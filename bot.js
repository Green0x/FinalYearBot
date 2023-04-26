const config = require("./config.json");
const secret = require("./secret.json");
const yaml = require('js-yaml');
const SQLite = require('better-sqlite3');
const sql = new SQLite('./database.sqlite');
const https = require('https');
const fs = require('fs');

const db = require('./databaseInit');

const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { Client, GatewayIntentBits } = require('discord.js');
const { get } = require("http");
const client = new Client({ intents: [
                                GatewayIntentBits.Guilds,
                                GatewayIntentBits.GuildMessages,
                                GatewayIntentBits.MessageContent,
                                GatewayIntentBits.GuildMembers,
                                GatewayIntentBits.GuildEmojisAndStickers,
                                GatewayIntentBits.GuildPresences,
                                GatewayIntentBits.GuildMessageReactions,
                                GatewayIntentBits.DirectMessages                   
                            ] });




// Initial startup
client.on("ready", () => {
    
    console.log(`Bot Activated! Logged in as: ${client.user.tag}`);
    console.log("Welcome to the Final Year Project Bot");
    db.initDatabase();
    console.log("Database initialised")
    
    
});
//let numOfQuizLeft = 0;
function startQuiz(message, quizId, numOfQuizLeft) {
    if (numOfQuizLeft !== 0) {
        const getQuiz = sql.prepare("SELECT * FROM quiz WHERE uniqueId = ?");
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
        const quizEmbed = new EmbedBuilder()
        quizEmbed.setColor(16711680)
        // Build ActionRow to add buttons to message
        const row = new ActionRowBuilder()
        row.addComponents(btnA, btnB, btnC, btnD);

        // Read from quiz data
        let quiz = getQuiz.get(quizId);
        const fileContents = fs.readFileSync(quiz.quizName.concat('.yml'), 'utf-8');
        const doc = yaml.load(fileContents);
        
        // Sets Embed title to the name of the quiz
        quizEmbed.setTitle(quiz.quizName)
        // Starts a stopwatch and counts to 15 seconds, then moves onto the next question
        let i = 0;
        const interval = setInterval(() => {
            if (i === 15) {
                // Stop quiz after 15 seconds
                console.log("Times up");
                message.channel.send("Times up!");
                numOfQuizLeft = numOfQuizLeft - 1;
                clearInterval(interval);
                startQuiz(message, quizId, numOfQuizLeft)
              } else{
                
                console.log("timers not up");
              }
              i++;
        }, 1000);


        quizEmbed.setDescription(doc[numOfQuizLeft].question)
        let answer = doc[numOfQuizLeft].answer
        quizEmbed.addFields({ name: 'A', value: doc[numOfQuizLeft].choices[0], inline: false })
        quizEmbed.addFields({ name: 'B', value: doc[numOfQuizLeft].choices[1], inline: false })
        quizEmbed.addFields({ name: 'C', value: doc[numOfQuizLeft].choices[2], inline: false })
        quizEmbed.addFields({ name: 'D', value: doc[numOfQuizLeft].choices[3], inline: false })
        correctAnswer = answer - 1;
        
        
        message.channel.send({ embeds: [quizEmbed], components: [row] })
    }else{
        message.channel.send("Quiz has ended!")
    }
    
        
}

// Check for command inputs
client.on("interactionCreate", async message => {
    if (message.commandName === "ping") {

        message.reply("Pong!");

    }
	
	if (message.commandName === "embedtest") {
       
       

    }

    if(message.commandName === "listquiz"){
        let userName = message.options.getUser("username")
        const getUser = sql.prepare("SELECT * FROM users WHERE userId = ?");
        const getQuiz = sql.prepare("SELECT * FROM quiz WHERE quizOwner = ?");
        let user = getUser.get(userName.id);
    
        if (!user) {
            message.reply("Selected user does not have any quizzes")
            
        }

        let getAllUserQuiz = getQuiz.all(userName.id)
        const listQuizIdEmbed = new EmbedBuilder()
                .setColor(16711680)
                .setTitle("List of quizzes for selected user") 
	    try{
            for(let i = 0; i < user.numberOfQuizCreated; i++){
                listQuizIdEmbed.addFields({ name: getAllUserQuiz[i].quizName.toString(), value: "ID = " + getAllUserQuiz[i].uniqueID.toString(), inline: true })
                
            }
            message.reply({ embeds: [listQuizIdEmbed] })
        }
        catch{
            console.log("User does not exist. Ignoring...")
        }

        
        
        
        
        
    }
    let correctAnswer = 0;
    if (message.isButton()) {
        // Get the message and button
        const sentMessage = message.message;
        const component = message.component;
    
        // Check if the button pressed is correct
        if (component.customId === 'btnA') {
            if (correctAnswer === 0) {
                sentMessage.edit('right answer');
              }else{
                sentMessage.edit('wrong answer');
              }
        }
        if (component.customId === 'btnB') {
            if (correctAnswer === 1) {
                sentMessage.edit('right answer');
              }else{
                sentMessage.edit('wrong answer');
              }
        }
        if (component.customId === 'btnC') {
            if (correctAnswer === 2) {
                sentMessage.edit('right answer');
              }else{
                sentMessage.edit('wrong answer');
              }
        }
        if (component.customId === 'btnD') {
            if (correctAnswer === 3) {
                sentMessage.edit('right answer');
              }else{
                sentMessage.edit('wrong answer');
              }
        }
      }

    if (message.commandName === "startquiz"){
        let quizId = message.options.getNumber("id");

        const getQuiz = sql.prepare("SELECT * FROM quiz WHERE uniqueId = ?");
        let quiz = getQuiz.get(quizId);
        const fileContents = fs.readFileSync(quiz.quizName.concat('.yml'), 'utf-8');
        const doc = yaml.load(fileContents);

        numOfQuizLeft = doc[0].numberOfQuestions
        startQuiz(message, quizId, numOfQuizLeft)
        
        

    }




    if (message.commandName === "uploadquiz"){
        let quizAttach = message.options.getAttachment("ymlfile");
        let quizName = message.options.getString("quizname");

        // Check for and remove any punctuation in the file name
        let punctuation = /[!"#'%()*+,-./:;$&<=>?@[\]^_`{|}~]/g;
        let quizNameClean = quizName.replace(punctuation, '');
        
        
        if(fs.existsSync(quizNameClean.concat('.yml'))){  
            console.log("Quiz is a duplicate. Sending error message...");
           
            message.reply("You cannot upload a quiz with the same name!");
            
        }else{
            console.log("Quiz is not a duplicate. Downloading...");
            // Creates dummy file with same name as quiz name
            const file = fs.createWriteStream(quizNameClean.concat('.yml'));
            const request = https.get(quizAttach.url, function(response) {
                response.pipe(file); // Stream the data into our dummy file

                file.on("finish", () => { 
                    file.close(); // Once file is downloaded we close it
                    console.log(quizNameClean + ".yml, has been downloaded");
                });
            });
            
            // Setup each SQL statement we will be using
            const insertQuiz = sql.prepare("INSERT INTO quiz (quizName, quizOwner) VALUES (?, ?);");
            const insertUser = sql.prepare("INSERT OR REPLACE INTO users (userId, numberOfQuizCreated) VALUES (?, ?);");
            const getUser = sql.prepare("SELECT * FROM users WHERE userId = ?");
            const getQuiz = sql.prepare("SELECT * FROM quiz WHERE quizName = ?");

            // Populate the quiz table with newly downloaded quiz data
            insertQuiz.run(quizNameClean, message.user.id)
            
            // Gets user data from the users table
            let user = getUser.get(message.user.id);

            // If the user does not exist in the database, add them to it
            if (!user) {
                user = { userId: message.user.id, numberOfQuizCreated: 0}
            }

            // Update users table with number of quizs created + 1
            insertUser.run(message.user.id, user.numberOfQuizCreated += 1)

            let getQuizID = getQuiz.get(quizNameClean)
            message.reply("Your quiz: " + quizNameClean + " was successfully uploaded!" + ` Your quiz ID is: ${getQuizID.uniqueID}`);
           
        };

        

    }
});













//Client login token
client.login(secret.token);