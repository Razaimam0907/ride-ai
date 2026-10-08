const $=id=>document.getElementById(id);
const RIDES=[{n:'Glide',e:'🚲',m:'Bike taxi · 1 seat',base:20,km:7,eta:3},{n:'Zip',e:'🛺',m:'Auto · 3 seats',base:30,km:11,eta:4},
{n:'Cruise',e:'🚗',m:'Hatchback · 4 seats',base:50,km:15,eta:5},{n:'Sky Premier',e:'🚙',m:'Sedan · extra comfy',base:80,km:22,eta:7},{n:'Squad XL',e:'🚐',m:'SUV · 6 seats',base:100,km:28,eta:8}];
let selected=null,route=null;
const toast=t=>{const e=$('toast');e.textContent=t;e.classList.add('on');setTimeout(()=>e.classList.remove('on'),2600)};
const modal=h=>{$('mBody').innerHTML=h;$('modal').classList.add('on')};
$('closeM').onclick=()=>$('modal').classList.remove('on');
$('modal').onclick=e=>{if(e.target.id==='modal')$('modal').classList.remove('on')};
$('burger').onclick=()=>$('menu').classList.toggle('open');
$('menu').onclick=()=>$('menu').classList.remove('open');
const d=new Date();$('date').min=d.toISOString().slice(0,10);
function hash(s){let h=0;for(const c of s.toLowerCase())h=(h*31+c.charCodeAt(0))%997;return h}
$('seePrices').onclick=()=>{
 const f=$('from').value.trim(),t=$('to').value.trim();
 if(!f||!t){$('hint').textContent='Tell us where you are and where you want to go 🛺';return}
 if(f.toLowerCase()===t.toLowerCase()){$('hint').textContent='Pickup and destination are the same!';return}
 $('hint').textContent='';
 const km=+(3+Math.abs(hash(f)-hash(t))%250/10).toFixed(1),surge=1+(new Date().getHours()%12>7?.2:0);
 route={f,t,km,surge};document.dispatchEvent(new Event('ride:go'));
 $('routeInfo').textContent=`${f} → ${t} · ${km} km`+(surge>1?' · busy hours, small surge applied':'');
 $('rideList').innerHTML=RIDES.map((r,i)=>{const p=Math.round((r.base+r.km*km)*surge);
 return `<div class="ride" data-i="${i}"><span class="em">${r.e}</span><div class="in"><b>${r.n}</b><br><small>${r.m} · arrives in ${r.eta} min</small></div><b class="p">₹${p}</b></div>`}).join('')+
 `<button class="solid big" id="confirm">Pick a ride to continue</button>`;
 $('rides').classList.remove('hidden');window.lenis?lenis.scrollTo('#rides',{offset:-70}):$('rides').scrollIntoView({behavior:'smooth'});document.dispatchEvent(new Event('rides:ready'));selected=null;
 document.querySelectorAll('.ride').forEach(el=>el.onclick=()=>{document.querySelectorAll('.ride').forEach(x=>x.classList.remove('sel'));el.classList.add('sel');
  selected=RIDES[el.dataset.i];selected.price=el.querySelector('.p').textContent;$('confirm').textContent=`Chalo with ${selected.n} · ${selected.price}`});
 $('confirm').onclick=book;
};
function book(){
 if(!selected){toast('Choose a ride first 👆');return}
 const later=$('date').value?` on ${$('date').value} ${$('time').value||''}`:'';
 const steps=['Finding your driver…','Driver assigned: Ravi ⭐4.9','Arriving in '+selected.eta+' min!'];
 modal(`<h2>Chalo! Your ride is on the way 🛺</h2><p class="muted">${route.f} → ${route.t}${later}</p><div class="bar"><i id="pb"></i></div><p id="st">${steps[0]}</p>`);
 [1,2,3].forEach(n=>setTimeout(()=>{$('pb').style.width=n*33+'%';if(steps[n-1])$('st').textContent=steps[n-1]},n*1100));
 setTimeout(()=>{$('mBody').innerHTML=`<h2>You're all set! 🎉</h2><p>${selected.e} <b>${selected.n}</b> · ${selected.price}</p><p class="muted">${route.f} → ${route.t}</p><p>Your OTP: <b>${1000+Math.floor(Math.random()*9000)}</b></p>`;
  $('nextFlight').textContent=`${selected.n} to ${route.t}${later||' · right now'} (${selected.price})`;},4200);
}
function auth(kind){modal(`<h2>${kind==='up'?'Join the flight crew':'Welcome back'} ✈</h2><p class="muted">Chalo, ready to go?</p>
${kind==='up'?'<input id="nm" placeholder="Your name">':''}<input id="em" type="email" placeholder="Email"><input type="password" placeholder="Password">
<button class="solid big" id="go">${kind==='up'?'Create account':'Log in'}</button>`);
 $('go').onclick=()=>{const e=$('em').value;if(!/^\S+@\S+\.\S+$/.test(e)){toast('Enter a valid email');return}
  $('modal').classList.remove('on');toast(`Welcome aboard${$('nm')&&$('nm').value?', '+$('nm').value:''}! 🎉`)}}
$('signBtn').onclick=()=>auth('up');$('loginBtn').onclick=()=>auth('in');
function split(){$('each').textContent='₹'+Math.ceil(($('fare').value||0)/(Math.max(1,+$('ppl').value)+1))}
$('ppl').oninput=$('fare').oninput=split;split();
