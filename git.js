'use strict';
//where the workingDirPath is optional, defaulting to the current directory.
const git = require('simple-git')();

function ZingGit () {}

// rebase 比较适合公司场景 http://gitbook.liuhui998.com/4_2.html

// update repo and when there are changes, restart the app
ZingGit.prototype.pull = function() {
  git.pull((err, update) => {
        if(update && update.summary.changes) {
          //  require('child_process').exec('npm restart');
          console.log('发现新的更新!')
          console.log(update)
        }
     });
}

ZingGit.prototype.gitInfo = function() {
  git.listRemote(['--get-url'], (err, data) => {
      if (!err) {
          console.info('当前工作目录：>>> %s   👌' , __dirname );
          console.info('当前远程空间：>>> %s   ' , data);
          // git.addRemote('origin', data, (err,addInfo) => {
          //   console.info('addInfo >>> ' + addInfo);
          // })
      }
  });
}

     
//git checkout -b 本地分支名 origin/远程分支名
ZingGit.prototype.checkoutBranch = function(branch,origin) {
  if(origin == undefined || origin === null) {
    origin = 'origin/dev'
  }
  git.checkoutBranch(branch,origin, function (err, result) {
    if(!err) {
      console.info('自动为您从 &s 创建并切换为分支：%s 👌',origin,branch)
      // new ZingGit().gitInfo();
      console.warn('请尽量确保一个分支只解决一个问题 ! ')
    }
  });
}

module.exports = new ZingGit();
     


 