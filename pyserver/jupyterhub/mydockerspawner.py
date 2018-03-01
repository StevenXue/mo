from dockerspawner import DockerSpawner
from traitlets import default
from tornado import gen
import jupyterhub
import requests


def default_format_volume_name(template, spawner):
    return template.format(username=spawner.user.name,
                           user_ID=spawner.user.name.split('+')[0],
                           project_name=spawner.user.name.split('+')[1])


class MyDockerSpawner(DockerSpawner):
    tb_port = '6006'

    @property
    def extra_create_kwargs(self):
        return {"ports": {'%i/tcp' % self.port: None, '6006/tcp': None}}

    @property
    def extra_host_config(self):
        return {"port_bindings": {self.port: (self.host_ip,),
                                  '6006': (self.host_ip,)}}

    @default('format_volume_name')
    def _get_default_format_volume_name(self):
        return default_format_volume_name

    @gen.coroutine
    def get_tb_port(self):
        tb_resp = yield self.docker('port', self.container_id, self.tb_port)
        port = int(tb_resp[0]['HostPort'])
        return port

    def update_project_tb_port(self, project_name, tb_port):
        """
        auth jupyterhub with user token
        :param tb_port:
        :param project_name:
        :return: dict of res json
        """
        print('update project tb_port: ', project_name, tb_port)
        return requests.put('{server}/project/projects/{project_name}?by=name'.
                            format(server='http://localhost:5000',
                                   project_name=project_name),
                            json={'tb_port': str(tb_port)}
                            )

    @gen.coroutine
    def start(self, image=None, extra_create_kwargs=None,
              extra_start_kwargs=None, extra_host_config=None):
        """Start the single-user server in a docker container. You can override
        the default parameters passed to `create_container` through the
        `extra_create_kwargs` dictionary and passed to `start` through the
        `extra_start_kwargs` dictionary.  You can also override the
        'host_config' parameter passed to `create_container` through the
        `extra_host_config` dictionary.

        Per-instance `extra_create_kwargs`, `extra_start_kwargs`, and
        `extra_host_config` take precedence over their global counterparts.

        """
        container = yield self.get_container()
        if container and self.remove_containers:
            self.log.warning(
                "Removing container that should have been cleaned up: %s (id: %s)",
                self.container_name, self.container_id[:7])
            # remove the container, as well as any associated volumes
            yield self.docker('remove_container', self.container_id, v=True)
            container = None

        if container is None:
            image = image or self.image
            if self._user_set_cmd:
                cmd = self.cmd
            else:
                image_info = yield self.docker('inspect_image', image)
                cmd = image_info['Config']['Cmd']
            cmd = cmd + self.get_args()

            # build the dictionary of keyword arguments for create_container
            create_kwargs = dict(
                image=image,
                environment=self.get_env(),
                volumes=self.volume_mount_points,
                name=self.container_name,
                command=cmd,
            )

            # ensure internal port is exposed
            create_kwargs['ports'] = {'%i/tcp' % self.port: None}

            create_kwargs.update(self.extra_create_kwargs)
            if extra_create_kwargs:
                create_kwargs.update(extra_create_kwargs)

            # build the dictionary of keyword arguments for host_config
            host_config = dict(binds=self.volume_binds, links=self.links)

            if hasattr(self, 'mem_limit') and self.mem_limit is not None:
                # If jupyterhub version > 0.7, mem_limit is a traitlet that can
                # be directly configured. If so, use it to set mem_limit.
                # this will still be overriden by extra_host_config
                host_config['mem_limit'] = self.mem_limit

            if not self.use_internal_ip:
                host_config['port_bindings'] = {self.port: (self.host_ip,)}
            host_config.update(self.extra_host_config)
            host_config.setdefault('network_mode', self.network_name)

            if extra_host_config:
                host_config.update(extra_host_config)

            self.log.debug("Starting host with config: %s", host_config)

            host_config = self.client.create_host_config(**host_config)
            create_kwargs.setdefault('host_config', {}).update(host_config)

            # create the container
            resp = yield self.docker('create_container', **create_kwargs)
            self.container_id = resp['Id']
            self.log.info(
                "Created container '%s' (id: %s) from image %s",
                self.container_name, self.container_id[:7], image)

        else:
            self.log.info(
                "Found existing container '%s' (id: %s)",
                self.container_name, self.container_id[:7])
            # Handle re-using API token.
            # Get the API token from the environment variables
            # of the running container:
            for line in container['Config']['Env']:
                if line.startswith(
                        ('JPY_API_TOKEN=', 'JUPYTERHUB_API_TOKEN=')):
                    self.api_token = line.split('=', 1)[1]
                    break

        # TODO: handle unpause
        self.log.info(
            "Starting container '%s' (id: %s)",
            self.container_name, self.container_id[:7])

        # build the dictionary of keyword arguments for start
        start_kwargs = {}
        start_kwargs.update(self.extra_start_kwargs)
        if extra_start_kwargs:
            start_kwargs.update(extra_start_kwargs)

        # start the container
        yield self.docker('start', self.container_id, **start_kwargs)

        ip, port = yield self.get_ip_and_port()
        if jupyterhub.version_info < (0, 7):
            # store on user for pre-jupyterhub-0.7:
            self.user.server.ip = ip
            self.user.server.port = port
        tb_port = yield self.get_tb_port()
        self.update_project_tb_port(self.user.name, tb_port)
        # jupyterhub 0.7 prefers returning ip, port:
        return (ip, port)
