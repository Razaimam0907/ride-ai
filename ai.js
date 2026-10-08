// Chalo AI: chat widget. Talks to /api/chat (server.js). Falls back to a simple offline parser if no backend.
const aiBox=document.getElementById('aiBox'),msgs=document.getElementById('aiMsgs'),aiIn=document.getElementById('aiIn');
let history=[];
document.getElementById('aiBtn').onclick=()=>{aiBox.classList.toggle('on');if(!msgs.children.length)say('b','Namaste! 🛺 I\'m Chalo AI. Tell me where you want to go, like "Cruise to Airport at 6am", and I\'ll fill in your trip.')};
document.getElementById('aiX').onclick=()=>aiBox.classList.remove('on');
document.getElementById('aiSend').onclick=send;aiIn.onkeydown=e=>{if(e.key==='Enter')send()};
function say(c,t){const d=document.createElement('div');d.className='m '+c;d.textContent=t;msgs.appendChild(d);msgs.scrollTop=1e9;return d}
function offline(t){ // very basic fallback, no AI
  const m=t.match(/(?:from\s+(.+?)\s+)?to\s+([a-z ]+?)(?:\s+(?:at|by)\s+(\d{1,2})(?::(\d\d))?\s*(am|pm)?)?$/i);
  if(!m)return{reply:'Backend AI is offline. Try: "to Airport at 6pm".'};
  let time='';if(m[3]){let h=+m[3];if(/pm/i.test(m[5]||'')&&h<12)h+=12;if(/am/i.test(m[5]||'')&&h==12)h=0;time=String(h).padStart(2,'0')+':'+(m[4]||'00')}
  return{reply:`Got it! Heading to ${m[2]}. Check the form and press See prices.`,from:m[1]||'',to:m[2],time}}
async function send(){
  const t=aiIn.value.trim();if(!t)return;aiIn.value='';say('u',t);history.push({role:'user',content:t});
  const w=say('b','…');let r;
  try{const res=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:history,context:ctx()})});
    if(!res.ok)throw 0;r=await res.json()}catch{r=offline(t)}
  w.textContent=r.reply||'Sorry, try again.';history.push({role:'assistant',content:r.reply||''});
  const set=(id,v)=>{if(v)document.getElementById(id).value=v};
  set('from',r.from);set('to',r.to);set('time',r.time);set('date',r.date);
  if(r.to&&r.search)document.getElementById('seePrices').click();
}

/* ---- Intelligence: live context, quick chips, AI ride pick ---- */
function ctx(){
  const rides=[...document.querySelectorAll('.ride')].map(e=>({name:e.querySelector('b').textContent,price:e.querySelector('.p').textContent,info:e.querySelector('small').textContent}));
  return{route:(typeof route!=='undefined'&&route)?route:null,rides,selected:(typeof selected!=='undefined'&&selected)?selected.name:null,hour:new Date().getHours()}}
function chips(){const c=document.createElement('div');c.className='qc';
  ['Which ride is best?','Why this fare?','Airport tomorrow 6am'].forEach(q=>{const b=document.createElement('button');b.textContent=q;b.onclick=()=>{c.remove();aiIn.value=q;send()};c.appendChild(b)});
  msgs.appendChild(c)}
document.getElementById('aiBtn').addEventListener('click',()=>setTimeout(()=>{if(msgs.children.length===1)chips()},50));
function markPick(name,why){
  document.querySelectorAll('.ride').forEach(e=>{e.classList.remove('pick');const o=e.querySelector('.badge');o&&o.remove()});
  const el=[...document.querySelectorAll('.ride')].find(e=>e.querySelector('b').textContent===name);if(!el)return;
  el.classList.add('pick');el.querySelector('b').insertAdjacentHTML('afterend','<span class="badge">✨ AI pick</span>');
  let n=document.getElementById('aiNote');if(!n){n=document.createElement('p');n.id='aiNote';document.getElementById('routeInfo').after(n)}n.textContent=why}
document.addEventListener('rides:ready',async()=>{
  const km=route.km;markPick(km<5?'Glide':km<12?'Zip':'Cruise','Quick smart pick based on distance.');
  try{const res=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({messages:[{role:'user',content:'Recommend the best ride for this trip. Set pick to the ride name and explain in one short line.'}],context:ctx()})});
    if(!res.ok)return;const r=await res.json();if(r.pick)markPick(r.pick,'✨ '+(r.reply||''))}catch{}});
