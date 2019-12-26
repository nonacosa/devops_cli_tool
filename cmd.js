'use strict';
const program = require('commander')
const Table2 = require('cli-table2')
const toolsInfo = require('./package.json')
const ZingFetch = require('./fetch')
const ZingGit = require('./git')
function ZingCMD() { }

let table2 = new Table2({
  head: ['功能', '命令', '缩写', '例子'],
  colWidths: [35, 15, 10, 65]
})

table2.push(
  ['查看帮助',                      'help',      '-h',  'zgit -h 或 zgit --help'],
  ['查看 「 wekan 」列表 (敬请期待)', 'feature',   'f',   'zgit f 或 zgit feature'],
  ['查看 「 禅 道 」列表 ',          'bug',       'b',    'zgit b 或 zgit bug 后面可以跟 branch 名称 zgit b xxx「一般用于没有对应 bug 的情况」'],
  ['可以自动填写 commit 信息',       'commit',    'c',    'zgit c 或 zgit commit 后面可跟 msg:「zgit c 这是一次提交」 '],
  ['自动 push',                    'push',      'p',    'zgit p 或 zgit push'],
  ['切换分支',                      'checkout',  'co',   'zgit co 或 zgit checkout']
)

ZingCMD.prototype.listening = function () {
  // 初始化commander
  program
    .version(toolsInfo.version, '-v, --version')
    .usage('<cmd> [option]');

  program.on('--help', function () {
    console.info('')
    console.info('命令列表')
    console.info(table2.toString())
  });


  if (program.fontend) {
    console.log('-fontend')
  }

  // 添加可选指令
  program
    .option('b bug')
    .option('f feature')
    .option('c commit')
    .option('p push')
    .option('co mergeAbort')
    .option('ma mergeAbout')
    .parse(process.argv)

  if (program.bug) {// bug 命令
    let branchName = null;
    if(program.args.length > 0) {
      branchName = program.args[0]
      ZingGit.checkoutBranch(`fix-bug-${branchName}`, null);
      console.log("您自定义的分支名称：fix-bug-%s \n", branchName)
      return;
    }
    ZingFetch.bug({})
  }

  if (program.feature) {// feature 命令
    ZingFetch.feature({})
  }

  if (program.commit) {// 提交 命令
    let msg = null;
    if(program.args.length > 0) {
      msg = program.args[0]
    }
    ZingGit.checkAndCommit(msg)
  }

  if (program.push) {// 提交 命令
    ZingGit.pushZinglabsRules()
  }

  if (program.checkout) {// 提交 命令
    ZingGit.showAndCheckout()
  }


  if (program.mergeAbort) {// 提交 命令
    ZingGit.mergeAbort()
  }




 

  program.parse(process.argv)



}

module.exports = new ZingCMD();



