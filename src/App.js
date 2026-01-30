import React, { useState, useEffect } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import './App.css';

const API_KEY = "AIzaSyDBg5D_HKcbDelARptXccHnheRizhZntvY";
const genAI = new GoogleGenerativeAI(API_KEY);

function App() {
  const [screen, setScreen] = useState('home'); 
  const [isRegistered, setIsRegistered] = useState(false);
  const [userCar, setUserCar] = useState({ 
    brand: "", model: "", year: "", engine: "", vin: "", mileage: "" 
  });
  
  // Дані про заміни (пробіг, на якому міняли востаннє)
  const [maintenance, setMaintenance] = useState({
    pads: "120000",
    engineOil: "124000",
    gearboxOil: "100000",
    coolant: "110000",
    gboFilter: "120000"
  });

  // Регламенти (через скільки міняти)
  const intervals = { pads: 30000, engineOil: 10000, gearboxOil: 60000, coolant: 40000, gboFilter: 15000 };

  useEffect(() => {
    const saved = localStorage.getItem('bogdan_car');
    const savedMaint = localStorage.getItem('bogdan_maint');
    if (saved) setUserCar(JSON.parse(saved));
    if (savedMaint) setMaintenance(JSON.parse(savedMaint));
    if (saved) setIsRegistered(true);
  }, []);

  const saveMaint = (key, val) => {
    const newMaint = { ...maintenance, [key]: val };
    setMaintenance(newMaint);
    localStorage.setItem('bogdan_maint', JSON.stringify(newMaint));
  };

  const getRemains = (key) => {
    const left = (parseInt(maintenance[key]) + intervals[key]) - parseInt(userCar.mileage);
    return left > 0 ? `${left} км` : "ТЕРМІНОВО!";
  };

  if (!isRegistered) {
    return (
      <div className="app-container registration-page fade-in">
        <div className="registration-card">
          <div className="reg-header">
             <img src="/assets/logo.jpg" alt="Лого" className="logo-small-reg" />
             <h2>Реєстрація авто</h2>
          </div>
          <div className="input-grid">
            <input placeholder="Марка" value={userCar.brand} onChange={(e)=>setUserCar({...userCar, brand:e.target.value})}/>
            <input placeholder="Модель" value={userCar.model} onChange={(e)=>setUserCar({...userCar, model:e.target.value})}/>
            <input placeholder="Рік" type="number" value={userCar.year} onChange={(e)=>setUserCar({...userCar, year:e.target.value})}/>
            <input placeholder="Двигун" value={userCar.engine} onChange={(e)=>setUserCar({...userCar, engine:e.target.value})}/>
            <input placeholder="VIN" value={userCar.vin} onChange={(e)=>setUserCar({...userCar, vin:e.target.value})}/>
            <input placeholder="Пробіг" type="number" value={userCar.mileage} onChange={(e)=>setUserCar({...userCar, mileage:e.target.value})}/>
          </div>
          <button className="main-btn bogdan" onClick={() => {localStorage.setItem('bogdan_car', JSON.stringify(userCar)); setIsRegistered(true);}}>Зберегти 🏎️</button>
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
          <button className="main-btn bogdan" onClick={() => setScreen('chat')}>Побазарити з Богданом</button>
          <button className="main-btn stats" onClick={() => setScreen('stats')}>Коли на ТО?</button>
        </div>
      )}

      {screen === 'stats' && (
        <div className="page fade-in">
          <button onClick={() => setScreen('home')} className="back">← Назад</button>
          <h2 style={{color: '#f1c40f'}}>Прогноз замін</h2>
          <div className="maint-list">
            {[
              { label: "Гальмівні колодки", key: "pads" },
              { label: "Масло моторне", key: "engineOil" },
              { label: "Масло КПП", key: "gearboxOil" },
              { label: "Тосол / Антифриз", key: "coolant" },
              { label: "Фільтр ГБО", key: "gboFilter" }
            ].map(item => (
              <div key={item.key} className="maint-item">
                <div className="maint-info">
                  <label>{item.label}</label>
                  <input type="number" value={maintenance[item.key]} onChange={(e) => saveMaint(item.key, e.target.value)} placeholder="На якому км була заміна?" />
                </div>
                <div className={`remains ${getRemains(item.key) === "ТЕРМІНОВО!" ? "urgent" : ""}`}>
                  <span>Богдан каже:</span>
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

// Функція Chat залишається без змін...
function Chat({ onBack, car }) {
  const [msg, setMsg] = useState("");
  const [history, setHistory] = useState([{ r: "bot", t: "Здоров! Що по тачці?" }]);
  return (
    <div className="chat-screen">
       <div className="chat-header"><button onClick={onBack}>←</button><span>Богдан</span></div>
       <div className="chat-box">{history.map((m,i)=><div key={i} className={`msg ${m.r}`}>{m.t}</div>)}</div>
       <div className="input-area"><input value={msg} onChange={(e)=>setMsg(e.target.value)} /><button>🚀</button></div>
    </div>
  );
}

export default App;
