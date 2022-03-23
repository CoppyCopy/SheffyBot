require('http').createServer((req, res) => res.end('Bot is alive!')).listen(3000)
require('dotenv').config()
const Discord = require('discord.js');
const BOT_TOKEN = process.env['BOT_TOKEN'];
const Axios = require('axios');
const needle = require('needle');

const token = process.env['TWITTER_BEARER_TOKEN'];
const endpointUrl = "https://api.twitter.com/2/tweets/search/recent";
const twitterURL = "https://twitter.com/i/status/";

// A discord client
const discordClient = new Discord.Client({ intents: [Discord.Intents.FLAGS.GUILDS] });
const prefix = "-"

// A specific destination channel ID
const destIdJP = "931546094108835880"; // My private "931338521925541939"
const destIdEN = "931546094108835880"; // FUNPRISM "931546094108835880"
//const destIdJP = "784417589019148298"; // Maincord JP
//const destIdEN = "784417444000694282"; // Maincord EN

// var roleIdJP = "744478260762640455"; // Role ID for JP players DEBUG
// var roleIdEN = "744478260762640455"; // Role ID for EN players DEBUG
var roleIdJP = "679448607916556318"; // Role ID for JP players
var roleIdEN = "679448612652056599"; // Role ID for EN players
var currentIdJP = '1482233077065981952'; // Current active tweet link for JP
var currentIdEN = '1482125487593844738'; // Current active tweet link for EN
var milliseconds = 1000;
var seconds = 5; // 60 seconds in a minute, for example.
var minutes = 1; // 5 minutes in 5 * 60 seconds, for example.
var updateLinkJP = ''; // Update link for JP priconne
var updateLinkEN = ''; // Update link for EN priconne
// The bot needs to ping every 5 mins prevent from ping spams. Therefore, 5*60/20 = 15
var counterPingJP = 60; // Counter for pinging Newsletter for JP players
var counterPingEN = 60; // Counter for pinging Newsletter for EN players
var getIdJP = ''; // Get the recent tweet ID for JP
var getIdEN = ''; // Get the recent tweet ID for EN

// TODO: Create an array that stores all the IDs within an interval (DONT HAVE TO)
// REMINDER: <@userId> and <@&roleId>
// Check that the discord client is ready
discordClient.on('ready', client => {
  console.log(`Logged in as ${discordClient.user.tag}!`);

  setInterval(function() {
    async function getRequest(query) {
      // Edit query parameters below
      // specify a search query, and any additional fields that are required
      // by default, only the Tweet ID and text fields are returned
      const params = {
          'query': query,
          'tweet.fields': 'author_id'
      }

      const res = await needle('get', endpointUrl, params, {
          headers: {
              "User-Agent": "v2RecentSearchJS",
              "authorization": `Bearer ${token}`
          }
      })

      if (res.body) {
          return res.body;
      } else {
          throw new Error('Unsuccessful request');
      }
    } (async () => {
      try {
          // Make request
          const responseJP = await getRequest('from:priconne_redive -is:retweet -is:reply');
          const responseEN = await getRequest('from:priconne_en -is:retweet -is:reply');
          // Both of these responses should shows the recent tweets
          // console.log(responseJP.data[0]);
          // console.log(responseEN.data[0]);

          if (counterPingJP == 60 || counterPingEN == 60) {
            console.log("Current counter (JP) " + counterPingJP + " | Current counter (EN) " + counterPingEN);
          }
          // Get the recent tweet ID for both JP and EN
          getIdJP = responseJP.data[0].id;
          getIdEN = responseEN.data[0].id;

          // If the current ID is not the same as the new ID then, update it
          if (currentIdJP != getIdJP) {
            currentIdJP = getIdJP; // Keep the current ID until they tweet the new one
            console.log("New tweet ID (JP): " + currentIdJP);

            if (counterPingJP == 60) {
              updateLinkJP = "<@&" + roleIdJP + ">" + "\n" + twitterURL + currentIdJP;
              counterPingJP = 0;
            } else {
              updateLinkJP = twitterURL + currentIdJP;
            }

            client.channels.cache.get(destIdJP).send(updateLinkJP); // Send to the channel
          }

          // If the current ID is not the same as the new ID then, update it
          if (currentIdEN != getIdEN) {
            currentIdEN = getIdEN; // Keep the current ID until they tweet the new one
            console.log("New tweet ID (EN): " + currentIdEN);

            if (counterPingEN == 60) {
              updateLinkEN = "<@&" + roleIdEN + ">" + "\n" + twitterURL + currentIdEN;
              counterPingEN = 0;
            } else {
              updateLinkEN = twitterURL + currentIdEN;
            }

            client.channels.cache.get(destIdEN).send(updateLinkEN); // Send to the channel
          }

        } catch (e) {
          console.log(e);
          process.exit(-1);
      };
    })();

      // Increment the values counter of both JP and EN pings
      // Only increment these values if they are under 5 (5 mins interval for pings)
      if (counterPingJP < 60) counterPingJP++;
      if (counterPingEN < 60) counterPingEN++;

  }, minutes * seconds * milliseconds); // Change the time interval here for news updates
});

//================================================================================//

discordClient.login(BOT_TOKEN);