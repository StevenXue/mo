from server3.repository.general_repo import Repo
from server3.entity.general_entity import Objects
from operator import itemgetter


def check_auth(func):
    def _deco(cls, object_id, user_ID, *args, **kwargs):
        entity = cls.get_by_id(object_id)
        if entity.user.user_ID == user_ID:
            return func(cls, object_id, user_ID, *args, **kwargs)
        else:
            raise RuntimeError('no right to delete')
    return _deco


class GeneralBusiness:
    # 实例化后的 instance 走general repo
    repo = Repo(None)
    # class 不走general repo
    entity = None

    @classmethod
    def get_all(cls):
        project = cls.repo.read()
        return project

    # 另一种方式
    # @classmethod
    # def get_all(cls):
    #     return cls.__cls.objects().order_by('-_id')

    @classmethod
    def read(cls, query=None):
        if query is None:
            query = {}
        return cls.entity.objects(**query).order_by('-_id')

    @classmethod
    def get_by_id(cls, object_id):
        return cls.repo.read_by_id(object_id=object_id)

    @classmethod
    def read_unique_one(cls, **kwargs):
        return cls.repo.read_unique_one(kwargs)

    @classmethod
    def get_pagination(cls, query, page_no, page_size):
        start = (page_no - 1) * page_size
        end = page_no * page_size
        objects = cls.repo.read(query=query)
        count = objects.count()
        return Objects(objects=objects[start: end], count=count, page_no=page_no,
                       page_size=page_size)

    @classmethod
    def create(cls, obj):
        return cls.repo.create(obj)

    @classmethod
    def create_one(cls, **kwargs):
        return cls.repo.create_one(**kwargs)

    @classmethod
    @check_auth
    def remove_by_id(cls, object_id, user_ID):
        return cls.repo.delete_by_id(object_id)

    @staticmethod
    def get_hot_tag(entity, search_query, object_type):
        objects = entity.objects(type=object_type)
        if search_query:
            tag_freqs = objects(
                tags__icontains=search_query).item_frequencies(
                'tags', normalize=True)
            top_tags = sorted(tag_freqs.items(), key=itemgetter(1),
                              reverse=True)[:100]
            res = []
            max_number = 5
            number = 0
            top_five = []
            top_five_length = 0
            for i in top_tags:
                if search_query in i[0]:
                    res.append(i)
                    number += 1
                else:
                    if top_five_length < max_number:
                        top_five.append(i)
                        top_five_length += 1
                if number == max_number:
                    return res
            if number < max_number:
                res += top_five[:max_number - number]
            return res
        else:
            tag_freqs = objects().item_frequencies(
                'tags', normalize=True)
            top_tags = sorted(tag_freqs.items(), key=itemgetter(1),
                              reverse=True)[:5]
            return top_tags