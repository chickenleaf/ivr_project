const express = require('express');
const twilio = require('twilio');
const bodyParser = require('body-parser');
require('dotenv').config(); // Load environment variables

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

// Twilio credentials from environment variables
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

// Twilio number and target number from environment variables
const twilioNumber = process.env.TWILIO_NUMBER;
const targetNumber = process.env.TARGET_NUMBER;
const ngrokUrl = process.env.NGROK_URL; // ngrok URL from environment variables

// Function to initiate a call
function initiateCall() {
    client.calls
        .create({
            url: `${ngrokUrl}/ivr`, // Use ngrok URL for the /ivr endpoint
            to: targetNumber,
            from: twilioNumber
        })
        .then(call => console.log(`Call initiated with SID: ${call.sid}`))
        .catch(error => console.error(`Error initiating call: ${error}`));
}

// Twilio webhook to handle incoming calls
app.post('/ivr', (req, res) => {
    const twiml = new twilio.twiml.VoiceResponse();

    // Play the audio when the call is picked up
    twiml.play('https://onedrive.live.com/download?cid=6D834994D9580DCB&resid=6D834994D9580DCB!245717&authkey=!AEm9E0JuXEPP2EE');

    // Gather input from the user
    const gather = twiml.gather({
        numDigits: 1,
        action: '/handle-key',
        method: 'POST'
    });
    gather.say('To receive a personalized interview link, please press 1. To end the call without receiving a link, press 2.');

    res.type('text/xml');
    res.send(twiml.toString());
});

// Handle the keypad input
app.post('/handle-key', (req, res) => {
    const twiml = new twilio.twiml.VoiceResponse();
    const selectedOption = req.body.Digits;

    if (selectedOption === '1') {
        // Respond with a message and send the SMS
        twiml.say('A personalized interview link has been sent to you via SMS. Please check your inbox. Thank you.');
        client.messages
            .create({
                body: 'Here is your personalized interview link: https://v.personaliz.ai/?id=9b697c1a&uid=fe141702f66c760d85ab&mode=test',
                from: twilioNumber,
                to: targetNumber,
            })
            .then(message => console.log(`Message sent: ${message.sid}`))
            .catch(error => console.error(`Error sending message: ${error}`));
    } else if (selectedOption === '2') {
        // End the call without sending an SMS
        twiml.say('Goodbye.');
    } else {
        // Invalid input
        twiml.say('Invalid input. Please hang up and try again.');
    }

    twiml.hangup();
    res.type('text/xml');
    res.send(twiml.toString());
});

// Start the server
app.listen(3000, () => {
    console.log('Server listening on port 3000');
    // Uncomment the line below if you want to initiate the call immediately on server start
    initiateCall();
});
