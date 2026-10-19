'use strict';
(() => {
  const $ = id => document.getElementById(id);
  const DURATION = 30000, TARGET = 40;
  const cards = [
    ['ghost','A HAPPY SURPRISE\nIS LOADING...'],['pumpkin','TRICK OR TREAT ?'],['gift','YOU GOT\nA MYSTERY BOX!'],['folder','NEW IDEA\nINCOMING...'],['plane','TIME FOR\nA SHORT BREAK?'],['pizza','PIZZA?\nALWAYS A GOOD IDEA.'],['camera','SAY CHEESE!'],['heart',"YOU’VE GOT\nGOOD VIBES!"],['candy','SOME CANDY\nFOR YOU!'],['party','LEVEL UP!']
  ];
  let winRecord = null, running = false, score = 0, started = 0, nextSpawn = 0, lastFrame = 0, frame = 0, popups = [], serial = 0;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function stop() { running = false; cancelAnimationFrame(frame); popups.forEach(p => p.el.remove()); popups = []; }
  function show(id) {
    document.querySelectorAll('.screen').forEach(s => s.hidden = s.id !== id);
    document.body.setAttribute('data-screen',id);
    $('employeeId').value = ''; $('submittedId').textContent = ''; $('formError').textContent = '';
    window.scrollTo(0,0);
  }
  function bounds() { return { w: $('arena').clientWidth, h: $('arena').clientHeight }; }
  function place(p) { p.el.style.transform = `translate(${p.x}px,${p.y}px)`; }
  function spawn() {
    if (popups.length >= 15) return;
    const [icon, text] = cards[Math.floor(Math.random()*cards.length)];
    const el = document.createElement('div'); el.className = 'window popup';
    el.innerHTML = '<div class="titlebar"><span>🎃 KLOOK.exe</span><button class="close-popup" type="button" aria-label="关闭异常窗口">×</button></div><div class="popup-body"><span class="popup-icon"></span><p></p><button class="fake-ok" type="button" aria-label="OK（仅展示，请点击右上角关闭）" aria-disabled="true" tabindex="-1">OK</button></div>';
    const iconEl = el.querySelector('.popup-icon');
    iconEl.innerHTML = `<svg aria-hidden="true"><use href="#${icon}"/></svg>`;
    el.querySelector('p').textContent = text;
    $('arena').appendChild(el);
    const {w,h} = bounds(), maxX = Math.max(0,w-el.offsetWidth), maxY = Math.max(0,h-el.offsetHeight);
    // Prefer free title-bar space so close buttons remain reachable on small screens.
    let x = 0, y = 0, best = -1;
    for(let i=0;i<18;i++) {
      const cx = Math.random()*maxX, cy = Math.random()*maxY;
      const separation = popups.length ? Math.min(...popups.map(p=>Math.hypot(cx-p.x,cy-p.y))) : Infinity;
      if(separation>best){best=separation;x=cx;y=cy;}
    }
    const p = {el,x,y,vx:(Math.random()>.5?1:-1)*(18+Math.random()*25),vy:(Math.random()>.5?1:-1)*(14+Math.random()*20)};
    el.style.zIndex = ++serial; popups.push(p); place(p);
    const closePopup = () => {
      if(!running) return;
      if(performance.now()-started>=DURATION){finish();return;}
      if(!popups.includes(p))return;
      el.remove();popups=popups.filter(item=>item!==p);score++;
      $('score').textContent=score;
    };
    el.querySelector('.close-popup').addEventListener('click', closePopup);
    el.addEventListener('pointerdown', () => { p.holdUntil = performance.now()+450; });
  }
  function finish() {
    if(!running)return;
    stop(); show('result');
    const won = score >= TARGET;
    winRecord = won ? {runId: (crypto.randomUUID ? crypto.randomUUID() : Date.now()+'-'+Math.random().toString(36).slice(2)), score, completedAt: new Date(), submitted:false} : null;
    track(won?'game_win':'game_lose',{score});
    $('timer').textContent='0';$('progress').style.width='0%';
    $('resultIcon').setAttribute('href',won?'#pumpkin':'#sad-ghost');
    $('result').setAttribute('data-outcome',won?'won':'lost');
    $('resultBadge').textContent=won?'SYSTEM RESTORED / 系统已恢复':'MISSION FAILED / 再接再厉';
    $('resultTitle').textContent=won?'恭喜！任务完成':'TIME’S UP!';
    $('resultText').textContent=won?`恭喜！你成功解决了 ${score} 个异常窗口，系统已恢复正常……至少目前是这样。`:`TIME'S UP！你只关闭了 ${score} 个异常窗口\n再试一次，说不定下次就能搞定`;
    $('finalScore').textContent=score;$('next').hidden=!won;
  }
  function tick(now) {
    if(!running)return;
    const elapsed=now-started;
    if(elapsed>=DURATION){finish();return;}
    const dt=Math.min((now-lastFrame)/1000,.05);lastFrame=now;
    $('timer').textContent=Math.ceil((DURATION-elapsed)/1000);
    $('progress').style.width=`${100*(1-elapsed/DURATION)}%`;
    const phase=elapsed<10000?0:elapsed<20000?1:2;
    $('phase').textContent=['点击右上角 ×，清理异常窗口','异常窗口开始移动了！','最后冲刺！弹窗正在加速'][phase];
    $('phaseLabel').textContent=['01 / WARM UP','02 / CHAOS MODE','03 / FINAL RUSH'][phase];
    if(now>=nextSpawn){spawn();nextSpawn=now+[500,350,220][phase];}
    const {w,h}=bounds();
    for(const p of popups){
      if(phase>0 && now>(p.holdUntil||0)){const speed=(phase===2?1.6:1)*(reducedMotion?.25:1);p.x+=p.vx*dt*speed;p.y+=p.vy*dt*speed;}
      const mx=Math.max(0,w-p.el.offsetWidth),my=Math.max(0,h-p.el.offsetHeight);
      if(p.x<0||p.x>mx)p.vx*=-1;if(p.y<0||p.y>my)p.vy*=-1;
      p.x=Math.max(0,Math.min(mx,p.x));p.y=Math.max(0,Math.min(my,p.y));place(p);
    }
    frame=requestAnimationFrame(tick);
  }
  function start(){track('game_start');stop();show('game');score=0;serial=0;$('score').textContent='0';$('timer').textContent='30';$('progress').style.width='100%';running=true;started=performance.now();lastFrame=started;nextSpawn=started+500;spawn();frame=requestAnimationFrame(tick);}
  document.querySelectorAll('.start').forEach(b=>b.addEventListener('click',start));
  document.querySelectorAll('.home').forEach(b=>b.addEventListener('click',()=>{stop();show('home');}));
  $('exit').addEventListener('click',()=>{stop();show('home');});
  $('next').addEventListener('click',()=>{if(score>=TARGET){show('employee');$('employeeId').focus();}});
  const pad = n => String(n).padStart(2,'0');
  const fmt = d => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  const ID_RE = /^K\d{6}$/;
  $('employeeId').addEventListener('input',()=>{$('formError').textContent='';});
  $('employeeForm').addEventListener('submit',async e=>{
    e.preventDefault();
    if(!winRecord||winRecord.submitting)return;
    const value=$('employeeId').value.trim().toUpperCase();$('employeeId').value=value;
    if(!ID_RE.test(value)){$('formError').textContent='工号格式不正确，应为 K + 6位数字，例如 K007309';$('employeeId').focus();return;}
    const endpoint=window.GAME_CONFIG&&window.GAME_CONFIG.registrationEndpoint;
    if(!endpoint){$('formError').textContent='登记地址未配置。';return;}
    const rec=winRecord,btn=$('submitBtn');rec.submitting=true;btn.disabled=true;$('formError').textContent='正在提交…';
    const payload={employeeId:value,runId:rec.runId,score:rec.score,durationSeconds:DURATION/1000,completedAt:fmt(rec.completedAt)};
    const ctrl=new AbortController(),t=setTimeout(()=>ctrl.abort(),15000);
    let ok=false;
    try{
      const r=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),signal:ctrl.signal});
      if(!r.ok)throw Error('submit');
      let j={};try{j=await r.json()}catch(_){}
      if(j.ok===false||(typeof j.code==='number'&&j.code!==0))throw Error('receipt');
      ok=true;
    }catch(err){
      if(err.name==='AbortError'){$('formError').textContent='提交超时，请重试。';}
      else if(err instanceof TypeError){
        // 浏览器因跨域拦截 JSON 请求（并未发出）：改用不触发预检的简单请求
        try{await fetch(endpoint,{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain;charset=UTF-8'},body:JSON.stringify(payload)});ok=true;}
        catch(_){$('formError').textContent='网络异常，请重试。';}
      }else{$('formError').textContent='未能确认登记成功，请重试。';}
    }
    clearTimeout(t);rec.submitting=false;btn.disabled=false;
    if(ok){track('register_success');rec.submitted=true;show('submitted');$('submittedId').textContent=value;}
  });
  document.addEventListener('visibilitychange',()=>{if(running&&!document.hidden&&performance.now()-started>=DURATION)finish();});
})();
