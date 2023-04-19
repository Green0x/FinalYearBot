const config = require("./config.json");
const secret = require("./secret.json");
const yaml = require('js-yaml');
const SQLite = require('better-sqlite3');
const sql = new SQLite('./database.sqlite');
const https = require('https');
const fs = require('fs');

const db = require('./databaseInit');

const { EmbedBuilder } = require('discord.js');
const { Client, GatewayIntentBits } = require('discord.js');
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




// READY
client.on("ready", () => {
    
    console.log(`Bot Activated! Logged in as: ${client.user.tag}`);
    console.log("You are running version: " + config.botVersion + " of the FYPBot");
    console.log("");
    db.initDatabase();
    client.getUser = sql.prepare("SELECT * FROM users WHERE userId = ?");
});


client.on("interactionCreate", async message => {
    if (message.commandName === "ping") {

        message.reply("Pong!");

    }
	
	if (message.commandName === "embedtest") {
                
        const embed = new EmbedBuilder()
            .setTitle("Question title")
            .setDescription("Top 10 points:")
            .setColor(0x00AE86);
    
        
                 
           
            embed.addFields({ name: "A: answer1", value: "10 points", inline: true});
			embed.addFields({ name: "b: answer2 : ", value: "12 points", inline: true});
			embed.addFields({ name: "c: answer 3: ", value: "1 points", inline: true});
			embed.addFields({ name: "d: answer 4: ", value: "0 points", inline: true});
			
            
        
        message.reply({ embeds: [embed] });

    }

    if (message.commandName === "startquiz"){
        let quizId = message.options.getNumber("id");
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

        if(fs.existsSync(quizName.concat('.yml'))){  
            console.log("Quiz is a duplicate. Sending error message")
           
            message.reply("You cannot upload a quiz with the same name!");
            
        }else{
            console.log("Quiz is not a duplicate. Downloading...")
            
            const file = fs.createWriteStream(quizName.concat('.yml'));
            const request = https.get(quizAttach.url, function(response) {
                response.pipe(file);

                file.on("finish", () => {
                    file.close();
                    console.log(quizName + ".yml, has been downloaded")
                })
            });
                                         
            
            message.reply("Your quiz " + quizName + " was successfully uploaded!");
           
        };

        

    }
});













//Client login token
client.login(secret.token);