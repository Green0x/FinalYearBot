const SQLite = require('better-sqlite3');
const sql = new SQLite('./database.sqlite');
//const db = require('./bot');

function initDatabase(){
    const table = sql.prepare("SELECT count(*) FROM sqlite_master WHERE type='table';").get();
    if(!table['count(*)']) {
        // If the table isn't there, create it and setup the database correctly.
        sql.prepare("CREATE TABLE users (userId INTEGER PRIMARY KEY, numberOfQuizCreated INTEGER);").run();
        sql.prepare("CREATE TABLE quiz (uniqueID INTEGER PRIMARY KEY, quizName TEXT, quizOwner INTEGER);").run();
               
    
    }
    
}

module.exports = { initDatabase };
