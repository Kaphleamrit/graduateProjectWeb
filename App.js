const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const { SQSClient, SendMessageCommand } = require('@aws-sdk/client-sqs'); // Import SQSClient and SendMessageCommand from v3 SDK
const app = express();
const port = 3000;

// Configure SQS Client
const sqsClient = new SQSClient({
    region: 'us-west-2', // Replace with your preferred region
    credentials: {
        accessKeyId: 'YOUR_AWS_ACCESS_KEY_ID', // Replace with your access key ID
        secretAccessKey: 'YOUR_AWS_SECRET_ACCESS_KEY' // Replace with your secret access key
    }
});

// Your FIFO queue URL
const queueUrl = 'https://sqs.us-west-2.amazonaws.com/YOUR_ACCOUNT_ID/my-fifo-queue.fifo';

// Middleware to parse form data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve static files from the "public" folder
app.use(express.static(path.join(__dirname, 'public')));

// Serve the index.html file at the root path
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// POST route to handle the submitted URL and email, and push to SQS
app.post('/submit-url', async (req, res) => {
    const { url, email } = req.body;
    console.log(`URL received: ${url}`);
    console.log(`Email received: ${email}`);

    // Message parameters for SQS
    const params = {
        QueueUrl: queueUrl,
        MessageBody: JSON.stringify({ url, email }), // Send both URL and email as a JSON object
        MessageGroupId: 'submissionGroup', // Required for FIFO queues
        MessageDeduplicationId: new Date().getTime().toString() // Unique ID for deduplication
    };

    // Create and send the SQS message
    try {
        const command = new SendMessageCommand(params);
        const data = await sqsClient.send(command);
        console.log('Message sent to SQS:', data.MessageId);
        res.redirect('/thanks');
    } catch (error) {
        console.error('Error sending message to SQS', error);
        res.status(500).send('Error sending data to queue.');
    }
});

// Serve the thanks.html file at /thanks path
app.get('/thanks', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'thanks.html'));
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
