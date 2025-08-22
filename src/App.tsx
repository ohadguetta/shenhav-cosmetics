import './App.css'
import logo from './assets/logo.jpg'
import logo_favicon from './assets/logo_favicon.ico'
import { useEffect, useState } from 'react';
import SignaturePad from 'signature_pad';
import { handlePost } from './send_data';

function App() {
  type FormData = {
    name: string;
    birthDate: string;
    age: string;
    phone: string;
    signature: string;
    diseases: string[];
    moreInfo: [string, string];
    diseaseDetails: [string, string, string, string];
    verifications: string[];
  };

  const [formData, setFormData] = useState<FormData>({
    name: '',
    birthDate: '',
    age: '',
    phone: '',
    signature: '',
    diseases: [],
    moreInfo: ['', ''],
    diseaseDetails: ['', '', '', ''],
    verifications: [],
  });


  useEffect(() => {
    const canvas = document.getElementById("signature-canvas") as HTMLCanvasElement;
    if (canvas) {
      // @ts-ignore
      window.signaturePad = new SignaturePad(canvas);
    }
  }, []);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCheckboxChange = (text: string, variable: 'diseases' | 'verifications') => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => {
      const arr = prev[variable];
      if (e.target.checked) {
        // Add text if checked and not already present
        return { ...prev, [variable]: arr.includes(text) ? arr : [...arr, text] };
      } else {
        // Remove text if unchecked
        return { ...prev, [variable]: arr.filter(item => item !== text) };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    console.log('Form submitted:', formData);
    e.preventDefault();

    const canvas = document.getElementById("signature-canvas") as HTMLCanvasElement;
    let signature = '';
    if (canvas && (window as any).signaturePad && !(window as any).signaturePad.isEmpty()) {
      signature = canvas.toDataURL();
    } else {
      console.log('No signature captured');
    }

    // Send the PDF to the webhook
    // await sendHtmlToPdf(document.body, 'document.pdf');
    

    // Send the signature with the rest of the form data
    const result = await handlePost({ ...formData, signature });
    if (result) {
      console.log('Data sent successfully:', result);
      alert('הטופס נשלח בהצלחה!');
      setFormData({
        name: '',
        birthDate: '',
        age: '',
        phone: '',
        signature: '',
        diseases: [],
        moreInfo: ['', ''],
        diseaseDetails: ['', '', '', ''],
        verifications: [],
      });
      // Clear the signature pad
      const canvas = document.getElementById("signature-canvas") as HTMLCanvasElement;
      if (canvas && (window as any).signaturePad) {
        (window as any).signaturePad.clear();
      }

    } else {
      console.log('Failed to send data');
    }

  };

  return (
    <>
      <head>
        <title>Shenhav Cosmetics</title>
        <link rel="stylesheet" href="./App.css" />
        <link rel="icon" href={logo_favicon} />
      </head>

      <div className="form-container">
        <img src={logo} alt="Shenhav Cosmetics" className="logo" />
        <h1>Shenhav Cosmetics</h1>
        <h2>טופס אנמנזה - טיפול פנים</h2>
        <form onSubmit={handleSubmit}>
          <label>שם פרטי ומשפחה:</label>
          <input name="name" type="text" required value={formData.name} onChange={handleChange} />

          <label>תאריך לידה:</label>
          <input name="birthDate" type="date" required value={formData.birthDate} onChange={handleChange} />

          <label>גיל:</label>
          <input name="age" type="number" required value={formData.age} onChange={handleChange} />

          <label>טלפון:</label>
          <input name="phone" type="tel" required value={formData.phone} onChange={handleChange} />

          <div className="checkbox-group">
            <label>האם אתה סובל מאחת המחלות הבאות? (סמן את המתאים)</label>
            {[
              'האם את בהריון?',
              'האם את מניקה או לאחר לידה?',
              'האם את/ה השתזפת במכון שיזוף בחודש האחרון?',
              'האם עורך נכווה בקלות מחשיפה לשמש?',
              'האם את/ה משתמש/ת בתכשיר שמכיל רטין A/רטינול?',
              'האם את/ה מטופל/ת ברואקוטן/קורטיזון?',
              'האם את/ה הזרקת בוטוקס/חומצה היאלורונית ב-3 חודשים האחרונים?',
              'האם את/ה עברת ניתוח פלסטי בפנים?',
              'האם את/ה בעל/ת נטייה להרפס?',
              'האם את/ה עברת טיפול בשעווה/אפילציה ב-3 ימים האחרונים?',
              'האם את/ה סובל/ת מאפילפסיה?',
              'האם את/ה צורך/ת אלכוהול?',
              'האם את/ה מעשן/ת?',
              'האם את/ה מבצע/ת פעילות גופנית?',
            ].map((text, idx) => (
              <label className="checkbox-item" key={idx}>
                <input
                  type="checkbox"

                  checked={formData.diseases.includes(text)}
                  onChange={handleCheckboxChange(text,'diseases')}
                />
                <span className="custom-checkbox"></span>
                {text}
              </label>
            ))}
          </div>

          <div className="checkbox-group" style={{ marginTop: '20px' }}>
            {[
              'האם את/ה נוטל/ת תרופות קבועות? אם כן פרט/י',
              'האם סובל/ת מאלרגיות? אם כן פרט/י',
              'האם את משתמשת בגלולות/התקן/טיפולי פוריות? אם כן פרט/י',
              'האם את/ה סובל/ת ממחלות עור? אם כן פרט/י',
            ].map((text, idx) => (
              <div key={idx}>
                <label className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={formData.diseases.includes(text)}
                    onChange={handleCheckboxChange(text,'diseases')}
                  />
                  <span className="custom-checkbox"></span>
                  {text}
                </label>
                {formData.diseases.includes(text) && (
                  <input
                    type="text"
                    placeholder="פרט/י כאן..."
                    style={{ marginTop: 8, marginBottom: 8, width: '100%' }}
                    value={
                      // Store explanation in diseaseDetails[0] for תרופות קבועות, diseaseDetails[1] for אלרגיות
                      formData.diseaseDetails[idx]
                    }
                    onChange={e =>
                      setFormData({
                        ...formData,
                        diseaseDetails: (() => {
                          const updated = formData.diseaseDetails.map((detail, i) =>
                            i === idx ? e.target.value : detail
                          );
                          // Ensure exactly 4 elements
                          return [...updated.slice(0, 4), '', '', '', ''].slice(0, 4) as [string, string, string, string];
                        })()
                      })
                    }
                  />
                )}
              </div>
            ))}
          </div>



          <label>מה הביא אותך לטיפול פנים?</label>
          <input type="text" required value={formData.moreInfo[0]} onChange={e => setFormData({ ...formData, moreInfo: [e.target.value, formData.moreInfo[1]] })} />

          <label>האם את/ה משתמש/ת בחומרים לפנים באופן יום-יומי? אם כן פרט/י:</label>
          <input type="text" required value={formData.moreInfo[1]} onChange={e => setFormData({ ...formData, moreInfo: [formData.moreInfo[0], e.target.value] })} />

          <div className="instructions">
            <strong>הנחיות לאחר טיפול:</strong><br />
            - אין לשפשף/לגרד את האיזור המטופל במשך 24 שעות.<br />
            - להימנע משהייה במים חמים/ג׳קוזי/סאונה במשך 24 שעות.<br />
            - להימנע מאימון כושר מאומץ במשך 24 שעות.<br />
            - להימנע מחשיפה לשמש/מיטות שיזוף.<br />
            - רצוי להשתמש במקדם הגנה לאחר הטיפול.<br />
            - לדווח לקוסמטיקאית על תופעות לוואי או רגישות יתר.
          </div>

          <label>חתימת הלקוח/ה:</label>
          <div style={{ border: "1px solid #ccc", marginBottom: 8, position: "relative" }}>
            <canvas
              id="signature-canvas"
              width={664}
              height={200}
              style={{ background: "#fff", width: "100%" }}

            />
            <button
              className="clear-button"
              type="button"
              onClick={() => {
                const canvas = document.getElementById("signature-canvas") as HTMLCanvasElement;
                if (canvas && (window as any).signaturePad) {
                  (window as any).signaturePad.clear();
                }
              }}
              style={{ position: "absolute", top: 5, right: 5, zIndex: 2 }}
            >
              נקה
            </button>
          </div>



          <div className="checkbox-group">
            {[
              'האם את/ה מאשר/ת עיסוי בקרקפת?',
              'האם את/ה מאשר/ת פרסום תמונות?'
            ].map((text, idx) => (
              <label className="checkbox-item" key={idx}>
                <input
                  type="checkbox"

                  checked={formData.verifications.includes(text)}
                  onChange={handleCheckboxChange(text,'verifications')}
                />
                <span className="custom-checkbox"></span>
                {text}
              </label>
            ))}
          </div>

          <button className='submit-button' type="submit">שליחה</button>
        </form>
      </div>
    </>
  )
}

export default App
