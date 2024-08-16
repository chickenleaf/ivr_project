# Twilio Call Handling with Node.js

This project demonstrates how to use Twilio's API with Node.js to handle phone calls and send SMS messages based on user input. It uses the `twilio` library to interact with Twilio's API and `express` to create a web server.

## Features

- Initiates a phone call using Twilio.
- Plays an audio file when the call is picked up.
- Gathers user input via keypad.
- Sends an SMS with a personalized link based on user input.

## Setup

1. **Clone the Repository**

   ```
   git clone <repository-url>
   cd <repository-folder>
   ```

2. **Install Dependencies**

   Make sure you have Node.js and npm installed. Then run:

   ```
   npm install
   ```

3. **Configure Environment Variables**

   Create a `.env` file in the root directory of the project with the following content:

   ```
   TWILIO_ACCOUNT_SID=your_account_sid
   TWILIO_AUTH_TOKEN=your_auth_token
   TWILIO_NUMBER=your_twilio_number
   TARGET_NUMBER=your_target_number
   NGROK_URL=your_ngrok_url
   ```

   Replace the placeholders with your actual Twilio account SID, auth token, Twilio number, target number, and ngrok URL.

4. **Run the Server**

   Start the server using:

   ```
   node server.js
   ```

   The server will listen on port 3000 by default. If you want to initiate the call immediately on server start, uncomment the `initiateCall()` function call in the `app.listen` block.

## Code Overview

### Dependencies

```
const express = require('express');
const twilio = require('twilio');
const bodyParser = require('body-parser');
require('dotenv').config(); // Load environment variables
```

### Server Configuration

```
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
```

### Twilio Credentials

```
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);
const twilioNumber = process.env.TWILIO_NUMBER;
const targetNumber = process.env.TARGET_NUMBER;
const ngrokUrl = process.env.NGROK_URL;
```

### Initiate a Call

```
function initiateCall() {
    client.calls
        .create({
            url: `${ngrokUrl}/ivr`,
            to: targetNumber,
            from: twilioNumber
        })
        .then(call => console.log(`Call initiated with SID: ${call.sid}`))
        .catch(error => console.error(`Error initiating call: ${error}`));
}
```

### Twilio Webhook for Incoming Calls

```
app.post('/ivr', (req, res) => {
    const twiml = new twilio.twiml.VoiceResponse();
    twiml.play('https://onedrive.live.com/download?cid=6D834994D9580DCB&resid=6D834994D9580DCB!245717&authkey=!AEm9E0JuXEPP2EE');
    const gather = twiml.gather({
        numDigits: 1,
        action: '/handle-key',
        method: 'POST'
    });
    gather.say('To receive a personalized interview link, please press 1. To end the call without receiving a link, press 2.');
    res.type('text/xml');
    res.send(twiml.toString());
});
```

### Handle Keypad Input

```
app.post('/handle-key', (req, res) => {
    const twiml = new twilio.twiml.VoiceResponse();
    const selectedOption = req.body.Digits;

    if (selectedOption === '1') {
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
        twiml.say('Goodbye.');
    } else {
        twiml.say('Invalid input. Please hang up and try again.');
    }

    twiml.hangup();
    res.type('text/xml');
    res.send(twiml.toString());
});
```

### Start the Server

```
app.listen(3000, () => {
    console.log('Server listening on port 3000');
    // Uncomment the line below if you want to initiate the call immediately on server start
    // initiateCall();
});
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
```

Replace `<repository-url>` and `<repository-folder>` with the actual URL and folder name of your repository. Adjust any details as needed for your specific setup.
