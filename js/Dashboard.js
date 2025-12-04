export default class Dashboard {
  constructor(rootSelector){
    this.container = document.querySelector(rootSelector);
    this.widgets = [];
    this.availableTypes = {};
    this._initDragDrop();
    this._loadFromStorage();
  }

  registerType(name, cls){
    this.availableTypes[name] = cls;
  }


addWidget(typeName, config={}){
  const Cls = this.availableTypes[typeName];
  if(!Cls) throw new Error('Unknown widget type '+typeName);
  const instance = new Cls(config);
  const el = instance.render();
  this.container.appendChild(el);

  el.addEventListener('widget:remove', ()=>{
    this.removeWidget(instance.id);
  });


  el.addEventListener('widget:save', ()=>{
    this._saveToStorage();
  });

  this.widgets.push({id: instance.id, type: typeName, instance});

  this._saveToStorage();
  if(typeof instance.refresh === 'function') instance.refresh();
  return instance.id;
}

  removeWidget(id){
    const idx = this.widgets.findIndex(w=>w.id===id);
    if(idx===-1) return;
    const {instance} = this.widgets[idx];
    instance.destroy();
    this.widgets.splice(idx,1);
    this._saveToStorage();
  }

  _initDragDrop(){
    const container = this.container;
    container.addEventListener('dragover', (e)=>{
      e.preventDefault();
      const after = this._getDragAfterElement(container, e.clientY);
      const dragging = container.querySelector('.dragging');
      if(!dragging) return;
      if(after == null) container.appendChild(dragging);
      else container.insertBefore(dragging, after);
    });
    container.addEventListener('drop', ()=>{
      this._reorderFromDOM();
      this._saveToStorage();
    });
  }

  _getDragAfterElement(container, y){
    const draggableElements = [...container.querySelectorAll('.widget-card:not(.dragging)')];
    return draggableElements.reduce((closest, child)=>{
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height/2;
      if(offset<0 && offset>closest.offset){
        return {offset, element: child};
      } else return closest;
    }, {offset: Number.NEGATIVE_INFINITY}).element;
  }

  _reorderFromDOM(){
    const ids = [...this.container.children].map(ch=>ch.dataset.widgetId);
    this.widgets.sort((a,b)=> ids.indexOf(a.id) - ids.indexOf(b.id));
  }

  _saveToStorage(){
    const state = this.widgets.map(w=>({id:w.id,type:w.type,instanceState: w.instance.serialize ? w.instance.serialize() : null}));
    localStorage.setItem('dashboard_v1', JSON.stringify(state));
  }

  _loadFromStorage(){
  const raw = localStorage.getItem('dashboard_v1');
  if(!raw) return;
  try{
    const state = JSON.parse(raw);
    
    this.container.innerHTML = '';
    this.widgets = [];
    
    state.forEach(s=>{
      const Cls = this.availableTypes[s.type];
      if(!Cls) return;
      
      const instance = new Cls({id:s.id});
      if(s.instanceState && instance.restore) {
        instance.restore(s.instanceState);
      }
      
      const el = instance.render();
      this.container.appendChild(el);
      el.addEventListener('widget:remove', ()=>this.removeWidget(instance.id));
      this.widgets.push({id: instance.id, type: s.type, instance});
      
      if(typeof instance.refresh==='function') {
        const shouldRefresh = 
          (s.type === 'Weather' && !s.instanceState?.last) ||
          (s.type === 'Currency' && !s.instanceState?.rates) ||
          (s.type === 'Quote' && !s.instanceState?.current);
        
        if (shouldRefresh) {
          instance.refresh();
        }
      }
    });
  }catch(e){console.error('Load failed',e)}
}

  exportConfig(){
    return JSON.stringify(this.widgets.map(w=>({id:w.id,type:w.type,state: w.instance.serialize ? w.instance.serialize() : null})), null, 2);
  }

  importConfig(json){
    try{
      const arr = JSON.parse(json);
      this.widgets.slice().forEach(w=>this.removeWidget(w.id));
      arr.forEach(s=>{
        const Cls = this.availableTypes[s.type];
        if(!Cls) return;
        const instance = new Cls({id:s.id});
        if(s.state && instance.restore) instance.restore(s.state);
        const el = instance.render();
        this.container.appendChild(el);
        el.addEventListener('widget:remove', ()=>this.removeWidget(instance.id));
        this.widgets.push({id: instance.id, type: s.type, instance});
        if(typeof instance.refresh==='function') instance.refresh();
      });
      this._saveToStorage();
    }catch(e){throw e}
  }
}