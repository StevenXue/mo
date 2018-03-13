from datetime import datetime
from server3.repository.general_repo import Repo
from server3.entity.statistics import Statistics
from server3.business.general_business import GeneralBusiness


class StatisticsBusiness(GeneralBusiness):
    repo = Repo(Statistics)

    @classmethod
    def use_app(cls, user_obj, app_obj, input_json, output_json):
        return cls.repo.create_one(
            caller=user_obj,
            entity_type="app",
            app=app_obj,
            action="use",
            datetime=datetime.utcnow(),
            input_json=input_json,
            output_json=output_json
        )

    @classmethod
    def action(cls, user_obj, entity_obj, entity_type, action):
        # 用于动态加入 attribute 对象元素
        dict = {
            entity_type: entity_obj
        }

        return cls.repo.create_one(
            caller=user_obj,
            entity_type=entity_type,
            action=action,
            datetime=datetime.utcnow(),
            **dict
        )

    @classmethod
    def get_user_statistics(cls, user_obj, entity_type, action):
        # GeneralBusiness.read()
        return cls.repo.objects(caller=user_obj, entity_type=entity_type, action=action)

    # @classmethod
    # def get_extend(cls, query, page_no, page_size):
    #     objects = cls.get_pagination(query, page_no, page_size)
    #     for object in objects.objects:
    #         object.app = object.app
    #     return objects
