const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const SQLite = require('better-sqlite3');
const sql = new SQLite('./database.sqlite');
const fs = require('fs');
const yaml = require('js-yaml');

async function startQuiz(message, quizId, numOfQuizLeft) {
  if (numOfQuizLeft !== 0) { // If there are questions left continue running the function
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
        global.buttonPressCollection = []; // Sets users who pressed the button back to 0

        clearInterval(quizTimeLimit);

        startQuiz(message, quizId, numOfQuizLeft);
      } else {
        // Continue
      }
      i++;
    }, 1000); // Run this function every second until 15 seconds has passed


    quizEmbed.setDescription(yamlFile[numOfQuizLeft].question);
    const answer = yamlFile[numOfQuizLeft].answer;

    quizEmbed.addFields({ name: 'A', value: yamlFile[numOfQuizLeft].choices[0], inline: false });
    quizEmbed.addFields({ name: 'B', value: yamlFile[numOfQuizLeft].choices[1], inline: false });
    quizEmbed.addFields({ name: 'C', value: yamlFile[numOfQuizLeft].choices[2], inline: false });
    quizEmbed.addFields({ name: 'D', value: yamlFile[numOfQuizLeft].choices[3], inline: false });
    global.correctAnswer = answer - 1;


    await message.channel.send({ embeds: [quizEmbed], components: [btnRow] }).then(msg => setTimeout(() => msg.delete(), 15000)); // Delete message after 15 seconds
  } else {
    await message.channel.send('Quiz has ended!');
  }
}

module.exports = { startQuiz };
