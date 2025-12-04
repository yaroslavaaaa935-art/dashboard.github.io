import UIComponent from '../UIComponent.js';

export default class ToDoWidget extends UIComponent{
  constructor(cfg={}){ super({id:cfg.id,title:'Список дел'}); this.items = cfg.items || []; }

  render(){
    super.render();
    this._body.innerHTML = `
      <div>
        <div style="display:flex;gap:.5rem;margin-bottom:.5rem"><input class="todo-input" placeholder="Новая задача"><button class="add-todo">Добавить</button></div>
        <div class="todo-list"></div>
      </div>`;
    this._list = this._body.querySelector('.todo-list');
    this._input = this._body.querySelector('.todo-input');
    this.on(this._body.querySelector('.add-todo'),'click', ()=>this._add());
    this._renderList();
    return this.el;
  }

  _renderList(){
    this._list.innerHTML = this.items.map((it, idx)=>`<label class="todo-item"><input data-idx="${idx}" type="checkbox" ${it.done? 'checked': ''}> <span>${escapeHtml(it.text)}</span> <button data-del="${idx}">✖</button></label>`).join('');
    // attach handlers
    this._list.querySelectorAll('[data-del]').forEach(btn=> this.on(btn,'click', (e)=>{ const i = +btn.dataset.del; this.items.splice(i,1); this._renderList(); this._save(); }));
    this._list.querySelectorAll('input[type="checkbox"]').forEach(cb=> this.on(cb,'change', (e)=>{ const i=+cb.dataset.idx; this.items[i].done = cb.checked; this._save(); }));
  }

  _add(){
    const val = this._input.value.trim(); if(!val) return; this.items.unshift({text:val, done:false}); this._input.value=''; this._renderList(); this._save();
  }

  _save(){
  if(this.el) this.el.dispatchEvent(new CustomEvent('widget:save', {bubbles:true}));
}


  serialize(){ return {items:this.items}; }
  restore(state){ this.items = state.items || []; }
}

function escapeHtml(s){ return s.replace(/[&<>"']/g, (c)=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c])); }
