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

  const carImageUrl = `https://source.unsplash.com/800x600/?car,${userCar.brand},${userCar.model}`;

  if (!isRegistered) {
    return (
      <div className="app-container registration-page">
        <div className="registration-card fade-in">
          <div className="reg-header">
            <img src="/assets/logo.jpg" alt="Лого" className="logo-small" />
            <h2>Гараж Богдана</h2>
          </div>
          <div className="input-grid">
            <input placeholder="Марка" value={userCar.brand} onChange={(e)=>setUserCar({...userCar, brand:e.target.value})}/>
            <input placeholder="Модель" value={userCar.model} onChange={(e)=>setUserCar({...userCar, model:e.target.value})}/>
            <input placeholder="Рік" type="number" value={userCar.year} onChange={(e)=>setUserCar({...userCar, year:e.target.value})}/>
            <input placeholder="Двигун" value={userCar.engine} onChange={(e)=>setUserCar({...userCar, engine:e.target.value})}/>
            <input placeholder="VIN" value={userCar.vin} onChange={(e)=>setUserCar({...userCar, vin:e.target.value})}/>
            <input placeholder="Пробіг" type="number" value={userCar.mileage} onChange={(e)=>setUserCar({...userCar, mileage:e.target.value})}/>
          </div>
          <button className="main-btn bogdan" onClick={handleRegister}>Заїхати в бокс 🏎️</button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {screen === 'home' && (
        <div className="fade-in">
          {/* НОВА ШАПКА: Лого зліва, Богдан справа */}
          <div className="top-nav">
            <img src="/assets/logo.jpg" alt="Лого" className="nav-logo" />
            <div className="nav-profile">
               <span className="expert-name">Експерт Богдан</span>
               <img src="/assets/bogdan_run.jpg" alt="Богдан" className="nav-avatar" />
            </div>
          </div>

          <div className="header-info">
            <h1>{userCar.brand} {userCar.model}</h1>
            <p>{userCar.year} рік | {userCar.engine} | {userCar.vin}</p>
            <div className="mileage-tag">{userCar.mileage} км</div>
          </div>
          
          <div className="car-container" onClick={() => setScreen('service')}>
            <div className="pixar-frame">
              <img src={carImageUrl} alt="Car" className="car-img" />
            </div>
            <p className="hint">Твоя тачка в стилі Pixar 🎨</p>
          </div>

          <button className="main-btn bogdan" onClick={() => setScreen('chat')}>Побазарити з Богданом</button>
          <button className="main-btn stats" onClick={() => setScreen('stats')}>Витрати</button>
          <button className="reset-link" onClick={() => {localStorage.clear(); window.location.reload();}}>Змінити авто</button>
        </div>
      )}

      {screen === 'chat' && <Chat onBack={() => setScreen('home')} car={userCar} />}
      {/* ... блоки service та stats ... */}
    </div>
  );
}

function Chat({ onBack, car }) {
  const [msg, setMsg] = useState("");
  const [history, setHistory] = useState([{ r: "bot", t: `Здоров! Бачу твій ${car.brand} на зв'язку. Що подивимось?` }]);
  // ... логіка чату з попереднього коду ...
  return (
    <div className="chat-screen">
      <div className="chat-header">
        <button onClick={onBack} className
