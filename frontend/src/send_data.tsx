import html2pdf from 'html2pdf.js';



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
    const formData = new FormData();
    formData.append('pdfBlob', pdfBlob, fileName);
    formData.append('customerName', customerName);

    const response = await fetch(import.meta.env.VITE_BACKEND_URL + 'send-email', {
      method: 'POST',
      body: formData,
      // Do not set Content-Type header; browser will set it to multipart/form-data with boundary
    });

    if (!response.ok) {
      console.error('Failed to send PDF to webhook:', response.statusText);
    }
  } catch (error) {
    console.error('Error sending PDF to webhook:', error);
  }
}



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
    const formData = new FormData();
    Object.keys(inputValue).forEach((key) => {
      formData.append(key, inputValue[key]);
    });
    try {
      const response = await fetch(import.meta.env.VITE_BACKEND_URL + 'log-form', {
        method: 'POST',
        body: JSON.stringify(inputValue),
        headers: {
          'Content-Type': 'application/json'
        },
      });

      if (!response.ok) {
        console.error('Failed to send PDF to webhook:', response.statusText);
        return null;
      }
      return response.json();

    } catch (error) {
      console.error('Error sending PDF to webhook:', error);
    }
  };