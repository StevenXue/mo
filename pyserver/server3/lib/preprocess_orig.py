#!/usr/bin/python
# -*- coding: UTF-8 -*-
"""
# @author   : Zhaofeng Li
# @version  : 1.0
# @date     : 2017-06-21 11:00pm
# @function : preprocess methods
# @running  : python
"""

# 此处全部要导入到执行文件位置
# -----------------------
import numpy as np
import pandas as pd
from sklearn import preprocessing, feature_selection, decomposition
from sklearn.feature_selection.from_model import _get_feature_importances as get_importance

from server3.business import staging_data_business
from server3.utility import json_utility
import json
from server3.business.step_business import StepBusiness

from bson import ObjectId
import time
# -----------------------


# 标准化，preproccessing库的StandardScaler类，x' = (x-X)/S
# 返回添加栏位
def standard_scaler(arr0):
    matrix = np.array(arr0)
    temp = preprocessing.StandardScaler().fit_transform(matrix)
    # result = data_utility.retrieve_nan_index(temp.tolist(), index)
    result = temp.tolist()
    return result


# 区间缩放法preproccessing库的MinMaxScaler类对数据进行区间缩放
# 返回添加栏位
def min_max_scaler(arr0):
    matrix = np.array(arr0)
    temp = preprocessing.MinMaxScaler().fit_transform(matrix)
    # result = data_utility.retrieve_nan_index(temp.tolist(), index)
    result = temp.tolist()
    return result


# 定量归一化，preproccessing库的Normalizer类对数据进行区间归一化
# 返回添加栏位
def normalizer(arr0):
    matrix = np.array(arr0)
    temp = preprocessing.Normalizer().fit_transform(matrix)
    # result = data_utility.retrieve_nan_index(temp.tolist(), index)
    result = temp.tolist()
    return result


# 定量特征二值化，preproccessing库的Binarizer类对数据进行区间二值化
# 返回添加栏位
def binarizer(arr0, threshold):
    matrix = np.array(arr0)
    temp = preprocessing.Binarizer(threshold=threshold).fit_transform(matrix)
    # result = data_utility.retrieve_nan_index(temp.tolist(), index)
    result = temp.tolist()
    return result


# 哑编码，preproccessing库的onehotencode类对数据进行哑编码
# 输入是单个栏位
# 返回添加多个栏位
def one_hot_encoder(arr0):
    matrix = np.array(arr0)
    temp = preprocessing.OneHotEncoder().fit_transform(matrix.reshape((-1, 1)))
    # result = data_utility.retrieve_nan_index(temp.tolist(), index)
    result = temp.tolist()
    return result


# 缺失值计算，返回值为计算缺失值后的数据
# 参数missing_value为缺失值的表示形式，默认为np.nan
# 参数strategy为缺失值填充方式，默认为mean（均值）
def imputer(arr0):
    matrix = np.array(arr0)
    temp = preprocessing.Imputer().fit_transform(matrix.reshape((1, -1)))
    # result = data_utility.retrieve_nan_index(temp.tolist(), index)
    result = temp.tolist()
    return result


# 多项式数据变换，返回为数据的多项式变化
# 返回默认为2次
def polynomial_features(arr0):
    matrix = np.array(arr0)
    temp = preprocessing.PolynomialFeatures().fit_transform(matrix)
    # result = data_utility.retrieve_nan_index(temp.tolist(), index)
    result = temp.tolist()
    return result


# 返回get dummy的值
def get_dummy(arr0):
    # series = pd.DataFrame(arr0)
    value = pd.get_dummies(arr0).values
    # result = data_utility.retrieve_nan_index(value.tolist(), index)
    result = value.tolist()
    return result


# 把string转化为数字类别
def str_to_categories(arr0):
    value = pd.Series(arr0).astype('category').cat.codes.values
    # result = data_utility.retrieve_nan_index(value.tolist(), index)
    result = value.tolist()
    return result


# FIXME
def pandas_cut(arr0, bins, labels=False):
    labels = False if labels == [""] else labels
    temp = pd.cut(np.array(arr0).flatten(), bins, labels=labels)
    # result = data_utility.retrieve_nan_index(list(temp), index)
    result = list(temp)
    return result


# 特征选择
# 方差选择法
def variance_threshold(arr0, threshold):
    matrix = np.array(arr0)
    temp = feature_selection.VarianceThreshold(threshold=threshold).fit(matrix)
    scores = [np.var(el) for el in matrix.T]
    indx = temp.get_support().tolist()
    # result = data_utility.retrieve_nan_index(temp.transform(matrix).tolist(), index)
    result = temp.transform(matrix).tolist()
    return scores, indx, result


# 特征选择
# 卡方检验法
# 需要多加考虑下
def select_k_best_chi2(arr0, target, k):
    from sklearn.feature_selection import chi2
    matrix = np.array(arr0)
    target = np.array(target)
    temp = feature_selection.SelectKBest(chi2, k=int(k)).fit(matrix, target)
    scores = temp.scores_.tolist()
    indx = temp.get_support().tolist()
    # result = data_utility.retrieve_nan_index(temp.transform(matrix).tolist(), index)
    result = temp.transform(matrix).tolist()
    return scores, indx, result


# 特征选择
# 选择K个最好的特征，返回特征选择后的数据
# 皮尔森互信息法, 需要多加考虑下
def select_k_best_pearson(arr0, target, k):
    from scipy.stats import pearsonr
    matrix = np.array(arr0)
    target = np.array(target)
    temp = feature_selection.SelectKBest(
        lambda X, Y: np.array(list(map(lambda x: abs(pearsonr(x, Y)[0]), X.T))), k=k).fit(matrix,
                                                                                          target)
    scores = temp.scores_.tolist()
    indx = temp.get_support().tolist()
    # result = data_utility.retrieve_nan_index(temp.transform(matrix).tolist(), index)
    result = temp.transform(matrix).tolist()
    return scores, indx, result


# 特征选择
# 互信息法,需要多加考虑下
# 由于MINE的设计不是函数式的，定义mic方法将其为函数式的，返回一个二元组，二元组的第2项设置成固定的P值0.5
# 第一个参数为计算评估特征是否好的函数，该函数输入特征矩阵和目标向量，输出二元组（评分，P值）的数组，数组第i项为第i个特征的评分和P值。在此定义为计算相关系数
def select_k_best_mic(arr0, target, k):
    from minepy import MINE
    matrix = np.array(arr0)
    target = np.array(target)

    def mic(x, y):
        m = MINE()
        m.compute_score(x, y)
        return (m.mic(), 0.5)

    temp = feature_selection.SelectKBest(
        lambda X, Y: np.array(list(map(lambda x: mic(x, Y), X.T))).T[0], k=k).fit(matrix, target)
    scores = temp.scores_.tolist()
    indx = temp.get_support().tolist()
    # result = data_utility.retrieve_nan_index(temp.transform(matrix).tolist(), index)
    result = temp.transform(matrix).tolist()
    return scores, indx, result


# 递归特征消除法，返回特征选择后的数据
# 参数estimator为基模型
# 参数n_features_to_select为选择的特征个数
def ref(arr0, target, n_features):
    from sklearn.linear_model import LogisticRegression
    matrix = np.array(arr0)
    target = np.array(target)
    temp = feature_selection.RFE(estimator=LogisticRegression(),
                                 n_features_to_select=n_features).fit(matrix, target)
    scores = temp.ranking_.tolist()
    indx = temp.support_.tolist()
    # result = data_utility.retrieve_nan_index(temp.transform(matrix).tolist(), index)
    result = temp.transform(matrix).tolist()
    return scores, indx, result


# 基于惩罚项的特征选择法
# 带L1惩罚项的逻辑回归作为基模型的特征选择
# 带惩罚的基模型，除了筛选出特征，同时也降维
def select_from_model_lr(arr0, target):
    from sklearn.linear_model import LogisticRegression
    matrix = np.array(arr0)
    target = np.array(target)
    temp = feature_selection.SelectFromModel(LogisticRegression(penalty="l1", C=0.1)).fit(matrix,
                                                                                          target)
    indx = temp._get_support_mask().tolist()
    scores = get_importance(temp.estimator_).tolist()
    # threthold = temp.threshold_
    # result = data_utility.retrieve_nan_index(temp.transform(matrix).tolist(), index)
    result = temp.transform(matrix).tolist()
    return scores, indx, result


# 基于树模型的特征选择法
# 树模型中GBDT可用来作为基模型进行特征选择
def select_from_model_gbdt(arr0, target):
    from sklearn.ensemble import GradientBoostingClassifier
    matrix = np.array(arr0)
    target = np.array(target)
    temp = feature_selection.SelectFromModel(GradientBoostingClassifier()).fit(matrix, target)
    indx = temp._get_support_mask().tolist()
    scores = get_importance(temp.estimator_).tolist()
    # result = data_utility.retrieve_nan_index(temp.transform(matrix).tolist(), index)
    result = temp.transform(matrix).tolist()
    return scores, indx, result


# 降维-线性判别分析法（LDA）
# 线性判别分析法，返回降维后的数据
# 参数n_components为降维后的维数
def lda(arr0, target, n_components):
    from sklearn.lda import LDA
    matrix = np.array(arr0)
    target = np.array(target)
    temp = LDA(n_components=n_components).fit(matrix, target)
    coef = temp.coef_
    # covariance = temp.covariance_
    mean = temp.means_
    priors = temp.priors_
    scalings = temp.scalings_
    xbar = temp.xbar_
    # label = data_utility.retrieve_nan_index(temp.transform(matrix).tolist(), index)
    label = temp.transform(matrix).tolist()
    return label, coef.tolist(), mean.tolist(), priors.tolist(), scalings.tolist(), xbar.tolist()


def table_to_json(table, added_fields=[], with_new=False):
    now = time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(time.time()))
    table_json = []
    for row in table:
        table_json.append(row.to_mongo().to_dict())
        # source_table_pd.append(row.to_mongo().to_dict(), ignore_index=True)
    table_json = json_utility.convert_to_json(table_json)
    if with_new:
        new_table_json = []
        for table_row in table_json:
            new_table_row = {}
            for key, value in table_row.items():
                if key in added_fields:
                    new_table_row["new_" + now + key] = value
                else:
                    new_table_row[key] = value
            new_table_json.append(new_table_row)
        return new_table_json
    return table_json


def add_columns_append(steps):
    target_table_id = StepBusiness.get_step(steps, 'target_datasource')['args'][0]['value']
    source_table_id = StepBusiness.get_step(steps, 'from_datasource')['args'][0]['value']
    index = StepBusiness.get_step(steps, 'select_index')['args'][0]['values']
    added_fields = StepBusiness.get_step(steps, 'from_fields')['args'][0]['values']
    nan_type = StepBusiness.get_step(steps, 'parameters')['args'][0]['value']
    add_columns_append_in(target_table_id, source_table_id, index, added_fields, nan_type)
    return {
        "target_table_id": target_table_id,
        "source_table_id": source_table_id,
        "index": index,
        "added_fields": added_fields,
        "nan_type": nan_type
    }


# 合并添加列
def add_columns_append_in(target_table_id, source_table_id, index, added_fields, nan_type,
                          **kwargs):
    # target table
    target_table = staging_data_business.get_by_staging_data_set_id(
        staging_data_set_id=target_table_id)
    # table to json
    target_table_json = table_to_json(target_table)

    # json to pd
    target_table_pd = pd.read_json(json.dumps(target_table_json))

    # 展开source table
    source_table = staging_data_business.get_by_staging_data_set_and_fields(
        source_table_id,
        fields=added_fields + index,
        with_id=True
    )
    # table to json
    source_table_json = table_to_json(source_table, added_fields=added_fields, with_new=True)

    # json to pd
    source_table_pd = pd.read_json(json.dumps(source_table_json))

    # pd index
    if len(index) != 0:
        target_table_pd = target_table_pd.set_index(index)
        source_table_pd = source_table_pd.set_index(index)

    result = pd.concat([target_table_pd, source_table_pd],
                       axis=1, join_axes=[target_table_pd.index])

    # pandas dataframe to json
    update_json = result.to_json(orient='index')
    update_json = json.loads(update_json)
    update_dict = []
    if len(index) == 0:
        for key, value in update_json.items():
            update_dict.append({"_id": key, **value})
    elif len(index) == 1:
        for key, value in update_json.items():
            update_dict.append({"_id": key, **value})
    else:
        for key, value in update_json.items():
            ele = {}
            key = json.loads(key)
            for k, v in zip(index, key):
                ele[k] = v
            update_dict.append({**ele, **value})
    new_update_dict = [
        {**item, "_id": ObjectId(item["_id"]), "staging_data_set": ObjectId(
            item["staging_data_set"])}
        for item in update_dict]
    staging_data_business.update_many_with_new_fields(new_update_dict)


# 合并添加行
def add_rows_append(steps):
    target_table_id = StepBusiness.get_step(steps, 'target_datasource')['args'][0]['value']
    source_table_id = StepBusiness.get_step(steps, 'from_datasource')['args'][0]['value']
    # index = StepBusiness.get_step(steps, 'select_index')['args'][0]['values']
    # added_fields = StepBusiness.get_step(steps, 'from_fields')['args'][0]['values']
    nan_type = StepBusiness.get_step(steps, 'parameters')['args'][0]['value']

    add_rows_append_in(target_table_id, source_table_id)
    return {
        "target_table_id": target_table_id,
        "source_table_id": source_table_id,
        # "index": index,
        # "added_fields": added_fields,
        "nan_type": nan_type
    }


def add_rows_append_in(target_table_id, source_table_id, **kwargs):
    """
    把两张表纵向拼起来，取target_table的fields


    :param target_table:
    :type target_table:
    :param source_table:
    :type source_table:
    :param kwargs:
    :type kwargs:
    :return:
    :rtype:
    """
    # 无数据的单元格填充
    empty_cell_filling = None
    # source table
    source_table = staging_data_business.get_by_staging_data_set_id(
        staging_data_set_id=source_table_id)

    added_dict = []

    for row in source_table:
        new_row = {
            **row.to_mongo().to_dict(),
            # 'staging_data_set': ObjectId(target_table_id)
        }
        new_row.pop("_id")
        new_row.pop("staging_data_set")
        added_dict.append(new_row)
    staging_data_business.add_many(target_table_id, added_dict)


def test_add_rows_append():

    add_rows_append_in("59fffa1ed845c026aa27fae9", "59fffa1ed845c026aa27fae9")

    # def sds_data_to_table(data):
    #     return [d.to_mongo().to_dict() for d in data]
    #
    # target_sds_id = '59c21d71d845c0538f0faeb2'
    # target_data = staging_data_business.get_by_staging_data_set_id(target_sds_id)
    # source_data = staging_data_business.get_by_staging_data_set_and_fields(
    #     staging_data_set_id=target_sds_id,
    #     fields=['Attention', 'Attention_dimension_reduction_PCA_col']
    # )
    # add_rows_append(
    #     target_table=sds_data_to_table(target_data),
    #     source_table=sds_data_to_table(source_data)
    # )


def test_add_column_append():
    # add_columns_append_in(
    #     target_table_id='5a0012ccd845c02ce3da30c8',
    #     source_table_id='5a0012ccd845c02ce3da30c8',
    #     index=["_id"],
    #     added_fields=['Attention', 'Attention_dimension_reduction_PCA_col'],
    #     nan_type='null'
    # )
    # add_columns_append_in("59c21d71d845c0538f0faeb2",
    #                       "59c21d71d845c0538f0faeb2",
    #                       ["_id"],
    #                       ['Excitement'],
    #                       None)
    add_columns_append_in("5a02b7bdd845c0147784cc34",
                          "5a02b7bdd845c0147784cc34",
                          [],
                          ['day'],
                          None)


if __name__ == '__main__':
    test_add_rows_append()
