#! /usr/bin/env node  自定义爬取内容
'use strict'; 
const request = require('superagent')
const { table } = require('table')

const ZingConf = require('./config')
const ZingInquirer = require('./inquirer')
const ZingGit = require('./git')


// 存储数据的表格
let tableData = []
  
// 输出表格数据
let output

 

// 获取查询结果
function getResult(queryData, articleType) {
  let config = {};
  let url
  if (articleType === 'bug') {
    url = 'http://39.104.96.233:60888/zentao/my-bug.json'
  } else {
    url = 'https://wekan'
  }
  // ZingConf.checkCookie();
  // 网络请求
  console.log('=====')
  console.log(ZingConf.getCookie())
  request.get(url)
    .query(queryData)
    .set('Cookie', ZingConf.getCookie())
    .then(res => {
      let info = JSON.parse(JSON.parse(res.text).data)
      let bugs = info.bugs
      for (let i = 0; i < bugs.length; i++) {
        tableData[i] = [i+1, bugs[i].id, bugs[i].openedBy, bugs[i].title, `http://39.104.96.233:60888/zentao/bug-view-${bugs[i].id}.html`]
      }
      if(bugs.length == 0 ) {
        tableData[i] = [0, '-', '-', '您没有BUG', `http://39.104.96.233:60888/zentao/`]
      }
    }).then(() => {
      config = {
        columns: {
          0: {
            alignment: 'left',
            width: 5
          },
          1: {
            alignment: 'right',
            width: 5
          },
          2: {
            alignment: 'right',
            width: 15
          },
          3: {
            alignment: 'right',
            width: 60
          }
        }
      }

      // 添加表头
      tableData.unshift(['序号', 'BUG编号', '创建人', '标题', '链接（Command/Ctrl+鼠标左键链接可点击）']); // 注意数组索引, [0,1,2..]
      output = table(tableData, config)
      console.log(output)
      ZingInquirer.inputBugIndex( index => {
        let bug = tableData[~~index];
        let bugId =  bug[1];
        let bugName =  bug[3];
        ZingGit.checkoutBranch(`fix-bug-${bugId}`,null,bugId);
        console.log("您选择的 BUG 编号：%s  >>> %s 👌",bugId,bugName)
      });
    })
    .catch(err => {
      console.warn('cookie 可能已经过期，请重新调整！')
      ZingConf.checkCookie()
    })
}

function switchType(type) {
  // queryData.xxx
}

module.exports  =  {
  getResult : getResult,
}