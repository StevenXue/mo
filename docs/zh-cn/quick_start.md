# 快速开始
Welcome to Getting Started with the MO

## 主页面
登录后主页面包含3个版块


<img src="./media/home.png"  width="840px" height="465px" />

**1. workspace 我的工作台**

包含用户的apps，modules 和 datasets

**2. market 市场**

包含平台上所有的apps，modules 和 datasets

**3. request 需求版**

包含用户发布的需求        


## 发布我的第一个需求
用户进入request模块，选择相应的request类型（apps/module/dataset), 点击 New app request, 填写相应内容。 用户可以在Request版块查找自己发布的需求，也可以在my profile中查看.
- title: 标题
- description: 描述
- Tags：标签
- Input: 对输入的描述
- Output: 对输出的描述

## 使用我的第一个App
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

## 返回的结果
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



