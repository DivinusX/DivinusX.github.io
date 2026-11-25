// Pixel Decoder · everything runs in the browser; nothing is sent anywhere.
(() => {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const input = $('input'), output = $('output'), bubble = $('bubble'), buddy = document.querySelector('.buddy');
  const state = { format: 'b64', mode: 'decode' };

  // ---------- Base64 (UTF-8) ----------
  function encodeB64(text) {
    const bytes = new TextEncoder().encode(text);
    let bin = '';
    for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    return btoa(bin);
  }
  function decodeB64(str) {
    // accepts spaces/line breaks, URL-safe (- _), missing "=" padding and data: URIs
    let s = str.replace(/^data:[^,]*;base64,/i, '').replace(/\s+/g, '').replace(/-/g, '+').replace(/_/g, '/');
    if (/[^A-Za-z0-9+/=]/.test(s)) throw new Error('eso no parece Base64.');
    s = s.replace(/=+$/, '');
    if (s.length % 4 === 1) throw new Error('a ese Base64 le falta un pedazo. ¿Lo copiaste completo?');
    s += '='.repeat((4 - (s.length % 4)) % 4);
    const bin = atob(s);
    const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  }

  // ---------- URL % ----------
  const encodeUrl = (t) => encodeURIComponent(t);
  function decodeUrl(t) {
    try { return decodeURIComponent(t.replace(/\+/g, ' ')); }
    catch { throw new Error('hay un código % mal formado.'); }
  }

  function transform(text) {
    const fn = state.format === 'b64'
      ? (state.mode === 'encode' ? encodeB64 : decodeB64)
      : (state.mode === 'encode' ? encodeUrl : decodeUrl);
    if ($('optLines').checked && state.format === 'b64') {
      return text.split(/\r?\n/).map((line, i) => {
        if (!line.trim()) return '';
        try { return fn(line.trim()); } catch (e) { throw new Error(`línea ${i + 1}: ${e.message}`); }
      }).join('\n');
    }
    return fn(state.mode === 'decode' ? text.trim() : text);
  }

  // ---------- UI ----------
  function say(msg, isError = false) {
    bubble.textContent = msg;
    bubble.classList.toggle('is-error', isError);
    buddy.classList.remove('pop'); void buddy.offsetWidth; buddy.classList.add('pop');
  }
  const chars = (n) => `${n.toLocaleString('es')} ${n === 1 ? 'carácter' : 'caracteres'}`;
  function counts() {
    $('inCount').textContent = chars(input.value.length);
    $('outCount').textContent = output.value ? chars(output.value.length) : '';
  }

  function renderLinks(text) {
    const re = /\b((?:https?:\/\/|www\.)[^\s<>"'`]+|magnet:\?[^\s<>"'`]+)/gi;
    const links = state.mode === 'decode' ? [...new Set((text.match(re) || []).map((u) => u.replace(/[),.;:!?]+$/, '')))].slice(0, 20) : [];
    const list = $('linkList');
    list.replaceChildren();
    for (const u of links) {
      const li = document.createElement('li');
      const code = document.createElement('code'); code.textContent = u;
      const open = document.createElement('a');
      open.className = 'btn btn--green'; open.textContent = 'Abrir ↗';
      open.target = '_blank'; open.rel = 'noopener noreferrer nofollow';
      open.href = /^www\./i.test(u) ? 'https://' + u : u;
      const copy = document.createElement('button');
      copy.className = 'btn'; copy.type = 'button'; copy.textContent = 'Copiar';
      copy.addEventListener('click', () => copyText(u));
      li.append(code, open, copy); list.append(li);
    }
    $('links').hidden = links.length === 0;
    return links.length;
  }

  function run() {
    const text = input.value;
    if (!text.trim()) { output.value = ''; renderLinks(''); counts(); return; }
    try {
      output.value = transform(text);
      const n = renderLinks(output.value);
      if (state.mode === 'encode') say('¡Codificado! Ya puedes copiarlo. 👍');
      else say(n ? `¡Listo! Encontré ${n === 1 ? 'un link' : n + ' links'}. 👍` : '¡Decodificado! 👍');
    } catch (e) {
      output.value = ''; renderLinks('');
      say(`Ups: ${e.message}`, true);
    }
    counts();
  }

  const LABELS = {
    'b64-decode': ['Pega aquí el texto en Base64', 'aHR0cHM6Ly93d3cueW91dHViZS5jb20v…'],
    'b64-encode': ['Escribe o pega el link', 'https://www.youtube.com/…'],
    'url-decode': ['Pega aquí el link con códigos %', 'https%3A%2F%2Fejemplo.com%2F%3Fq%3Dhola%20mundo'],
    'url-encode': ['Escribe o pega el texto', 'hola mundo & más'],
  };
  function sync() {
    document.querySelectorAll('[data-format]').forEach((b) => { const on = b.dataset.format === state.format; b.classList.toggle('is-on', on); b.setAttribute('aria-selected', on); });
    document.querySelectorAll('[data-mode]').forEach((b) => { const on = b.dataset.mode === state.mode; b.classList.toggle('is-on', on); b.setAttribute('aria-selected', on); });
    document.body.classList.toggle('fmt-url', state.format === 'url');
    const [label, ph] = LABELS[`${state.format}-${state.mode}`];
    $('inLabel').textContent = label; input.placeholder = ph;
  }

  document.querySelectorAll('[data-format]').forEach((b) => b.addEventListener('click', () => { state.format = b.dataset.format; sync(); run(); }));
  document.querySelectorAll('[data-mode]').forEach((b) => b.addEventListener('click', () => { state.mode = b.dataset.mode; sync(); run(); }));
  input.addEventListener('input', run);
  $('optLines').addEventListener('change', run);

  function toast(msg) {
    const t = $('toast'); t.textContent = msg; t.classList.add('show');
    clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('show'), 1800);
  }
  async function copyText(text) {
    if (!text) { toast('No hay nada que copiar'); return; }
    try { await navigator.clipboard.writeText(text); }
    catch { const ta = document.createElement('textarea'); ta.value = text; document.body.append(ta); ta.select(); document.execCommand('copy'); ta.remove(); }
    toast('¡Copiado! 📋');
  }
  $('copyBtn').addEventListener('click', () => copyText(output.value));
  $('clearBtn').addEventListener('click', () => { input.value = ''; run(); input.focus(); say('Todo limpio. ¿Qué decodificamos ahora?'); });
  $('pasteBtn').addEventListener('click', async () => {
    try { input.value = await navigator.clipboard.readText(); run(); }
    catch { toast('Usa Ctrl+V para pegar'); input.focus(); }
  });
  $('swapBtn').addEventListener('click', () => {
    if (!output.value) return;
    input.value = output.value;
    state.mode = state.mode === 'encode' ? 'decode' : 'encode';
    sync(); run();
  });

  // ---------- theme ----------
  const store = (k, v) => { try { localStorage.setItem(k, v); } catch { /* private mode */ } };
  const load = (k) => { try { return localStorage.getItem(k); } catch { return null; } };
  const themeBtn = $('themeToggle');
  function setTheme(t) {
    document.documentElement.dataset.theme = t;
    themeBtn.textContent = t === 'dark' ? '☀️' : '🌙';
    themeBtn.setAttribute('aria-label', t === 'dark' ? 'Cambiar a modo día' : 'Cambiar a modo noche');
    store('pd-theme', t);
  }
  themeBtn.addEventListener('click', () => setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'));
  setTheme(load('pd-theme') || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));

  // share link: ?d=<base64> pre-fills a decode
  const pre = new URLSearchParams(location.search).get('d');
  if (pre) input.value = pre;
  sync(); run();
})();

// ---------- contador de visitas (Abacus, solo cuenta 1 vez por sesión) ----------
(function () {
  const box = document.getElementById('visits');
  const num = document.getElementById('visitsNum');
  if (!box || !num) return;
  let counted = false;
  try { counted = sessionStorage.getItem('pd-visit') === '1'; } catch (e) {}
  const url = 'https://abacus.jasoncameron.dev/' + (counted ? 'get' : 'hit') + '/mrpixeldecoder/visits';
  fetch(url).then(r => r.ok ? r.json() : Promise.reject()).then(d => {
    if (typeof d.value !== 'number') return;
    try { sessionStorage.setItem('pd-visit', '1'); } catch (e) {}
    num.textContent = d.value.toLocaleString('es-ES');
    box.hidden = false;
  }).catch(() => {});
})();
