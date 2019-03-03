//Requirements
const Discord = require('discord.js');
const fs = require('fs');
const dom = require('@dominic_mine/dom-module');

//Getting the bot or client
const bot = new Discord.Client();

//Importing Custom Emotes
const coinEmote = '<:coin:550547073016266754>';

//JSON Requirements
const config = require('./botconfig.json');
const quotes = require('./json/quotes.json');
const roasts = require('./json/roasts.json');
const meme_links = require('./json/memelinks.json');
let coins = require('./json/coins.json');

//Discord Bot Token | Do not share with others.
const TOKEN = config.token;

// This event will run on every single message received, from any channel or DM.
bot.on('message', function(message) {
	// It's good practice to ignore other bots. This also makes your bot ignore itself and not get into a spam loop (we call that "botception").
	if (message.author.bot) return;

	//Splits the message into parts
	let messageArray = message.content.split(' ');
	let args = messageArray.slice(1);
	let cmd = messageArray[0];
	let prefix = config.prefix;

	//Coin System
	dom.throttle(coinGiver, 5000);

	function coinGiver() {
		//Checks if user id is not in coins.json
		if (!coins[message.author.id]) {
			coins[message.author.id] = {
				coins: 0
			};
		}

		//Creates a random amount of coins. 1-3 coins.
		let coinAmt = Math.floor(Math.random() * 3) + 1;
		//Creates a random chance of someone getting a coin. 1/15 chance of getting a coin.
		let chanceAmt = Math.floor(Math.random() * 15) + 1;
		console.log(chanceAmt);

		if (9 === chanceAmt) {
			//Checks: Does the random number equal 9?
			coins[message.author.id] = {
				coins: coins[message.author.id].coins + coinAmt //Adds the pre-existing coin amount to the new coin amount
			};

			//Writes the coin amount to coins.json
			fs.writeFile('./json/coins.json', JSON.stringify(coins), (err) => {
				if (err) console.log(err);
			});

			//Makes a embed telling the user that they received a coin
			let coinEmbed = new Discord.RichEmbed()
				.setAuthor(message.author.username)
				.setColor('#00FF00')
				.addField('💰', `${coinAmt} coins added`);
			message.channel.send(coinEmbed).then((msg) => {
				msg.delete(5000);
			});
		}
	}

	// Bot Commands
	switch (cmd) {
		case '^pay':
			//Check if the user paying has coins
			if (!coins[message.author.id]) {
				return message.reply("You don't have any coins!");
			}

			//User being paid
			let pUser = message.guild.member(message.mentions.users.first()) || message.guild.members.get(arg[0]);

			//If the person getting coins doesn't have a log in coins.json, make one
			if (!coins[pUser.id]) {
				coins[pUser.id] = {
					coins: 0
				};
			}

			//User getting's coins
			let pCoins = coins[pUser.id].coins;
			//User paying's coins
			let sCoins = coins[message.author.id].coins;

			//Check if the buyer has enough coins
			if (sCoins < args[0]) return message.reply('Not enough coins there!');

			//Subtracting the coins from the buyer
			coins[message.author.id] = {
				coins: sCoins - parseInt(args[1])
			};

			//Adding the coins to the seller
			coins[pUser.id] = {
				coins: pCoins + parseInt(args[1])
			};

			//Sends the coin payment through
			//! Not able to use a rich embed because you can not mention though them
			message.channel.send(
				coinEmote +
					'-- A coin payment!' +
					message.author.username +
					'has given' +
					pUser.user +
					args[1] +
					'coins'
			);

			//Writes to the coins.json file telling it to add coins
			fs.writeFile('./json/coins.json', JSON.stringify(coins), (err) => {
				if (err) console.log(err);
			});
			break;

		case `${prefix}gift`:
			//Checks if they are allowed to => with administrator
			if (!message.member.hasPermission('ADMINISTRATOR')) {
				return message.reply('You do not have permission to use this command');
			}

			//User being gifted => from mentions
			let giftUser = message.guild.member(message.mentions.users.first()) || message.guild.members.get(arg[0]);

			//Gifted persons coins
			let gCoins = coins[giftUser.id].coins;

			//If the gifted person doesn't have a log in coins.json, make one
			if (!coins[giftUser.id]) {
				coins[giftUser.id] = {
					coins: 0
				};
			}

			//Gives 10 coins to the gifted person
			coins[giftUser.id] = {
				coins: gCoins + 10
			};

			message.reply('🎁' + giftUser.user + 'has been gifted 10 coins for a good deed!');
			break;

		case '^coinshop':
			let coinshopEmbed = new Discord.RichEmbed()
				.setDescription('Coin Shop')
				.addField(
					'Use coins to buy certain perks. Once ready to buy, ping @Dominic#1087 and you will get your order shortly'
				)
				.addField('Change Nickname => 10 coins')
				.addField('Create Polls => 20 coins')
				.addField('Talk In Announcements => 30 coins')
				.addField('Add New Emotes => 40 coins')
				.addField('Honored Role => 50 coins');
			message.reply(coinshopEmbed);
			break;

		case `${prefix}ping`:
			message.reply(
				'Pong! ' +
					`The time now subtracted by the time when the message was sent was: ${Date.now() -
						message.createdTimestamp} ms`
			);
			break;

		case `${prefix}report`:
			let rUser = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]));
			if (!rUser) return message.channel.send("Couldn't find user");
			let reason = args.join(' ').slice(22);

			let reportEmbed = new Discord.RichEmbed()
				.setDescription('Reports')
				.setColor('#FF0000')
				.addField('Reported User', `${rUser} with ID: ${rUser.id}`)
				.addField('Reported By', `${message.author} with ID: ${message.author.id}`)
				.addField('Channel', message.channel)
				.addField('Time', message.createdAt)
				.addField('Reason', reason);

			let reportschannel = message.guild.channels.find(`name`, 'reports');
			if (!reportschannel) return message.channel.send("Couldn't find reports channel");
			message.delete().catch((O_o) => {});
			reportschannel.send(reportEmbed);
			break;

		case '^balcoins':
			let bal = coins[message.author.id].coins;
			let balEmbed = new Discord.RichEmbed()
				.setAuthor(message.author.username)
				.setColor('#00FF00')
				.addField(`You have ${bal} coins. You can get them by being helpful and active on the Discord server.`);
			message.channel.send(balEmbed).then((msg) => {
				msg.delete(5000);
			});
			break;

		case '^countdown':
			switch (args[0]) {
				case 'springbreak':
					message.reply('Time Until Spring Break: ' + dom.countdown('April 1 2019').totaltime);
					break;
				case 'endofschool':
					message.reply('Time Until End of School: ' + dom.countdown('June 1 2019').totaltime);
					break;
				default:
					let stringdate = args.join(' ');
					message.reply('Time Until Specified Date: ' + dom.countdown(stringdate).totaltime);
			}

			break;

		case '^help':
			message.reply(
				'Bot commands are ^commands. For general help, check #rules and #announcements. If you need specific help, please contact at @Dominic#1087.'
			);
			break;

		case '^commands':
			let rulesEmbed = new Discord.RichEmbed()
				.setColor('#0000FF')
				.setDescription('All Bot Commands:')
				.addField('Information Commands: ^commands | ^help | ^about | ^form | ^new | ^serverip')
				.addField('Coin Commands: ^pay [mention user] [amount of coins] | ^coinshop | ^balcoins')
				.addField(
					'Extra/Fun Commands: ^countdown [springbreak, endofschool] | ^roast | ^quote |  ^meme | ^report | ^ping'
				);
			message.channel.send(rulesEmbed);
			break;

		case '^serverip':
			message.reply('The server IP address is 73.222.216.165.');
			break;

		case '^quote':
			message.reply(quotes[Math.floor(Math.random() * quotes.length)]);
			break;

		case '^roast':
			message.reply(roasts[Math.floor(Math.random() * roasts.length)]);
			break;

		case '^about':
			message.reply(
				"ChromoCraft is a Minecraft whitelisted survival server. We are striving for a friendly server; like Hermitcraft. Dominic, the server owner and the bot programmer, is the person to contact for anything that staff can't answer."
			);
			break;

		case '^form':
			message.reply(
				'The form you can use to request people into ChromoCraft can be found here: https://goo.gl/forms/DfBhIWWH63PhZT5i2'
			);
			break;

		case '^meme':
			message.channel.send('A random meme:', {
				files: [ meme_links[Math.floor(Math.random() * meme_links.length)] ]
			});
			break;
	}
});

// Tell the console when the bot is online. Event will run when bot is online.
bot.on('ready', function() {
	console.log('The bot is ready for use.');
});

// Event will run every time a user joins
bot.on('guildMemberAdd', (member) => {
	message.reply(
		'Welcome to the ChromoCraft server. Hope you enjoy playing on the server. Help can be found using ^help or by pinging @Dominic#1087.'
	);
});

//Login the bot
bot.login(TOKEN);
