const express = require('express');
const app = express();
const port = process.env.PORT || 3000; // Use environment variable or default to 3000
const { MailtrapClient } = require("mailtrap");
require('dotenv').config();
const cors = require('cors'); // Install this package: npm install cors
const multer = require('multer');
const upload = multer();

const TOKEN = process.env.MAILTRAP_API_TOKEN; // Use Node.js environment variable

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

app.post('/api/log-form', async (req, res) => {
    const formData = req.body;
    console.log("Received form data:", formData);

    // Here you can process the form data as needed
    // For example, you might save it to a database or perform some other action

    res.status(200).json({ message: "Form data received successfully!" });
});

app.get('/', (req, res) => {
    res.send('Healthy');
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});