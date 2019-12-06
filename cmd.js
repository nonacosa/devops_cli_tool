'use strict';
const program = require('commander')
const Table2 = require('cli-table2')
const toolsInfo = require('./package.json')
const ZingFetch = require('./fetch')
const ZingGit = require('./git')
function ZingCMD () {}

let table2 = new Table2({
  head: ['功能','命令', '缩写','例子'],
  colWidths: [35,10,10,40]
})

table2.push(
  ['查看帮助','--help','-h' ,'zingGit -h 或 zingGit --help'],
  ['查看 「 wekan 」列表 (敬请期待)','feature','-f' ,'zingGit -f 或 zingGit feature'],
  ['查看 「 禅 道 」列表 ','bug','-b','zingGit -b 或 zingGit bug'],
  ['可以自动填写 commit 信息','commit','-c','zingGit -c 或 zingGit commit']
)

ZingCMD.prototype.listening = function() {
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
    .option('-b --bug ')
    .option('-f --feature ')
    .option('-c --commit ')
    .parse(process.argv)
  
  /***
   * 检测是否携带可选 
   */
  if (program.bug) {
    console.log('--------')
    /***
     * 可选指令
     * -h         没有携带附加参数, 则program.hot为true
     * -h [dir]   携带dir参数, program.hot为dir字符串
     * 下方new参数同理
     */
    if (program.bug !== true) {
      
      // switchType(program.hot)
    }
    ZingFetch.getResult({}, 'bug')
  }
 
  // bug 命令
  program
    .command('bug')
    .description('查看禅道我的 BUG 列表')
    .action(function (command) {
      ZingFetch.getResult({}, 'bug')
    })
  // 提交 命令
  program
    .command('commit')
    .description('自动按规则 commit  修改')
    .action(function (command) {
      ZingGit.checkAndCommit()
    })
  
  // program
  //   .command('new <dir>')
  //   .description('获取最新需求列表')
  //   .action(function (dir, otherDirs) {
  //     switchType(dir)
  //     ZingFetch.getResult(queryData, 'new')
  //   })
 

  // 参数不满足两个默认去禅道找bug
  if (process.argv.length === 2) {
    console.warn('\n 请按照要求输入参数，帮助请看 --help \n\n 或访问：            http://39.104.73.92:81/dev-team/zingGit \n');
    console.info(table2.toString())
  }
  
  program.parse(process.argv)
  


}

module.exports = new ZingCMD();
     


 