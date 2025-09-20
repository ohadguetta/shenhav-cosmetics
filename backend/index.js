const express = require('express');
const app = express();
const port = process.env.PORT || 3000; // Use environment variable or default to 3000
require('dotenv').config();
const cors = require('cors'); // Install this package: npm install cors
const multer = require('multer');
const { google } = require('googleapis');
const upload = multer();

const { encode } = require("js-base64");


const GOOGLE_SHEET_ID = process.env.GOOGLE_SHEET_ID;
const GOOGLE_SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL;
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n');

const GOOGLE_GMAIL_CLIENT_SECRET = process.env.GOOGLE_GMAIL_CLIENT_SECRET;
const GOOGLE_GMAIL_CLIENT_ID = process.env.GOOGLE_GMAIL_CLIENT_ID;
const GOOGLE_GMAIL_REDIRECT_URI = process.env.GOOGLE_GMAIL_REDIRECT_URI;
const GOOGLE_GMAIL_REFRESH_TOKEN = process.env.GOOGLE_GMAIL_REFRESH_TOKEN;

app.use(express.json());

app.use(cors({
    origin: ['http://localhost:5173', 'https://shenhav-cosmetics.vercel.app']
}));






async function sendMail(to, subject, messageText, pdfBlob) {

    const oAuth2Client = new google.auth.OAuth2(GOOGLE_GMAIL_CLIENT_ID, GOOGLE_GMAIL_CLIENT_SECRET, GOOGLE_GMAIL_REDIRECT_URI);
    oAuth2Client.setCredentials({ refresh_token: GOOGLE_GMAIL_REFRESH_TOKEN });

    const gmail = google.gmail({ version: "v1", auth: oAuth2Client });

    // Build the email with a PDF attachment (MIME format)
    const boundary = "boundary_" + Date.now();
    const message =
        `To: ${to}\r\n` +
        `Subject: ${subject}\r\n` +
        `MIME-Version: 1.0\r\n` +
        `Content-Type: multipart/mixed; boundary="${boundary}"\r\n\r\n` +

        `--${boundary}\r\n` +
        `Content-Type: text/plain; charset="UTF-8"\r\n\r\n` +
        `${messageText}\r\n\r\n` +

        `--${boundary}\r\n` +
        `Content-Type: application/pdf\r\n` +
        `Content-Disposition: attachment; filename="attachment.pdf"\r\n` +
        `Content-Transfer-Encoding: base64\r\n\r\n` +
        `${pdfBlob.toString('base64')}\r\n\r\n` +

        `--${boundary}--`;

    const encodedMessage = encode(message);

    const res = await gmail.users.messages.send({
        userId: "me",
        requestBody: { raw: encodedMessage },
    });

    console.log("Message sent:", res.data.id);
    return res;
}




app.post('/api/send-email', upload.single('pdfBlob'), async (req, res) => {
    const pdfBlob = req.file ? req.file.buffer : null;
    const customerName = req.body.customerName;

    if (!pdfBlob) {
        return res.status(400).json({ error: "No PDF data provided." });
    }

    try {

        await sendMail("o4255542@gmail.com", "לקוח מילא טופס אמנזה", `שם לקוח: ${customerName}`, pdfBlob);
    } catch (error) {
        console.error('Error sending email:', error);
        return res.status(500).json({ success: false, error: "Failed to send email." });
    }
    res.status(200).json({ success: true, message: "Email sent successfully!" });
});


// Endpoint to log form data
app.post('/api/log-form', async (req, res) => {
    const formData = req.body;

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