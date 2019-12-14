#! /usr/bin/env node  自定义爬取内容
'use strict';
const request = require('superagent')
const { table } = require('table')

const ZingConf = require('./config')
const ZingInquirer = require('./inquirer')
const ZingGit = require('./git')
const ZingSql = require('./sql')

// 输出表格数据
let output

function createBranch(branchPrefix, tableData) {
  let config = {
    columns: {
      0: {
        alignment: 'left',
        width: 5
      },
      1: {
        alignment: 'right',
        width: 10
      },
      2: {
        alignment: 'right',
        width: 60
      },
      3: {
        alignment: 'right',
        width: 70
      }
    }
  }

  // 添加表头
  tableData.unshift(['序号', '需求/BUG编号', '标题', '链接（Command/Ctrl+鼠标左键链接可点击）']); // 注意数组索引, [0,1,2..]
  output = table(tableData, config)
  console.log(output)
  ZingInquirer.inputNumRadio("请输入您要解决的 BUG 或 FEATURE 序号 :", index => {
    let bug = tableData[~~index];
    let code = bug[1];
    let title = bug[3];
    ZingGit.checkoutBranch(`${branchPrefix}-${code}`, null);
    console.log("您选择的 需求/BUG 编号：%s  >>> %s \n", code, title)
  });
}

function loagMyBug(queryData, fn) {
  ZingConf.get('chandao', cookie => {

    request.get(`${ZingConf.zentaoBaseUrl}/zentao/my-bug.json`)
      .query(queryData)
      .set('Cookie', cookie)
      .then(res => {
        let info = JSON.parse(JSON.parse(res.text).data)
        let bugs = info.bugs
        // 存储数据的表格
        let tableData = []
        for (let i = 0; i < bugs.length; i++) {
          tableData[i] = [i + 1, bugs[i].id, bugs[i].title, `${ZingConf.zentaoBaseUrl}/zentao/bug-view-${bugs[i].id}.html`]
        }
        if (bugs.length == 0) {
          tableData[i] = [0, '-', '-', '您没有BUG', `${ZingConf.zentaoBaseUrl}/zentao/`]
        }

        if (fn != undefined) fn(tableData);

      })
      .catch(err => {
        console.error(err)
        console.warn('cookie 可能已经过期，请重新调整！')
        ZingConf.check()
      })
  })

}

async function loadMyFeature(fn) {
  let userId = ""

  let userData = await ZingConf.get("wekan");
  if (userData == '') {
    ZingConf.check("wekan")
    return
  }
  userData = JSON.parse(userData)
  if (typeof userData === "object") {
    userId = userData.id;

  }

  const boards = await wekanRequest(`/api/users/${userId}/boards`);
  let boardList = [];
  for (let i = 0; i < boards.length; i++) {
    let board = boards[i]
    if (board.title !== "Templates") {
      const lists = await wekanRequest(`/api/boards/${board._id}/lists`);
      for (let j = 0; j < lists.length; j++) {
        const list = lists[j];
        if (!isEmpty(list) && isUncommitFeature(list.title)) {
          boardList.push({ boardId: board._id, listId: list._id })
        }
      }
    }
  }

  let cardList = [];
  for (let i = 0; i < boardList.length; i++) {
    let boardId = boardList[i].boardId;
    let listId = boardList[i].listId;
    const cards = await wekanRequest(`/api/boards/${boardId}/lists/${listId}/cards`);
    for (let j = 0; j < cards.length; j++) {
      cardList.push({ boardId, listId, cardId: cards[j]._id })
    }
  }

  let features = [];
  for (let i = 0; i < cardList.length; i++) {
    let boardId = cardList[i].boardId;
    let listId = cardList[i].listId;
    let cardId = cardList[i].cardId;
    const feature = await wekanRequest(`/api/boards/${boardId}/lists/${listId}/cards/${cardId}`);
    if (feature.members.indexOf(userId) >= 0) {
      features = features.concat(feature)
    }
  }

  let tableData = []
  let index = 1;
  features.forEach(item => {
    tableData.push([index++, item.customFields[0].value, item.title, `${ZingConf.wenkanBaseUrl}/b/${item.boardId}/board/${item._id}`])
  })
  fn(tableData)
}

function isUncommitFeature(title) {
  return !isEmpty(title) && title.indexOf("进行中") >= 0;
}

function isEmpty(val) {
  return typeof val === "undefined" || val === null || val === "";
}

async function wekanRequest(path, fn) {
  const promise = new Promise((resolve, reject) => {
    ZingConf.get("wekan", userData => {
      userData = JSON.parse(userData)
      let authorization = "";
      if (typeof userData === "object") {
        authorization = userData.token;
      }
      request.get(ZingConf.wenkanBaseUrl + path)
        .set('Authorization', `Bearer ${authorization}`)
        .then(res => {
          if (res.body.statusCode === 401) {
            console.error(res.body.statusCode === 401)
            ZingConf.check("wekan")
          } else {
            resolve(res.body)
          }

        })
        .catch(err => {
          reject(err)
          console.error('cookie 可能已经过期，请重新调整！')
        })
    });

  });
  return promise
}



function switchType(type) {
  // queryData.xxx
}

module.exports = {

  bug(queryData) {
    loagMyBug(queryData, res => {
      createBranch("fix-bug", res)
    });
  },
  feature() {
    loadMyFeature(res => {
      createBranch("fix-feature", res)
    })
  }
}