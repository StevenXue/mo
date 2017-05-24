# # -*- coding: UTF-8 -*-
from bson import ObjectId
from service import data_service
from service import ownership_service
from business import ownership_business
from entity.file import File

data_service.import_data_from_file_object_id(ObjectId("592551a8df86b22826983bdc"), 'test_with_os', 'some ds',
    'tttt', True)
# print ownership_business.list_ownership_by_type('file')
# s