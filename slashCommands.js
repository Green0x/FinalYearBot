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
	new SlashCommandBuilder().setName('listquiz').setDescription('Lists a users quizzes')
							.addUserOption(user =>
								user.setName("username")
									.setRequired(true)
									.setDescription("Which users quizzes do you want to see")),
	new SlashCommandBuilder().setName('generategraph').setDescription('Generates a graph of users points')
							.addStringOption(option => 
								option.setName("users")
								.setDescription("How many users do you want to display in the graph")
								.setRequired(true)
								.addChoices(
									{ name: "top3", value: "top3" },
									{ name: "top5", value: "top5" },
									{ name: "top10", value: "top10" },
								)),
	new SlashCommandBuilder().setName('checkpoints').setDescription('Displays your current points'),
	new SlashCommandBuilder().setName('editquiz').setDescription('Edits your own quiz or edit another users quiz as an Admin')
							.addNumberOption(quizid =>
								quizid.setName("id")
									.setDescription("Quiz ID")
									.setRequired(true))
							.addStringOption(option =>
								option.setName("type")
									.setDescription("Are you requesting an edit, or submitting a finished edit")
									.setRequired(true)
									.addChoices(
										{ name: "request", value: "request"},
										{ name: "submit", value: "submit"},
									))
							.addAttachmentOption(attach =>
								attach.setName("quizfile")
									.setDescription("Upload your edited file here"))								
						
]
	.map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(token);

rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
	.then((data) => console.log(`Successfully registered ${data.length} application commands.`))
	.catch(console.error);