(() => {
  'use strict';
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
  const months=['一月','二月','三月','四月','五月','六月','七月','八月','九月','十月','十一月','十二月'];
  const shortDate=date=>date.slice(5).replace('-','.');
  const labelDate=event=>event.startDate===event.endDate?shortDate(event.startDate):`${shortDate(event.startDate)} — ${shortDate(event.endDate)}`;
  const timeline=document.querySelector('#story-timeline');let group,groupMonth;
  data.events.forEach(event=>{
    const eventMonth=event.startDate.slice(0,7);
    if(eventMonth!==groupMonth){groupMonth=eventMonth;group=document.createElement('section');group.className='month-stories';const heading=document.createElement('h3');heading.className='month-heading';heading.textContent=`${eventMonth.slice(5)} / ${months[Number(eventMonth.slice(5))-1]}`;group.append(heading);timeline.append(group);}
    const article=document.createElement('article');article.className=`story-entry ${event.kind}`;article.id=event.id;
    const date=document.createElement('time');date.dateTime=event.startDate;date.textContent=labelDate(event);date.className='story-date';
    const copy=document.createElement('div');copy.className='story-copy';
    const tag=document.createElement('span');tag.className='story-tag';tag.textContent=event.tag;
    const title=document.createElement('h4');title.textContent=event.title;
    const description=document.createElement('p');description.textContent=event.description;
    const jump=document.createElement('button');jump.type='button';jump.className='story-calendar-link';jump.textContent='在日历里看看 ↗';jump.setAttribute('aria-label',`在日历里查看${event.title}`);
    jump.addEventListener('click',()=>{selected=event.startDate;[year,month]=selected.split('-').map(Number);month-=1;render();document.querySelector('#calendar').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});days.querySelector(`[data-date="${selected}"]`).focus({preventScroll:true});});
    copy.append(tag,title,description,jump);article.append(date,copy);group.append(article);
  });
  const findEvent=key=>data.events.find(event=>event.startDate<=key&&event.endDate>=key);
  const findMilestone=key=>data.milestones.find(item=>item.date===key);
  function showDetails(key){
    selected=key;const [y,m,d]=key.split('-').map(Number),item=findEvent(key)||findMilestone(key);
    document.querySelector('#selected-date').textContent=`${y} 年 ${m} 月 ${d} 日`;
    document.querySelector('#selected-title').textContent=item?.title||'这一天，还没有记下故事。';
    document.querySelector('#selected-description').textContent=item?.description||'空白的日子不代表没有相聚，回忆会慢慢补全。';
    const link=document.querySelector('#selected-link');link.hidden=!item;if(item)link.href=`#${item.id||item.chapter}`;
    days.querySelectorAll('button').forEach(button=>{const active=button.dataset.date===key;button.classList.toggle('is-selected',active);button.setAttribute('aria-pressed',String(active));});
  }
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
  if(data.photos.length){const grid=document.querySelector('#photo-grid');data.photos.forEach(photo=>{const figure=document.createElement('figure'),img=document.createElement('img'),caption=document.createElement('figcaption');img.src=photo.src;img.alt=photo.alt||photo.caption||'';img.loading='lazy';img.decoding='async';if(photo.width)img.width=photo.width;if(photo.height)img.height=photo.height;caption.textContent=photo.caption||'';figure.append(img,caption);grid.append(figure);});document.querySelector('#photos').hidden=false;}
})();
