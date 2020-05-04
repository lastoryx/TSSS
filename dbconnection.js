var mysql = require('mysql');
var pool = mysql.createPool({
    connectionLimit : 10,
    host            : 'classmysql.engr.oregonstate.edu',
    user            : 'cs340_USERNAME_GOES_HERE',
    password        : 'YOUR_PASSWORD_GOES_HERE',
    database        : 'cs340_USERNAME_GOES_HERE'
});

module.exports.pool = pool;
