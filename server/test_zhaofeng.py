# # -*- coding: UTF-8 -*-
from bson import ObjectId
from service import data_service
from business import data_set_business
from business import staging_data_business
from service import staging_data_service
from service import ownership_service
from business import ownership_business
from entity.file import File

# data_service.import_data_from_file_id(ObjectId("592551a8df86b22826983bdc"),
#                                       'test_with_os', 'some ds', 'tttt', True)
# print ownership_business.list_ownership_by_type('file')
# data_set = data_set_business.get_by_id(ObjectId("59263812df86b2225a372472"))
# sds = staging_data_business.
# print type(data_set.id)
print staging_data_business.get_by_staging_data_set_and_fields(
    ObjectId("5926d6291c5ad4881f4d060a"), ['name', 'device_type'])
