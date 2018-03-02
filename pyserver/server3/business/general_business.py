from server3.repository.general_repo import Repo


class GeneralBusiness:
    # 实例化后的 instance 走general repo
    repo = Repo()
    # class 不走general repo
    __cls = None

    @classmethod
    def get_all(cls):
        project = cls.repo.read()
        return project

    # @classmethod
    # def get_all(cls):
    #     return cls.__cls.objects().order_by('-_id')

    @classmethod
    def read(cls, query=None):
        if query is None:
            query = {}
        return cls.__cls.objects(**query).order_by('-_id')

    # @classmethod
    # def objects(cls, ):

