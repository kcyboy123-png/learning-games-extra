import {validateSong} from './core.mjs';

// Files stay in memory: presenting never writes into the student's draft or library.
export async function readPresentations(files, existing=[]) {
  const works=[...existing], errors=[];
  for (const file of Array.from(files).slice(0,100)) {
    try {
      if (works.length>=100) throw Error('목록은 100곡까지 담을 수 있어요.');
      if (file.size>100000) throw Error('작품 파일 크기가 너무 커요.');
      const song=validateSong(JSON.parse(await file.text()));
      const name=String(file.name).slice(0,200);
      if (!works.some(w=>w.name===name&&JSON.stringify(w.song)===JSON.stringify(song))) works.push({name,song});
    } catch(e) { errors.push(`${String(file.name).slice(0,200)}: ${String(e?.message||'').startsWith('목록은')?e.message:'올바른 작품 파일인지 확인해 주세요.'}`); }
  }
  if (files.length>100) errors.push('한 번에 100개까지 선택해 주세요. 나머지 파일은 읽지 않았어요.');
  return {works,errors};
}
