
from business import project_business
from business import staging_data_set_business, staging_data_business


def add_staging_data_set(sds_name, sds_description, project_id,
                         data_objs):
    # get project object
    project = project_business.get_by_id(project_id)

    # create new staging data set
    sds = staging_data_set_business.add(sds_name, sds_description, project)

    # copy data from data(raw) to staging data
    for do in data_objs:
        staging_data_business.add(sds, do)
