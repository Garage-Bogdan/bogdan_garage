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
    brand: "", 
    model: "", 
    year: "", 
    engine: "", 
    vin: "", 
    mileage: "" 
  });

  useEffect(() => {
    const saved = localStorage.getItem('bogdan_car');
    if (saved) {
      setUserCar(JSON.parse(saved));
      setIsRegistered(true);
    }
  }, []);

  const handleRegister = () => {
    const { brand, model, year, engine, vin, mileage } = userCar;
    if (brand && model && year && engine && vin && mileage) {
      localStorage.setItem('bogdan_car', JSON.stringify(userCar));
      setIsRegistered(true);
    }
  };

  // Формуємо посилання на картинку авто (використовуємо сервіс Unsplash для авто в стилі Pixar/Creative)
  const carImageUrl = `https://source.unsplash.com/800x600/?car,${userCar.brand},${userCar.model},3d`;

  if (!isRegistered) {
    return (
      <div className="app-container registration-page fade-in">
        <div className="page registration-form">
          <img src="/assets/logo.jpg" alt="Лого" className="reg-logo" />
          <h2>Реєстрація авто</h2>
          
          <div className="input-grid">
            <input placeholder="Марка (напр. BMW)" value={userCar.brand} onChange={(e) => setUserCar({...userCar, brand: e.target.value})} />
            <input placeholder="Модель (напр. X5)" value={userCar.model} onChange={(e) => setUserCar({...userCar, model: e.target.value})} />
            <input placeholder="Рік випуску" type="number" value={userCar.year} onChange={(e) => setUserCar({...userCar, year: e.target.value})} />
            <input placeholder="Об'єм двигуна" value={userCar.engine} onChange={(e) => setUserCar({...userCar, engine: e.target.value})} />
            <input placeholder="VIN номер" value={userCar.vin} onChange={(e) => setUserCar({...userCar, vin: e.target.value})} />
            <input placeholder="Пробіг (км)" type="number" value={userCar.mileage} onChange={(e) => setUserCar({...userCar, mileage: e.target.value})} />
          </div>

          <button className="main-btn bogdan" onClick={handleRegister}>
            Зберегти в Гараж 🏎️
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {screen === 'home' && (
        <div className="fade-in">
          <div className="header">
            <img src="/assets/logo.jpg" alt="Лого" className="app-logo" />
            <h1>{userCar.brand} {userCar.model} ({userCar.year})</h1>
            <div className="mileage-tag">{userCar.mileage} км</div>
          </div>
          
          <div className="car-container" onClick={() => setScreen('service')}>
            <div className="pixar-frame">
              {/* Тепер тут картинка авто, а не Богдан */}
              <img src={carImageUrl} alt="Твоє авто" className="car-pixar-img" />
              <div className="vin-overlay">{userCar.vin}</div>
            </div>
            <p className="hint">Натисни на авто для діагностики 🔧</p>
          </div>

          <button className="main-btn bogdan" onClick={() => setScreen('chat')}>Спитати пораду у Богдана</button>
          <button className="main-btn stats" onClick={() => setScreen('stats')}>Витрати</button>
          
          <button className="reset-btn" onClick={() => {localStorage.clear(); window.location.reload();}}>
            Видалити авто
          </button>
        </div>
      )}

      {screen === 'chat' && <Chat onBack={() => setScreen('home')} car={userCar} />}
      {/* ... блоки service та stats залишаються такими ж ... */}
    </div>
  );
}

// Додамо передачу даних про авто в чат, щоб Богдан знав про двигун і VIN
function Chat({ onBack, car }) {
  const [msg, setMsg] = useState("");
  const [history, setHistory] = useState([{ r: "bot", t: `Здоров! Бачу у тебе ${car.brand} ${car.model} на ${car.engine} літра. Солідна апаратура! Що підказати?` }]);
  // ... решта логіки чату (ask) без змін ...
}

export default App;
