# -*- coding: UTF-8 -*-
import os
import shutil
import subprocess
from datetime import datetime
from server3.entity.data_set import DataSet
from server3.entity import project
from server3.business.project_business import ProjectBusiness
from server3.repository.data_set_repo import DataSetRepo
from server3.repository.general_repo import Repo
from server3.repository import config
from server3.business.general_business import GeneralBusiness
from server3.constants import DATASET_DIR
from server3.constants import DEFAULT_DEPLOY_VERSION

UPLOAD_FOLDER = config.get_file_prop('UPLOAD_FOLDER')

data_set_repo = DataSetRepo(DataSet)


def add(name, **kwargs):
    create_time = datetime.utcnow()
    data_set = DataSet(name=name, create_time=create_time,
                       upload_time=create_time,
                       **kwargs)
    return data_set_repo.create(data_set)


# def get_by_name(name):
# ds = DataSet(name=name)
# return data_set_repo.read_by_name(name)


def get_by_id(data_set_id):
    return data_set_repo.read_by_id(data_set_id)


def remove_by_id(data_set_id):
    return data_set_repo.delete_by_id(data_set_id)


def remove(data_set_obj):
    return data_set_repo.delete_by_id(data_set_obj.id)


class DatasetBusiness(ProjectBusiness, GeneralBusiness):
    repo = Repo(project.Dataset)

    @classmethod
    def deploy_or_publish(cls, project_id, commit_msg,
                          version=DEFAULT_DEPLOY_VERSION):
        dataset = cls.get_by_id(project_id)

        dataset.status = 'deploying'
        dataset.save()

        # commit dataset
        cls.commit(project_id, commit_msg, version)

        dataset.dataset_path = os.path.join(DATASET_DIR, dataset.user.user_ID,
                                            dataset.name)
        dst = os.path.join(dataset.dataset_path, version)

        # copy dataset
        cls.copytree_wrapper(dataset.path, dst,
                             ignore=shutil.ignore_patterns('.git'))

        # if publish update privacy and version
        if version != DEFAULT_DEPLOY_VERSION:
            dataset.privacy = 'public'
            dataset.versions.append(version)

        dataset.status = 'active'
        dataset.save()

        return dataset
