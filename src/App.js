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

  useEffect(() => {
    const saved = localStorage.getItem('bogdan_car');
    if (saved) {
      setUserCar(JSON.parse(saved));
      setIsRegistered(true);
    }
  }, []);

  const handleRegister = () => {
    if (Object.values(userCar).every(val => val !== "")) {
      localStorage.setItem('bogdan_car', JSON.stringify(userCar));
      setIsRegistered(true);
    }
  };

  // Посилання на динамічне фото авто в стилі Pixar
  const carImageUrl = `https://img.freepik.com/free-photo/view-3d-car-with-cartoon-style_23-2150797354.jpg?t=st=car,${userCar.brand},${userCar.model}`;

  if (!isRegistered) {
    return (
      <div className="app-container registration-page fade-in">
        <div className="registration-card">
          <div className="reg-header">
            <img src="/assets/logo.jpg" alt="Лого" className="logo-small-reg" />
            <h2>Реєстрація авто</h2>
          </div>
          <p className="reg-subtitle">Введи дані для Богдана:</p>
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
          {/* ШАПКА: Лого зліва (-50%), Богдан справа */}
          <div className="top-nav">
            <img src="/assets/logo.jpg" alt="Лого" className="nav-logo" />
            <div className="nav-profile">
               <span className="expert-name">Експерт Богдан</span>
               <img src="/assets/bogdan_run.jpg" alt="Богдан" className="nav-avatar" />
            </div>
          </div>

          <div className="header-info">
            <h1>{userCar.brand} {userCar.model}</h1>
            <p className="car-subtext">{userCar.year} р. | {userCar.engine} л. | VIN: {userCar.vin}</p>
            <div className="mileage-tag">{userCar.mileage} км</div>
          </div>
          
          <div className="car-container" onClick={() => setScreen('service')}>
            <div className="pixar-frame">
              <img src={carImageUrl} alt="Car Pixar" className="car-pixar-img" />
              <div className="vin-label">VIN verified</div>
            </div>
            <p className="hint">Твоя машина в стилі Pixar 🎨</p>
          </div>

          <div className="actions">
            <button className="main-btn bogdan" onClick={() => setScreen('chat')}>Побазарити з Богданом</button>
            <button className="main-btn stats" onClick={() => setScreen('stats')}>Витрати</button>
          </div>
          
          <button className="reset-link" onClick={() => {localStorage.clear(); window.location.reload();}}>Змінити автомобіль</button>
        </div>
      )}

      {screen === 'chat' && <Chat onBack={() => setScreen('home')} car={userCar} />}
      
      {screen === 'service' && (
        <div className="page fade-in">
          <button onClick={() => setScreen('home')} className="back">← Назад</button>
          <h2>Діагностика {userCar.model}</h2>
          <div className="service-item"><span>Олива</span><div className="bar"><div className="fill" style={{width:'85%'}}></div></div></div>
          <div className="service-item"><span>Гальма</span><div className="bar"><div className="fill" style={{width:'30%', background: '#e74c3c'}}></div></div></div>
          <p className="bot-note">Богдан: "Гальма на такому моторі — це перше діло!"</p>
        </div>
      )}

      {screen === 'stats' && (
        <div className="page fade-in">
          <button onClick={() => setScreen('home')} className="back">← Назад</button>
          <h2>Журнал витрат</h2>
          <div className="chart-placeholder">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={[{v:4000},{v:2000},{v:1000}]} innerRadius={60} outerRadius={80} dataKey="v">
                  <Cell fill="#f1c40f"/><Cell fill="#2980b9"/><Cell fill="#95a5a6"/>
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <p style={{textAlign:'center'}}>Статистика по вашому {userCar.brand}</p>
        </div>
      )}
    </div>
  );
}

function Chat({ onBack, car }) {
  const [msg, setMsg] = useState("");
  const [history, setHistory] = useState([{ r: "bot", t: `Здоров! Бачу твій ${car.brand} ${car.model} вже в боксі. Що по ньому підказати?` }]);
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
          systemInstruction: `Ти — Богдан з 'Авто Підбір Україна'. Користувач має ${car.brand} ${car.model} ${car.year} року. Спілкуйся професійно, але з гумором. Нагадуй про YouTube канал.` 
      });
      const res = await model.generateContent(userMsg);
      setHistory([...newHistory, { r: "bot", t: res.response.text() }]);
    } catch (e) {
      setHistory([...newHistory, { r: "bot", t: "Братан, щось з інтернетом... Спробуй ще раз!" }]);
    } finally { setIsTyping(false); }
  };

  return (
    <div className="chat-screen">
      <div className="chat-header">
        <button onClick={onBack} className="back">←</button>
        <img src="/assets/bogdan_run.jpg" className="chat-avatar" alt="B" />
        <span>Чат з Богданом</span>
      </div>
      <div className="chat-box">
        {history.map((m, i) => <div key={i} className={`msg-bubble ${m.r}`}>{m.t}</div>)}
        {isTyping && <div className="msg-bubble bot italic">Богдан друкує...</div>}
      </div>
      <div className="input-area">
        <input value={msg} onChange={(e) => setMsg(e.target.value)} onKeyPress={(e)=>e.key==='Enter'&&ask()} placeholder="Спитай про тачку..." />
        <button onClick={ask}>🚀</button>
      </div>
    </div>
  );
}

export default App;
