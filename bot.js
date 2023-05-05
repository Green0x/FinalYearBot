// Library imports
const secret = require('./secret.json');
const yaml = require('js-yaml');
const SQLite = require('better-sqlite3');
const sql = new SQLite('./database.sqlite');
const fs = require('fs');

// Local file imports
const config = require('./config.json');
const db = require('./databaseInit');
const quizMain = require('./quizMain');
const quizUpload = require('./quizUpload');
const graphRender = require('./graphRender');
const quizEdit = require('./quizEdit');

// Discord.js specific imports
const { EmbedBuilder } = require('discord.js');
const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({ // Setting Discord intents, to control bot permissions
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
  console.log(`Your username is: ${client.user.tag}`);
  console.log('Welcome to the Final Year Project Bot');
  db.initDatabase(); // Initialises the database
});

global.correctAnswer = 0; // Global varaible for use across files
global.buttonPressCollection = [];
// Check for command inputs
client.on('interactionCreate', async message => {
  // Ping command
  if (message.commandName === 'ping') {
    await message.reply('Pong!');
  }

  // Check user points command
  if (message.commandName === 'checkpoints') {
    const getUser = sql.prepare('SELECT * FROM users WHERE userId = ?');
    const user = getUser.get(message.user.id);
    try {
      await message.reply(`You have ${user.points} points`);
    } catch {
      await message.reply('You have 0 points');
    }
  }

  // List quiz command
  if (message.commandName === 'listquiz') {
    const userName = message.options.getUser('username');
    const getUser = sql.prepare('SELECT * FROM users WHERE userId = ?');
    const getQuiz = sql.prepare('SELECT * FROM quiz WHERE quizOwner = ?');
    const user = getUser.get(userName.id);

    if (!user) { // Checks if user has anything registered in database
      await message.reply('Selected user does not have any quizzes');
    }

    const getAllUserQuiz = getQuiz.all(userName.id);
    const listQuizIdEmbed = new EmbedBuilder() // Creates a new embed for lising the quizzes
      .setColor(16711680)
      .setTitle('List of quizzes for selected user');
    try {
      for (let i = 0; i < user.numberOfQuizCreated; i++) {
        await listQuizIdEmbed.addFields({ name: getAllUserQuiz[i].quizName.toString(), value: 'ID = ' + getAllUserQuiz[i].uniqueID.toString(), inline: true });
      }
      await message.reply({ embeds: [listQuizIdEmbed] });
    } catch {
      // User does not exist, ignore it as we already have a check
    }
  }

  // Start quiz command
  if (message.commandName === 'startquiz') {
    const quizId = message.options.getNumber('id');

    const getQuiz = sql.prepare('SELECT * FROM quiz WHERE uniqueId = ?'); // Gets quiz from database with selected ID number
    const quiz = getQuiz.get(quizId);


    try {
      const fileContents = fs.readFileSync('./questions/' + quiz.quizName.concat('.yml'), 'utf-8'); // Reads quiz data from its .yml file
      const yamlFile = yaml.load(fileContents); // Loads quiz .yml file data into a custom object type
      let numOfQuizLeft = 0;
      numOfQuizLeft = yamlFile[0].numberOfQuestions; // Sets number of quiz questions, so bot knows when to stop
      await quizMain.startQuiz(message, quizId, numOfQuizLeft);
      await message.reply('Starting quiz: ' + quiz.quizName);
    } catch {
      await message.reply('Error: Your quiz file is corrupt');
    }
  }

  // Upload quiz command
  if (message.commandName === 'uploadquiz') {
    const quizAttach = message.options.getAttachment('ymlfile');
    const quizName = message.options.getString('quizname');
    await quizUpload.uploadQuiz(message, quizAttach, quizName);
  }

  // Generate graph command
  if (message.commandName === 'generategraph') {
    const numOfUsersToGraph = message.options.getString('users');
    const getTopUsers = sql.prepare('SELECT * FROM users ORDER BY points DESC LIMIT 10');
    const topUsers = getTopUsers.all();
    await graphRender.renderGraph(message, numOfUsersToGraph, topUsers);
  }

  // Edit quiz command
  if (message.commandName === 'editquiz') {
    const quizId = message.options.getNumber('id');
    const submitOrRequest = message.options.getString('type');
    const editedQuiz = message.options.getAttachment('quizfile');
    await quizEdit.editQuiz(message, quizId, submitOrRequest, editedQuiz);
  }

  if (message.commandName === 'deletequiz') {
    const quizId = message.options.getString('quizid');

    const getUser = sql.prepare('SELECT * FROM users WHERE userId = ?');
    const getQuiz = sql.prepare('SELECT * FROM quiz WHERE uniqueID = ?');
    const removeQuiz = sql.prepare('UPDATE users SET numberOfQuizCreated = ? WHERE userId = ?');
    const deleteQuizRow = sql.prepare('DELETE FROM quiz WHERE uniqueID = ?');
    try {
      const quiz = getQuiz.get(quizId);
      const user = getUser.get(quiz.quizOwner);
      if (quiz.quizOwner === message.user.id || message.member.roles.cache.some(role => role.name === config.trustedRole)) {
        fs.unlinkSync('./questions/' + quiz.quizName.concat('.yml'));


        removeQuiz.run(user.numberOfQuizCreated - 1, quiz.quizOwner);
        deleteQuizRow.run(quizId);

        message.reply('Quiz successfully deleted');
      } else {
        message.reply('Error: You do not have permission to delete that quiz');
      }
    } catch {
      message.reply('Error: Invalid quiz ID');
    }
  }

  if (message.commandName === 'downloadtemplate') {
    await message.reply({
      content: 'Here is the requested quiz template. Please use the upload command when you wish to create a quiz',
      files: ['./questions/quizTemplate.yml'],
      ephemeral: true,
    });
  }


  // Checks for button presses on quiz
  if (message.isButton()) {
    // Get the button pressed
    const component = message.component;
    const insertUser = sql.prepare('INSERT OR REPLACE INTO users (userId, nickName, numberOfQuizCreated, points) VALUES (?, ?, ?, ?);');
    // Get user data from database in order to add points
    const getUser = sql.prepare('SELECT * FROM users WHERE userId = ?');
    const addPoints = sql.prepare('UPDATE users SET points = ? WHERE userId = ?');
    let user = getUser.get(message.user.id);

    // If user does not exist in Database
    if (!user) {
      user = await { userId: message.user.id, nickName: message.user.username, numberOfQuizCreated: 0, points: 0 }; // Sets SQL object
      insertUser.run(message.user.id, message.user.username, user.numberOfQuizCreated, user.points); // Add new user to DB
    }


    // If chain to check for each button press
    if (!global.buttonPressCollection.includes(message.user.id)) { // If user is in the button press collection, do not let them gain more points
      if (component.customId === 'btnA') {
        if (global.correctAnswer === 0) {
          await addPoints.run(user.points + 1, message.user.id); // Adds 1 point for correct answer
          global.buttonPressCollection.push(message.user.id); // Adds user to button press collection
          await message.reply({ content: 'Correct Answer! You just gained 1 point', ephemeral: true });
        } else {
          await message.reply({ content: 'Wrong Answer.', ephemeral: true });
        }
      }
      if (component.customId === 'btnB') {
        if (global.correctAnswer === 1) {
          await addPoints.run(user.points + 1, message.user.id); // Adds 1 point for correct answer
          global.buttonPressCollection.push(message.user.id);
          console.log(global.buttonPressCollection);
          await message.reply({ content: 'Correct Answer! You just gained 1 point', ephemeral: true });
        } else {
          await message.reply({ content: 'Wrong Answer.', ephemeral: true });
        }
      }
      if (component.customId === 'btnC') {
        if (global.correctAnswer === 2) {
          await addPoints.run(user.points + 1, message.user.id); // Adds 1 point for correct answer
          global.buttonPressCollection.push(message.user.id);
          await message.reply({ content: 'Correct Answer! You just gained 1 point', ephemeral: true });
        } else {
          await message.reply({ content: 'Wrong Answer.', ephemeral: true });
        }
      }
      if (component.customId === 'btnD') {
        if (global.correctAnswer === 3) {
          await addPoints.run(user.points + 1, message.user.id); // Adds 1 point for correct answer
          global.buttonPressCollection.push(message.user.id);
          await message.reply({ content: 'Correct Answer! You just gained 1 point', ephemeral: true });
        } else {
          await message.reply({ content: 'Wrong Answer.', ephemeral: true });
        }
      }
    } else {
      message.reply({ content: 'You have already selected an answer.', ephemeral: true });
    }
  }
});


// Client login token
client.login(secret.token);
