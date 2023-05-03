const SQLite = require('better-sqlite3');
const sql = new SQLite('./database.sqlite');


function initDatabase(){
    const table = sql.prepare("SELECT count(*) FROM sqlite_master WHERE type='table';").get();
    if(!table['count(*)']) {
        // If the table isn't there, create it and setup the database correctly.
        sql.prepare("CREATE TABLE users (userId TEXT PRIMARY KEY, nickName TEXT, numberOfQuizCreated INTEGER, points INTEGER);").run();
        sql.prepare("CREATE TABLE quiz (uniqueID INTEGER PRIMARY KEY, quizName TEXT, quizOwner TEXT);").run();         
    }
}

module.exports = { initDatabase };
