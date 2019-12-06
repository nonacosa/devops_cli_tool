#! /usr/bin/env node



const ZingConf = require('./config')
const ZingCMD = require('./cmd')


ZingConf.init(ok => {

  console.info(`\n\n\n\n      zing-git   \n\n\n`);
  
  ZingCMD.listening();
  
  
});

