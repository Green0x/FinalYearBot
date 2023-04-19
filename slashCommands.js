const { SlashCommandBuilder, Routes } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { clientId, guildId} = require('./secret.json');
const { token } = require("./secret.json");



const commands = [
	new SlashCommandBuilder().setName('ping').setDescription('Pong!'),
	new SlashCommandBuilder().setName('embedtest').setDescription('tets'),
	new SlashCommandBuilder().setName('uploadquiz').setDescription('Upload a quiz file!')
							.addAttachmentOption(attach => 
								attach.setName("ymlfile")
									.setRequired(true)
									.setDescription("Upload a .yml file of your custom quiz!"))
							.addStringOption(title =>
								title.setName("quizname")
									.setRequired(true)
									.setDescription("The title of your quiz")),
	new SlashCommandBuilder().setName('startquiz').setDescription('Starts a quiz')
							.addNumberOption(quizid =>
								quizid.setName("id")
									.setDescription("Quiz ID")
									.setRequired(true)),
						
]
	.map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(token);

rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
	.then((data) => console.log(`Successfully registered ${data.length} application commands.`))
	.catch(console.error);