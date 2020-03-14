#! /usr/bin/env node  自定义爬取内容

'use strict';
const request = require('superagent')
const {
  table
} = require('table')

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
        alignment: 'center',
        width: 4
      },
      1: {
        alignment: 'center',
        width: 8
      },
      2: {
        alignment: 'left',
        width: 35
      },
      3: {
        alignment: 'left'
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

async function loagMyBug(queryData, fn) {
  let cookie = await ZingConf.getAuthorization();
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
      fn(tableData);
    })
    .catch(async err => {
      //console.info(err)
      await ZingConf.login();
      loagMyBug(queryData, fn)
      //console.warn('cookie 可能已经过期，请重新调整！')
    })
}

async function loagMyTask(queryData, fn) {
  let cookie = await ZingConf.getAuthorization();
  request.get(`${ZingConf.zentaoBaseUrl}/zentao/my-task.json`)
    .query(queryData)
    .set('Cookie', cookie)
    .then(res => {
      let info = JSON.parse(JSON.parse(res.text).data)
      let tasks = info.tasks
      // 存储数据的表格
      let tableData = []
      for (let i = 0; i < tasks.length; i++) {
        tableData[i] = [i + 1, tasks[i].id, tasks[i].title, `${ZingConf.zentaoBaseUrl}/zentao/task-view-${tasks[i].id}.html`]
      }
      if (tasks.length == 0) {
        tableData[i] = [0, '-', '-', '您没有任务', `${ZingConf.zentaoBaseUrl}/zentao/`]
      }
      fn(tableData);
    })
    .catch(async err => {
      //console.info(err)
      await ZingConf.login();
      loagMyBug(queryData, fn)
      //console.warn('cookie 可能已经过期，请重新调整！')
    })
}

async function loadMyFeature(fn) {
  let userId = ""

  let userData = await ZingConf.getAuthorization("wekan");
  if (userData == '') {
    await ZingConf.login("wekan")
    userData = await ZingConf.getAuthorization("wekan");
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
          boardList.push({
            boardId: board._id,
            listId: list._id
          })
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
      cardList.push({
        boardId,
        listId,
        cardId: cards[j]._id
      })
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

async function wekanRequest(path) {
  let userData = await ZingConf.getAuthorization("wekan");

  const promise = new Promise((resolve, reject) => {
    userData = JSON.parse(userData)
    let authorization = "";
    if (typeof userData === "object") {
      authorization = userData.token;
    }
    request.get(ZingConf.wenkanBaseUrl + path)
      .set('Authorization', `Bearer ${authorization}`)
      .then(async res => {
        if (res.body.statusCode === 401) {
          await ZingConf.login("wekan")
        } else {
          resolve(res.body)
        }
      })
      .catch(async err => {
        reject(err)
        await ZingConf.login("wekan")
      })
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
  task(queryData) {
    loagMyTask(queryData, res => {
      createBranch("fix-task", res)
    });
  },
  feature() {
    loadMyFeature(res => {
      createBranch("fix-feature", res)
    })
  }
}