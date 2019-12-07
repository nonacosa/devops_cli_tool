'use strict';
//where the workingDirPath is optional, defaulting to the current directory.
const git = require('simple-git')();
const ZingInquirer = require('./inquirer')
const inquirer = require('inquirer')

let currentBugId = '';

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
ZingGit.prototype.checkoutBranch = function(branch,origin,bugId) {
  git.fetch()
  if(origin == undefined || origin === null) {
    origin = 'origin/master'
  }
  git.checkoutBranch(branch,origin, function (err, result) {
    if(!err) {
      currentBugId = bugId;
      console.info('自动为您从 %s 创建并切换为分支：%s 👌',origin,branch)
      // new ZingGit().gitInfo();
      console.warn('请尽量确保一个分支只解决一个问题 ! ')
    }
  });
}    

//git status
ZingGit.prototype.checkAndCommit = function(msg) {
  let checkArr = [];
  let fileArr = [];
 
  function eachCheck(checkArr,changeArr,type) {
    if(changeArr.length > 0) {
      checkArr.push(new inquirer.Separator(` = ${type} = `))
      for(var i = 0; i< changeArr.length; i++) {
        checkArr.push({name : changeArr[i], checked : true})
      }
    }
  }

  git.status(function (err, result) {
    if(!err) {

      for(var i = 0; i< result.files.length; i++) {
        fileArr.push(__dirname + '/' + result.files[i].path)
      }
 
      eachCheck(checkArr,result.not_added,"当前新建的文件");
      eachCheck(checkArr,result.conflicted,"当前冲突的文件");
      eachCheck(checkArr,result.created,"当前 created 的文件");
      eachCheck(checkArr,result.deleted,"当前删除的文件");
      eachCheck(checkArr,result.modified,"当前修改的文件");
      eachCheck(checkArr,result.renamed,"当前改名的文件");
      ZingInquirer.checkbox(checkArr,files => {
        let toCommitFilesPathArray = [];
        for(var i = 0; i< files.length; i++) {
          toCommitFilesPathArray.push(__dirname + '/' + files[i]);
        }
        new ZingGit().add(toCommitFilesPathArray);
        new ZingGit().commit(toCommitFilesPathArray,msg);
      });

    }
  });
}

//git add
ZingGit.prototype.add = function(fileArr) {
  git.add(fileArr,function (err, result) {

    if(!err) {
      console.log(result)
    }
  });
}
//git commit
ZingGit.prototype.commit = function(fileArr,msg) {
  new ZingGit().branchInfo(Id => {
    git.commit(msg || `fix-bug-${Id}  http://39.104.96.233:60888/zentao/bug-view-${Id}.html `, fileArr, null,function (err, result) {
    if(!err) {
      console.info("提交成功，改动如下 ： \n\n")
      console.log(result)
    }else {
      console.log(err + '\n')
    }
  });
  })
  
}

//git branchInfo
ZingGit.prototype.branchInfo = function(callback) {
  git.branch(null,(err,data) => {
    if(!err) {
      let currentBranch = data.current;
      let bugOrFeatureId = '';
      if(currentBranch.indexOf('fix') > -1) {
        bugOrFeatureId = currentBranch.substring(currentBranch.lastIndexOf('-')+1);
      } else {
        bugOrFeatureId = currentBranch
      }
      callback(bugOrFeatureId,currentBranch);
    }
  })
}
console.log('--1--')

//git push
ZingGit.prototype.push = function(callback) {
  console.log('----')
  ZingGit.prototype.branchInfo((id,name) => {
    git.push('origin',name,(err,res) => {
      console.info('push 分支 %s 到远程成功',name);
    });
  })
  
}
//git push current fix-xxx-xxx push to origin 
ZingGit.prototype.checkoutDev = function(callback) {
  git.fetch()
  git.checkout('dev',(err,res) => {
    console.info('checkout 分支 %s 到远程成功');
  });
 
  
}


new ZingGit().checkout();



module.exports = new ZingGit();
     


 