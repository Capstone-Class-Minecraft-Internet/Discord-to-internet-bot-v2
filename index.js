const fs = require('node:fs');
const path = require('node:path');
//-------------------- Params
botChannelId = process.argv[0];
botRelayChannelId = process.argv[1];
clientId = process.argv[2];
guildId = process.argv[3];
token = process.argv[4];

//------------------- End of Params


// Require the necessary discord.js classes
const { Client, Events, GatewayIntentBits, Collection, Intents } = require('discord.js');
//const { token } = require('./config.json');

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds,GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

// When the client is ready, run this code (only once)
// We use 'c' for the event parameter to keep it separate from the already defined 'client'
client.once(Events.ClientReady, c => {
	console.log(`Ready! Logged in as ${c.user.tag}`);
});

client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	// Set a new item in the Collection with the key as the command name and the value as the exported module
	if ('data' in command && 'execute' in command) {
		client.commands.set(command.data.name, command);
	} else {
		console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
}
// Loading command files 

client.on(Events.InteractionCreate, interaction => {
	console.log(interaction);
});
//every slash command is an interaction


client.on(Events.InteractionCreate, interaction => {
	if (!interaction.isChatInputCommand()) return;
	console.log(interaction);
});
//Not every interaction is a slash command (e.g. MessageComponent interactions)
// Receiving command interactions

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});
// Executing commands


/*
client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const { commandName } = interaction;

	if (commandName === 'ping') {
		await interaction.reply('Pong!');
	} else if (commandName === 'beep') {
		await interaction.reply('Boop!');
	}
});
*/


/*Verifies function parameters, and calls functions accordingly.
 * If a function runs correctly, return True. Otherwise, return false
 */

function commandTokenizer(inputCommand, username){ 	
	if(inputCommand.charAt(0) == '!'){//Verifies that the first character is an explination point
	
		//Tokenize command
		command = inputCommand.slice(1);
		tokenArr = command.split(" ");

		switch(tokenArr[0]){//Read and run tokenized Commands
			case "ping":
				console.log("Running ping command.");
				client.channels.cache.get(botRelayChannelId).send(`tell ${username} Pong!`);
				break;

			case "get_build":
				console.log("Running get_build command.");
				client.channels.cache.get(botRelayChannelId).send(`tell ${username} This command is currently under construction.`);
				break;

			default:
				console.log("Command not recognized: " + tokenArr[0]);
		}


	}
	else{// The first character is not an explination point. Something weird happened. 
		console.log("Invalid command initializer");
		return false;
	}
}

client.on("messageCreate", async (message) =>{//This command runs every time a message in the discord server is sent.
	try{
	if(message.author.username == '_testbot'){// If a message is from the bot itself, return
		return false;
	}

	if(message.content == 'Unknown command. Type "/help" for help.'){
		return false;

	}

	if(message.channel == botChannelId){//If message is in non-relay bot channel
		await message.channel.send("Received a message: " + message.content);
		
		messageArr = message.content.split(": ",2); //Splits name and message
		console.log(messageArr);
		username = messageArr[0]
		messageContent = messageArr[1]

		commandTokenizer(messageContent,username);
		//await client.channels.cache.get(botRelayChannelId).send("say hi");
	}
	}
	catch (e){
		console.log("Logging error in messageCreate: ");
		console.log(e);
	}
});



// Log in to Discord with your client's token
console.log(process.argv[5]);
client.login(process.argv[5]);

