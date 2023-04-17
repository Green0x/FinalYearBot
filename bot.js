const config = require("./config.json");
const secret = require("./secret.json");

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
			
            //embed.setDescription(`<@${data.userId}> ${data.points} points`);
        
        message.reply({ embeds: [embed] });

    }
});













//Client login token
client.login(secret.token);