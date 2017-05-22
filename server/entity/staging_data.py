from mongoengine import *


class StagingData(DynamicDocument):
    data_set = ListField(ReferenceField('DataSet'))
    fields = DateTimeField()
    # should be link to data_set in sql, so may be not string
    temp_data_set_name = StringField(max_length=50)
    value = FloatField()
