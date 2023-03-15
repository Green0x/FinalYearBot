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
            .setTitle("This could be a leaderboard")
            .setDescription("Top 10 points:")
            .setColor(0x00AE86);
    
        
                 
           
            embed.addFields({ name: "UP number: ", value: "10 points", inline: true});
			embed.addFields({ name: "UP number 2: ", value: "12 points", inline: true});
			embed.addFields({ name: "UP number 3: ", value: "1 points", inline: true});
			embed.addFields({ name: "UP number 4: ", value: "0 points", inline: true});
			embed.addFields({ name: "UP number 5: ", value: "23 points", inline: true});
            //embed.setDescription(`<@${data.userId}> ${data.points} points`);
        
        message.reply({ embeds: [embed] });

    }
});













//Client login token
client.login(secret.token);