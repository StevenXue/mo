# # -*- coding: UTF-8 -*-
import sys
from bson import ObjectId
from service import data_service
from business import data_set_business
from business import data_business
from business import staging_data_business
from service import staging_data_service
from service import ownership_service
from business import ownership_business
from entity.file import File

print staging_data_service.get_fields_with_types(ObjectId(
    '59341201df86b26b1f12f924'))




