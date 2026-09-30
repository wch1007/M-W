(() => {
  'use strict';
  // Regional anchors are illustrative, not GPS locations or travel routes.
  const places={
    beijing:{name:'北京',lon:116.4,lat:39.9},
    hangzhou:{name:'杭州',lon:120.16,lat:30.27},
    xinjiang:{name:'新疆',lon:84.5,lat:44,regional:true},
    korla:{name:'新疆 · 库尔勒',lon:86.17,lat:41.72},
    innerMongolia:{name:'内蒙古',lon:115.5,lat:43.5,regional:true},
    jinan:{name:'济南',lon:117.12,lat:36.65},
    busan:{name:'韩国 · 釜山',lon:129.08,lat:35.18},
    seoul:{name:'韩国 · 首尔',lon:126.98,lat:37.57}
  };
  // Observations are dated facts, never automatically extended into a stay.
  const observations=[
    ['2026-06-12','W','xinjiang','赴新疆旅行，当晚报平安已落地。'],
    ['2026-06-14','M','beijing','聊天提到当天北京的天气。'],
    ['2026-06-15','W','xinjiang','新疆旅行，分享那拉提行程。'],
    ['2026-06-17','W','xinjiang','当晚聊天确认两个人都在新疆；并未见面。'],
    ['2026-06-17','M','korla','库尔勒出差，当天下午报平安已落地。'],
    ['2026-06-18','W','xinjiang','凌晨仍在新疆旅行。'],
    ['2026-06-18','M','korla','当天从新疆离开，落地后的城市未确认。'],
    ['2026-06-21','W','xinjiang','从巴音布鲁克开到乌鲁木齐。'],
    ['2026-07-09','W','hangzhou','前往杭州，当天下午已到酒店。'],
    ['2026-07-11','M','innerMongolia','草原旅行，分享内蒙古风景。'],
    ['2026-07-12','W','hangzhou','分享在杭州的饭店日常。'],
    ['2026-07-12','M','beijing','当晚结束草原旅行，回到北京。'],
    ['2026-08-03','M','beijing','结束杭州周末行，回到北京日常。'],
    ['2026-08-07','M','jinan','周末来到济南。'],
    ['2026-08-09','M','jinan','在山东等返京列车，不能据此确认已抵京。'],
    ['2026-08-10','W','hangzhou','聊天里的杭州日常。'],
    ['2026-08-30','W','hangzhou','北京相聚后，当晚已回到杭州。'],
    ['2026-09-02','W','hangzhou','“这是我在杭州第一次穿这个粉色衬衫”。'],
    ['2026-09-05','M','busan','分享釜山街头见闻。'],
    ['2026-09-07','M','seoul','中午已来到首尔汝矣岛。'],
    ['2026-09-08','M','beijing','返京，晚上发来“我到家啦”。'],
    ['2026-09-09','M','korla','赴新疆出差，傍晚在库尔勒落地。'],
    ['2026-09-11','W','hangzhou','下雨天的飞盘与杭州天气预报。'],
    ['2026-09-27','W','hangzhou','中午确认已到达杭州。'],
    ['2026-09-30','M','beijing','北京地铁早高峰。']
  ].map(([date,who,place,note])=>({date,who,place,note}));
  const meetingPlaces={ 'first-date':'beijing',flowers:'beijing','first-movie':'beijing','nba-and-cooking':'beijing','back-from-xinjiang':'beijing',graduation:'beijing','graduation-photos':'beijing','surprise-visit':'beijing','our-city':'hangzhou','meet-dad':'hangzhou','hangzhou-again':'hangzhou','beijing-suit':'beijing','mid-autumn':'beijing'};
  function locate(who,date,events){
    if(date<'2026-05-18'||date>'2026-09-30')return null;
    const facts=observations.filter(o=>o.who===who&&o.date<=date);
    for(const e of events){if(e.kind!=='meeting'||!meetingPlaces[e.id]||e.startDate>date)continue;
      const last=e.endDate<date?e.endDate:date;
      facts.push({date:last,who,place:meetingPlaces[e.id],note:`已确认相聚：${e.title}`,meeting:true});
    }
    // A same-day arrival after a meeting takes precedence over that meeting's city.
    facts.sort((a,b)=>a.date.localeCompare(b.date)||Number(b.meeting||false)-Number(a.meeting||false));
    const latest=facts.at(-1);return latest?{...latest,exact:latest.date===date}:null;
  }
  window.MW_PLACES={places,observations,locate,project:(lon,lat)=>[(lon-72)/65*720,(54-lat)/36*400]};
})();
