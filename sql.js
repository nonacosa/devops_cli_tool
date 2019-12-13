var sqlite3 = require('sqlite3').verbose();

var db = new sqlite3.Database("./zgit.db", function(e){
//  if (err) throw err;
});
db.serialize(function() {
 
 // 存贮用户信息的表   
 db.run(`  CREATE TABLE IF NOT EXISTS USER(
            ID INT PRIMARY KEY                  NOT NULL,
            chandao_name                TEXT    NOT NULL,
            chandao_password            TEXT    NOT NULL,
            chandao_cookie              TEXT    NOT NULL,
            wekan_name                  TEXT    NOT NULL,
            wekan_password              TEXT    NOT NULL,
            wekan_cookie                TEXT    NOT NULL
 )`);

 // 存储 bug 的表
 // type 'close' 已关闭
 db.run(`  CREATE TABLE IF NOT EXISTS BUG(
            ID INT PRIMARY KEY                  NOT NULL,
            bug_id                      TEXT    NOT NULL,
            type                        TEXT    NOT NULL, 
            url                         TEXT    NOT NULL
)`);

  var stmt = db.prepare("INSERT INTO lorem VALUES (?)");
  for (var i = 0; i < 10; i++) {
      stmt.run("Ipsum " + i);
  }
  stmt.finalize();

  db.each("SELECT rowid AS id, info FROM lorem", function(err, row) {
      console.log(row.id + ": " + row.info);
  });
});

db.close();

 