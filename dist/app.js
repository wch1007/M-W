(() => {
  'use strict';
  const assetBase=new URL('.',document.currentScript.src);
  const data=window.MW_CONTENT, pad=n=>String(n).padStart(2,'0');
  const days=document.querySelector('#calendar-days'),previous=document.querySelector('#previous-month'),next=document.querySelector('#next-month');
  const monthKey=(y,m)=>`${y}-${pad(m+1)}`,dateKey=(y,m,d)=>`${monthKey(y,m)}-${pad(d)}`;
  const actualMeetings=data.events.filter(event=>event.kind==='meeting');
  const meetingDays=window.MW_DATES.expandDays(actualMeetings);
  let selected=actualMeetings.at(-1)?.startDate||data.firstDay;
  let [year,month]=selected.split('-').map(Number);month-=1;
  document.querySelector('#meeting-count').textContent=meetingDays.size;
  document.querySelector('#story-count').textContent=data.events.length;
  function updateTimer(){const elapsed=window.MW_DATES.elapsed(data.firstDay);for(const part of ['days','hours','minutes','seconds'])document.querySelector(`#together-${part}`).textContent=part==='days'?elapsed[part]:pad(elapsed[part]);}
  updateTimer();setInterval(updateTimer,1000);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)updateTimer();});
  const shortDate=date=>date.slice(5).replace('-','.');
  const labelDate=event=>event.startDate===event.endDate?shortDate(event.startDate):`${shortDate(event.startDate)} — ${shortDate(event.endDate)}`;
  const memories=window.MW_MEMORIES;
  document.querySelector('#memory-count').textContent=memories.items.length;
  const timeline=document.querySelector('#story-timeline');
  const make=(tag,className,text)=>{const node=document.createElement(tag);if(className)node.className=className;if(text!==undefined)node.textContent=text;return node;};
  const scrollBehavior=()=>matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth';
  function selectDate(key,scroll=false){
    selected=key;[year,month]=key.split('-').map(Number);month-=1;render();
    if(scroll){document.querySelector('#calendar').scrollIntoView({behavior:scrollBehavior()});days.querySelector(`[data-date="${selected}"]`)?.focus({preventScroll:true});}
  }
  function calendarJump(date,title){
    const button=make('button','story-calendar-link','在日历和地图里看看 ↗');button.type='button';button.setAttribute('aria-label',`在日历和地图里查看${title}`);
    button.addEventListener('click',()=>selectDate(date,true));return button;
  }
  function eventCard(event){
    const article=document.createElement('article');article.className=`story-entry ${event.kind}`;article.id=event.id;
    const date=document.createElement('time');date.dateTime=event.startDate;date.textContent=labelDate(event);date.className='story-date';
    const copy=document.createElement('div');copy.className='story-copy';
    const tag=document.createElement('span');tag.className='story-tag';tag.textContent=event.tag;
    const title=document.createElement('h4');title.textContent=event.title;
    const description=document.createElement('p');description.textContent=event.description;
    copy.append(tag,title,description,calendarJump(event.startDate,event.title));article.append(date,copy);return article;
  }
  function memoryCard(memory){
    const article=make('article','memory-card');article.id=memory.id;
    const top=make('div','memory-meta'),time=make('time','',shortDate(memory.date));time.dateTime=memory.date;top.append(time,make('span','','聊天原话节选'));
    article.append(top,make('h4','',memory.title),make('p','memory-note',memory.note));
    const quotes=make('div','dialogue');
    for(const line of memory.quotes){const bubble=make('blockquote',`bubble person-${line.who}`);bubble.append(make('span','speaker',`${line.who==='W'?'城昊 · W':'蔓蔓 · M'} · ${line.time}`),make('p','',line.text));quotes.append(bubble);}
    article.append(quotes,calendarJump(memory.date,memory.title));return article;
  }
  memories.months.forEach(monthInfo=>{
    const group=make('details','month-stories');group.id=`month-${monthInfo.key}`;
    const events=data.events.filter(e=>e.startDate.startsWith(monthInfo.key)),snippets=memories.items.filter(m=>m.date.startsWith(monthInfo.key));
    const summary=make('summary','month-heading'),number=make('span','month-number',monthInfo.key.slice(5));
    const copy=make('span','month-summary-copy');copy.append(make('span','month-title',monthInfo.title),make('span','month-description',monthInfo.note),make('span','month-counts',`${events.length} 段相聚与纪念 · ${snippets.length} 则聊天小事`));
    summary.append(number,copy,make('span','month-toggle','＋'));group.append(summary);
    const body=make('div','month-body'),eventList=make('div','monthly-events');eventList.append(make('h3','collection-heading','值得圈起来的日子'));
    events.forEach(event=>eventList.append(eventCard(event)));
    const snippetsList=make('div','memory-grid');snippets.forEach(memory=>snippetsList.append(memoryCard(memory)));
    body.append(eventList,make('h3','collection-heading','藏在聊天里的小事'),snippetsList,make('p','month-end','这一页先收到这里。下次见面，再添几笔。'));group.append(body);timeline.append(group);
    group.addEventListener('toggle',()=>{group.querySelector('.month-toggle').textContent=group.open?'−':'＋';updateExpandButton();});
  });
  function updateExpandButton(){document.querySelector('#toggle-months').textContent=[...timeline.querySelectorAll('details')].every(d=>d.open)?'收起全部月份':'展开全部月份';}
  document.querySelector('#toggle-months').addEventListener('click',()=>{const groups=[...timeline.querySelectorAll('details')],open=!groups.every(d=>d.open);groups.forEach(d=>d.open=open);updateExpandButton();});
  function revealHash(){let id;try{id=decodeURIComponent(location.hash.slice(1));}catch{return;}const target=document.getElementById(id);if(!target)return;const parent=target.closest('.month-stories');if(parent){parent.open=true;requestAnimationFrame(()=>target.scrollIntoView({behavior:scrollBehavior()}));}}
  window.addEventListener('hashchange',revealHash);
  document.addEventListener('click',event=>{const link=event.target.closest('a[href^="#"]');if(link&&link.hash===location.hash)revealHash();});
  revealHash();
  const findEvent=key=>data.events.find(event=>event.startDate<=key&&event.endDate>=key);
  const findMilestone=key=>data.milestones.find(item=>item.date===key);
  function showDetails(key){
    selected=key;const [y,m,d]=key.split('-').map(Number),memory=memories.items.find(m=>m.date===key),item=findEvent(key)||findMilestone(key)||(memory?{id:memory.id,title:memory.title,description:memory.note}:null);
    document.querySelector('#selected-date').textContent=`${y} 年 ${m} 月 ${d} 日`;
    document.querySelector('#selected-title').textContent=item?.title||'这一天，还没有记下故事。';
    document.querySelector('#selected-description').textContent=item?.description||'空白的日子不代表没有相聚，回忆会慢慢补全。';
    const link=document.querySelector('#selected-link');link.hidden=!item;if(item)link.href=`#${item.id||item.chapter}`;
    days.querySelectorAll('button').forEach(button=>{const active=button.dataset.date===key;button.classList.toggle('is-selected',active);button.setAttribute('aria-pressed',String(active));});
    renderMap(key);
  }
  const places=window.MW_PLACES;
  document.querySelector('#map-land').setAttribute('href',new URL('assets/asia-land.svg',assetBase).href);
  const svg=(tag,attributes,text)=>{const node=document.createElementNS('http://www.w3.org/2000/svg',tag);for(const [k,v] of Object.entries(attributes))node.setAttribute(k,v);if(text)node.textContent=text;return node;};
  const cities=document.querySelector('#map-cities');
  for(const id of ['beijing','hangzhou','xinjiang']){const p=places.places[id],[x,y]=places.project(p.lon,p.lat);cities.append(svg('circle',{cx:x,cy:y,r:3,class:'city-dot'}),svg('text',{x:x+10,y:y-22,class:'city-label'},p.name));}
  function renderMap(key){
    document.querySelector('#location-date').value=key;document.querySelector('#map-day-label').textContent=key.replaceAll('-',' / ');
    const panel=document.querySelector('#location-people'),markers=document.querySelector('#map-positions');panel.replaceChildren();markers.replaceChildren();
    const facts=['W','M'].map(who=>places.locate(who,key,data.events));
    const labelParts=[];
    facts.forEach((fact,index)=>{
      const who=index===0?'W':'M',name=index===0?'城昊':'蔓蔓',card=make('div',`location-person person-${who}${fact?.exact?'':' unconfirmed'}`);
      card.append(make('span','location-name',`${who} / ${name}`));
      if(!fact){card.append(make('strong','','位置待补充'),make('p','','这一天没有足够的聊天线索。'));labelParts.push(`${name}的位置未确认`);}
      else {
        const p=places.places[fact.place];
        card.append(make('strong','',p.name),make('span','location-certainty',fact.exact?'当天线索':`最近记录 · ${shortDate(fact.date)}，当天未确认`),make('p','',fact.note));
        if(p.regional)card.append(make('small','','地区位置为示意，不代表具体城市。'));
        labelParts.push(`${name}：${p.name}，${fact.exact?'当天线索':fact.date+'的最近记录，当天未确认'}`);
        const [baseX,y]=places.project(p.lon,p.lat),same=facts[0]?.place===facts[1]?.place,x=baseX+(same?(index===0?-17:17):0);
        const marker=svg('g',{class:`map-person marker-${who}${fact.exact?'':' stale'}`});
        marker.append(svg('circle',{cx:x,cy:y,r:15}),svg('text',{x,y:y+5,'text-anchor':'middle'},who),svg('title',{},labelParts.at(-1)));
        if(!['beijing','hangzhou','xinjiang'].includes(fact.place))marker.append(svg('text',{x:x+21,y:y+(index===0?-12:22),class:'extra-city-label'},p.name));
        markers.append(marker);
      }
      panel.append(card);
    });
    document.querySelector('#map-description').textContent=labelParts.join('；');
    const meeting=findEvent(key)?.kind==='meeting';
    document.querySelector('#map-status').textContent=meeting?'这一天有相聚记录。若当天返程，位置按较晚的线索显示。':facts.every(f=>f?.exact)?'各自的日常，也在同一页里。位置相近，不等于已经相见。':'没有消息的地方，先留一点空白；不把最近记录当作今天的位置。';
    document.querySelectorAll('[data-map-date]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.mapDate===key)));
  }
  document.querySelector('#location-date').addEventListener('change',event=>{const input=event.target;if(input.value&&input.checkValidity())selectDate(input.value);});
  document.querySelectorAll('[data-map-date]').forEach(button=>button.addEventListener('click',()=>selectDate(button.dataset.mapDate)));
  function render(){
    document.querySelector('#month-label').textContent=`${year} 年 ${month+1} 月`;
    previous.disabled=monthKey(year,month)<=data.calendarStart;next.disabled=monthKey(year,month)>=data.calendarEnd;days.replaceChildren();
    const offset=(new Date(Date.UTC(year,month,1)).getUTCDay()+6)%7,length=new Date(Date.UTC(year,month+1,0)).getUTCDate();
    for(let i=0;i<offset;i++){const spacer=document.createElement('span');spacer.setAttribute('aria-hidden','true');days.append(spacer);}
    for(let day=1;day<=length;day++){
      const key=dateKey(year,month,day),event=findEvent(key),item=event||findMilestone(key),button=document.createElement('button');button.type='button';button.textContent=day;button.dataset.date=key;
      if(event?.kind==='meeting')button.classList.add('is-meeting');else if(item)button.classList.add('is-milestone');
      button.setAttribute('aria-label',`${year}年${month+1}月${day}日${event?.kind==='meeting'?', 相聚':''}${item?', '+item.title:''}`);button.addEventListener('click',()=>showDetails(key));days.append(button);
    }
    showDetails(selected);
  }
  function changeMonth(delta){
    const date=new Date(Date.UTC(year,month+delta,1));year=date.getUTCFullYear();month=date.getUTCMonth();
    const prefix=monthKey(year,month),firstDay=`${prefix}-01`;
    selected=findEvent(firstDay)?firstDay:data.events.find(event=>event.startDate.startsWith(prefix))?.startDate||data.milestones.find(item=>item.date.startsWith(prefix))?.date||firstDay;render();
  }
  previous.addEventListener('click',()=>changeMonth(-1));next.addEventListener('click',()=>changeMonth(1));render();
  if(data.photos.length){const grid=document.querySelector('#photo-grid');data.photos.forEach(photo=>{const figure=document.createElement('figure'),img=document.createElement('img'),caption=document.createElement('figcaption');img.src=new URL(photo.src,assetBase).href;img.alt=photo.alt||photo.caption||'';img.loading='lazy';img.decoding='async';if(photo.width)img.width=photo.width;if(photo.height)img.height=photo.height;caption.textContent=photo.caption||'';figure.append(img,caption);grid.append(figure);});document.querySelector('#photos').hidden=false;}
})();
