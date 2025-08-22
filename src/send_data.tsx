// import 'dotenv/config';
import html2pdf from 'html2pdf.js';
const APP_ID = import.meta.env.VITE_APP_ID || 'APP_ID'; 
const webhookUrl = import.meta.env.VITE_WEBHOOK_URL; // Replace with your actual webhook URL
const webhookAuthToken = import.meta.env.VITE_WEBHOOK_AUTH_TOKEN; // Replace with your actual auth token


export const sendHtmlToPdf = async (element: HTMLElement, fileName: string, customerName: string) => {
  const options = {
    margin: 0.5,
    filename: fileName,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'in', format: 'a4', orientation: 'landscape' as const },
  };
  //send to email
  const pdfBlob = await html2pdf().set(options).from(element).outputPdf('blob');
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      body: pdfBlob,
      headers: {
        'Content-Type': 'application/pdf',
        'AUTH_TOKEN': `${webhookAuthToken}`,
        'Customer-Name': encodeURIComponent(customerName)
      },
    });
    if (!response.ok) {
      console.error('Failed to send PDF to webhook:', response.statusText);
    }
  } catch (error) {
    console.error('Error sending PDF to webhook:', error);
  }
}

// Remove dotenv and process.env usage for client-side code

export const handlePost = async (clientData: { [key: string]: any }) => {
  console.log('Sending data to server:', clientData);
  const date = new Date();
  const inputValue: { [key: string]: string } = {
    'שם מלא': clientData.name,
    'תאריך לידה': clientData.birthDate,
    'גיל': clientData.age,
    'טלפון': clientData.phone,
    'חתימה': clientData.signature,
    'מחלות': clientData.diseases.join(', '),
    'פרטי מחלות ותרופות': clientData.diseaseDetails.join(', '),
    'מידע נוסף': clientData.moreInfo.join(', '),
    'נוצר בתאריך': date.toLocaleString(),
    'אישור עיסוי בקרקפת': clientData.verifications.includes('האם את/ה מאשר/ת עיסוי בקרקפת?') ? 'כן' : 'לא',
    'אישור פרסום תמונות': clientData.verifications.includes('האם את/ה מאשר/ת פרסום תמונות?') ? 'כן' : 'לא',

  };
  console.log(inputValue);
  const baseURL = `https://script.google.com/macros/s/${APP_ID}/exec`;
  const formData = new FormData();
  Object.keys(inputValue).forEach((key) => {
    formData.append(key, inputValue[key]);
  });
  try {
    const res = await fetch(baseURL, {
      method: 'POST',
      body: formData,
    });
    if (res.ok) {
      console.log('Request was successful:', res);
      
    } else {
      console.log('Request Failed:', res);
    }
    const data = await res.json();
    return data;

  } catch (e) {
    console.error('Error during fetch:', e);
  }
};