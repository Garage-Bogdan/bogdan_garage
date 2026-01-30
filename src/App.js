import React, { useState, useEffect } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import './App.css';

const API_KEY = process.env.REACT_APP_GEMINI_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

function App() {
  const [screen, setScreen] = useState('home'); 
  const [isRegistered, setIsRegistered] = useState(false);
  const [userCar, setUserCar] = useState({ 
    brand: "", model: "", year: "", engine: "", vin: "", mileage: "" 
  });
  const [maintenance, setMaintenance] = useState({
    pads: "0", engineOil: "0", gearboxOil: "0", coolant: "0", gboFilter: "0"
  });
  const [msg, setMsg] = useState("");
  const [history, setHistory] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  const intervals = { pads: 30000, engineOil: 10000, gearboxOil: 60000, coolant: 40000, gboFilter: 15000 };

  useEffect(() => {
    const saved = localStorage.getItem('bogdan_car');
    const savedMaint = localStorage.getItem('bogdan_maint');
    if (saved) { 
      const carData = JSON.parse(saved);
      setUserCar(carData); 
      setIsRegistered(true); 
      setHistory([{ r: "bot", t: `Здоров! Бачу твій ${carData.brand} ${carData.model} на базі. Що підказати по тачці?` }]);
    }
    if (savedMaint) setMaintenance(JSON.parse(savedMaint));
  }, []);

  const saveMaint = (key, val) => {
    const newMaint = { ...maintenance, [key]: val };
    setMaintenance(newMaint);
    localStorage.setItem('bogdan_maint', JSON.stringify(newMaint));
  };

  const getRemains = (key) => {
    const current = parseInt(userCar.mileage) || 0;
    const last = parseInt(maintenance[key]) || 0;
    const left = (last + intervals[key]) - current;
    return left > 0 ? `${left} км` : "ТЕРМІНОВО!";
  };

  const handleRegister = () => {
    if (Object.values(userCar).every(val => val !== "")) {
      localStorage.setItem('bogdan_car', JSON.stringify(userCar));
      setIsRegistered(true);
      setHistory([{ r: "bot", t: `Здоров! Бачу твій ${userCar.brand} ${userCar.model} на базі. Що підказати?` }]);
    }
  };

  const askBogdan = async () => {
    if (!msg.trim() || isTyping) return;
    const currentKey = process.env.REACT_APP_GEMINI_KEY || API_KEY;
    if (!currentKey) {
      setHistory(prev => [...prev, { r: "bot", t: "Братан, ключ не знайдено в налаштуваннях Vercel!" }]);
      return;
    }

    const userText = msg;
    setMsg("");
    const newHistory = [...history, { r: "user", t: userText }];
    setHistory(newHistory);
    setIsTyping(true);

    try {
      const client = new GoogleGenerativeAI(currentKey);
      const model = client.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(`Ти Богдан з 'Авто Підбір Україна'. Клієнт має ${userCar.brand} ${userCar.model}. Питання: ${userText}`);
      const response = await result.response;
      setHistory([...newHistory, { r: "bot", t: response.text() }]);
    } catch (e) {
      setHistory([...newHistory, { r: "bot", t: "Богдан пішов на перекур (помилка ключа). Спробуй пізніше!" }]);
    } finally {
      setIsTyping(false);
    }
  };

  if (!isRegistered) {
    return (
      <div className="app-container registration-page fade-in">
        <div className="registration-card">
          <div className="reg-header">
             <img src="/assets/logo.jpg" alt="Лого" className="logo-half" />
             <img src="/assets/bogdan_run.jpg" alt="Богдан" className="avatar-small" />
          </div>
          <h2>Реєстрація авто</h2>
          <div className="input-grid">
            <input placeholder="Марка" value={userCar.brand} onChange={(e)=>setUserCar({...userCar, brand:e.target.value})}/>
            <input placeholder="Модель" value={userCar.model} onChange={(e)=>setUserCar({...userCar, model:e.target.value})}/>
            <input placeholder="Рік" type="number" value={userCar.year} onChange={(e)=>setUserCar({...userCar, year:e.target.value})}/>
            <input placeholder="Двигун" value={userCar.engine} onChange={(e)=>setUserCar({...userCar, engine:e.target.value})}/>
            <input placeholder="VIN" value={userCar.vin} onChange={(e)=>setUserCar({...userCar, vin:e.target.value})}/>
            <input placeholder="Пробіг" type="number" value={userCar.mileage} onChange={(e)=>setUserCar({...userCar, mileage:e.target.value})}/>
          </div>
          <button className="main-btn bogdan" onClick={handleRegister}>Створити авто 🏎️</button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {screen === 'home' && (
        <div className="fade-in">
          <div className="top-nav">
            <img src="/assets/logo.jpg" alt="Лого" className="nav-logo" />
            <div className="nav-profile">
               <span className="expert-name">Богдан</span>
               <img src="/assets/bogdan_run.jpg" alt="Богдан" className="nav-avatar" />
            </div>
          </div>
          <div className="header-info">
            <h1>{userCar.brand} {userCar.model}</h1>
            <div className="mileage-tag">{userCar.mileage} км</div>
          </div>
          <div className="pixar-container">
            <div className="pixar-frame">
              <img src={`https://loremflickr.com/800/500/car,${userCar.brand}`} alt="Pixar Car" className="car-pixar-img" />
            </div>
          </div>
          <button className="main-btn bogdan" onClick={() => setScreen('chat')}>Побазарити з Богданом</button>
          <button className="main-btn stats" onClick={() => setScreen('stats')}>Прогноз ТО</button>
          <button className="reset-link" onClick={() => {localStorage.clear(); window.location.reload();}}>Змінити авто</button>
        </div>
      )}

      {screen === 'stats' && (
        <div className="page fade-in">
          <button onClick={() => setScreen('home')} className="back">← Назад</button>
          <h2 style={{color: '#f1c40f'}}>Коли міняти?</h2>
          <div className="maint-list">
            {[{l:"Колодки",k:"pads"},{l:"Масло мотор",k:"engineOil"},{l:"Масло КПП",k:"gearboxOil"},{l:"Тосол",k:"coolant"},{l:"ГБО",k:"gboFilter"}].map(i => (
              <div key={i.k} className="maint-item">
                <div className="maint-info">
                  <label>{i.l}</label>
                  <input type="number" value={maintenance[i.k]} onChange={(e) => saveMaint(i.k, e.target.value)} />
                </div>
                <div className={`remains ${getRemains(i.k) === "ТЕРМІНОВО!" ? "urgent" : ""}`}>
                  <span>Залишок:</span>
                  <strong>{getRemains(i.k)}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {screen === 'chat' && (
        <div className="chat-screen fade-in">
          <div className="chat-header">
            <button onClick={() => setScreen('home')} className="back">←</button>
            <img src="/assets/bogdan_run.jpg" className="chat-avatar" alt="B" />
            <span>Богдан AI</span>
          </div>
          <div className="chat-box">
            {history.map((m, i) => <div key={i} className={`msg-bubble ${m.r}`}>{m.t}</div>)}
            {isTyping && <div className="msg-bubble bot italic">Богдан думає...</div>}
          </div>
          <div className="input-area">
            <input value={msg} onChange={(e) => setMsg(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && askBogdan()} placeholder="Питай..." />
            <button onClick={askBogdan}>🚀</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
