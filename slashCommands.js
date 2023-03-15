const { SlashCommandBuilder, Routes } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { clientId, guildId} = require('./secret.json');
const { token } = require("./secret.json");



const commands = [
	new SlashCommandBuilder().setName('ping').setDescription('Pong!'),
	new SlashCommandBuilder().setName('embedtest').setDescription('tets'),								

									
]
	.map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(token);

rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
	.then((data) => console.log(`Successfully registered ${data.length} application commands.`))
	.catch(console.error);