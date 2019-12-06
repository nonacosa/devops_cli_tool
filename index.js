#! /usr/bin/env node

const program = require('commander')
const request = require('superagent')
const { table } = require('table')
const Table2 = require('cli-table2')
const toolsInfo = require('./package.json')

const ZingInquirer = require('./inquirer')
const ZingGit = require('./git')
const ZingConf = require('./config')

// 初始化commander
program
  .version(toolsInfo.version, '-v, --version')
  .usage('<cmd> [option]')

ZingConf.init(ok => {

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
  
  program.on('--help', function () {
    console.info('')
    console.info('命令列表')
    console.info(table2.toString())
  })
  
  // 存储数据的表格
  let tableData = []
  
  // 输出表格数据
  let output
  
  let queryData = {
    src: 'sixgold',
    limit: 20,
    category: 'all'
  }
  
  if (program.fontend) {
    console.log('-fontend')
  }
  
  // 添加可选指令
  program
    .option('-b --bug ')
    .parse(process.argv)
  
  /***
   * 检测是否携带可选则hot或者new参数
   */
  if (program.bug) {
    console.log('1')
    /***
     * 可选指令
     * -h         没有携带附加参数, 则program.hot为true
     * -h [dir]   携带dir参数, program.hot为dir字符串
     * 下方new参数同理
     */
    if (program.bug !== true) {
      switchType(program.hot)
    }
    getResult(queryData, 'bug')
  }
  
  if (program.new) {
    if (program.new !== true) {
      switchType(program.new)
    }
    getResult(queryData, 'new')
  }
  
  // bug 命令
  program
    .command('bug')
    .description('查看禅道我的 BUG 列表')
    .action(function (command) {
      getResult(queryData, 'bug')
    })
  // 提交 命令
  program
    .command('commit')
    .description('自动按规则 commit  修改')
    .action(function (command) {
      console.log(command)
    })
  
  // program
  //   .command('new <dir>')
  //   .description('获取最新需求列表')
  //   .action(function (dir, otherDirs) {
  //     switchType(dir)
  //     getResult(queryData, 'new')
  //   })
  
    // 参数不满足两个默认去禅道找bug
  if (process.argv.length === 0) {
    console.warn('请按照要求输入参数，帮助请看 --help : \n');
    console.info(table2.toString())
  }
  
  program.parse(process.argv)
  
  // 获取查询结果
  function getResult(queryData, articleType) {
    let url
    if (articleType === 'bug') {
      url = 'http://39.104.96.233:60888/zentao/my-bug.json'
    } else {
      url = 'https://wekan'
    }
    //lang=zh-cn; device=desktop; theme=default; preBranch=0; bugModule=0; qaBugOrder=id_desc; lastProject=1; moduleBrowseParam=0; preProjectID=1; projectTaskOrder=id_desc; selfClose=0; productBrowseParam=9; keepLogin=on; za=zhuangwenda; lastProduct=49; preProductID=49; zp=422adbe139a2d5a846a1af2377d5e8da159d0a7d; selfClose=1; windowHeight=1217; windowWidth=1171; zentaosid=edf0vi8v07bln97tqo2gnusgt5
    ZingConf.checkCookie();
    // 网络请求
    request.get(url)
      .query(queryData)
      .set('Cookie', ZingConf.getCookie())
      .then(res => {
        let info = JSON.parse(JSON.parse(res.text).data)
        let bugs = info.bugs
        for (let i = 0; i < bugs.length; i++) {
           
          tableData[i] = [i+1, bugs[i].id, bugs[i].openedBy, bugs[i].title, `http://39.104.96.233:60888/zentao/bug-view-${bugs[i].id}.html`]
        }
      }).then(() => {
        config = {
          columns: {
            0: {
              alignment: 'left',
              width: 10
            },
            1: {
              alignment: 'right',
              width: 10
            },
            2: {
              alignment: 'right',
              width: 20
            },
            3: {
              alignment: 'right',
              width: 40
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
          ZingGit.checkoutBranch(`fix-bug-${bugId}`,null);
          console.log("您选择的 BUG 编号：%s  >>> %s 👌",bugId,bugName)
        });
      })
      .catch(err => {
        console.error('err' + err)
      })
  }
  
  function switchType(type) {
      // queryData.xxx
  }
  
});

