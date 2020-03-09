#! /usr/bin/env node  配置文件
'use strict';
var fs = require("fs");
var request = require('superagent');
var ZingInquirer = require("./inquirer");
var ZingSql = require("./sql");


const CONFIG_PATH = '/usr/local/zingGit-config.json';
// const DIR_USR = '/usr/';
// const DIR_LOCAL = '/usr/local/';

class ZingConfig {
  constructor() {
    this.wenkanBaseUrl = "http://wekan.qmenhu.com";
    this.zentaoBaseUrl = "http://bug.qmenhu.com"
  }

  writeConfig(config) {
    fs.writeFile(CONFIG_PATH, config, function (err) {
      if (err) {
        return console.error(err);
      }
    });
  }

  init(callback) {
    ZingSql.init(ok => {
      callback()
    });
  }

  loadChandao(account, password) {
    const promise = new Promise((resolve, reject) => {
      request.post(`${this.zentaoBaseUrl}/zentao/user-login.json`)
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .set('Accept', ' */*')
        .send({ account, password })
        .then((res) => {
          let ret = JSON.parse(res.text)
          if ("success" === ret.status) {
            let ret = res.header['set-cookie'];
            let cookies = [];
            ret.forEach(element => {
              let arr = element.split(";");
              cookies.push(arr[0])
            });
            let cookie = cookies.join(";");
            resolve({ success: true, cookie })
          } else {
            resolve({ success: false })
          }
          //callback(res.body)
        })
        .catch(err => {
          console.error("用户名密码错误", err)
        })
    });
    return promise;
  }

  loadWekan(username, password) {
    const promise = new Promise((resolve, reject) => {
      request.post(`${this.wenkanBaseUrl}/users/login`)
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .set('Accept', ' */*')
        .send({ username, password })
        .then(res => {
          resolve({ success: true, cookie: JSON.stringify(res.body) })
        })
        .catch(err => {
          resolve({ success: false })
        })
    });
    return promise;
  }

  async getAuthorization(type) {
    let user = await this.getUser(type);
    return user.cookie;
  }

  getUser(type) {
    const promise = new Promise((resolve, reject) => {
      if (type == undefined || type === null) {
        type = 'chandao';
      }
      ZingSql.getUser(type, res => {
        resolve(res);
      })
    });
    return promise
  }

  async login(type) {
    if (type == undefined || type === null) {
      type = 'chandao';
    }
    let user = await this.getUser(type);
    if ("chandao" === type) {
      let ret = await this.loadChandao(user.name, user.password);
      if (!ret.success) {
        let inputUser = await ZingInquirer.inputUserMsg(" \n 请输入禅道用户名密码以空格隔开 :");
        ret = await this.loadChandao(inputUser.username, inputUser.password);
        await ZingSql.updateUser(inputUser.username, inputUser.password, ret.cookie, type);
      } else {
        await ZingSql.updateUser(user.name, user.password, ret.cookie, type);
      }
    } else if ("wekan" === type) {
      let ret = await this.loadWekan(user.name, user.password);
      if (!ret.success) {
        let inputUser = await ZingInquirer.inputUserMsg(" \n 请输入看板用户名密码以空格隔开 :");
        ret = await this.loadWekan(inputUser.username, inputUser.password);
        await ZingSql.updateUser(inputUser.username, inputUser.password, ret.cookie, type);
      } else {
        await ZingSql.updateUser(user.name, user.password, ret.cookie, type);
      }
    }
  }
}

module.exports = new ZingConfig();