import React, { useState } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import './App.css';

const API_KEY = "AIzaSyDBg5D_HKcbDelARptXccHnheRizhZntvY";
const genAI = new GoogleGenerativeAI(API_KEY);

function App() {
  const [screen, setScreen] = useState('home'); // home, chat, service, stats
  const [mileage, setMileage] = useState(125400);

  // Дані для сторінки витрат
  const statsData = [
    { name: 'Паливо', value: 4500, color: '#f1c40f' },
    { name: 'Сервіс', value: 2100, color: '#2980b9' },
    { name: 'Мийка', value: 800, color: '#95a5a6' },
  ];

  return (
    <div className="app-container">
  {screen === 'home' && (
    <div className="fade-in">
      <div className="header">
        {/* Додаємо твій логотип */}
        <img src="/assets/logo.jpg" alt="Лого" style={{width: '100px', marginBottom: '10px'}} />
        <h1>Volkswagen Golf</h1>
        <div className="mileage-tag">{mileage} км</div>
      </div>
      
      <div className="car-container" onClick={() => setScreen('service')}>
        <div className="pixar-frame">
          {/* Замість тексту вставляємо Богдана, який біжить */}
          <img src="/assets/bogdan_run.jpg" alt="Богдан" style={{height: '100%'}} />
        </div>
        <p className="hint">Натисни на Богдана для ТО 🔧</p>
      </div>
    <div className="app-container">
      {screen === 'home' && (
        <div className="fade-in">
          <div className="header">
            <h1>Volkswagen Golf</h1>
            <div className="mileage-tag">{mileage} км</div>
          </div>
          <div className="car-container" onClick={() => setScreen('service')}>
            <div className="pixar-frame">
              {/* Сюди ти підставиш фото car_pixar.png */}
              <div className="car-placeholder">PIXAR CAR PHOTO</div>
            </div>
            <p className="hint">Натисни на авто для ТО 🔧</p>
          </div>
          <button className="main-btn bogdan" onClick={() => setScreen('chat')}>
            ЗАПИТАЙ У БОГДАНА
          </button>
          <button className="main-btn stats" onClick={() => setScreen('stats')}>
            ВИТРАТИ 📊
          </button>
        </div>
      )}

      {screen === 'chat' && <Chat onBack={() => setScreen('home')} />}
      
      {screen === 'service' && (
        <div className="page">
          <button onClick={() => setScreen('home')} className="back">←</button>
          <h2>Технічний стан</h2>
          <div className="service-item">
            <p>Мастило: <span>залишилось 4,600 км</span></p>
            <div className="bar"><div className="fill" style={{width: '46%'}}></div></div>
          </div>
          <div className="service-item">
            <p>ГРМ: <span>залишилось 25,000 км</span></p>
            <div className="bar"><div className="fill" style={{width: '80%'}}></div></div>
          </div>
        </div>
      )}

      {screen === 'stats' && (
        <div className="page">
          <button onClick={() => setScreen('home')} className="back">←</button>
          <h2>Твої витрати</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={statsData} dataKey="value" innerRadius={60} outerRadius={80} paddingAngle={5}>
                {statsData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="stats-legend">
            {statsData.map(item => <p key={item.name} style={{color: item.color}}>{item.name}: {item.value} грн</p>)}
          </div>
        </div>
      )}
    </div>
  );
}

function Chat({ onBack }) {
  const [msg, setMsg] = useState("");
  const [history, setHistory] = useState([{ r: "bot", t: "Здоров! Що там твоя тачка? Знову щось стукає чи просто скучив? Канал наш не забувай: @АвтоПідбір_Україна" }]);

  const ask = async () => {
    const userMsg = msg;
    setMsg("");
    setHistory([...history, { r: "user", t: userMsg }]);
    
    const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        systemInstruction: "Ти — Богдан з 'Авто Підбір Україна'. Харизматичний, чесний, використовуєш сленг. Завжди нагадуй про YouTube @АвтоПідбір_Україна." 
    });
    const res = await model.generateContent(userMsg);
    setHistory(prev => [...prev, { r: "bot", t: res.response.text() }]);
  };

  return (
    <div className="chat-screen">
      <button onClick={onBack} className="back">←</button>
      <div className="messages">
        {history.map((h, i) => <div key={i} className={`msg ${h.r}`}>{h.t}</div>)}
      </div>
      <div className="input-row">
        <input value={msg} onChange={e => setMsg(e.target.value)} placeholder="Питай Богдана..." />
        <button onClick={ask}>🚀</button>
      </div>
    </div>
  );
}


export default App;
