# FinalYearBot
This is the repository of my Final Year Project Discord bot.

## Setup instructions
Dependancies: Node.js, discord.js, better-sqlite3, quickchart-js, js-yaml

Make sure Node.js and npm are installed and working.

```bash
npm init
```
```bash
npm install discord.js  
```
```bash
npm install better-sqlite3
```
```bash
npm install quickchart-js
```
```bash
npm install js-yaml
```
> Follow this guide if you have not set up a Discord bot before https://discordjs.guide/preparations/setting-up-a-bot-application.html#creating-your-bot
> Follow this guide if you have not added a Discord bot to your server before
https://discordjs.guide/preparations/adding-your-bot-to-servers.html#bot-invite-links

Change secret.json to your server information
<pre>
> Token = Your bot's secret token on the Developer portal

> ClientID = Discord developer portal -> General info -> Application ID

> GuildID = Enable developer mode in discord client -> Right click your server and copy ID
</pre>
```bash
node slashCommands.js # if running for the first time 
```
```bash
node bot.js
```

## Usage
/downloadtemplate - Downloads the quiz template for editing

/uploadquiz - Uploads your edited template with a name for the quiz

/listquiz - Lists all your quizzes and their corresponding ID's

/startquiz - Starts a quiz with your selected quiz ID from /listquiz

/generategraph - Generates a graph of the top 3, top 5 and top 10 student point values (note will need multiple accounts to use this)

/editquiz - Either requests a quiz to be edited, or submits an edited quiz, by ID

/deletequiz - Deletes a quiz by id

/checkpoints - Displays your points

/ping - Ping the bot
