export default class UIComponent {
  constructor({ id=null, title='Widget' } = {}){
    this.id = id || `w_${Date.now()}_${Math.floor(Math.random()*1000)}`;
    this.title = title;
    this.el = null; // DOM root
    this._listeners = [];
  }

  render(){
    const card = document.createElement('section');
    card.className = 'widget-card';
    card.dataset.widgetId = this.id;

    const header = document.createElement('div'); header.className = 'widget-header';
    const title = document.createElement('div'); title.className = 'widget-title'; title.textContent = this.title;
    const actions = document.createElement('div'); actions.className = 'widget-actions';

    // Refresh
    const btnRefresh = document.createElement('button'); btnRefresh.className='icon-btn'; btnRefresh.title='Обновить'; btnRefresh.innerText='⟳';
    btnRefresh.addEventListener('click', ()=>this.refresh());
    
    // Delete
    const btnDelete = document.createElement('button'); btnDelete.className='icon-btn'; btnDelete.title='Удалить'; btnDelete.innerText='✖';
    btnDelete.addEventListener('click', ()=>this._requestRemove());

    actions.append(btnRefresh, btnDelete);
    header.append(title, actions);

    // body container
    const body = document.createElement('div'); body.className='widget-body';
    // footer
    const footer = document.createElement('div'); footer.className='widget-footer';
    const idSpan = document.createElement('span'); idSpan.className='small'; idSpan.textContent = this.id;

    card.append(header, body, footer);
    this.el = card;
    this._body = body;
    this._headerTitle = title;
    this._setLoading(false);

    card.draggable = true;
    card.addEventListener('dragstart', (e)=>{
      e.dataTransfer.setData('text/plain', this.id);
      card.classList.add('dragging');
    });
    card.addEventListener('dragend', ()=>card.classList.remove('dragging'));

    return card;
  }

  _setLoading(isLoading){
    if(!this.el) return;
    if(isLoading){
      this._body.innerHTML = `<div class="loading">Загрузка...</div>`;
    } else {
    }
  }

  async refresh(){
    return;
  }

  openSettings(){

    alert('Настройки не реализованы для этого виджета.');
  }

  _requestRemove(){
    const event = new CustomEvent('widget:remove', {detail:{id:this.id}, bubbles:true});
    this.el.dispatchEvent(event);
  }

  destroy(){
    if(this.el && this.el.parentNode) this.el.parentNode.removeChild(this.el);
    this._listeners.forEach(({el, type, fn}) => el.removeEventListener(type, fn));
    this._listeners = [];
  }

  on(el, type, fn){
    el.addEventListener(type, fn);
    this._listeners.push({el,type,fn});
  }
}
