# -*- coding: utf-8 -*-
from packages.jpush_python import jpush
from packages.jpush_python.SmartMonitorPush.conf import app_key, master_secret

_jpush = jpush.JPush(app_key, master_secret)
_jpush.set_logging("DEBUG")
device = _jpush.create_device()

database = [{
    "registration_ids": '171976fa8a8c70ba8b8',
    "mobile": "15988731660,",
    "alias": "陈炳蔚",
    "tags": []
}, {
    "registration_ids": '1a1018970aaaa1c0028',
    "mobile": "15557122597,",
    "alias": "李骏翔",
    "tags": []
}, {
    "registration_ids": '171976fa8a8c70ba8b8',
    "mobile": "15250428487,",
    "alias": "李兆丰",
    "tags": []
}]

userInfo = {
    "registration_ids": '',
    "mobile": "",
    "alias": "",
    "tags": []
}


# get info ---------------------------------------------
def getDeviceInfoByID(registerID):
    return device.get_deviceinfo(registerID).payload


def getDeviceInfoByAlias(alias):
    platform = "android,ios"
    return device.get_aliasuser(alias, platform).payload


# get detail
def getDeviceIDsFromInfo(info):
    return info["registration_ids"]


def getDeviceAliasFromInfo(info):
    return info["alias"]


def getDeviceMobileFromInfo(info):
    return info["mobile"]


# set info   ---------------------------------------------
def setAliasByID(registerID, name):
    entity = jpush.device_alias(name)
    device.set_devicemobile(registerID, entity)


def setMobileByID(registerID, mobile):
    entity = jpush.device_mobile(mobile)
    device.set_devicemobile(registerID, entity)


def test():
    # setMobileByID('171976fa8a8c70ba8b8','15988731660')
    # print getDeviceInfoByID('190e35f7e0487ad3a5b')
    print(getDeviceInfoByID('161a3797c835300a7a9'))


    # print getDeviceInfoByAlias("陈炳蔚")
    # print getDeviceInfoByID(database[0]["registration_ids"])
    # setAliasByID('171976fa8a8c70ba8b8','陈炳蔚')
    # setMobileByID("171976fa8a8c70ba8b8","15250428487")


if __name__ == "__main__":
    test()
