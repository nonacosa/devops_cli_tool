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

- -b -f 领取 bug 或 需求

- zgit -c 提交

    自动从 origin/master checkout 一份按照规范命名的本地分支 eg: fix-bug-11011。
    
- zgit -p 合并到远程

    自动把 fix-bug-11011 推送到 origin，然后自动 切换/checkout dev 到本地，fetch、pull 代码， merge fix-bug-11011 到 dev，然后 push dev 到 origin/dev
    
    
## FAQ

- cookie

 cookie 要从外网获取：http://39.104.96.233:60888/zentao/  不要从内网获取

## 效果

![](http://www.gitrue.com:9000/image/A95FE3D1DCBD16064DF8824783448546.jpg)

![](http://www.gitrue.com:9000/image/A7055320A68EEF852DBA77002AEFBEED.jpg)

![](http://www.gitrue.com:9000/image/92330D317E10D026EC3E1C3EFD7755EB.png)
