var sqlite3 = require('sqlite3').verbose();

var db = new sqlite3.Database(__dirname + "/zgit.db", function (e) {
    //  if (err) throw err;
});

function ZingSql() { }
ZingSql.prototype.init = function (callback) {
    db.serialize(function () {

        // 存贮用户信息的表    type 'chandao' || 'wekan' 
        db.run(`  CREATE TABLE IF NOT EXISTS user(
                   name                TEXT    NOT NULL,
                   password            TEXT    NOT NULL,
                   cookie              TEXT    NOT NULL,
                   type                TEXT    NOT NULL
        )`);

        
        // 存储 bug 的表
        // type 'close' 已关闭
        db.run(`  CREATE TABLE IF NOT EXISTS bug(
                   ID INT PRIMARY KEY                  NOT NULL,
                   bug_id                      TEXT    NOT NULL,
                   type                        TEXT    NOT NULL, 
                   url                         TEXT    NOT NULL
       )`);

        db.get('SELECT name,password FROM user  WHERE type = ?', 'chandao', function (err, row) {
            if (!err) {
                if (row != undefined) {
                    callback();
                } else {
                    ZingSql.prototype.insert('user', ["", "", "", "chandao"], () => {
                        db.get('SELECT name,password FROM user  WHERE type = ?', 'wekan', function (err, row) {
                            if (!err) {
                                if (row != undefined) {
                                    callback();
                                } else {
                                    ZingSql.prototype.insert('user', ["", "", "", "wekan"], () => {
                                        console.info('第一次初始化成功 👌')
                                        callback();
                                    });
                                }
                            } else {
                                console.error(err)
                            }
                        });
                    });
                }
            } else {
                console.error(err)
            }
        });


    });


}


ZingSql.prototype.insert = function (table, values, callback) {
    var stmt = db.prepare(`INSERT INTO ${table} VALUES (?,?,?,?)`);
    stmt.run(...values);
    callback(1);


}

ZingSql.prototype.updateUser = function (name, password, cookie, type) {
    const promise = new Promise(resolve => {
        db.run(`UPDATE user SET name = ?, password = ? ,cookie = ? WHERE type = ?`, name, password, cookie, type, function (err) {
            if (err) throw err;
            resolve();
        });
    })
    return promise;
}

ZingSql.prototype.getUser = function (type, callback) {
    db.get('SELECT name,password, cookie FROM user  WHERE type = ?', type, function (err, row) {
        if (!err) {
            callback(row)
        } else {
            console.error(err)
        }

    });
}


// new ZingSql().insert('user',["","","","chandao"],() => {
//     console.log('ok')
// });


// new ZingSql().updateNameAndPassword('zhuangwenda','886pkxiaojiba','chandao',() => {
//     console.log('ok')
// });

// new ZingSql().updateCookie('sdsadsadsadsadsadas','chandao',() => {
//     console.log('ok')
// });

// new ZingSql().getCookie('chandao',(cookie) => {
//     console.log(cookie)
// });


module.exports = new ZingSql();


