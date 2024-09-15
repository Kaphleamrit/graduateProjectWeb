const express = require('express');
const bodyParser = require('body-parser');
const path = require('path'); // Add path module to handle file paths
const app = express();
const port = 3000;

// Middleware to parse form data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve static files (CSS, client-side JS, images) from the "public" folder
app.use(express.static(path.join(__dirname, 'public')));

// Serve the index.html file at the root path
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// POST route to handle the submitted URL and redirect to the thanks page
app.post('/submit-url', (req, res) => {
    const submittedUrl = req.body.url;
    console.log(`URL received: ${submittedUrl}`);

    // Store the submitted URL in session or pass it (optional)
    req.session = { submittedUrl };  // For demo purposes only, not persistent

    // Redirect to the 'thanks' page after receiving the URL
    res.redirect('/thanks');
});

// Serve the thanks.html file at /thanks path
app.get('/thanks', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'thanks.html'));
});

// POST route to handle the submitted email
app.post('/submit-email', (req, res) => {
    const submittedEmail = req.body.email;
    console.log(`Email received: ${submittedEmail}`);

    // Process the email and send back a confirmation
    res.send(`Thanks! We'll notify you at ${submittedEmail} once your reports are ready.`);
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
