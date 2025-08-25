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
  origin: 'http://localhost:5173' // Allow requests from your frontend origin
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
        name: customerName,
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
            subject: "You are awesome!",
            text: "Congrats for sending test email with Mailtrap!",
            category: "Integration Test",
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


app.get('/', (req, res) => {
    res.send('Hello from the Node.js backend!');
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});