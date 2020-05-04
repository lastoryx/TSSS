var mysql = require('mysql');
var pool = mysql.createPool({
  connectionLimit : 10,
  host            : 'classmysql.engr.oregonstate.edu',
  user            : 'cs340_thompsaa',
  password        : 'Pumpkin2scream!',
  database        : 'cs340_thompsaa'
});

module.exports.pool = pool;
