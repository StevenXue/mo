# 快速开始
平台中联结了人工智能应用使用者、需求提出者、数据提供者、关键模组开发者以及应用组装者，集合网页端和移动端，满足不同用户的使用场景，实现了需求提出 - 可复用算法模块开发 - 模块组装 - 应用发布使用的生态链。

平台中涉及的概念：

应用：人工智能预测模型。满足普通用户的直接使用需求，例如航班延误预测模型。

模块：可复用的算法组件。分为 toolkit 以及 modle 两种，toolkit 为特定的不可训练的函数， modle则是可以训练优化，例如特征提取模块。

数据集：有一组数据组成的集合。平台支持 jpg 、csv 等格式，多个文件可以以 zip 压缩包的形式
上传到平台。

功能介绍:

**1. workspace 工作台**

无论完整的 AI 应用或是封装好的算法模块，都可以跳过繁琐的开发环境搭建，使用我们内嵌的 JupyterLab 直接上手。点击“新建应用”或“新建模块”即可快速开始。




**2. market 发现**

探索学习公开的应用以及模块算法，还有开放的数据集，发现喜欢的项目可以点赞收藏，如果你有优质的资源我们也欢迎你与其他数据爱好者共享。

**3. request 需求**

其他用户提出的需求会在这里分类展示，你可以寻找自己擅长的领域进行回答。如果你有任何需求，点击“发布需求”也会找到合适的帮手来为你解决。        

### 如何寻找别人提出的需求
<img src="./media/nav2.png"  />

点击首页导航中的Requst栏目。

<img src="./media/requst_eg.png"  />

点击需求列表中的栏目可以进入详情，如果回答显示对号则表明此条需求已经采纳了某条回答。

### 发布我的第一个需求
用户进入request模块，选择相应的request类型（apps/module/dataset), 点击 New app request, 填写相应内容。 用户可以在Request版块查找自己发布的需求，也可以在my profile中查看.
- title: 标题
- description: 描述
- Tags：标签
- Input: 对输入的描述
- Output: 对输出的描述

### 使用我的第一个App
用户进入 market / app , 点击自己需要的 app， 进入app 详情页面， 查看完app 的简介后，点击example ，在Input 填写自己的参数， 点击submit, 结果将会展示在output 框内. 
用户也可浏览app列表并通过category和tags进行筛选， 或者使用顶部搜索框进行筛选

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

### 返回的结果
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



