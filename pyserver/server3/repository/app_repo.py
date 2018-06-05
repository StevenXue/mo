# -*- coding: UTF-8 -*-

from server3.repository.project_repo import ProjectRepo


class AppRepo(ProjectRepo):
    def __init__(self, instance):
        ProjectRepo.__init__(self, instance)

    class AppStatus:
        """
        App status
        """
        DEPLOYING = 'deploying'
        ACTIVE = 'active'
        INACTIVE = 'inactive'

    class AppPrivacy:
        """
        App Privacy
        """
        PUBLIC = 'public'
        PRIVATE = 'private'

    def add_version(self, app_id, version):
        """
        To add a new version

        :param app_id: app id
        :param version: version to add
        :return:
        """
        app = self.read_by_id(app_id)
        app.versions.append(version)
        app.save()
        return app

    def update_path(self, app_id, path):
        """
        To update app path.

        :param app_id: app id
        :param path: app path
        :return:
        """
        app = self.read_by_id(app_id)
        app.app_path = path
        app.save()
        return app

    def update_privacy(self, app_id, privacy):
        """
        To update app privacy.

        :param app_id: app id
        :param privacy: new privacy of app
        :return:
        """
        app = self.read_by_id(app_id)
        app.privacy = privacy
        app.save()
        return app

    def update_status(self, app_id, status):
        """
        To update app status.

        :param app_id: app id
        :param status: new status of app
        :return: updated app objecty
        """
        app = self.read_by_id(app_id)
        app.status = status
        app.save()
        return app

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
        return app
