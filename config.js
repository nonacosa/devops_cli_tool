#! /usr/bin/env node  配置文件
'use strict';
var fs = require("fs");
var request = require('superagent');
var ZingInquirer = require("./inquirer");

const CONFIG_PATH = '/usr/local/zingGit-config.json';
const DIR_USR = '/usr/';
const DIR_LOCAL = '/usr/local/';

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
    fs.readFile(CONFIG_PATH, function (err, data) {
      if (err) {
        console.info('配置文件不存在，正在创建... ')
        fs.mkdir(DIR_USR, err => {
          // -17  目录已存在
          if (!err || err.errno == -4075 || err.errno == -17) {
            fs.mkdir(DIR_LOCAL, err => {
              if (!err || err.errno == -4075 || err.errno == -17) {
                console.info('目录创建成功...')
                fs.writeFile(CONFIG_PATH, JSON.stringify({ chandao: '', wekan: '' }), function (err) {
                  if (err) {
                    console.error('创建文件失败，请检查权限，UNIX 系统以管理员「sudo」运行！ ')
                    return console.error(err);
                  } else {
                    console.info('初始化成功 👌');
                    callback();
                  }

                });
              }
            })

          } else {
            console.error(err)
          }
        })
      } else {
        callback();
      }
    });
  }

  //重置配置文件：删除 -> 重新创建
  resetConfig(config) {
    fs.unlink(CONFIG_PATH, cb => {
      this.writeConfig(config);
      console.info('配置文件已重置！')
    });
  }

  check(type) {
    if (type == undefined || type === null) {
      type = 'chandao';
    }
    fs.readFile(CONFIG_PATH, (err, data) => {
      if (!err) {
        let Config = JSON.parse(data.toString());
        // 未配置，请输入相关 cookie
        if ("chandao" === type) {
          ZingInquirer.inputUserMsg(" \n 请输入禅道用户名密码以空格隔开 :", (account, password) => {
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
                Config[type] = cookies.join(";");
                this.resetConfig(JSON.stringify(Config));
                //callback(res.body)
              })
              .catch(err => {
                console.error("用户名密码错误", err)
              })
          })
        } else if ("wekan" === type) {
          ZingInquirer.inputUserMsg(" \n 请输入禅道用户名密码以空格隔开 :", (username, password) => {
            request.post(`${this.wenkanBaseUrl}/users/login`)
              .set('Content-Type', 'application/x-www-form-urlencoded')
              .set('Accept', ' */*')
              .send({ username, password })
              .then(res => {
                Config[type] = res.body;
                this.resetConfig(JSON.stringify(Config));
              })
              .catch(err => {
                console.error("用户名密码错误", err)
              })
          })
        }
      }
    });
  }

  get(type) {
    if (type == undefined || type === null) {
      type = 'chandao';
    }
    //同步较好
    var data = fs.readFileSync(CONFIG_PATH, 'utf-8');
    let Config = JSON.parse(data.toString());
    return Config[type];
  }
}

module.exports = new ZingConfig();