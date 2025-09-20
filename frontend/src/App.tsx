import logo from './assets/logo.jpg'
import logo_favicon from './assets/logo_favicon.ico'
import { useEffect, useState } from 'react';
import SignaturePad from 'signature_pad';
import { handlePost, sendHtmlToPdf } from './send_data';
import { OrbitProgress } from 'react-loading-indicators';
import ReCAPTCHA from "react-google-recaptcha";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY;




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

  const [isCaptchaVerified, setIsCaptchaVerified] = useState(false);

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
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState<{ show: boolean; message: string; success: boolean }>({ show: false, message: '', success: false });



  useEffect(() => {
    const canvas = document.getElementById("signature-canvas") as HTMLCanvasElement;
    if (canvas) {
      // @ts-ignore
      window.signaturePad = new SignaturePad(canvas);
      const resizeCanvas = () => {
        const ratio = Math.max(window.devicePixelRatio || 1, 1);
        canvas.width = canvas.offsetWidth * ratio;
        canvas.height = canvas.offsetHeight * ratio;
        canvas.getContext("2d")?.scale(ratio, ratio);
      };
      window.addEventListener("resize", resizeCanvas);
      resizeCanvas();
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

  const checkIfCaptchaVerified = async (value: string | null) => {
    try {
      const response = await fetch(BACKEND_URL + 'verify-recaptcha', {
        method: 'POST',
        body: JSON.stringify({ token: value }),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        console.error('Failed to verify reCAPTCHA:', response.statusText);
      }
      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('Error verifying reCAPTCHA:', error);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Capture signature as data URL
    const canvas = document.getElementById("signature-canvas") as HTMLCanvasElement;
    let signature = '';
    if (canvas && (window as any).signaturePad && !(window as any).signaturePad.isEmpty()) {
      signature = canvas.toDataURL();
    } else {
      console.log('No signature captured');
    }

    // Clone body and inject signature into cloned canvas
    const bodyWithoutLoading = document.body.cloneNode(true) as HTMLElement;
    const clonedCanvas = bodyWithoutLoading.querySelector("#signature-canvas") as HTMLCanvasElement;


    
    // Check if recaptcha is verified
    if (!isCaptchaVerified) {
      console.log('Captcha not verified');
      setPopup({ show: true, message: 'יש למלא את ReCaptcha', success: false });
      return;
    }

    if (clonedCanvas && signature && isCaptchaVerified) {
      setLoading(true);
      const ctx = clonedCanvas.getContext("2d");
      const img = new window.Image();
      img.onload = () => {
        ctx?.clearRect(0, 0, clonedCanvas.width, clonedCanvas.height);
        ctx?.drawImage(img, 0, 0, clonedCanvas.width, clonedCanvas.height);
        // Send the PDF to the webhook after signature is drawn
        sendHtmlToPdf(bodyWithoutLoading, 'document.pdf', formData.name || 'ללא שם').then(async () => {
          const result = await handlePost({ ...formData, signature });
          setLoading(false);
          if (result) {
            setPopup({ show: true, message: 'הטופס נשלח בהצלחה!', success: true });
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
            setPopup({ show: true, message: 'שליחת הטופס נכשלה. נסה שוב.', success: false });
          }
        });
      };
      img.src = signature;
      return; // Prevent further execution until image is drawn
    }
    // If no signature, show error
    setPopup({ show: true, message: 'לא נחתם טופס', success: false });

  };

  return (
    <>
      <head>
        <title>Shenhav Cosmetics</title>
        <link rel="stylesheet" href="./App.css" />
        <link rel="icon" href={logo_favicon} />
      </head>


      <div className="form-container">
        <img src={logo} alt="Shenhav Cosmetics" className="logo"  />
        <h1>Shenhav Cosmetics</h1>
        <h2>טופס אנמנזה - טיפול פנים</h2>
        <form onSubmit={handleSubmit} aria-label="טופס אנמנזה - טיפול פנים">
          <label htmlFor="name">שם פרטי ומשפחה: <span className="required">*</span></label>
          <input id="name" name="name" type="text" required value={formData.name} onChange={handleChange} aria-required="true" />

          <label htmlFor="birthDate">תאריך לידה: <span className="required">*</span></label>
          <input id="birthDate" name="birthDate" type="date" required value={formData.birthDate} onChange={handleChange} aria-required="true" />

          <label htmlFor="age">גיל: <span className="required">*</span></label>
          <input id="age" name="age" type="number" required value={formData.age} onChange={handleChange} aria-required="true" />

          <label htmlFor="phone">טלפון: <span className="required">*</span></label>
          <input id="phone" name="phone" type="tel" required value={formData.phone} onChange={handleChange} aria-required="true" />

          <div className="checkbox-group">
            <label>האם את/ה סובל/ת מאחת המחלות הבאות? (סמן/י את המתאים)</label>
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
                  onChange={handleCheckboxChange(text, 'diseases')}
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
                    onChange={handleCheckboxChange(text, 'diseases')}
                  />
                  <span className="custom-checkbox"></span>
                  {text}
                </label>
                {formData.diseases.includes(text) && (
                  <input
                    type="text"
                    placeholder="פרט/י כאן..."
                    required
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



          <label>מה הביא אותך לטיפול פנים? <span className="required">*</span></label>
          <input type="text" required value={formData.moreInfo[0]} onChange={e => setFormData({ ...formData, moreInfo: [e.target.value, formData.moreInfo[1]] })} />

          <label>האם את/ה משתמש/ת בחומרים לפנים באופן יום-יומי? אם כן פרט/י: <span className="required">*</span></label>
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

          <label>חתימת הלקוח/ה: <span className="required">*</span></label>
          <div style={{ border: "1px solid #ccc", marginBottom: 8, position: "relative" }}>
            <canvas
              id="signature-canvas"
              height='300px'
              style={{ background: "#fff", width: "100%", height: "100%" }}
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
                  onChange={handleCheckboxChange(text, 'verifications')}
                />
                <span className="custom-checkbox"></span>
                {text}
              </label>
            ))}
          </div>


          <ReCAPTCHA
            sitekey={RECAPTCHA_SITE_KEY}
            onChange={async (value) => {
              setIsCaptchaVerified(await checkIfCaptchaVerified(value));
            }}
            style={{ margin: '16px 0' }}
          />

          <button className='submit-button' type="submit">שליחה</button>
        </form>
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div
          aria-live="polite"
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.7)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
          <OrbitProgress color="#fff" size="large" text="שולח..." textColor="#fff" />
        </div>
      )}
      {/* Popup Message */}
      {popup.show && (
        <div
          role="alert"
          aria-live="assertive"
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
          <div style={{
            background: '#fff',
            padding: '32px 48px',
            borderRadius: 12,
            boxShadow: '0 2px 16px rgba(0,0,0,0.2)',
            textAlign: 'center'
          }}>
            <h2 style={{ color: popup.success ? 'green' : 'red', marginBottom: 16 }}>{popup.message}</h2>
            <button
              aria-label="סגור הודעה"
              onClick={() => setPopup({ ...popup, show: false })}
              style={{
                padding: '8px 24px',
                borderRadius: 6,
                border: 'none',
                background: '#32cd32',
                color: '#fff',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}>
              סגור
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export default App
