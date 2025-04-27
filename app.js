const express = require('express');

const { Client, LocalAuth } = require('whatsapp-web.js');

const qrcode = require('qrcode-terminal');

const axios = require('axios');

const app = express();

const port = process.env.PORT || 3000;

// Your credentials

const API_KEY = 'AIzaSyCTq8lU35ZZc1h0xhFF_rxvt_XW2DNkKwA';  // Your YouTube API key

const CHANNEL_ID = 'UCf60xw0hhkKnWqgf67z41qw';  // Your YouTube Channel ID

const COMMUNITY_NAME = 'Majlis-e-Zikrullah'; // Your WhatsApp community name

// Initialize WhatsApp Client

const client = new Client({

    authStrategy: new LocalAuth()

});

client.on('qr', (qr) => {

    console.log('[QR] QR Code received. Please scan it using your WhatsApp mobile app.');

    qrcode.generate(qr, { small: true });

});

client.on('ready', () => {

    console.log('[WhatsApp] Bot is ready and connected to WhatsApp!');

});

client.on('auth_failure', (msg) => {

    console.error('[WhatsApp] Authentication failure:', msg);

});

client.on('disconnected', (reason) => {

    console.log('[WhatsApp] Disconnected from WhatsApp:', reason);

});

// Function to check if the YouTube channel is live

async function isChannelLive() {

    console.log('[YouTube] Checking if channel is live...');

    try {

        const response = await axios.get(

            `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${CHANNEL_ID}&eventType=live&type=video&key=${API_KEY}`

        );

        const items = response.data.items;

        if (items && items.length > 0) {

            console.log('[YouTube] Channel is LIVE!');

            const videoId = items[0].id.videoId;

            const liveUrl = `https://www.youtube.com/watch?v=${videoId}`;

            return liveUrl;

        } else {

            console.log('[YouTube] Channel is NOT live.');

            return null;

        }

    } catch (error) {

        console.error('[YouTube] Error checking live status:', error.message);

        return null;

    }

}

// Function to send a WhatsApp message

async function sendWhatsAppMessage(liveUrl) {

    console.log('[WhatsApp] Preparing to send WhatsApp message...');

    try {

        const chats = await client.getChats();

        console.log(`[WhatsApp] Total chats fetched: ${chats.length}`);

        const group = chats.find(chat => chat.name === COMMUNITY_NAME);

        if (!group) {

            console.error(`[WhatsApp] Community "${COMMUNITY_NAME}" not found!`);

            return;

        }

        const message = `Hey everyone! I am live now on YouTube. Join here: ${liveUrl}`;

        await group.sendMessage(message);

        console.log('[WhatsApp] Notification sent successfully to WhatsApp Community.');

    } catch (error) {

        console.error('[WhatsApp] Error sending message:', error.message);

    }

}

// Route for checking live status and sending a message

app.get('/checklive', async (req, res) => {

    console.log('[HTTP] /checklive endpoint hit.');

    const liveUrl = await isChannelLive();

    if (liveUrl) {

        await sendWhatsAppMessage(liveUrl);

        res.send('Live detected! Notification sent to WhatsApp.');

    } else {

        res.send('Not live yet.');

    }

});

// Root route for basic health check

app.get('/', (req, res) => {

    console.log('[HTTP] / (root) endpoint hit.');

    res.send('Welcome to the Live YouTube Notification Bot!');

});

// Initialize WhatsApp client and start the server

client.initialize();

app.listen(port, () => {

    console.log(`[Server] Server is running at http://localhost:${port}`);

});
