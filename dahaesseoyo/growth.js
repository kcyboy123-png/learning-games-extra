(function(root){
'use strict';
root.ThinkstarGrowth=function(count){
 const xp=Math.max(0,Math.floor(count))*10;let level=1,base=0,need=80;
 while(xp>=base+need){base+=need;level++;need+=20;}
 return {level,xp,progress:xp-base,need,capacity:Math.min(3,level),hue:[0,25,80,160,225,290][(level-1)%6]};
};
})(globalThis);
