# 快速入门

## 使用项目
<img src="./media/nav1.png" width="50%" height="50%" />

点击首页导航中的discovery栏目。

<img src="./media/app_eg.png"  />

展示卡片会显示项目名称、描述、作者、创建时间以及项目分类，点击卡片可以进入应用详情。应用的使用方式有两种：

**1. 直接使用**

进入应用详情页面， 查看完app 的简介后，点击example ，根据应用要求输入 自己的参数并点击提交，结果将自动反馈在输出区域内。

**2. 调用API**

We’ll make our first call with the demo algorithm “Hello”. This algorithm takes an input of a string (preferably your name!) and returns a greeting addressed to the input.

Calling the algorithm is as simple as making a curl request. For example, to call the demo/Hello algorithm, simply run a cURL request in your terminal:

```$xslt
curl -X POST -d '"YOUR_USERNAME"' -H 'Content-Type: application/json' -H 'Authorization: Simple YOUR_API_KEY' https://api.algorithmia.com/v1/algo/demo/Hello/
```

You can also use one of the clients to make your call. See below for examples or visit one of the Client Guides for details on how to call algorithms and work with data in your language of choice.

```$xslt
import Algorithmia

input = "YOUR_USERNAME"
client = Algorithmia.client('YOUR_API_KEY')
algo = client.algo('demo/Hello/')
print algo.pipe(input)
```

###### 返回的结果
Each algorithm returns a response in JSON. It will include the "result" as well as metadata about the API call you made. The metadata will include the content_type as well as a duration.
```$xslt
curl -X POST -d '"YOUR_USERNAME"' -H 'Content-Type: application/json' -H 'Authorization: Simple API_KEY' https://api.algorithmia.com/v1/algo/demo/Hello/

{ "result": "Hello YOUR_USERNAME",
  "metadata": {
     "content_type": "text",
     "duration": 0.000187722
  }
}
```
he duration is the compute time of the API call into the algorithm. This is the time in seconds between the start of the execution of the algorithm and when it produces a response. Because you are charged on the compute time of the API call, this information will help you optimize your use of the API.

For more information about pricing, check out our Pricing Guide

## 探索需求
**1. 发布需求**
用户进入request模块，选择相应的request类型（apps/module/dataset), 点击新建需求, 填写相应内容。 用户可以在Request版块查找自己发布的需求，也可以在my profile中查看.

**3. 创建项目**
点击首页导航中的workspace栏目，先选择文件类型，项目分为应用、模块、数据集三种，在对应页面点击“新建按钮”，填写名称、描述等信息完成创建。创建完成或会自动计入项目详情页面，点击“notebook”按钮，即可进入工作编辑区进行开发训练。

notebook分为三个区域如下图所示：

A区域是文件管理区，包含项目所有程序文件列表，在这里可以进行文件的新建、删除等操作。

B区域是主要编程区，你可以在这里用 Python 语言进行开发测试。

C区域是资源区，包含平台中所有的模块与数据集列表，查找到需要的模块后可以查看使用说明并直接插入到B区域编程区。

更多功能介绍参考 Notebook 功能介绍。
