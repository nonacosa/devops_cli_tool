#! /usr/bin/env node

const program = require('commander')
const request = require('superagent')
const { table } = require('table')
const Table2 = require('cli-table2')
const toolsInfo = require('./package.json')

const inquirer = require('./inquirer')

// 初始化commander
program
  .version(toolsInfo.version, '-v, --version')
  .usage('<cmd> [option]')

let table2 = new Table2({
  head: ['功能','命令', '缩写'],
  colWidths: [30,10,10 ]
})

table2.push(
  ['我要完成 : 功能/需求','feature','-f' ],
  [ '我要解决 : BUG','bug','-b']
)

program.on('--help', function () {
  console.log('')
  console.log('命令列表')
  console.log(table2.toString())
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
  .option('-h --hot [dir]', 'an dir argument')
  .option('-n --new [dir]', 'an dir argument')
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
    switchDir(program.hot)
  }
  getResult(queryData, 'bug')
}

if (program.new) {
  if (program.new !== true) {
    switchDir(program.new)
  }
  getResult(queryData, 'new')
}

// 添加自定义命令
program
  .command('hot <dir>')
  .description('获取最热文章列表')
  .action(function (dir, otherDirs) {
    switchDir(dir)
    getResult(queryData, 'bug')
  })

program
  .command('new <dir>')
  .description('获取最新文章列表')
  .action(function (dir, otherDirs) {
    switchDir(dir)
    getResult(queryData, 'new')
  })

if (!process.argv[2]) {
  switchDir(program.hot)
  getResult(queryData, 'bug')
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
  
  // 网络请求
  request.get(url)
    .query(queryData)
    .set('Cookie', 'lang=zh-cn; device=desktop; theme=default; preBranch=0; bugModule=0; qaBugOrder=id_desc; lastProject=1; moduleBrowseParam=0; preProjectID=1; projectTaskOrder=id_desc; selfClose=0; productBrowseParam=9; keepLogin=on; za=zhuangwenda; lastProduct=49; preProductID=49; zp=422adbe139a2d5a846a1af2377d5e8da159d0a7d; selfClose=1; windowHeight=1217; windowWidth=1171; zentaosid=edf0vi8v07bln97tqo2gnusgt5')
    .then(res => {
      let info = JSON.parse(JSON.parse(res.text).data)
      let bugs = info.bugs
      for (let i = 0; i < bugs.length; i++) {
         
        tableData[i] = [i, bugs[i].id, bugs[i].openedBy, bugs[i].title, `http://39.104.96.233:60888/zentao/bug-view-${bugs[i].id}.html`]
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
      inquirer.inputBugIndex( index => {
        let bug = tableData[~~index];
        let bugId =  
        console.log("您选择的 BUG：")
        console.log(bug)
      });
    })
    .catch(err => {
      console.error('err' + err)
    })
}

function switchDir(dir) {
    // queryData.xxx
}
