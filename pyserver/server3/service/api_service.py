# -*- coding: UTF-8 -*-
import re
import synonyms
from mongoengine import Q

from server3.business import user_business
from server3.business import api_business
from server3.entity.api import ApiGetType
from server3.entity.api import Api
from server3.constants import Error, Warning, ErrorMessage

default_page_no = 1
default_page_size = 5

fields = ["name", "keyword", "description"]


def get_favor_apis(user_ID, page_no=default_page_no, page_size=default_page_size):
    user = user_business.get_by_user_ID(user_ID=user_ID)
    start = (page_no - 1) * page_size
    end = page_no * page_size
    return user.favor_apis[start:end]


def get_used_apis(user_ID, page_no=default_page_no, page_size=default_page_size):
    user = user_business.get_by_user_ID(user_ID=user_ID)
    start = (page_no - 1) * page_size
    end = page_no * page_size
    return user.used_apis[start:end]


def search(search_query):
    return Api.objects(
        Q(name__icontains=search_query) | Q(keyword__icontains=search_query)
        | Q(description__icontains=search_query)
    )


def custom_sort(array, key='_id'):
    return sorted(array, key=compare_to_key, reverse=True)


def compare_to_key(x):
    return x.id


def custom_sort_objetc(array, key='_id'):
    return sorted(array, key=lambda item: -item[key])


def get_api_list(get_type, search_query, user_ID, page_no=default_page_no,
                 page_size=default_page_size, default_max_score=0.4):
    start = (page_no - 1) * page_size
    end = page_no * page_size

    # apis = []
    if get_type == ApiGetType.all:
        # 获取所有的
        if search_query:
            # apis = Api.objects.search_text(search_query).order_by('$text_score')
            apis = search(search_query)
        else:
            apis = api_business.get()  # 分页
        return apis.order_by('-create_time')[start:end]

    elif get_type == ApiGetType.favor or get_type == ApiGetType.used or get_type == ApiGetType.star:
        # 获取特定
        user = user_business.get_by_user_ID(user_ID=user_ID)
        apis = user[get_type + "_apis"]
        if search_query:
            # 先search, 后用apis filter
            match_apis = search(search_query)
            final_apis = list(filter(lambda match_api: match_api in apis, match_apis))
            apis = final_apis
        return custom_sort(apis)[start:end]

    elif get_type == ApiGetType.chat:
        # 机器人
        apis = api_business.get_all().order_by('-create_time')
        #  比对打分
        apis_score = []
        for api in apis:
            api_json = api.to_mongo()
            apis_score.append({
                **api_json,
                "score": synonyms.compare(search_query, api.keyword, seg=True)
            })

            # TODO 以后可以更换成 object
            # for api in apis:
            #     api.score = synonyms.compare(search_query, api.keyword, seg=True)
            # api_json = api.to_mongo()
            # apis_score.append({
            #     **api_json,
            #     "score": synonyms.compare(search_query, api.keyword, seg=True)
            # })
        apis_score = sorted(apis_score, key=lambda item: -item["score"])
        # 最大值
        max_score = apis_score[0]["score"]
        if max_score < default_max_score:
            raise Warning(ErrorMessage.no_match_apis)
        else:
            apis = apis_score
            return apis[start:end]
    else:
        raise Error(ErrorMessage.error_get_type)


def test_get_favor_apis():
    get_favor_apis(user_ID='super_user')


def test_get_api_list():
    apis = get_api_list(
        get_type=ApiGetType.favor,
        search_query="预测航班延误信息",
        # search_query=None,
        user_ID='super_user',
        page_no=1,
        page_size=2
    )
    print("apis", apis)
    for api in apis:
        print("api111", api.to_mongo())  # def new_test():


if __name__ == '__main__':
    test_get_api_list()

# TODO 以后可以加入正则
# import re
# regex = re.compile('.*bob.*')
# Person.objects(name=regex)
