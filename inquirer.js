#! /usr/bin/env node  自定义交互内容
'use strict';
const inquirer = require('inquirer');
var chalkPipe = require('chalk-pipe');

function ZingInquirer () {}

ZingInquirer.prototype.list = function() {
  inquirer.prompt([
    {
      type: 'list',
      name: 'theme',
      message: 'What do you want to do?',
      choices: [
        'Order a pizza',
        'Make a reservation',
        new inquirer.Separator(),
        'Ask for opening hours',
        {
          name: 'Contact support',
          disabled: 'Unavailable at this time'
        },
        'Talk to the receptionist'
      ]
    },
    {
      type: 'list',
      name: 'size',
      message: 'What size do you need?',
      choices: ['Jumbo', 'Large', 'Standard', 'Medium', 'Small', 'Micro'],
      filter: function(val) {
        return val.toLowerCase();
      }
    }
  ])
  .then(answers => {
    console.log(JSON.stringify(answers, null, '  '));
  })
}


ZingInquirer.prototype.longList = function() {
  var choices = Array.apply(0, new Array(26)).map((x, y) => String.fromCharCode(y + 65));
  choices.push('Multiline option \n  super cool feature');
  choices.push({
    name:
      'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam dictum felis eu pede mollis pretium.',
    value: 'foo',
    short: 'The long option'
  });
  
  inquirer
    .prompt([
      {
        type: 'list',
        name: 'letter',
        message: "What's your favorite letter?",
        choices: choices
      },
      {
        type: 'checkbox',
        name: 'name',
        message: 'Select the letter contained in your name:',
        choices: choices
      }
    ])
    .then(answers => {
      console.log(JSON.stringify(answers, null, '  '));
    });
}

ZingInquirer.prototype.checkbox = function(choices,callback) {
  console.log(choices)
  inquirer
  .prompt([
    {
      type: 'checkbox',
      message: '请检查您要提交的内容！默认全部提交，上下操作按空格取消您不想提交的内容。',
      name: 'files',
      choices: choices,
      validate: function(answer) {
        if (answer.length < 1) {
          return '请至少选择一个要提交的内容！';
        }
        return true;
      }
    }
  ])
  .then(answers => {
    console.log(JSON.stringify(answers, null, '  '));
    callback(answers.files)
  });
}

// BUG 编号 「需求可重用」
ZingInquirer.prototype.inputBugIndex = function(callback) {
  var questions = [
    {
      type: 'input',
      name: 'index',
      message: "请输入您要解决的 BUG 或 FEATURE 序号 :",
      validate: function(value) {
        var pass = value.match(
          /^-?[1-9]\d*$/i
        );
        if (pass) {
          return true;
        }
        return '请输入正确的序号数字 ！';
      }
    }
  ];
  
  inquirer.prompt(questions).then(answers => {
    callback(answers.index);
  });
}

// 设置相关 Cookie
ZingInquirer.prototype.setCookie = function(type,callback) {
  var questions = [
    {
      type: 'input',
      name: 'cookie',
      message: ` \n 检测到您没有填写过 「${type}」 Cookie，或 Cookie 已经失效，请粘贴 Cookie ! \n 或手动在 /usr/local/zingGit-config.json 内进行配置 :`,
    }
  ];

  inquirer.prompt(questions).then(answers => {
    callback(answers.cookie);
  });
}

 
new ZingInquirer().checkbox();

module.exports = new ZingInquirer();
