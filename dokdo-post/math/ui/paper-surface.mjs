import {svg} from './dom.mjs?v=tablet-20261115';
let sequence = 0;
// 세부 무늬는 장식층에만 둔다. 실제 면·조각의 좌표와 클릭 영역은 바꾸지 않는다.
export function paperSurface(target) {
  const id = `paper-grain-${sequence++}`;
  const pattern = svg('pattern', {id, width: 12, height: 12, patternUnits: 'userSpaceOnUse'});
  pattern.append(svg('path', {d: 'M1 2h3 M7 8h4 M3 11h2', stroke: '#785735', 'stroke-width': '.55', opacity: '.18'}));
  pattern.append(svg('path', {d: 'M5 4h4 M1 7h2', stroke: '#fff5d5', 'stroke-width': '.7', opacity: '.32'}));
  target.append(svg('defs', {}, [pattern]));
  return `url(#${id})`;
}
