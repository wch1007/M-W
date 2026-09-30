(() => {
  'use strict';
  const DAY=86400000;
  const dateNumber=key=>{const [year,month,day]=key.split('-').map(Number);return Date.UTC(year,month-1,day);};
  const expandDays=events=>{const result=new Set();for(const event of events){for(let t=dateNumber(event.startDate);t<=dateNumber(event.endDate);t+=DAY)result.add(new Date(t).toISOString().slice(0,10));}return result;};
  const elapsed=(firstDay,now=Date.now())=>{
    // Only a date was supplied, so use midnight in China as the origin.
    const seconds=Math.max(0,Math.floor((now-Date.parse(`${firstDay}T00:00:00+08:00`))/1000));
    return {days:Math.floor(seconds/86400),hours:Math.floor(seconds%86400/3600),minutes:Math.floor(seconds%3600/60),seconds:seconds%60};
  };
  window.MW_DATES={expandDays,elapsed};
})();
