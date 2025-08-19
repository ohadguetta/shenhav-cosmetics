// import 'dotenv/config';


// Remove dotenv and process.env usage for client-side code
const APP_ID = import.meta.env.VITE_APP_ID || 'APP_ID'; 

export const handlePost = async (email:string) => {
  const date = new Date();
  const inputValue: { [key: string]: string } = {
    'Email': email,
    'Created At': date.toLocaleString(),
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
  } catch (e) {
    console.error('Error during fetch:', e);
  }
};