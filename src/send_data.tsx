// import 'dotenv/config';


// Remove dotenv and process.env usage for client-side code
const APP_ID = import.meta.env.VITE_APP_ID || 'APP_ID'; 

export const handlePost = async (clientData: { [key: string]: any }) => {
  console.log('Sending data to server:', clientData);
  const date = new Date();
  const inputValue: { [key: string]: string } = {
    'אימייל': clientData.email,
    'שם מלא': clientData.name,
    'תאריך לידה': clientData.birthDate,
    'גיל': clientData.birthDate ? Math.floor((date.getTime() - new Date(clientData.birthDate).getTime()) / (1000 * 60 * 60 * 24 * 365.25)).toString() : '',
    'טלפון': clientData.phone,
    'חתימה': clientData.signature,
    'מחלות': clientData.diseases.join(', '),
    'מידע נוסף': clientData.moreInfo.join(', '),
    'נוצר בתאריך': date.toLocaleString(),
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