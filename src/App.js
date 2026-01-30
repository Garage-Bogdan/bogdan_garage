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
      setHistory([{ r: "bot", t: `Здоров! Бачу твій ${carData.brand} ${carData.model} на базі. Що підказати?` }]);
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
    const userText = msg;
    setMsg("");
    const newHistory = [...history, { r: "user", t: userText }];
    setHistory(newHistory);
    setIsTyping(true);

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `Ти Богдан з 'Авто Підбір Україна'. Клієнт має ${userCar.brand} ${userCar.model}. Відповідай коротко, харизматично, з авто-сленгом. Питання: ${userText}`;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      setHistory([...newHistory, { r: "bot", t: response.text() }]);
    } catch (e) {
      setHistory([...newHistory, { r: "bot", t: "Братан, щось з інтернетом або ключем! Перевір Vercel Settings." }]);
    } finally {
      setIsTyping(false);
    }
  };

  if (!isRegistered) {
    return (
      <div className="app-container registration-page">
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
          <button className="main-btn bogdan" onClick={handleRegister}>
