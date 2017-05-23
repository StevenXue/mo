# -*- coding: UTF-8 -*-
"""
"""
import sys
from os import path
sys.path.append(path.dirname(path.dirname(path.abspath(__file__))))

from mongoengine import connect
from server.repository import config
from server.entity import toolkit

connect(
    db=config.get_mongo_db(),
    username=config.get_mongo_user(),
    password=config.get_mongo_pass(),
    host=config.get_mongo_host(),)

if __name__ == '__main__':
    toolkit.save_once()
