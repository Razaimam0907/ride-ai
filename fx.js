// Smooth scroll (Lenis) + reveal animations + hero parallax
(()=>{
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
document.documentElement.classList.add('js');

/* ---------- Lenis smooth scrolling ---------- */
if(window.Lenis&&!reduce){
  const lenis=new Lenis({duration:1.4,easing:t=>1-Math.pow(1-t,4),smoothWheel:true,wheelMultiplier:.9,touchMultiplier:1.6});
  window.lenis=lenis;
  const raf=t=>{lenis.raf(t);requestAnimationFrame(raf)};requestAnimationFrame(raf);
  document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{
    const id=a.getAttribute('href');e.preventDefault();id.length>1?lenis.scrollTo(id,{offset:-70}):lenis.scrollTo(0)}));
  // pause page scroll while a modal is open
  new MutationObserver(()=>$m.classList.contains('on')?lenis.stop():lenis.start()).observe($m=document.getElementById('modal'),{attributes:true});
  ['aiMsgs','aiBox'].forEach(i=>document.getElementById(i).setAttribute('data-lenis-prevent',''));
}
// hide nav on scroll down, show on scroll up
let last=0;const nav=document.querySelector('.nav');
addEventListener('scroll',()=>{const y=scrollY;nav.classList.toggle('hide',y>last&&y>240);last=y},{passive:true});

/* ---------- scroll reveal + tilt ---------- */
const targets=document.querySelectorAll('.split>*,.tile,details,#faq h2,#biz h2,#rides h2,footer .wrap');
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.15});
targets.forEach((el,i)=>{el.setAttribute('data-reveal','');el.style.transitionDelay=(i%4)*90+'ms';io.observe(el)});
if(!reduce)document.querySelectorAll('.tile,.panel').forEach(el=>{
  el.addEventListener('mousemove',e=>{const b=el.getBoundingClientRect(),x=(e.clientX-b.left)/b.width-.5,y=(e.clientY-b.top)/b.height-.5;
    el.style.transform=`perspective(700px) rotateY(${x*10}deg) rotateX(${-y*10}deg) translateY(-4px)`});
  el.addEventListener('mouseleave',()=>el.style.transform='')});

/* ---------- hero: ride zooms off on search + gentle parallax ---------- */
const plane=document.getElementById('plane'),sun=document.querySelector('.sun'),clouds=[...document.querySelectorAll('.cloud')];
document.addEventListener('ride:go',()=>{plane.classList.add('go');setTimeout(()=>plane.classList.remove('go'),1500)});
if(!reduce){let tx=0,ty=0,cx=0,cy=0;
  addEventListener('mousemove',e=>{tx=e.clientX/innerWidth-.5;ty=e.clientY/innerHeight-.5},{passive:true});
  (function loop(){requestAnimationFrame(loop);const y=scrollY;if(y>900)return;
    cx+=(tx-cx)*.06;cy+=(ty-cy)*.06;
    sun.style.transform=`translate3d(${cx*-30}px,${y*.25+cy*-20}px,0)`;
    clouds.forEach((c,i)=>c.style.translate=`${cx*(i?40:25)}px ${y*(.12+i*.1)}px`);
    plane.style.translate=`${cx*20}px ${y*.08+cy*12}px`})();}
})();
