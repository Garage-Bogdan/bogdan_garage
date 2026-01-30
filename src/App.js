import React, { useState } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import './App.css';

// Твій ключ. Якщо знову буде помилка в чаті - створи новий в Google AI Studio
const API_KEY = "AIzaSyDBg5D_HKcbDelARptXccHnheRizhZntvY";
const genAI = new GoogleGenerativeAI(API_KEY);

function App() {
  const [screen, setScreen] = useState('home'); // home, chat, service, stats
  const [mileage] = useState(125400);

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
            <img src="/assets/logo.jpg" alt="Лого" className="app-logo" style={{ width: '180px', marginBottom: '10px' }} />
            <h1>Volkswagen Golf</h1>
            <div className="mileage-tag">{mileage} км</div>
          </div>
          <div className="car-container" onClick={() => setScreen('service')}>
            <div className="pixar-frame">
              <img src="/assets/bogdan_run.jpg" alt="Богдан" style={{ height: '100%', borderRadius: '15px' }} />
            </div>
            <p className="hint">Натисни на Богдана для ТО 🔧</p>
          </div>
          <button className="main-btn bogdan" onClick={() => setScreen('chat')}>Побазарити з Богданом</button>
          <button className="main-btn stats" onClick={() => setScreen('stats')}>Витрати на тачку</button>
        </div>
      )}

      {screen === 'chat' && <Chat onBack={() => setScreen('home')} />}
      
      {screen === 'service' && (
        <div className="page fade-in">
          <button onClick={() => setScreen('home')} className="back">← Назад</button>
          <h2>Сервісна книжка</h2>
          <div className="service-item"><span>Олива двигуна</span><div className="bar"><div className="fill" style={{width:'80%'}}></div></div></div>
          <div className="service-item"><span>Гальма</span><div className="bar"><div className="fill" style={{width:'40%', background: '#e74c3c'}}></div></div></div>
          <p>Богдан каже: "Гальма треба глянути, не жартуй з цим!"</p>
        </div>
      )}

      {screen === 'stats' && (
        <div className="page fade-in">
          <button onClick={() => setScreen('home')} className="back">← Назад</button>
          <h2>Твої витрати</h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={statsData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                {statsData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
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
  const [isTyping, setIsTyping] = useState(false);

  const ask = async () => {
    if (!msg.trim() || isTyping) return;
    const userMsg = msg;
    setMsg("");
    const newHistory = [...history, { r: "user", t: userMsg }];
    setHistory(newHistory);
    setIsTyping(true);
    
    try {
      const model = genAI.getGenerativeModel({ 
          model: "gemini-1.5-flash",
          systemInstruction: "Ти — Богдан з 'Авто Підбір Україна'. Харизматичний, чесний, використовуєш сленг автопідбірника. Завжди нагадуй про YouTube @АвтоПідбір_Україна." 
      });
      const res = await model.generateContent(userMsg);
      setHistory(prev => [...prev, { r: "bot", t: res.response.text() }]);
    } catch (e) {
      setHistory(prev => [...prev, { r: "bot", t: "Братан, зв'язок пропав. Спробуй ще раз!" }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="chat-screen">
      <div className="chat-header">
        <button onClick={onBack} className="back">←</button>
        <span>Чат з Богданом</span>
      </div>
      <div className="chat-box">
        {history.map((m, i) => (
          <div key={i} className={`msg ${m.r}`}>
            {m.t}
          </div>
        ))}
        {isTyping && <div className="msg bot">Богдан друкує...</div>}
      </div>
      <div className="input-area">
        <input 
          value={msg} 
          onChange={(e) => setMsg(e.target.value)} 
          placeholder="Питай..." 
          onKeyPress={(e) => e.key === 'Enter' && ask()} 
        />
        <button onClick={ask} disabled={isTyping}>🚀</button>
      </div>
    </div>
  );
}

export default App;
