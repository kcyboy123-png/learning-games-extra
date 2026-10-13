'use strict';
(() => {
  // Clockwise from east. Westward poses reuse the matching eastward atlas row.
  const directions = ['east','southeast','south','southwest','west','northwest','north','northeast'];
  const rows = [2,1,0,1,2,3,4,3];
  const cycle = [1,2,3,0];
  const stride = 144;
  window.STAR_HERO_MOTION = {
    create(image, atlas) {
      let facing = 2, distance = 0, moving = false, reduced = false;
      let frame = 0;
      return {
        reset() { facing=2; distance=0; moving=false; frame=0; },
        stop() { moving=false; distance=0; frame=0; },
        update(dx,dy,reduce=false) {
          reduced=reduce;
          const travelled=Math.hypot(dx,dy);
          moving=travelled>.04;
          if (!moving) { distance=0; frame=0; return; }
          const angle=Math.atan2(dy,dx);
          const current=facing*Math.PI/4;
          const delta=Math.atan2(Math.sin(angle-current),Math.cos(angle-current));
          // A small angular dead band prevents flicker while following road curves.
          if (Math.abs(delta)>Math.PI/8+.1) facing=(Math.round(angle/(Math.PI/4))+8)%8;
          distance=(distance+travelled)%stride;
          frame=reduced?0:cycle[Math.floor(distance/stride*cycle.length)];
        },
        draw(ctx,x,y) {
          if (!image.complete || !image.naturalWidth || !atlas?.frames) return false;
          const pose=atlas.frames[rows[facing]][frame];
          const [sx,sy,sw,sh]=pose.rect;
          const scale=124/pose.height;
          const flip=facing>=3&&facing<=5?-1:1;
          // Feet stay anchored to world coordinates; the body only lifts subtly while stepping.
          const lift=moving&&!reduced?Math.abs(Math.sin(distance/stride*Math.PI*2))*.7:0;
          ctx.save();ctx.translate(x,y-lift);ctx.scale(flip,1);
          ctx.drawImage(image,sx,sy,sw,sh,-pose.anchor[0]*scale,-pose.anchor[1]*scale,sw*scale,sh*scale);
          ctx.restore();return true;
        },
        snapshot() { return {facing:directions[facing],frame,moving,reduced,ready:!!(image.complete&&image.naturalWidth),distance}; }
      };
    }
  };
})();
