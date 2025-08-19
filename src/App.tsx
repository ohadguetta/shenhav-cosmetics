import './App.css'
import logo from './assets/logo.jpg'
import logo_favicon from './assets/logo_favicon.ico'
import { useEffect, useState } from 'react';
import SignaturePad from 'signature_pad';
import { handlePost } from './send_data';

function App() {
  const [formData, setFormData] = useState({
    name: '',
    birthDate: '',
    email: '',
    age: '',
    phone: '',
    // ...add more fields as needed
    signature: '',
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

  const handleSubmit = async (e: React.FormEvent) => {
    console.log('Form submitted:', formData);
    e.preventDefault();

    const canvas = document.getElementById("signature-canvas") as HTMLCanvasElement;
    let signature = '';
    if (canvas && (window as any).signaturePad && !(window as any).signaturePad.isEmpty()) {
      signature = canvas.toDataURL();
    }

    

    const email = formData.email;
    await handlePost(email);

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

          <label>אימייל:</label>
          <input name="email" type="email" required value={formData.email} onChange={handleChange} />

          <label>גיל:</label>
          <input name="age" type="number" min="0" required value={formData.age} onChange={handleChange} />

          <label>טלפון:</label>
          <input name="phone" type="tel" required value={formData.phone} onChange={handleChange} />

          <div className="checkbox-group">
            <label>האם אתה סובל מאחת המחלות הבאות? (סמן את המתאים)</label>
            {[
              'האם הנך בשלבי הריון?',
              'האם הנך מניקה או לאחר לידה?',
              'האם השתזפת במכון/שמש בחודש האחרון?',
              'האם הנך משתמש/ת בתכשיר עם רטין A/רטינול?',
              'האם מטופל/ת ברואקוטן/קורטיזון?',
              'האם קיבלת הזרקת בוטוקס/חומצה היאלורונית ב-3 חודשים האחרונים?',
              'האם עברת ניתוח פלסטי בפנים?',
              'האם יש נטייה להרפס?',
              'האם את/ה נוטל/ת תרופות קבועות?',
              'האם עברת טיפול בשעווה/אפילציה ב-3 ימים האחרונים?',
              'האם הנך סובל/ת מאפילפסיה?',
              'האם סובל/ת מאלרגיות? פרט/י:',
              'האם את/ה משתמש/ת בגלולות/התקן/טיפולי פוריות?',
              'האם את/ה צורך/ת אלכוהול?',
              'האם את/ה מעשן/ת?',
              'האם את/ה מבצע/ת פעילות גופנית?',
              'האם את/ה מאשר/ת עיסוי בקרקפת?',
              'האם את/ה מאשר/ת פרסום תמונות?'
            ].map((text, idx) => (
              <label key={idx} className="checkbox-item">
                <input type="checkbox" />
                <span className="custom-checkbox"></span>
                {text}
              </label>
            ))}
          </div>

          <label>מה הביא אותך לטיפול פנים?</label>
          <input type="text" required />

          <label>האם את/ה משתמש/ת בחומרים לפנים באופן יום-יומי? אם כן פרט/י:</label>
          <input type="text" required />

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

          <button className='submit-button' type="submit">שליחה</button>
        </form>
      </div>
    </>
  )
}

export default App
