import { CONFIG } from './config.js';

export async function fetchWeatherByCity(city) {
  if (!CONFIG.OPENWEATHERMAP_KEY) throw new Error('NO_WEATHER_KEY');
  
  const apiUrl = `https://api.openweathermap.org/data/2.5/weather?units=metric&q=${encodeURIComponent(city)}&appid=${CONFIG.OPENWEATHERMAP_KEY}`;
  
  const response = await fetch(apiUrl);
  
  if (response.status === 404) {
    throw new Error('CITY_NOT_FOUND');
  }
  
  if (!response.ok) {
    throw new Error('WEATHER_FETCH_FAILED');
  }
  
  return response.json();
}

// Остальные функции остаются без изменений
export async function fetchRates() {
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/USD");
    const data = await res.json();
    return { RUB: data.rates.RUB, EUR: data.rates.EUR };
  } catch (error) {
    console.error("Ошибка загрузки курсов:", error);
    return null;
  }
}

export async function fetchRandomQuote() {
  const apis = [
    
    {
      url: "https://dummyjson.com/quotes/random",
      parser: data => ({
        content: data.quote,
        author: data.author
      })
    }
  ];

  for (const api of apis) {
    try {
      const res = await fetch(api.url);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const data = await res.json();
      const quoteObj = api.parser(data);
      if (quoteObj.content) {
        return quoteObj;
      }
    } catch (error) {
      console.warn(`API ${api.url} не доступен:`, error);
    }
  }

  // fallback
  return {
    content: "Не удалось загрузить цитату",
    author: "Система"
  };
}

