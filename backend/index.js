const express = require('express');
const app = express();
const port = process.env.PORT || 3000; // Use environment variable or default to 3000
const { MailtrapClient } = require("mailtrap");
require('dotenv').config();
const cors = require('cors'); // Install this package: npm install cors
const multer = require('multer');
const { google } = require('googleapis');
const upload = multer();

const TOKEN = process.env.MAILTRAP_API_TOKEN; // Use Node.js environment variable
const GOOGLE_SHEET_ID = process.env.GOOGLE_SHEET_ID;
const GOOGLE_SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL;
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n');

app.use(express.json());

app.use(cors({
  origin: ['http://localhost:5173', 'https://shenhav-cosmetics.vercel.app']
}));


// Endpoint to send email
app.post('/api/send-email', upload.single('pdfBlob'), async (req, res) => {
    const pdfBlob = req.file ? req.file.buffer : null;
    const customerName = req.body.customerName;
    console.log("Received PDF blob of size:", pdfBlob ? pdfBlob.length : 0);
    console.log("Customer name:", customerName);

    if (!pdfBlob) {
        return res.status(400).json({ error: "No PDF data provided." });
    }
    const client = new MailtrapClient({
        token: TOKEN,
    });

    const sender = {
        email: "hello@demomailtrap.co",
        name: 'Mailtrap',
    };
    const recipients = [
        {
            email: "o4255542@gmail.com",
        }
    ];

    try {
        await client.send({
            from: sender,
            to: recipients,
            subject: customerName,
            text: customerName,
            attachments: [
                {
                    filename: "document.pdf",
                    content: pdfBlob
                }
            ]
        });
        res.status(200).json({ message: "Email sent successfully!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to send email." });
    }
});

// Endpoint to log form data
app.post('/api/log-form', async (req, res) => {
    const formData = req.body;
    console.log("Received form data:", formData);

    const auth = new google.auth.GoogleAuth({
        credentials: {
            client_email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
            private_key: GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        },
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    const spreadsheetId = GOOGLE_SHEET_ID; 
    const sheetName = 'Sheet1';

    try {
        await sheets.spreadsheets.values.append({
            spreadsheetId,
            range: `${sheetName}!A1`,
            valueInputOption: 'RAW',
            requestBody: {
                values: [Object.values(formData)],
            },
        });
        console.log('Form data logged to Google Sheets');
    } catch (err) {
        console.error('Failed to log to Google Sheets:', err);
    }

    res.status(200).json({ message: "Form data received successfully!" });
});

app.post('/api/verify-recaptcha', (req, res) => {
    const { token } = req.body;
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    if (!token) {
        return res.status(400).json({ success: false, message: 'No token provided' });
    }
    const verificationUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`;
    fetch(verificationUrl, { method: 'POST' })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                res.status(200).json({ success: true, message: 'Captcha verified successfully' });
            } else {
                res.status(400).json({ success: false, message: 'Captcha verification failed' });
            }
            console.log('Captcha verification response:', data);
        })
        .catch(error => {
            console.error('Error verifying captcha:', error);
            res.status(500).json({ success: false, message: 'Internal server error' });
        });
        
});

app.get('/', (req, res) => {
    res.send('Healthy');
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});