# -*- coding: UTF-8 -*-
from bson import ObjectId
from business import project_business
from business import staging_data_set_business, staging_data_business
from entity.data import Data


def add_staging_data_set(sds_name, sds_description, project_id,
                         data_objects):
    # get project object
    project = project_business.get_by_id(project_id)

    # create new staging data set
    sds = staging_data_set_business.add(sds_name, sds_description, project)
    #print 'ttt', data_objects
    # copy data from data(raw) to staging data
    for do in data_objects:
        print do
        #print 'do', do
        # print do['device_level']
        # print dict(do)['device_type']
        #staging_data_business.add(sds, do)


def run():
    test_project = project_business.get_by_name('aaa')
    data = Data.objects(id=ObjectId("5925c511df86b2044e29ded7"))
    # data = eval(data.to_json())
    print data
    # for obj in data:
    #     print obj, '\n'
    #add_staging_data_set('test', 'test', test_project.id, data)
    for obj in data:
        print 'a'


# def get_by_staging_data_set_id_and_fields(staging_data_set_id, fields):
#     return staging_data_business.get_by_staging_data_set_and_fields(
#         staging_data_set_id, fields)
