import Dashboard from './Dashboard.js';
import QuoteWidget from './widgets/QuoteWidget.js';
import WeatherWidget from './widgets/WeatherWidget.js';
import CurrencyWidget from './widgets/CurrencyWidget.js';
import ToDoWidget from './widgets/ToDoWidget.js';
import TimerWidget from './widgets/TimerWidget.js';
import NotesWidget from './widgets/NotesWidget.js';

const dashboard = new Dashboard('#dashboard');

dashboard.registerType('Quote', QuoteWidget);
dashboard.registerType('Weather', WeatherWidget);
dashboard.registerType('Currency', CurrencyWidget);
dashboard.registerType('ToDo', ToDoWidget);
dashboard.registerType('Timer', TimerWidget);
dashboard.registerType('Notes', NotesWidget);

const addBtn = document.getElementById('add-widget-btn');
const widgetList = document.getElementById('widget-list');
addBtn.addEventListener('click', ()=> widgetList.style.display = widgetList.style.display==='flex'? 'none':'flex');
widgetList.querySelectorAll('button').forEach(b=> b.addEventListener('click', ()=>{ const type = b.dataset.widget; dashboard.addWidget(type); widgetList.style.display='none'; }));


const exportBtn = document.getElementById('export-config');
exportBtn.addEventListener('click', ()=>{
  const data = dashboard.exportConfig();
  const blob = new Blob([data], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href=url; a.download = 'dashboard-config.json'; a.click(); URL.revokeObjectURL(url);
});

const importBtn = document.getElementById('import-config');
const importFile = document.getElementById('import-file');
importBtn.addEventListener('click', ()=> importFile.click());
importFile.addEventListener('change', async (e)=>{
  const f = e.target.files[0]; if(!f) return; const txt = await f.text(); try{ dashboard.importConfig(txt); alert('Импорт выполнен'); }catch(e){ alert('Ошибка импорта: '+e.message)}
});


if('Notification' in window && Notification.permission === 'default') Notification.requestPermission();


window._dashboard = dashboard;

console.log('Dashboard initialized');
setTimeout(() => {
  console.log('Current widgets:', dashboard.widgets);
  dashboard.widgets.forEach(w => {
    console.log(`Widget ${w.id} (${w.type}):`, {
      city: w.instance.city,
      last: w.instance.last,
      rates: w.instance.rates,
      current: w.instance.current
    });
  });
}, 1000);
