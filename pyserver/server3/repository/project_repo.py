# -*- coding: UTF-8 -*-

from server3.repository.general_repo import Repo
from server3.constants import ProjectStatus
from server3.constants import ProjectPrivacy


class ProjectRepo(Repo):

    STATUS = ProjectStatus
    PRIVACY = ProjectPrivacy

    def __init__(self, instance):
        Repo.__init__(self, instance)

    def add_version(self, project, version):
        """
        To add a new version

        :param project: project id or project object
        :param version: new version
        :return:
        """
        if isinstance(project, str):
            project = self.read_by_id(project)

        project.versions.append(version)
        project.save()

    def update_privacy(self, project, privacy):
        """
        To update project privacy.

        :param project: project id or project object
        :param privacy: new privacy
        :return:
        """
        if isinstance(project, str):
            project = self.read_by_id(project)

        project.privacy = privacy
        project.save()

    def update_status(self, project, status):
        """
        To update project status.

        :param project: project id
        :param status: new status
        :return: updated project object
        """
        if isinstance(project, str):
            project = self.read_by_id(project)
        project.status = status
        updated_project = project.save()
        return updated_project





