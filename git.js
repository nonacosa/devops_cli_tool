'use strict';
//where the workingDirPath is optional, defaulting to the current directory.
const git = require('simple-git')(process.cwd());
const ZingInquirer = require('./inquirer')
const inquirer = require('inquirer')
const { table } = require('table')
const zentaoBaseUrl = "http://39.104.96.233:60888"

let currentBugId = '';

function ZingGit() { }

// rebase 比较适合公司场景 http://gitbook.liuhui998.com/4_2.html





// update repo and when there are changes, restart the app
ZingGit.prototype.pull = function (callback) {
  git.pull((err, update) => {
    if (update && update.summary.changes) {
      //  require('child_process').exec('npm restart');
      console.log('=========发现新的更新!=========')
      console.log(update)
      console.log("=============================")
    }
    if (callback != undefined) {
      callback();
    }
  });
}

ZingGit.prototype.gitInfo = function () {
  git.listRemote(['--get-url'], (err, data) => {
    if (!err) {
      console.info('当前工作目录：>>> %s   👌', process.cwd());
      console.info('当前远程空间：>>> %s   ', data);
      // git.addRemote('origin', data, (err,addInfo) => {
      //   console.info('addInfo >>> ' + addInfo);
      // })
    }
  });
}


//git checkout -b 本地分支名 origin/远程分支名
ZingGit.prototype.checkoutBranch = function (branch, origin, bugId) {
  git.fetch()
  if (origin == undefined || origin === null) {
    origin = 'origin/master'
  }
  git.checkoutBranch(branch, origin, function (err, result) {
    if (!err) {
      currentBugId = bugId;
      console.info('自动为您从 %s 创建并切换为分支：%s 👌', origin, branch)
      // new ZingGit().gitInfo();
      console.warn('\n\n请尽量确保一个分支只解决一个问题 ! \n\n')
    }
  });
}

//git status
ZingGit.prototype.checkAndCommit = function (msg) {
  let checkArr = [];
  let fileArr = [];

  function eachCheck(checkArr, changeArr, type) {
    if (changeArr.length > 0) {
      checkArr.push(new inquirer.Separator(` = ${type} = `))
      for (var i = 0; i < changeArr.length; i++) {
        checkArr.push({ name: changeArr[i], checked: true })
      }
    }
  }

  git.status(function (err, result) {
    if (!err) {

      for (var i = 0; i < result.files.length; i++) {
        fileArr.push(process.cwd() + '/' + result.files[i].path)

      }

      eachCheck(checkArr, result.not_added, "当前新建的文件");
      eachCheck(checkArr, result.conflicted, "当前冲突的文件");
      eachCheck(checkArr, result.created, "当前 created 的文件");
      eachCheck(checkArr, result.deleted, "当前删除的文件");
      eachCheck(checkArr, result.modified, "当前修改的文件");
      eachCheck(checkArr, result.renamed, "当前改名的文件");
      ZingInquirer.checkbox(checkArr, files => {
        let toCommitFilesPathArray = [];
        for (var i = 0; i < files.length; i++) {
          toCommitFilesPathArray.push(process.cwd() + '/' + files[i]);
        }
        new ZingGit().add(toCommitFilesPathArray);
        new ZingGit().commit(toCommitFilesPathArray, msg);
      });

    }
  });
}

//git add
ZingGit.prototype.add = function (fileArr) {
  git.add(fileArr, function (err, result) {

    if (!err) {
      console.log(result)
    }
  });
}
//git commit
ZingGit.prototype.commit = function (fileArr, msg) {
  new ZingGit().branchInfo(Id => {
    git.commit(msg || `fix-bug-${Id} \n http://39.104.96.233:60888/zentao/bug-view-${Id}.html `, fileArr, null, function (err, result) {
      if (!err) {
        console.info("=========提交成功，改动如下 ：==========\n\n")
        console.log(result)
        console.info("=====================================")
      } else {
        console.log(err + '\n')
      }
    });
  })

}

//git branchInfo
ZingGit.prototype.branchInfo = function (callback) {
  git.branch(null, (err, data) => {
    if (!err) {
      let currentBranch = data.current;
      let bugOrFeatureId = '';
      if (currentBranch.indexOf('fix') > -1) {
        bugOrFeatureId = currentBranch.substring(currentBranch.lastIndexOf('-') + 1);
      } else {
        bugOrFeatureId = currentBranch
      }
      console.log(currentBranch)
      callback(bugOrFeatureId, currentBranch);
    }
  })
}



//git push
ZingGit.prototype.push = function (callback) {
  ZingGit.prototype.pull(ok => {
    ZingGit.prototype.branchInfo((id, name) => {
      git.push('origin', name, (err, res) => {
        console.info('push 分支 %s 到远程成功', name);
        if (callback != undefined) {
          callback(name)
        }
      });
    })
  })


}

//git merge
ZingGit.prototype.merge = function (oldBranch, callback) {
  git.mergeFromTo(oldBranch, 'dev', (err, res) => {
    if (!err) {
      if (callback != undefined) {
        callback();
      }
    }
  })

}


//git checkout and pull 
ZingGit.prototype.checkoutDev = function (oldBranch, callback) {
  git.fetch()
  git.checkout('dev', (err, res) => {
    if (!err) {
      console.info('checkout 分支 dev 到远程成功 ！\n');
      console.info('准备从 origin 更新  dev  --no-rebase ... \n');
      git.pull('origin', 'dev', { '--no-rebase': null }, (err, res) => {
        console.error(err)
        ZingGit.prototype.merge(oldBranch, () => {
          console.info('merge 完成 ！')
          ZingGit.prototype.push(ok => {
            if(callback != undefined) {
              callback();
            }
          });

        })
      })

    }
  });

}

ZingGit.prototype.pushZinglabsRules = function (callback) {
  //先把当前分支推到远程
  ZingGit.prototype.push(fixBranchName => {
    ZingGit.prototype.checkoutDev(fixBranchName, () => {
      console.info('流程完成，请检查！')
      if (callback != undefined) {
        callback()
      }
    })
  });
}

ZingGit.prototype.showAndCheckout = function () {
  git.branchLocal((err, data) => {
    if (err) {
      console.error(err)
    }
    if (!err) {
      selectBranch(data.all);
    }
  })
}

function selectBranch(branches) {
  let tableData = []
  let index = 1;
  branches.forEach(item => {
    let url = "";
    if (item.indexOf('fix') > -1) {
      let bugOrFeatureId = item.substring(item.lastIndexOf('-') + 1);
      url += `${zentaoBaseUrl}/zentao/bug-view-${bugOrFeatureId}.html`
    }
    tableData.push([index++, item, url])
  })
  let config = {
    columns: {
      0: {
        alignment: 'left',
        width: 5
      },
      1: {
        alignment: 'right',
        width: 20
      },
      2: {
        alignment: 'right',
        width: 70
      }
    }
  }

  tableData.unshift(['序号', '分支名', '链接（Command/Ctrl+鼠标左键链接可点击）']);
  let output = table(tableData, config)
  console.log(output)
  ZingInquirer.inputNumRadio("请输入您要切换的分支序号 :", index => {
    let branch = tableData[~~index];
    let code = branch[0];
    let name = branch[1];
    // ZingGit.checkoutBranch(`${branchPrefix}-${code}`, null);
    git.checkout(name, (err, res) => {
      if (err) {
        console.error(err)
      }
      console.log("您选择的分支编号：%s  >>> %s \n", code, name)
    })
  });
}







module.exports = new ZingGit();



