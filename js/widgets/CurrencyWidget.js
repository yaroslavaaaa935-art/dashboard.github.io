import UIComponent from '../UIComponent.js';
import { fetchRates } from '../api.js';

export default class CurrencyWidget extends UIComponent {
  constructor(cfg = {}) { 
    super({ id: cfg.id, title: 'Курсы валют' }); 
    this.base = 'RUB'; 
    this.symbols = cfg.symbols || ['USD', 'EUR']; 
    this.rates = null;
    this._list = null;
  }

  render() {
    super.render();
    
    // Очищаем состояние загрузки
    this._setLoading(false);
    
    this._body.innerHTML = `
      <div class="rates-list">
        ${this._getRatesHTML()}
      </div>
      <div style="margin-top:.6rem">
        <button class="refresh-rates">Обновить</button>
      </div>`;
    
    this._list = this._body.querySelector('.rates-list');
    this.on(this._body.querySelector('.refresh-rates'), 'click', () => this.refresh());
    
    return this.el;
  }

  _getRatesHTML() {
    if (!this.rates) {
      return '—';
    }
    
    return Object.entries(this.rates)
      .map(([k, v]) => `
        <div class="currency-row">
          <div>${k}/${this.base}</div>
          <div>${v.toFixed(2)}</div>
        </div>`)
      .join('');
  }

  async refresh() {
    this._setLoading(false);
    try {
      const rates = await fetchRates();
      if (!rates) throw new Error("NO_RATES");
      
      this.rates = rates;
      if (this._list) {
        this._list.innerHTML = this._getRatesHTML();
      }
      this._setLoading(false);
    } catch (e) {
      console.error("Currency error:", e);
      this._body.innerHTML = `
        <div class="error">
          Ошибка загрузки курсов. 
          <button class="retry">Повторить</button>
        </div>`;
      const btn = this._body.querySelector('.retry');
      if (btn) this.on(btn, 'click', () => this.refresh());
    }
  }

    _setLoading(isLoading){
    if(!this.el) return;
    if(isLoading){
      this._body.innerHTML = `<div class="loading">Загрузка...</div>`;
    } else {

    }
  }

  serialize() { 
    return { 
      symbols: this.symbols, 
      rates: this.rates 
    }; 
  }
  
  restore(state) { 
    this.symbols = state.symbols || this.symbols; 
    this.rates = state.rates || null;
    

    if (this._list && this.rates) {
      this._list.innerHTML = this._getRatesHTML();
    }
  }
}