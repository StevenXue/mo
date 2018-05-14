# -*- coding: UTF-8 -*-

from server3.repository.project_repo import ProjectRepo
from server3.entity.project import Deployment


class AppRepo(ProjectRepo):
    def __init__(self, instance):
        ProjectRepo.__init__(self, instance)


    def add_imported_modules(self, app_id, app_deploy_version, used_modules):
        """

        :param app_id:
        :param app_deploy_version:
        :param used_modules:
        :return:
        """
        app = self.read_by_id(app_id)

        deployment = app.deployments.filter(app_version=app_deploy_version)

        if len(deployment) == 0:
            # add new Deployment
            app.deployments.create(app_version=app_deploy_version,
                                   modules=used_modules)
        else:
            deployment[0].modules += used_modules
            app.save()

    def add_imported_datasets(self, app_id, app_deploy_version, used_datasets):
        """

        :param app_id:
        :param app_deploy_version:
        :param used_datasets:
        :return:
        """
        app = self.read_by_id(app_id)

        deployment = app.deployments.filter(app_version=app_deploy_version)

        if len(deployment) == 0:
            # add new Deployment
            app.deployments.create(app_version=app_deploy_version,
                                   datasets=used_datasets)
        else:
            deployment[0].datasets += used_datasets
            app.save()




