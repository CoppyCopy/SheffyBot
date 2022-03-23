// This creates a host server for the bot to stay alive
require('http').createServer((req, res) => res.end('Sheffy is alive!')).listen(3000)

// Libraries
const Random = require('./randomiser.js');
const wait = require('util').promisify(setTimeout);
const childfork = require('child_process');

// Font configurations
const { registerFont } = require('canvas');
registerFont('fonts/Dongle-Regular.ttf', {family: 'Dongle-Regular'});

// Retrieve the resources from the gachaResources module
const GachaResources = require('./gachaResources.js');

// Discord configurations
const Discord = require('discord.js');
const BOT_TOKEN = process.env['BOT_TOKEN_SHEFFY'];
const CLIENT_ID = process.env['CLIENT_ID_SHEFFY'];
//const GUILD_ID = process.env['GUILD_ID_FUNPRISM'];
//const CHANNEL_ID = process.env['CHANNEL_ID_FUNPRISM'];
const GUILD_ID = process.env['GUILD_ID_MAINCORD'];
const CHANNEL_ID = process.env['CHANNEL_ID_MAINCORD'];
const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const discordClient = new Discord.Client({ intents: [Discord.Intents.FLAGS.GUILDS] });
const Canvas = require('canvas');

// Variables for unit, border, and star
const fixedWidth = 93;
const fixedHeight = 90;
var isWait = 0;
var isRainbow = 0;
var widthChange = 0;
var heightChange = 0;
var starImage = '';
var attachment = '';
var randomUnits = [];
var updateNext = 1; //Update to the next gacha
let starSize = {width: 0, height: 0};
const bannerLength = GachaResources.getBannerNames.length;
const canvas = Canvas.createCanvas(700, 300);
const context = canvas.getContext('2d');
const unitCanvas = Canvas.createCanvas(70, 70);
const borderCanvas = Canvas.createCanvas(77, 77);
const fiveStarsCanvas = Canvas.createCanvas(55, 12);
const sixStarsCanvas = Canvas.createCanvas(57, 12);
const messageCanvas = Canvas.createCanvas(127, 250);
const textCanvas = Canvas.createCanvas(132, 265);
const gachaPosSize = {
  unitPosW: 130, 
  unitPosH: 80, 
  borderPosW: 127, 
  borderPosH: 77, 
  starPosW: 132, 
  starPosH: 138
};

// An execute function that handles the command lines
function exec(cmd, handler = function(error, stdout, stderr){console.log(stdout);if(error !== null){console.log(stderr)}})
{
    return childfork.exec(cmd, handler);
}

// Logging into the discord
discordClient.once('ready', client => {
  console.log(`Logged in as ${client.user.tag}!`);
});

// List of the commands
const commands = [
	new SlashCommandBuilder().setName('pingsheffy').setDescription('Replies with pong!'),
  new SlashCommandBuilder().setName('sheffyhelp').setDescription('Help'),
  new SlashCommandBuilder()
    .setName('srollgacha')
    .setDescription('Roll gacha')
    .addIntegerOption(option =>
      option.setName('roll')
        .setDescription('The input to roll 1 or 10 time(s)')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('bannername')
        .setDescription('Input the banner name')
        .setRequired(true)),
]
	.map(command => command.toJSON());

const rest = new REST({ version: '9' }).setToken(BOT_TOKEN);

// const TokenResources = require('./tokenResources.js');

rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: commands })
  .then(() => console.log('Successfully registered application commands.'))
  .catch(console.error);

async function updateGacha(totalDisplay, bannerName, vipUser) {
  // Getting the random unit list
  randomUnits = await Random.randomiseUnit(totalDisplay, bannerName.toLowerCase(), parseInt(vipUser));
  // Create the base image (Gacha layout)
  const background = await Canvas.loadImage(GachaResources.misc.background);
  const messageBox = await Canvas.loadImage(GachaResources.misc.messageBox);
  context.drawImage(background, 0, 0, canvas.width, canvas.height);
  // Create image manipulation
  // ========================== Unit ==================================//
  for (var i=1; i <= totalDisplay; i++) {
    if (i <= 5) {
      widthChange = fixedWidth*(i-1)
      heightChange = 0;
    } else {
      widthChange = fixedWidth*(i-6);
      heightChange = fixedHeight;
    }
    
    context.strokeRect(0, 0, canvas.width, canvas.height);
    //console.log(randomUnits[i].source);

    const unit = await Canvas.loadImage(randomUnits[i].source);
    context.drawImage(unit, gachaPosSize.unitPosW+widthChange, gachaPosSize.unitPosH+heightChange, unitCanvas.width, unitCanvas.height);

    // Draw another image on it 
    // =================== Border =======================================//

    // Draw another image with a shape you want (E.g. Rect = Rectangle)
    context.strokeRect(0, 0, canvas.width, canvas.height);

    const border = await Canvas.loadImage('./PriconneGachaImages/border.png');
    context.drawImage(border, gachaPosSize.borderPosW+widthChange, gachaPosSize.borderPosH+heightChange, borderCanvas.width, borderCanvas.height);

    // ============================== Stars =================================//

    // Draw another image with a shape you want (E.g. Rect = Rectangle)
    context.strokeRect(0, 0, canvas.width, canvas.height);

    // If the current unit is 1 star then, displays only 1 star contents
    if (randomUnits[i].isStar === 1 && randomUnits[i].isSixStars) {
      starImage = GachaResources.getStars.oneSixStar;
      starSize.width = sixStarsCanvas.width;
      starSize.height = sixStarsCanvas.height;
    } else if (randomUnits[i].isStar === 1) {
      starImage = GachaResources.getStars.oneFiveStar;
      starSize.width = fiveStarsCanvas.width;
      starSize.height = fiveStarsCanvas.height;
    }

    // If the current unit is 2 stars then, displays only 2 stars contents
    if (randomUnits[i].isStar === 2 && randomUnits[i].isSixStars) {
      starImage = GachaResources.getStars.twoSixStar;
      starSize.width = sixStarsCanvas.width;
      starSize.height = sixStarsCanvas.height;
    } else if (randomUnits[i].isStar === 2) {
      starImage = GachaResources.getStars.twoFiveStar;
      starSize.width = fiveStarsCanvas.width;
      starSize.height = fiveStarsCanvas.height;
    }
    // If the current unit is 3 stars then, displays only 3 stars contents
    if (randomUnits[i].isStar === 3 && randomUnits[i].isSixStars) {
      starImage = GachaResources.getStars.threeSixStar;
      starSize.width = sixStarsCanvas.width;
      starSize.height = sixStarsCanvas.height;
    } else if (randomUnits[i].isStar === 3) {
      starImage = GachaResources.getStars.threeFiveStar;
      starSize.width = fiveStarsCanvas.width;
      starSize.height = fiveStarsCanvas.height;
    }
    
    const stars = await Canvas.loadImage(starImage);

    context.drawImage(stars, gachaPosSize.starPosW+widthChange, gachaPosSize.starPosH+heightChange, starSize.width, starSize.height);

    if (i === totalDisplay)  {
      isRainbow = randomUnits.slice(0)[0].isRainbow;
      Random.emptyRandomUnits(); // Empty the random unit list every time
    }
  }
  context.drawImage(messageBox, messageCanvas.width, messageCanvas.height, 450, 20);

  context.strokeRect(0, 0, canvas.width, canvas.height);
  context.font = '27px Dongle-Regular';
  context.fillStyle = '#000000'; // 

  if ((randomUnits.slice(0)[0].oneStar === 9 && randomUnits.slice(0)[0].twoStars === 1) || randomUnits.slice(0)[0].oneStar === 1) {
    sheffyMessage = 'Baka Onii-tan! Are you trying to embarrass me?';
  } else if (randomUnits.slice(0)[0].threeStars > 0 && randomUnits.slice(0)[0].threeStars < 5) {
    sheffyMessage = 'You really did well this time.';
  } else if (randomUnits.slice(0)[0].threeStars > 4 && randomUnits.slice(0)[0].threeStars < 7) {
    sheffyMessage = "Sounds good to be true, don't you think so?";
  } else if (randomUnits.slice(0)[0].threeStars > 6 && randomUnits.slice(0)[0].threeStars < 10) {
    sheffyMessage = "A-are you... Cheating, Onii-tan?!";
  } else if (randomUnits.slice(0)[0].threeStars === 10 ) {
    sheffyMessage = "Onii-tan... Please marry me!";
  } else {
    sheffyMessage = 'You did ok, Onii-tan.';
  }

  // Message box
  context.fillText(sheffyMessage, textCanvas.width, textCanvas.height);

  attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'units layout.png');
};

discordClient.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

  const isGuild = interaction.guild.id === GUILD_ID ? 1 : 0;
  const isChannel = interaction.channel.id === CHANNEL_ID ? 1 : 0;
	const { commandName } = interaction;

	if (commandName === 'pingsheffy') {
    if (isGuild && isChannel) {
      await interaction.reply('ONII-TAN BAKA!!!');
      await wait(2000); // wait for 2 seconds
      await interaction.editReply('Onii-tan... Daisuki!!');
    } else {
      await interaction.reply({ content: "Onii-tan! You cannot do it here! " + GachaResources.getSheffyEmotes.sheffyBats, ephemeral: true});
    }
		
	} else if (commandName === 'sheffyhelp') {
    if (isGuild && isChannel) {
      let banners = '';
      for (items of GachaResources.getBannerNames) {
        if (GachaResources.getBannerNames.indexOf(items) !== bannerLength - 1) {
          banners += items + ', '
        } else {
          banners += items
        }
      }
      await wait(500);
      await interaction.reply({ content: "Here's the list of banner names:\n" + "``" + banners + "``\nIf you want to play gacha, then just do slash command '/srollgacha' with number of rolls and the banner name, onii-tan!", ephemeral: true});
    } else {
      await interaction.reply({ content: "Onii-tan! You cannot do it here! " + GachaResources.getSheffyEmotes.sheffyBats, ephemeral: true});
    }
  }
  else if (commandName === 'srollgacha') {
    try {
      const rollTotal = interaction.options.getInteger('roll');
      const bannerName = interaction.options.getString('bannername');
      const isBanner = GachaResources.getBannerNames.indexOf(bannerName) !== -1 ? 1 : 0;
      console.log(bannerName);

      console.log(interaction.member.user.id);
      
      if ((rollTotal === 1 || rollTotal === 10)) {
        if (isChannel && isGuild && !isWait && isBanner) {
          isWait = 1;
          // Just let her reply first until edit reply to prevent the unknown interaction error (probably?)
          await interaction.deferReply();
          // Update the gacha units
          await updateGacha(rollTotal, bannerName, interaction.member.user.id);
          if (isRainbow) {
            await interaction.editReply(GachaResources.karinGifSource.karinRunRainbow);
          } else {
            await interaction.editReply(GachaResources.karinGifSource.karinRunNormal);
          }
          await wait(6000);
          interaction.editReply({content: ' ', files: [attachment]});
          isWait = 0;
          
        } else if (isWait && (rollTotal === 1 || rollTotal === 10)) {
          await interaction.reply({ content: "Onii-tan! Wait for me to process first! " + GachaResources.getSheffyEmotes.sheffyCry, ephemeral: true});
        } else if (!isBanner) {
          await interaction.reply({ content: "Onii-tan! Make sure you input the right banner name. \nIf Onii-tan needs help on getting the names, then type '/sheffyhelp' " + GachaResources.getSheffyEmotes.sheffySmile, ephemeral: true});
        }
        else { // Ephemeral makes the message only appear to the client user only.
          await interaction.reply({ content: "Onii-tan! You cannot do it here! " + GachaResources.getSheffyEmotes.sheffyBats, ephemeral: true});
        }
      } else {
        await interaction.reply({ content: "Onii-tan! You have to input 1 or 10 rolls only! " + GachaResources.getSheffyEmotes.sheffyPout, ephemeral: true});
      }
    } catch(err) {
      console.log(err);
      discordClient.destroy();
      exec('busybox reboot npm start');
    }
  }
});

discordClient.login(BOT_TOKEN);
