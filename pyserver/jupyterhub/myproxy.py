from jupyterhub.proxy import ConfigurableHTTPProxy
from jupyterhub.orm import Service, User
from tornado import gen


class MyProxy(ConfigurableHTTPProxy):
    @gen.coroutine
    def check_routes(self, user_dict, service_dict, routes=None):
        """Check that all users are properly routed on the proxy."""
        if not routes:
            routes = yield self.get_all_routes()

        user_routes = {path for path, r in routes.items() if
                       'user' in r['data']}
        futures = []
        db = self.db

        good_routes = {'/'}

        hub = self.app.hub
        if '/' not in routes:
            self.log.warning("Adding missing default route")
            futures.append(self.add_hub_route(hub))
        else:
            route = routes['/']
            if route['target'] != hub.host:
                self.log.warning("Updating default route %s → %s",
                                 route['target'], hub.host)
                futures.append(self.add_hub_route(hub))

        for orm_user in db.query(User):
            user = user_dict[orm_user]
            for name, spawner in user.spawners.items():
                if spawner.ready:
                    spec = spawner.proxy_spec
                    good_routes.add(spec)
                    if spec not in user_routes:
                        self.log.warning(
                            "Adding missing route for %s (%s)", spec,
                            spawner.server)
                        futures.append(self.add_user(user, name))
                    else:
                        route = routes[spec]
                        if route['target'] != spawner.server.host:
                            self.log.warning(
                                "Updating route for %s (%s → %s)",
                                spec, route['target'], spawner.server,
                            )
                            futures.append(self.add_user(user, name))
                elif spawner._spawn_pending:
                    good_routes.add(spawner.proxy_spec)

        # check service routes
        service_routes = {r['data']['service']: r
                          for r in routes.values() if 'service' in r['data']}
        for orm_service in db.query(Service).filter(Service.server != None):
            service = service_dict[orm_service.name]
            if service.server is None:
                # This should never be True, but seems to be on rare occasion.
                # catch filter bug, either in sqlalchemy or my understanding of
                # its behavior
                self.log.error(
                    "Service %s has no server, but wasn't filtered out.",
                    service)
                continue
            good_routes.add(service.proxy_spec)
            if service.name not in service_routes:
                self.log.warning("Adding missing route for %s (%s)",
                                 service.name, service.server)
                futures.append(self.add_service(service))
            else:
                route = service_routes[service.name]
                if route['target'] != service.server.host:
                    self.log.warning(
                        "Updating route for %s (%s → %s)",
                        route['routespec'], route['target'],
                        spawner.server.host,
                    )
                    futures.append(self.add_service(service))

        # Now delete the routes that shouldn't be there
        for routespec in routes:
            if routespec not in good_routes:
                self.log.warning("Deleting stale route %s", routespec)
                futures.append(self.delete_route(routespec))

        for f in futures:
            yield f

        @gen.coroutine
        def add_service(self, service, client=None):
            """Add a service's server to the proxy table."""
            if not service.server:
                raise RuntimeError(
                    "Service %s does not have an http endpoint to add to the proxy.",
                    service.name)

            self.log.info("Adding service %s to proxy %s => %s",
                          service.name, service.proxy_spec,
                          service.server.host,
                          )

            yield self.add_route(
                service.proxy_spec,
                service.server.host,
                {'service': service.name}
            )

        @gen.coroutine
        def add_route(self, routespec, target, data):
            body = data or {}
            body['target'] = target
            body['jupyterhub'] = True
            path = self._routespec_to_chp_path(routespec)
            self.log.info('111', path, body)
            print('111', path, body)
            return self.api_request(path,
                                    method='POST',
                                    body=body,
                                    )
