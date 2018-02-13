#
# class SendMessage:
#     message = ""
#     channel = ""
#     def send(self, ):
#
#
#     pass
#
#
# class UserSendMessage(SendMessage):
#     user = ""
#     def send(self):
#
#
from server3.business import world_business
from server3.business import user_business


# 1. 用户发送
def use_send(user_ID, channel, message):
    sender = user_business.get_by_user_ID(user_ID)
    return world_business.add(sender=sender, channel=channel, message=message)

