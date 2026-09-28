(() => {
  'use strict';
  const data = window.MW_CONTENT;
  const days = document.querySelector('#calendar-days');
  const previous = document.querySelector('#previous-month');
  const next = document.querySelector('#next-month');
  const pad = n => String(n).padStart(2, '0');
  const dateKey = (y,m,d) => `${y}-${pad(m+1)}-${pad(d)}`;
  const monthKey = (y,m) => `${y}-${pad(m+1)}`;
  const dateNumber = key => { const [y,m,d]=key.split('-').map(Number); return Date.UTC(y,m-1,d); };
  let year = 2026, month = 4, selected = '2026-05-31';
  const actualMeetings = data.meetings.filter(m => m.status !== 'planned' && m.confirmed !== false);
  const meetingDays = new Set();
  actualMeetings.forEach(meeting => {
    for(let time=dateNumber(meeting.startDate);time<=dateNumber(meeting.endDate);time+=86400000){
      meetingDays.add(new Date(time).toISOString().slice(0,10));
    }
  });
  document.querySelector('#meeting-count').textContent=meetingDays.size;
  const findMeeting = key => actualMeetings.find(m=>m.startDate<=key && m.endDate>=key);
  const findMilestone = key => data.milestones.find(m=>m.date===key);
  function showDetails(key){
    selected=key;
    const [y,m,d]=key.split('-').map(Number);
    const item=findMeeting(key)||findMilestone(key);
    document.querySelector('#selected-date').textContent=`${y} 年 ${m} 月 ${d} 日`;
    document.querySelector('#selected-title').textContent=item?.title||'这一天，还没有记下故事。';
    document.querySelector('#selected-description').textContent=item?.description||'空白的日子不代表没有相聚，回忆会慢慢补全。';
    const link=document.querySelector('#selected-link');
    link.hidden=!item?.chapter;
    if(item?.chapter)link.href=`#${item.chapter}`;
    days.querySelectorAll('button').forEach(button=>{
      const active=button.dataset.date===key;
      button.classList.toggle('is-selected',active);
      button.setAttribute('aria-pressed',String(active));
    });
  }
  function render(){
    document.querySelector('#month-label').textContent=`${year} 年 ${month+1} 月`;
    previous.disabled=monthKey(year,month)<=data.calendarStart;
    next.disabled=monthKey(year,month)>=data.calendarEnd;
    days.replaceChildren();
    const offset=(new Date(Date.UTC(year,month,1)).getUTCDay()+6)%7;
    const length=new Date(Date.UTC(year,month+1,0)).getUTCDate();
    for(let i=0;i<offset;i++){const spacer=document.createElement('span');spacer.setAttribute('aria-hidden','true');days.append(spacer);}
    for(let day=1;day<=length;day++){
      const key=dateKey(year,month,day),meeting=findMeeting(key),milestone=findMilestone(key);
      const button=document.createElement('button');button.type='button';button.textContent=day;button.dataset.date=key;
      if(meeting)button.classList.add('is-meeting');
      else if(milestone)button.classList.add('is-milestone');
      button.setAttribute('aria-label',`${year}年${month+1}月${day}日${meeting?', 相聚, '+meeting.title:milestone?', '+milestone.title:''}`);
      button.addEventListener('click',()=>showDetails(key));days.append(button);
    }
    showDetails(selected);
  }
  function changeMonth(delta){
    const date=new Date(Date.UTC(year,month+delta,1));year=date.getUTCFullYear();month=date.getUTCMonth();
    const prefix=monthKey(year,month);
    selected=data.milestones.find(m=>m.date.startsWith(prefix))?.date||`${prefix}-01`;
    render();
  }
  previous.addEventListener('click',()=>changeMonth(-1));next.addEventListener('click',()=>changeMonth(1));
  render();
  if(data.photos.length){
    const grid=document.querySelector('#photo-grid');
    data.photos.forEach(photo=>{const figure=document.createElement('figure'),img=document.createElement('img'),caption=document.createElement('figcaption');img.src=photo.src;img.alt=photo.alt||photo.caption||'';img.loading='lazy';img.decoding='async';if(photo.width)img.width=photo.width;if(photo.height)img.height=photo.height;caption.textContent=photo.caption||'';figure.append(img,caption);grid.append(figure);});
    document.querySelector('#photos').hidden=false;
  }
})();
