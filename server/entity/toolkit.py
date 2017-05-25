#!/usr/bin/python
# -*- coding: UTF-8 -*-
"""
# @author   : Tianyi Zhang
# @version  : 1.0
# @date     : 2017-05-23 17:00pm
# @function : Getting all of the toolkit of statics analysis
# @running  : python
# Further to FIXME of None
"""

from mongoengine import *


class Toolkit(DynamicDocument):
    """
    This is the document for Toolkit Entity:
        list of variables and its type on below
    """

    # object_id = StringField(max_length=20, unique=True)
    name = StringField(max_length=50, unique=True)
    description = StringField(max_length=100)
    # input_data = ListField()

    # target_py = StringField(max_length=25, unique=True)
    target_py = ReferenceField('File')

    # ownership_ref = StringField(max_length=20, unique=True)
    # ownership_ref = ReferenceField('Ownership')

    status = DictField()
    # status = IntField(choices=STATUS, required=True)

    parameter_spec = DictField()
    # meta = {'allow_inheritance': True}

    # def __init__(self, name, description, parameter_spec):
    #     self.name = name
    #     self.description = description
    #     # self.input_data = input_data
    #     self.parameter_spec = parameter_spec


if __name__ == '__main__':
    pass
#     # save_once()
#     # print dir(AVG)
#     aa = 'list'
#     aaa = 'int'
#     bb = isinstance([1, 2, 3], eval(aa))
#     bb = isinstance(1, eval(aaa))
#
#     print bb
