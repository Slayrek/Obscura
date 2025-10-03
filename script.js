/* script.js — оновлено: додано псевдовипадкову змішку (LCG) + base36.
   Сигнатури функцій не змінені — HTML працюватиме без правок. */

let seed = 0;

function updateSeed() {
  const seedElement = document.getElementById('seed');
  seed = parseInt(seedElement.value) || 0;
}

function encryptAndDisplay() {
  const inputElement = document.getElementById('inputString');
  const resultElement = document.getElementById('encryptedResult');
  const input = inputElement.value;
  const encryptedResult = encryptUkrainianAlphabet(input, seed);
  resultElement.textContent = encryptedResult;
}

function decryptAndDisplay() {
  const inputElement = document.getElementById('inputString');
  const resultElement = document.getElementById('encryptedResult');
  const input = inputElement.value;
  const decryptedResult = decryptUkrainianAlphabet(input, seed);
  resultElement.textContent = decryptedResult;
}

function copyToClipboard() {
  const resultElement = document.getElementById('encryptedResult');
  navigator.clipboard.writeText(resultElement.textContent)
    .catch(() => console.error("Помилка копіювання"));
}

/* --- Нова логіка шифрування (зворотна, детермінована) --- */
/* Використовує простий LCG (лише для обфускації), додає seed і кодує в base36.
   Формат виходу: токени розділені крапкою ('.'). При розшифруванні
   використовується та сама LCG-послідовність. */

function _lcg_next(state) {
  // 32-bit LCG parameters (Numerical Recipes like)
  return (Math.imul(state, 1664525) + 1013904223) >>> 0;
}

function encryptUkrainianAlphabet(input, seedVal) {
  const s = Number.isInteger(seedVal) ? seedVal >>> 0 : 0;
  let state = (s ^ 0xC0FFEE) >>> 0; // трохи перемішати початковий стан
  const tokens = [];

  for (let i = 0; i < input.length; i++) {
    state = _lcg_next(state);
    const pr = state & 0xff; // псевдовипадковий байт
    const code = input.charCodeAt(i);
    // обфускація: додаємо seed та псевдовипадковий байт, обмежуємо 16-біт
    const ob = (code + (s & 0xffff) + pr) & 0xffff;
    // зберігаємо в base36 — стисло та нечислово виглядає
    tokens.push(ob.toString(36));
  }

  return tokens.join('.');
}

function decryptUkrainianAlphabet(input, seedVal) {
  if (!input) return '';
  const s = Number.isInteger(seedVal) ? seedVal >>> 0 : 0;
  let state = (s ^ 0xC0FFEE) >>> 0;
  const parts = input.split('.');
  const chars = [];

  for (let i = 0; i < parts.length; i++) {
    state = _lcg_next(state);
    const pr = state & 0xff;
    // парсимо base36 назад
    const ob = parseInt(parts[i], 36);
    if (Number.isNaN(ob)) {
      // якщо токен некоректний — просто додаємо сам токен (щоб не губити дані)
      chars.push(parts[i]);
      continue;
    }
    // відновлюємо код символу
    const code = (ob - (s & 0xffff) - pr) & 0xffff;
    chars.push(String.fromCharCode(code));
  }

  return chars.join('');
}
