const config = require("./config.json");
const secret = require("./secret.json");
const yaml = require('js-yaml');
const SQLite = require('better-sqlite3');
const sql = new SQLite('./database.sqlite');
//const database = new SQLite('database.sqlite');
const https = require('https');
const fs = require('fs');

const db = require('./databaseInit');

const { EmbedBuilder } = require('discord.js');
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
    console.log("You are running version: " + config.botVersion + " of the FYPBot");
    console.log("");
    db.initDatabase();
    console.log("inited")
    
});

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

    if (message.commandName === "startquiz"){
        let quizId = message.options.getNumber("id");
        let quizId2 = quizId.toString();
        
        let user = message.user.id;
        
        //console.log(info.changes)
        //client.getScore = sql.prepare("SELECT * FROM quiz WHERE quizOwner = ?;");                           
        //client.setScore = sql.prepare("INSERT OR REPLACE INTO quiz (quizName, quizOwner) VALUES (@quizName, @quizOwner);");
        /*
        let quizOwner = client.getScore.get(user);
        if (!quizOwner) {
            quizOwner = { quizName: quizId, quizOwner: user }
        }
        
        client.setScore.run("test", quizOwner)
        //let user = message.member.id;
        //console.log(user)
        */
        message.reply("added")

        //let score = client.getScore
         /*
            const fileContents = fs.readFileSync(message.user.id.toString().concat('.yml'), 'utf-8');
           
            const doc = yaml.load(fileContents);
            //doc.newKey = 'testval:test1';
            
            
            //doc.quiz.name = 'quizy'; 
            const yamlStr = yaml.dump(data);
            fs.writeFileSync('example.yml', yamlStr, 'utf8');
            //console.log(doc['actions']['type'])
            */
    }




    if (message.commandName === "uploadquiz"){
        let quizAttach = message.options.getAttachment("ymlfile");
        let quizName = message.options.getString("quizname");

        // Check for and remove any punctuation in the file name
        let punctuation = /[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]/g;
        let quizNameClean = quizName.replace(punctuation, '');
        
        
        if(fs.existsSync(quizNameClean.concat('.yml'))){  
            console.log("Quiz is a duplicate. Sending error message...");
           
            message.reply("You cannot upload a quiz with the same name!");
            
        }else{
            console.log("Quiz is not a duplicate. Downloading...")
            
            const file = fs.createWriteStream(quizNameClean.concat('.yml'));
            const request = https.get(quizAttach.url, function(response) {
                response.pipe(file);
                file.on("finish", () => {
                    file.close();
                    console.log(quizNameClean + ".yml, has been downloaded")
                })
            });

            console.log("Updating Database...")

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
            
            console.log("Database updated successfully")

            let getQuizID = getQuiz.get(quizNameClean)
            message.reply("Your quiz: " + quizNameClean + " was successfully uploaded!" + ` Your quiz ID is: ${getQuizID.uniqueID}`);
           
        };

        

    }
});













//Client login token
client.login(secret.token);