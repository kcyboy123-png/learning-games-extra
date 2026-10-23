// 몽실이의 뽑기 심부름 · 화면 표시용 순수 포맷 함수 (DOM 없음, 브라우저와 Node 공용)
// 추첨 규칙은 picker.mjs에 있고, 여기서는 번호를 어떻게 보여 줄지만 정한다.

// 번호판 줄 나누기. 1~2개는 한 줄, 3개는 2+1, 4개는 2+2, 5개는 3+2.
export function cardRows(numbers) {
  if (!Array.isArray(numbers) || !numbers.length) return [];
  const split = { 3: 2, 4: 2, 5: 3 }[numbers.length];
  return split ? [numbers.slice(0, split), numbers.slice(split)] : [numbers.slice()];
}

// 남은 인원 팻말. 반복 허용이면 "남은 인원"이 아니라 "뽑을 수 있는 번호"로 적는다.
export function remainingText(unique, count) {
  return unique ? { label: '남은 인원', value: `${count}명` } : { label: '뽑을 수 있는 번호', value: `${count}개` };
}

// 빨랫줄 카드용 최근 결과. 최신이 먼저이고, 공개 전(revealed=false) 결과는 번호를 비워 둔다.
export function recentSlots(history, size = 3) {
  const slots = [];
  for (let i = history.length - 1; i >= 0 && slots.length < size; i--) {
    const entry = history[i];
    slots.push({ index: i + 1, pending: !entry.revealed, numbers: entry.revealed ? entry.numbers.slice() : [] });
  }
  while (slots.length < size) slots.push(null);
  return slots;
}

export function listNumbers(numbers) {
  return numbers.map(n => `${n}번`).join(', ');
}

export function parseTotal(value) {
  if (!/^\d+$/.test(value.trim())) return null;
  const number = Number(value);
  return Number.isInteger(number) && number >= 1 && number <= 100 ? number : null;
}
