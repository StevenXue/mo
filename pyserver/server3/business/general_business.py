from server3.repository.general_repo import Repo
from server3.entity.general_entity import Objects


class GeneralBusiness:
    # 实例化后的 instance 走general repo
    repo = Repo(None)
    # class 不走general repo
    __cls = None

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
        return cls.__cls.objects(**query).order_by('-_id')

    @classmethod
    def get_by_id(cls, object_id):
        return cls.repo.read_by_id(object_id=object_id)

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
        cls.repo.create(obj)

    @classmethod
    def create_one(cls, **kwargs):
        cls.repo.create_one(**kwargs)


