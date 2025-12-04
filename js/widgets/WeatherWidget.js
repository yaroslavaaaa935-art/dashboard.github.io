import UIComponent from '../UIComponent.js';
import { fetchWeatherByCity } from '../api.js';

export default class WeatherWidget extends UIComponent{
  constructor(cfg={}){ super({id:cfg.id,title:'Погода'}); this.city = cfg.city || 'Moscow'; this.last = null; }

  render(){
    super.render();
    this._body.innerHTML = `<div class="weather-main">—</div>
      <div style="margin-top:.6rem" class="widget-settings">
        <input class="city-input" placeholder="Город" value="${this.city}"> <button class="set-city">OK</button>
      </div>`;
    this._main = this._body.querySelector('.weather-main');
    this.on(this._body.querySelector('.set-city'),'click', ()=>{ this.city = this._body.querySelector('.city-input').value || this.city; this.refresh(); });
    return this.el;
  }

  async refresh(){
    this._setLoading(false);
    try{
      const data = await fetchWeatherByCity(this.city);
      const t = Math.round(data.main.temp);
      const desc = data.weather[0].description;
      const icon = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
      this._main.innerHTML = `<div style="display:flex;align-items:center;gap:.5rem"><img src="${icon}" alt="${desc}" width="48" height="48"><div><div><strong>${t}°C</strong></div><div class="small">${desc}</div></div></div>`;
      this._setLoading(false);
      this.last = data;
    }catch(e){
      if(e.message==='NO_WEATHER_KEY') this._body.innerHTML = `<div class="error">API ключ OpenWeatherMap не задан. Добавьте ключ в js/config.js</div>`;
      else this._body.innerHTML = `<div class="error">Ошибка загрузки погоды. <button class="retry">Повторить</button></div>`;
      const btn = this._body.querySelector('.retry'); if(btn) this.on(btn,'click', ()=>this.refresh());
    }
  }

  _setLoading(isLoading){
    if(!this.el) return;
    if(isLoading){
      this._body.innerHTML = `<div class="loading">Загрузка...</div>`;
    } else {
    }
  }

  serialize(){ return {city:this.city, last:this.last}; }
  restore(state){ this.city = state.city || this.city; this.last = state.last || null; }
}