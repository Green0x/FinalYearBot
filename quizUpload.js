const https = require('https');
const fs = require('fs');
const SQLite = require('better-sqlite3');
const sql = new SQLite('./database.sqlite');

function uploadQuiz(message, quizAttach, quizName) {
  // Check for and remove any punctuation in the file name
  const punctuation = /[!"#'%()*+,-./:;$&<=>?@[\]^_`{|}~]/g;
  const quizNameClean = quizName.replace(punctuation, '');


  if (fs.existsSync(quizNameClean.concat('.yml'))) {
    console.log('Quiz is a duplicate. Sending error message...');

    message.reply('You cannot upload a quiz with the same name!');
  } else {
    console.log('Quiz is not a duplicate. Downloading...');
    // Creates dummy file with same name as quiz name
    const file = fs.createWriteStream(quizNameClean.concat('.yml'));
    https.get(quizAttach.url, function (response) {
      response.pipe(file); // Stream the data into our dummy file

      file.on('finish', () => {
        file.close(); // Once file is downloaded we close it
        console.log(quizNameClean + '.yml, has been downloaded');
      });
    });

    // Setup each SQL statement we will be using
    const insertQuiz = sql.prepare('INSERT INTO quiz (quizName, quizOwner) VALUES (?, ?);');
    const insertUser = sql.prepare('INSERT OR REPLACE INTO users (userId, nickName, numberOfQuizCreated) VALUES (?, ?, ?);');
    const getUser = sql.prepare('SELECT * FROM users WHERE userId = ?');
    const getQuiz = sql.prepare('SELECT * FROM quiz WHERE quizName = ?');

    // Populate the quiz table with newly downloaded quiz data
    insertQuiz.run(quizNameClean, message.user.id);

    // Gets user data from the users table
    let user = getUser.get(message.user.id);

    // If the user does not exist in the database, add them to it
    if (!user) {
      user = { userId: message.user.id, nickName: message.user.username, numberOfQuizCreated: 0, points: 0 };
    }

    // Update users table with number of quizs created + 1
    insertUser.run(message.user.id, message.user.username, user.numberOfQuizCreated += 1);

    const getQuizID = getQuiz.get(quizNameClean);
    message.reply('Your quiz: ' + quizNameClean + ' was successfully uploaded!' + ` Your quiz ID is: ${getQuizID.uniqueID}`);
  }
}

module.exports = { uploadQuiz };
