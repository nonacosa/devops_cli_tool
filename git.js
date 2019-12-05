'use strict';
//where the workingDirPath is optional, defaulting to the current directory.
const git = require('simple-git');
// rebase 比较适合公司场景 http://gitbook.liuhui998.com/4_2.html

// update repo and when there are changes, restart the app
require('simple-git')()
     .pull((err, update) => {
        if(update && update.summary.changes) {
          //  require('child_process').exec('npm restart');
          console.log('发现新的更新')
          console.log(update)
        }
     });
console.log('pull.....')