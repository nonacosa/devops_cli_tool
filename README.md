## 英商 devops cli 工具     


 
## 如何安装？

```shell
npm install zing-git -g
```

或者 clone 代码，本地安装

```shell
npm install . -g
```

使用：

```
zgit --help # zgit -h
```    

定期更新，通知大家 update 即可。

## 使用流程

这是一套提交代码规范，使用流程如下：

## 领取 bug 或 需求

```shell
zgit --bug  # zgit -b
```
领取 bug

```shell
zgit --feature # zgit -f
```
领取需求


##  提交

```shell
zgit --commit  # zgit -c
```

> 自动从 origin/master checkout 一份按照规范命名的本地分支 eg: fix-bug-11011。
    
## 合并流程

```shell
zgit --push # zigt -p
```
这个命令做了什么事：

- ① 自动把 fix-bug-11011 推送到 origin

- ② 自动 切换/checkout dev 到本地

- ③ 自动 fetch、pull 代码保证本地 dev 与远程同步

- ④ 自动 merge fix-bug-11011 到 dev 

- ⑤ 自动 push dev 到 origin/dev

- ⑥ 手动解决/指派 bug ，等待测试即可

- ⑦ 如果bug被关闭收到邮件通知，手动 merge origin/fix-bug-11011 到 origin/master 即可

     
    
    
## FAQ

- cookie

 cookie 要从外网获取：http://39.104.96.233:60888/zentao/  不要从内网获取

## TODO

- 自动解决/指派


## 效果

![](http://www.gitrue.com:9000/image/A95FE3D1DCBD16064DF8824783448546.jpg)

![](http://www.gitrue.com:9000/image/A7055320A68EEF852DBA77002AEFBEED.jpg)

![](http://www.gitrue.com:9000/image/92330D317E10D026EC3E1C3EFD7755EB.png)
