import React, { useState, useEffect } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import './App.css';

// Використовуйте свій актуальний ключ
const API_KEY = "AIzaSyCYPj13TEwHBU3c7n9XH8XOic32JNMH6ZQ";
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

  // Регламенти замін (можна змінювати за потреби)
  const intervals = { pads: 30000, engineOil: 10000, gearboxOil: 60000, coolant: 40000, gboFilter: 15000 };

  useEffect(() => {
    const saved = localStorage.getItem('bogdan_car');
    const savedMaint = localStorage.getItem('bogdan_maint');
    if (saved) { 
      setUserCar(JSON.parse(saved)); 
      setIsRegistered(true); 
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
          <button className="main-btn bogdan" onClick={handleRegister}>Заїхати в Гараж 🏎️</button>
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
            {[
              { label: "Колодки", key: "pads" },
              { label: "Масло мотор", key: "engineOil" },
              { label: "Масло коробка", key: "gearboxOil" },
              { label: "Тосол", key: "coolant" },
              { label: "Фільтр ГБО", key: "gboFilter" }
            ].map(item => (
              <div key={item.key} className="maint-item">
                <div className="maint-info">
                  <label>{item.label}</label>
                  <input type="number" value={maintenance[item.key]} onChange={(e) => saveMaint(item.key, e.target.value)} />
                </div>
                <div className={`remains ${getRemains(item.key) === "ТЕРМІНОВО!" ? "urgent" : ""}`}>
                  <span>Богдан:</span>
                  <strong>{getRemains(item.key)}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {screen === 'chat' && <Chat onBack={() => setScreen('home')} car={userCar} />}
    </div>
  );
}

function Chat({ onBack, car }) {
  const [msg, setMsg] = useState("");
  const [history, setHistory] = useState([{ r: "bot", t: `Здоров! Бачу твій ${car.brand} на базі. Що підказати?` }]);
  const [isTyping, setIsTyping] = useState(false);

  const ask = async () => {
    if (!msg.trim() || isTyping) return;
    const userMsg = msg; setMsg("");
    const newHistory = [...history, { r: "user", t: userMsg }];
    setHistory(newHistory);
    setIsTyping(true);
    try {
      const model = genAI.getGenerativeModel({ 
          model: "gemini-1.5-flash",
          systemInstruction: `Ти — Богдан з 'Авто Підбір Україна'. Користувач має ${car.brand} ${car.model}. Відповідай харизматично.` 
      });
      const res = await model.generateContent(userMsg);
      setHistory([...newHistory, { r: "bot", t: res.response.text() }]);
    } catch (e) {
      setHistory([...newHistory, { r: "bot", t: "Братан, щось з інтернетом!" }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="chat-screen">
       <div className="chat-header">
         <button onClick={onBack} className="back">←</button>
         <span>Богдан AI</span>
       </div>
       <div className="chat-box">
         {history.map((m,i)=><div key={i} className={`msg-bubble ${m.r}`}>{m.t}</div>)}
       </div>
       <div className="input-area">
         <input value={msg} onChange={(e)=>setMsg(e.target.value)} onKeyPress={(e)=>e.key==='Enter'&&ask()} />
         <button onClick={ask}>🚀</button>
       </div>
    </div>
  );
}

export default App;

