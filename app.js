const express = require('express');

const { Client, LocalAuth } = require('whatsapp-web.js');

const qrcode = require('qrcode-terminal');

const axios = require('axios');

const app = express();

const port = process.env.PORT || 3000;

// Directly define your API keys and secrets here

const API_KEY = 'AIzaSyCTq8lU35ZZc1h0xhFF_rxvt_XW2DNkKwA';  // Your YouTube API key

const CHANNEL_ID = 'UCf60xw0hhkKnWqgf67z41qw';  // Your YouTube Channel ID

const COMMUNITY_NAME = 'Majlis-e-Zikrullah'; // Your WhatsApp community name

// Initialize WhatsApp Client

const client = new Client({

    authStrategy: new LocalAuth()

});

client.on('qr', (qr) => {

    qrcode.generate(qr, { small: true });

});

client.on('ready', () => {

    console.log('WhatsApp bot is ready!');

});

// Function to check if the channel is live

async function isChannelLive() {

    try {

        const response = await axios.get(

            `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${CHANNEL_ID}&eventType=live&type=video&key=${API_KEY}`

        );

        const items = response.data.items;

        if (items && items.length > 0) {

            const videoId = items[0].id.videoId;

            const liveUrl = `https://www.youtube.com/watch?v=${videoId}`;

            return liveUrl;

        }

        return null;

    } catch (error) {

        console.error('Error checking YouTube live status:', error.message);

        return null;

    }

}

// Function to send a WhatsApp message

async function sendWhatsAppMessage(liveUrl) {

    try {

        const chats = await client.getChats();

        const group = chats.find(chat => chat.name === COMMUNITY_NAME);

        if (!group) {

            console.error(`Community "${COMMUNITY_NAME}" not found!`);

            return;

        }

        const message = `Hey everyone! I am live now on YouTube. Join here: ${liveUrl}`;

        await group.sendMessage(message);

        console.log('Notification sent to WhatsApp Community.');

    } catch (error) {

        console.error('Error sending WhatsApp message:', error.message);

    }

}

// Route for checking live status and sending a message

app.get('/checklive', async (req, res) => {

    const liveUrl = await isChannelLive();

    if (liveUrl) {

        await sendWhatsAppMessage(liveUrl);

        res.send('Live detected! Notification sent to WhatsApp.');

    } else {

        res.send('Not live yet.');

    }

});

// Add a root route to handle visits to the root URL

app.get('/', (req, res) => {

    res.send('Welcome to the Live YouTube Notification Bot!');

});

// Initialize WhatsApp client and start server

client.initialize();

app.listen(port, () => {

    console.log(`Server running at http://localhost:${port}`);

});
