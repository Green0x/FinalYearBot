const config = require('./config.json');
const secret = require('./secret.json');
const yaml = require('js-yaml');
const SQLite = require('better-sqlite3');
const sql = new SQLite('./database.sqlite');
const https = require('https');
const fs = require('fs');
const QuickChart = require('quickchart-js');

const db = require('./databaseInit');

const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildEmojisAndStickers,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.DirectMessages,
  ],
});


// Initial startup
client.on('ready', () => {
  console.log(`Bot Activated! Logged in as: ${client.user.tag}`);
  console.log('Welcome to the Final Year Project Bot');
  db.initDatabase();
});
let correctAnswer = 0;
function startQuiz(message, quizId, numOfQuizLeft) {
  if (numOfQuizLeft !== 0) {
    // Build the buttons
    const btnA = new ButtonBuilder()
      .setCustomId('btnA')
      .setLabel('A')
      .setStyle(ButtonStyle.Secondary);
    const btnB = new ButtonBuilder()
      .setCustomId('btnB')
      .setLabel('B')
      .setStyle(ButtonStyle.Secondary);
    const btnC = new ButtonBuilder()
      .setCustomId('btnC')
      .setLabel('C')
      .setStyle(ButtonStyle.Secondary);
    const btnD = new ButtonBuilder()
      .setCustomId('btnD')
      .setLabel('D')
      .setStyle(ButtonStyle.Secondary);
    // Build the quiz display
    const quizEmbed = new EmbedBuilder();
    quizEmbed.setColor(16711680);
    // Build ActionRow to add buttons to message
    const btnRow = new ActionRowBuilder();
    btnRow.addComponents(btnA, btnB, btnC, btnD);

    // Read from quiz data
    const getQuiz = sql.prepare('SELECT * FROM quiz WHERE uniqueId = ?');
    const quiz = getQuiz.get(quizId);
    const fileContents = fs.readFileSync(quiz.quizName.concat('.yml'), 'utf-8');
    const yamlFile = yaml.load(fileContents);

    // Sets Embed title to the name of the quiz
    quizEmbed.setTitle(quiz.quizName);
    // Starts a stopwatch and counts to 15 seconds, then moves onto the next question
    let i = 0;
    const quizTimeLimit = setInterval(() => {
      if (i === 15) {
        // Stop quiz after 15 seconds
        numOfQuizLeft = numOfQuizLeft - 1;
        clearInterval(quizTimeLimit);

        startQuiz(message, quizId, numOfQuizLeft);
      } else {
        // Continue
      }
      i++;
    }, 1000);


    quizEmbed.setDescription(yamlFile[numOfQuizLeft].question);
    const answer = yamlFile[numOfQuizLeft].answer;
    console.log(answer);
    quizEmbed.addFields({ name: 'A', value: yamlFile[numOfQuizLeft].choices[0], inline: false });
    quizEmbed.addFields({ name: 'B', value: yamlFile[numOfQuizLeft].choices[1], inline: false });
    quizEmbed.addFields({ name: 'C', value: yamlFile[numOfQuizLeft].choices[2], inline: false });
    quizEmbed.addFields({ name: 'D', value: yamlFile[numOfQuizLeft].choices[3], inline: false });
    correctAnswer = answer - 1;


    message.channel.send({ embeds: [quizEmbed], components: [btnRow] }).then(msg => setTimeout(() => msg.delete(), 15000));
  } else {
    message.channel.send('Quiz has ended!');
  }
}

// Check for command inputs
client.on('interactionCreate', async message => {
  if (message.commandName === 'ping') {
    message.reply('Pong!');
  }

  if (message.commandName === 'checkpoints') {
    const getUser = sql.prepare('SELECT * FROM users WHERE userId = ?');
    const user = getUser.get(message.user.id);
    try {
      message.reply(`You have ${user.points} points`);
    } catch (error) {
      message.reply('You have 0 points');
    }
  }


  if (message.commandName === 'listquiz') {
    const userName = message.options.getUser('username');
    const getUser = sql.prepare('SELECT * FROM users WHERE userId = ?');
    const getQuiz = sql.prepare('SELECT * FROM quiz WHERE quizOwner = ?');
    const user = getUser.get(userName.id);

    if (!user) {
      message.reply('Selected user does not have any quizzes');
    }

    const getAllUserQuiz = getQuiz.all(userName.id);
    const listQuizIdEmbed = new EmbedBuilder()
      .setColor(16711680)
      .setTitle('List of quizzes for selected user');
    try {
      for (let i = 0; i < user.numberOfQuizCreated; i++) {
        listQuizIdEmbed.addFields({ name: getAllUserQuiz[i].quizName.toString(), value: 'ID = ' + getAllUserQuiz[i].uniqueID.toString(), inline: true });
      }
      message.reply({ embeds: [listQuizIdEmbed] });
    } catch {
      console.log('User does not exist. Ignoring...');
    }
  }

  if (message.isButton()) {
    // Get the message and button
    const sentMessage = message.message;
    const component = message.component;

    const getUser = sql.prepare('SELECT * FROM users WHERE userId = ?');
    const addPoints = sql.prepare('UPDATE users SET points = ? WHERE userId = ?');
    const user = getUser.get(message.user.id);


    if (component.customId === 'btnA') {
      if (correctAnswer === 0) {
        addPoints.run(user.points + 1, message.user.id);
        sentMessage.edit('Correct Answer');
      } else {
        sentMessage.edit('wrong answer');
      }
    }
    if (component.customId === 'btnB') {
      if (correctAnswer === 1) {
        addPoints.run(user.points + 1, message.user.id);
        sentMessage.edit('Correct Answer');
      } else {
        sentMessage.edit('wrong answer');
      }
    }
    if (component.customId === 'btnC') {
      if (correctAnswer === 2) {
        addPoints.run(user.points + 1, message.user.id);
        sentMessage.edit('Correct Answer');
      } else {
        sentMessage.edit('wrong answer');
      }
    }
    if (component.customId === 'btnD') {
      if (correctAnswer === 3) {
        addPoints.run(user.points + 1, message.user.id);
        sentMessage.edit('Correct Answer');
      } else {
        sentMessage.edit('wrong answer');
      }
    }
  }

  if (message.commandName === 'startquiz') {
    const quizId = message.options.getNumber('id');

    const getQuiz = sql.prepare('SELECT * FROM quiz WHERE uniqueId = ?');
    // Gets quiz from database with selected ID number
    const quiz = getQuiz.get(quizId);
    // Reads quiz data from its .yml file
    const fileContents = fs.readFileSync(quiz.quizName.concat('.yml'), 'utf-8');
    // Loads quiz .yml file data into a custom object type
    const yamlFile = yaml.load(fileContents);
    try {
      let numOfQuizLeft = 0;
      numOfQuizLeft = yamlFile[0].numberOfQuestions;
      startQuiz(message, quizId, numOfQuizLeft);
      message.reply('Starting quiz: ' + quiz.quizName);
    } catch {
      message.reply('Error, your quiz file is corrupt, please edit and re-submit');
    }
  }


  if (message.commandName === 'uploadquiz') {
    const quizAttach = message.options.getAttachment('ymlfile');
    const quizName = message.options.getString('quizname');

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

  if (message.commandName === 'generategraph') {
    const numOfUsersToGraph = message.options.getString('users');
    const getTopUsers = sql.prepare('SELECT * FROM users ORDER BY points DESC LIMIT 10');
    const topUsers = getTopUsers.all();


    const chart = new QuickChart();
    chart.setWidth(800);
    chart.setHeight(800);
    try {
      if (numOfUsersToGraph === 'top3') {
        chart.setConfig({
          type: 'bar',
          data: {
            labels: [topUsers[0].nickName, topUsers[1].nickName, topUsers[2].nickName],
            datasets: [{ label: 'Points', data: [topUsers[0].points, topUsers[1].points, topUsers[2].points] }],
          },
        });
        // Print the chart URL
        const url = await chart.getShortUrl();
        message.reply(`Top 3 users by point value: ${url}`);
      }
      if (numOfUsersToGraph === 'top5') {
        chart.setConfig({
          type: 'bar',
          data: {
            labels: [topUsers[0].nickName, topUsers[1].nickName, topUsers[2].nickName, topUsers[3].nickName, topUsers[4].nickName],
            datasets: [{ label: 'Points', data: [topUsers[0].points, topUsers[1].points, topUsers[2].points, topUsers[3].points, topUsers[4].points] }],
          },
        });
        // Print the chart URL
        const url = await chart.getShortUrl();
        message.reply(`Top 5 users by point value: ${url}`);
      }
      if (numOfUsersToGraph === 'top10') {
        chart.setConfig({
          type: 'bar',
          data: {
            labels: [topUsers[0].nickName, topUsers[1].nickName, topUsers[2].nickName, topUsers[3].nickName, topUsers[4].nickName, topUsers[5].nickName,
              topUsers[6].nickName, topUsers[7].nickName, topUsers[8].nickName, topUsers[9].nickName],
            datasets: [{
              label: 'Points',
              data: [topUsers[0].points, topUsers[1].points, topUsers[2].points, topUsers[3].points, topUsers[4].points,
                topUsers[5].points, topUsers[6].points, topUsers[7].points, topUsers[8].points, topUsers[9].points],
            }],
          },
        });
        // Print the chart URL
        const url = await chart.getShortUrl();
        message.reply(`Top 10 users by point value: ${url}`);
      }
    } catch {
      message.reply('Error, not enough registered students');
    }
  }

  if (message.commandName === 'editquiz') {
    const quizId = message.options.getNumber('id');
    const submitOrRequest = message.options.getString('type');
    const editedQuiz = message.options.getAttachment('quizfile');
    const getQuiz = sql.prepare('SELECT * FROM quiz WHERE uniqueID = ?');
    const quiz = getQuiz.get(quizId);

    if (submitOrRequest === 'request') {
      if (quiz.quizOwner === message.user.id || message.member.roles.cache.some(role => role.name === config.trustedRole)) {
        message.reply({
          content: 'Here is the requested quiz file. Please download and make your edits, then submit it with the /editquiz submit command',
          files: [quiz.quizName.concat('.yml')],
          ephemeral: true,
        });
      } else {
        message.reply('You do not have permission to edit this quiz');
      }
    }
    if (submitOrRequest === 'submit') {
      if (quiz.quizOwner === message.user.id || message.member.roles.cache.some(role => role.name === config.trustedRole)) {
        const file = fs.createWriteStream(quiz.quizName.concat('.yml'));
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
});


// Client login token
client.login(secret.token);
