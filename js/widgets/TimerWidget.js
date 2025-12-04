import UIComponent from '../UIComponent.js';

export default class TimerWidget extends UIComponent{
  constructor(cfg={}){ super({id:cfg.id,title:'Таймер'}); this.work = cfg.work || 25; this.break = cfg.break || 5; this._timerId = null; this._remaining = this.work*60; this._running=false; }

  render(){
    super.render();
    this._body.innerHTML = `<div class="timer-display">${formatTime(this._remaining)}</div>
      <div class="timer-controls" style="margin-top:.5rem">
        <button class="start">Старт</button>
        <button class="pause">Пауза</button>
        <button class="reset">Сброс</button>
      </div>
      <div style="margin-top:.5rem" class="widget-settings">Работа: <input class="work-min" value="${this.work}" size="2"> Перерыв: <input class="break-min" value="${this.break}" size="2"></div>`;
    this._display = this._body.querySelector('.timer-display');
    this.on(this._body.querySelector('.start'),'click', ()=>this.start());
    this.on(this._body.querySelector('.pause'),'click', ()=>this.pause());
    this.on(this._body.querySelector('.reset'),'click', ()=>this.reset());
    ['.work-min', '.break-min'].forEach(sel => {
  this.on(this._body.querySelector(sel), 'change', () => {
    this.work = +this._body.querySelector('.work-min').value || this.work;
    this.break = +this._body.querySelector('.break-min').value || this.break;
    this.reset();
  });
});
;
    return this.el;
  }

  start(){ if(this._running) return; this._running=true; this._tick(); }
  pause(){ this._running=false; if(this._timerId) clearTimeout(this._timerId); }
  reset(){ this.pause(); this._remaining = this.work*60; this._updateDisplay(); }

  _tick(){
    if(!this._running) return;
    if(this._remaining<=0){ this._running=false; this._notify(); return; }
    this._remaining--; this._updateDisplay();
    this._timerId = setTimeout(()=>this._tick(),1000);
  }

  _updateDisplay(){ this._display.textContent = formatTime(this._remaining); }
  _notify(){
    if(Notification && Notification.permission === 'granted') new Notification('Таймер', {body: 'Время истекло!'});
    else alert('Таймер: время истекло!');
  }

  serialize(){ return {work:this.work,break:this.break,remaining:this._remaining,running:this._running}; }
  restore(s){ this.work=s.work||this.work; this.break=s.break||this.break; this._remaining = s.remaining!=null? s.remaining: this.work*60; this._running = false; }
}

function formatTime(sec){ const m = Math.floor(sec/60).toString().padStart(2,'0'); const s = Math.floor(sec%60).toString().padStart(2,'0'); return `${m}:${s}`; }
