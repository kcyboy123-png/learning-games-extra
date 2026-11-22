const day=86400000,week=7*day,koreaMonday=3*day+9*3600000;
export const WEEKEND_DURATION=2*day;

export function weekendCareThrough(startedAt,now){
 return startedAt>0&&now>=startedAt?Math.min(now,startedAt+WEEKEND_DURATION):0;
}

export function weekendCareStatus(record,now=Date.now()){
 const startedAt=record.weekendCareAt??0;
 const time=Math.max(now,record.seenAt,record.health?.wall??0);
 const weekOf=t=>Math.floor((t+koreaMonday)/week);
 const currentWeek=weekOf(time);
 const endsAt=startedAt+WEEKEND_DURATION;
 const active=startedAt>0&&time>=startedAt&&time<endsAt;
 const used=startedAt>0&&weekOf(startedAt)>=currentWeek;
 return {time,active,endsAt,available:!active&&!used,nextWeekAt:(currentWeek+1)*week-koreaMonday};
}
