# -*- coding: utf-8 -*-
# import jpush as jpush
# from jpush import common

# from checkInfo import setMobileByID
# from conf import app_key, master_secret

from packages.jpush_python import jpush
from packages.jpush_python.jpush import common

from packages.jpush_python.SmartMonitorPush.conf import app_key, master_secret
from packages.jpush_python.SmartMonitorPush.checkInfo import setMobileByID

_jpush = jpush.JPush(app_key, master_secret)
push = _jpush.create_push()

# the default logging level is WARNING,if you set the logging
# level to "DEBUG",the it will show the debug logging
_jpush.set_logging("DEBUG")

push.platform = jpush.all_
push.options = {"time_to_live": 86400, "sendno": 12345,
                "apns_production": False}

database = [{
    "registration_ids": '171976fa8a8c70ba8b8',
    "mobile": "15988731660,",
    "alias": "bingwei",
    "tags": []
}, {
    "registration_ids": '1a1018970aaaa1c0028',
    "mobile": "15557122597,",
    "alias": "junxiang",
    "tags": []
}, {
    "registration_ids": '171976fa8a8c70ba8b8',
    "mobile": "15250428487,",
    "alias": "李兆丰",
    "tags": []
}]


def pushAll(pushInformation):
    push.audience = jpush.all_
    push.notification = jpush.notification(alert=pushInformation)
    try:
        response = push.send()
    except common.Unauthorized:
        raise common.Unauthorized("Unauthorized")
    except common.APIConnectionException:
        raise common.APIConnectionException("conn")
    except common.JPushFailure:
        print("JPushFailure")
    except:
        print("Exception")


# 当用户信息完整时,调用来发送推送（告警）
def pushByregisterID(registerID, pushInformation, Event_Type):
    push.audience = jpush.audience(
        jpush.registration_id(registerID)
    )
    # 发送手机推送
    push.notification = jpush.notification(alert=pushInformation)

    # 发送额外信息
    push.message = jpush.message(msg_content="information in app",
                                 title=Event_Type)
    # 发送短信
    push.smsmessage = jpush.smsmessage(pushInformation, 0)
    push.send()


# 调用来发送推送邮件信息（消息）
def push_message(registerID, sender, title, content):
    push.audience = jpush.audience(
        jpush.registration_id(registerID)
    )
    # 发送手机推送
    information = u"新消息 发件人:" + sender + u" 主题:" + title
    ios_msg = jpush.ios(alert=information)
    android_msg = jpush.android(alert=information, title=u"消息")
    push.notification = jpush.notification(alert=information,
                                           android=android_msg, ios=ios_msg)

    # 发送额外信息
    push.message = jpush.message(msg_content=content,
                                 title="message")
    # # 发送短信
    # push.smsmessage = jpush.smsmessage(pushInformation, 0)
    # print (push.payload)
    push.send()


# 视频通话
def push_room_number(registration_id, app_id, room_number,
                     push_information, sender):
    push.audience = jpush.audience(
        jpush.registration_id(registration_id)
    )

    extras_info = {
        "type": "room_number",  # 用于安卓识别
        "information": push_information,
        "sender": sender,
        "app_id": app_id,
        "room_number": room_number,
    }

    # message
    push.message = jpush.message(msg_content=room_number,
                                 title="room_number", extras=extras_info)

    # notification
    ios_msg = jpush.ios(alert=push_information, extras=extras_info)
    android_msg = jpush.android(alert=push_information, extras=extras_info,
                                title=u"视频通话邀请")
    push.notification = jpush.notification(alert=push_information,
                                           android=android_msg, ios=ios_msg)
    push.send()


# 暂时解决方法: 每次推送 设置该用户的电话号码
def pushAndSendSMS(registerID, phoneNumber, pushInformation):
    # 先更新用户电话号码
    setMobileByID(registerID, phoneNumber)
    pushByregisterID(registerID, pushInformation)

# push.smsmessage=jpush.smsmessage("a sms message from python jpush api to junxiang",0)
