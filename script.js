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

function _lcg_next(state) {
  return (Math.imul(state, 1664525) + 1013904223) >>> 0;
}

function encryptUkrainianAlphabet(input, seedVal) {
  const s = Number.isInteger(seedVal) ? seedVal >>> 0 : 0;
  let state = (s ^ 0xC0FFEE) >>> 0;
  const tokens = [];

  for (let i = 0; i < input.length; i++) {
    state = _lcg_next(state);
    const pr = state & 0xff; 
    const code = input.charCodeAt(i);
    const ob = (code + (s & 0xffff) + pr) & 0xffff;
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
      chars.push(parts[i]);
      continue;
    }
    const code = (ob - (s & 0xffff) - pr) & 0xffff;
    chars.push(String.fromCharCode(code));
  }

  return chars.join('');
}

