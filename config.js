#! /usr/bin/env node  配置文件
'use strict';
var fs = require("fs");

var ZingInquirer = require("./inquirer");

const CONFIG_PATH = '/usr/local/xxxx/zingGit-config.json';
const DIR_USR = '/usr/';
const DIR_LOCAL = '/usr/local/';

function ZingConfig() { }


ZingConfig.prototype.writeConfig = function (config) {
  fs.writeFile(CONFIG_PATH, config, function (err) {
    if (err) {
      return console.error(err);
    }
  });
}

ZingConfig.prototype.init = function (callback) {
  fs.readFile(CONFIG_PATH, function (err, data) {
    if (err) {
      console.info('配置文件不存在，正在创建...')
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
ZingConfig.prototype.resetConfig = function (config) {
  fs.unlink(CONFIG_PATH, cb => {
    this.writeConfig(config);
    console.info('配置文件已重置！')
  });

}
ZingConfig.prototype.check = function (type) {

  if (type == undefined || type === null) {
    type = 'chandao';
  }
  fs.readFile(CONFIG_PATH, function (err, data) {
    if (!err) {
      let Config = JSON.parse(data.toString());
      let typeConfig = Config[type];
      // 未配置，请输入相关 cookie
      ZingInquirer.setCookie(type, data => {
        Config[type] = data;
        new ZingConfig().resetConfig(JSON.stringify(Config));
      })
    }
  });
}


ZingConfig.prototype.get = function (type) {
  if (type == undefined || type === null) {
    type = 'chandao';
  }
  //同步较好
  var data = fs.readFileSync(CONFIG_PATH, 'utf-8');
  let Config = JSON.parse(data.toString());
  return Config[type];
}

module.exports = new ZingConfig();