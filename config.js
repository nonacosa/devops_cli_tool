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
    this.wenkanBaseUrl = "http://39.104.107.146";
    this.zentaoBaseUrl = "http://39.104.96.233:60888"
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

  

  check(type) {
    if (type == undefined || type === null) {
      type = 'chandao';
    }
    if ("chandao" === type) {
      ZingInquirer.inputUserMsg(" \n 请输入禅道用户名密码以空格隔开 :", (account, password) => {
        ZingSql.updateNameAndPassword(account,password,'chandao',() => {
            request.post(`${this.zentaoBaseUrl}/zentao/user-login.json`)
                  .set('Content-Type', 'application/x-www-form-urlencoded')
                  .set('Accept', ' */*')
                  .send({ account, password })
                  .then((res) => {
                    let ret = res.header['set-cookie'];
                    let cookies = [];
                    ret.forEach(element => {
                      let arr = element.split(";");
                      cookies.push(arr[0])
                    });
                    let cookie = cookies.join(";");
                    ZingSql.updateCookie(cookie,'chandao')


                    //callback(res.body)
                  })
            .catch(err => {
              console.error("用户名密码错误", err)
            })
          })
        
      })
    } else if ("wekan" === type) {
      ZingInquirer.inputUserMsg(" \n 请输入看板用户名密码以空格隔开 :", (username, password) => {
        ZingSql.updateNameAndPassword(username,password,'wekan',() => {

          request.post(`${this.wenkanBaseUrl}/users/login`)
                .set('Content-Type', 'application/x-www-form-urlencoded')
                .set('Accept', ' */*')
                .send({ username, password })
                .then(res => {
                  ZingSql.updateCookie(JSON.stringify(res.body),'wekan');
                })
                .catch(err => {
                  console.error("看板用户名密码错误", err)
          })
        })
        
      })
    }
  }

  async get(type,cb) {
    const promise = new Promise((resolve, reject) => {
      if (type == undefined || type === null) {
        type = 'chandao';
      }
      ZingSql.getCookie(type,cookie => {
        if(cb != undefined) cb(cookie)
        resolve(cookie);
      })
    });
    return promise
    
  }

  
}

module.exports = new ZingConfig();