import UIComponent from '../UIComponent.js';

export default class NotesWidget extends UIComponent{
  constructor(cfg={}){ super({id:cfg.id,title:'Заметки'}); this.notes = cfg.notes || []; }

  render(){
    super.render();
    this._body.innerHTML = `<div style="display:flex;gap:.5rem;margin-bottom:.5rem"><input class="note-input" placeholder="Новая заметка"><button class="add-note">Добавить</button></div><div class="notes-list"></div>`;
    this._list = this._body.querySelector('.notes-list');
    this.on(this._body.querySelector('.add-note'),'click', ()=>this._add());
    this._render();
    return this.el;
  }

  _add(){ const v=this._body.querySelector('.note-input').value.trim(); if(!v) return; this.notes.unshift({text:v}); this._body.querySelector('.note-input').value=''; this._render();this._emitSave(); }
  _render(){ this._list.innerHTML = this.notes.map((n,i)=>`<div class="note"><div>${escapeHtml(n.text)}</div><div style="text-align:right;margin-top:.4rem"><button data-del="${i}">Удалить</button></div></div>`).join(''); this._list.querySelectorAll('[data-del]').forEach(btn=> this.on(btn,'click', ()=>{ const i=+btn.dataset.del; this.notes.splice(i,1); this._render(); })); }

  serialize(){ return {notes:this.notes}; }
  restore(s){ this.notes = s.notes || []; }
}

function escapeHtml(s){ return s.replace(/[&<>"']/g, (c)=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c])); }
