import UIComponent from '../UIComponent.js';
import { fetchRandomQuote } from '../api.js';

export default class QuoteWidget extends UIComponent {
  constructor(cfg = {}) { 
    super({ id: cfg.id, title: 'Цитата' }); 
    this.current = null;
    this._quoteEl = null;
  }

  render() {
    super.render();
    
    this._setLoading(false);
    
    this._body.innerHTML = `
      <div class="quote-text">
        ${this._getQuoteHTML()}
      </div>
      <div style="margin-top:.6rem">
        <button class="next-quote">Следующая</button>
      </div>`;
    
    this._quoteEl = this._body.querySelector('.quote-text');
    this.on(this._body.querySelector('.next-quote'), 'click', () => this.refresh());
    
    return this.el;
  }

  _getQuoteHTML() {
    if (!this.current) {
      return '—';
    }
    
    if (this.current.content && this.current.author) {
      return `"${this.current.content}" — ${this.current.author}`;
    } else if (typeof this.current === 'string') {
      return this.current;
    }
    
    return '—';
  }

  async refresh() {
    this._setLoading(false);
    try {
      const data = await fetchRandomQuote();
      this.current = data;
      if (this._quoteEl) {
        this._quoteEl.textContent = this._getQuoteHTML();
      }
      this._setLoading(false);
    } catch (e) {
      console.error("Quote error:", e);
      this._body.innerHTML = `
        <div class="error">
          Ошибка загрузки цитаты. 
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
      current: this.current 
    }; 
  }
  
  restore(state) { 
    this.current = state.current || null;
    
    if (this._quoteEl && this.current) {
      this._quoteEl.textContent = this._getQuoteHTML();
    }
  }
}