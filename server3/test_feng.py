from bson import ObjectId

from business import staging_data_business
from business import staging_data_set_business

data = staging_data_business.get_by_staging_data_set_id(ObjectId(
    "5951cf7244a6372a608ec4e4"))

# data = [d.to_mongo().to_dict() for d in data]

print(data)


