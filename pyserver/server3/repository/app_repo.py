# -*- coding: UTF-8 -*-

from server3.repository.project_repo import ProjectRepo



class AppRepo(ProjectRepo):
    def __init__(self, instance):
        ProjectRepo.__init__(self, instance)

    def update_app_path(self, app, path):
        """
        To update app's app_path.

        :param app: app id or app object
        :param path: new path
        :return:
        """
        if isinstance(app, str):
            app = self.read_by_id(app)
        app.app_path = path
        app.save()

    def add_imported_entities(self, app_id, app_deploy_version,
                              used_datasets=None, used_modules=None):
        """
        Add imported datasets or modules to app deployments

        :param app_id:
        :param app_deploy_version:
        :param used_datasets:
        :param used_modules:
        :return:
        """
        if used_datasets is None:
            used_datasets = []

        if used_modules is None:
            used_modules = []
        app = self.read_by_id(app_id)

        deployments = app.deployments.filter(app_version=app_deploy_version)

        if len(deployments) == 0:
            # add new Deployment
            deployments.create(app_version=app_deploy_version,
                               datasets=used_datasets,
                               modules=used_modules)
        elif len(deployments) == 1:
            for um in used_modules:
                m_list = set(m.to_json() for m in deployments[0].modules)
                if um.to_json() not in m_list:
                    deployments[0].modules.append(um)
            for ud in used_datasets:
                d_list = set(d.to_json() for d in deployments[0].datasets)
                if ud.to_json() not in d_list:
                    deployments[0].datasets.append(ud)

        else:
            raise Exception('deployments duplicate')
        app.save()
