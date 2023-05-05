const SQLite = require('better-sqlite3');
const sql = new SQLite('./database.sqlite');
const https = require('https');
const fs = require('fs');
const config = require('./config.json');

function editQuiz(message, quizId, submitOrRequest, editedQuiz) {
  const getQuiz = sql.prepare('SELECT * FROM quiz WHERE uniqueID = ?');
  const quiz = getQuiz.get(quizId);

  if (submitOrRequest === 'request') {
    if (quiz.quizOwner === message.user.id || message.member.roles.cache.some(role => role.name === config.trustedRole)) {
      message.reply({
        content: 'Here is the requested quiz file. Please download and make your edits, then submit it with the /editquiz submit command',
        files: ['./questions/' + quiz.quizName.concat('.yml')],
        ephemeral: true,
      });
    } else {
      message.reply('You do not have permission to edit this quiz');
    }
  }
  if (submitOrRequest === 'submit') {
    if (quiz.quizOwner === message.user.id || message.member.roles.cache.some(role => role.name === config.trustedRole)) {
      const file = fs.createWriteStream('./questions/' + quiz.quizName.concat('.yml'));
      https.get(editedQuiz.url, function (response) {
        response.pipe(file); // Stream the data into our file

        file.on('finish', () => {
          file.close(); // Once file is downloaded we close it
        });

        message.reply('Your quiz has been successfully edited!');
      });
    } else {
      message.reply('You do not have permission to edit this quiz');
    }
  }
}


module.exports = { editQuiz };
