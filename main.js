/* Dhoop landing page: vanilla JS, no dependencies.
   Sections: 1 header + nav, 2 hero sun scene, 3 savings calculator,
   4 pricing toggle, 5 plan buttons, 6 demo form validation. */

(function () {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1. Header and navigation ---------- */
  const header = $('#siteHeader');
  const nav = $('#nav');
  const menuBtn = $('#menuBtn');

  function setMenu(open) {
    nav.classList.toggle('open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  menuBtn.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
  nav.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('open')) { setMenu(false); menuBtn.focus(); }
  });
  window.addEventListener('resize', () => { if (window.innerWidth > 820) setMenu(false); });

  const navLinks = $$('.nav a[href^="#"]:not(.btn)');
  const sections = navLinks.map((a) => $(a.getAttribute('href'))).filter(Boolean);

  function onScroll() {
    header.classList.toggle('scrolled', window.scrollY > 8);
    const probe = window.scrollY + header.offsetHeight + window.innerHeight * 0.25;
    let current = null;
    sections.forEach((s) => { if (s.offsetTop <= probe) current = s.id; });
    navLinks.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === '#' + current));
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- 2. Hero: a day on the roof ---------- */
  const svg = $('#sceneSvg');
  const city = $('#city');
  const NS = 'http://www.w3.org/2000/svg';
  const GROUND = 398;
  const PEAK_KW = 128;
  const TARIFF = 8;

  function el(name, attrs, parent) {
    const n = document.createElementNS(NS, name);
    Object.keys(attrs).forEach((k) => n.setAttribute(k, attrs[k]));
    if (parent) parent.appendChild(n);
    return n;
  }

  // x, width, height, body colour
  const blocks = [
    [-20, 150, 150, '#E3E7EC'], [150, 120, 215, '#D3D9E1'], [290, 170, 140, '#EDEFF2'],
    [480, 140, 255, '#D8DDE5'], [640, 160, 175, '#E8EBEF'], [820, 120, 235, '#D3D9E1'],
    [960, 150, 160, '#EDEFF2'], [1130, 110, 205, '#DDE2E9']
  ];
  const TALL = 3;
  let tallRoofY = 0, tallCx = 0;

  blocks.forEach(([x, w, h, color], i) => {
    const roofY = GROUND - h;
    el('rect', { x, y: roofY, width: w, height: h, fill: color }, city);
    el('rect', { x, y: roofY + 18, width: w, height: h - 34, fill: 'url(#wins)' }, city);
    el('rect', { x, y: roofY + 18, width: w, height: h - 34, fill: 'url(#winsLit)', class: 'lit' }, city);
    el('rect', { x: x - 3, y: roofY - 4, width: w + 6, height: 6, fill: '#8A93A3' }, city);
    // two rows of solar panels: back row smaller, front row full width
    const px = x + 10, pw = w - 20;
    el('rect', { x: px + 10, y: roofY - 28, width: pw - 20, height: 12, fill: 'url(#cells)' }, city);
    el('rect', { x: px + 10, y: roofY - 28, width: pw - 20, height: 12, fill: '#fff', class: 'sheen' }, city);
    el('rect', { x: px, y: roofY - 14, width: pw, height: 12, fill: 'url(#cells)' }, city);
    el('rect', { x: px, y: roofY - 14, width: pw, height: 12, fill: '#fff', class: 'sheen' }, city);
    if (i % 2 === 0) el('rect', { x: x + w - 26, y: roofY - 46, width: 16, height: 18, fill: '#8A93A3' }, city);
    if (i === TALL) { tallRoofY = roofY; tallCx = x + w / 2; }
  });

  // trees along the ground
  [70, 250, 450, 620, 810, 940, 1110].forEach((x, i) => {
    el('rect', { x: x - 2, y: GROUND - 18, width: 4, height: 18, fill: '#34423F' }, city);
    el('circle', { cx: x, cy: GROUND - 26, r: 13 + (i % 3) * 2, fill: '#2E6B4F' }, city);
  });

  const tag = $('#tag');
  tag.setAttribute('transform', `translate(${tallCx - 56}, ${tallRoofY - 66})`);
  const tagText = $('#tagText');
  const sun = $('#sun');

  const skyStops = [
    [5, '#1E2A4A', '#E58A5B'], [6.5, '#4A6A9B', '#F5B97E'], [9, '#7FB4DA', '#F3E4BE'],
    [12, '#4F9BD3', '#CFE8F2'], [15, '#6AAAD4', '#F2E2B8'], [17.5, '#5B77A3', '#F0A062'],
    [19, '#1C2745', '#C9704F']
  ];
  const hex = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
  const mix = (a, b, t) => '#' + hex(a).map((v, i) => Math.round(v + (hex(b)[i] - v) * t).toString(16).padStart(2, '0')).join('');

  function skyAt(h) {
    for (let i = 0; i < skyStops.length - 1; i++) {
      const [h0, t0, b0] = skyStops[i], [h1, t1, b1] = skyStops[i + 1];
      if (h >= h0 && h <= h1) {
        const t = (h - h0) / (h1 - h0);
        return [mix(t0, t1, t), mix(b0, b1, t)];
      }
    }
    return [skyStops[0][1], skyStops[0][2]];
  }

  const sunFactor = (h) => {
    const t = (h - 6) / 12;
    return t > 0 && t < 1 ? Math.sin(Math.PI * t) : 0;
  };
  const powerAt = (h) => PEAK_KW * Math.pow(sunFactor(h), 1.15);
  function energyUntil(h) {
    let kwh = 0;
    for (let x = 6; x < Math.min(h, 18); x += 0.05) kwh += powerAt(x + 0.025) * 0.05;
    return kwh;
  }
  function clockText(h) {
    const total = Math.round(h * 60);
    let hh = Math.floor(total / 60), mm = total % 60;
    const ap = hh >= 12 ? 'pm' : 'am';
    hh = hh % 12 || 12;
    return hh + ':' + String(mm).padStart(2, '0') + ' ' + ap;
  }
  const num = (n) => Math.round(n).toLocaleString('en-IN');

  const dial = $('#dial');
  const rd = { time: $('#rdTime'), kw: $('#rdKw'), kwh: $('#rdKwh'), saved: $('#rdSaved') };
  const sky = { top: $('#skyTop'), bot: $('#skyBot') };

  function renderScene(h) {
    const [top, bot] = skyAt(h);
    sky.top.setAttribute('stop-color', top);
    sky.bot.setAttribute('stop-color', bot);

    // keep the sun's whole path inside whatever part of the scene is visible
    const r = svg.getBoundingClientRect();
    const visW = r.width / Math.max(r.width / 1200, r.height / 440);
    const xMin = 600 - visW / 2 + 70, xMax = 600 + visW / 2 - 70;
    const t = clamp((h - 6) / 12, -0.1, 1.1);
    const sx = xMin + (xMax - xMin) * t;
    const sy = 345 - 215 * Math.sin(Math.PI * t);
    sun.setAttribute('transform', `translate(${sx.toFixed(1)}, ${sy.toFixed(1)})`);

    const s = sunFactor(h);
    const lit = clamp((7 - h) / 1.5, 0, 1) + clamp((h - 16.5) / 1.5, 0, 1);
    svg.style.setProperty('--sun', s.toFixed(3));
    svg.style.setProperty('--lit', clamp(lit, 0, 1).toFixed(3));

    const kw = powerAt(h), kwh = energyUntil(h);
    rd.time.textContent = clockText(h);
    rd.kw.textContent = num(kw) + ' kW';
    rd.kwh.textContent = num(kwh) + ' kWh';
    rd.saved.textContent = '₹' + num(kwh * TARIFF);
    tagText.textContent = num(kw) + ' kW';
  }

  // window glow and panel sheen are driven by CSS variables
  const sceneStyle = document.createElement('style');
  sceneStyle.textContent = '#sceneSvg .lit{opacity:calc(var(--lit,0)*.95)}#sceneSvg .sheen{opacity:calc(var(--sun,0)*.38)}';
  document.head.appendChild(sceneStyle);

  let playing = false;
  function stopPlay() { playing = false; }
  ['pointerdown', 'keydown', 'touchstart'].forEach((ev) => dial.addEventListener(ev, stopPlay, { passive: true }));
  dial.addEventListener('input', () => renderScene(parseFloat(dial.value)));
  window.addEventListener('resize', () => renderScene(parseFloat(dial.value)));

  function playIntro(from, to, ms) {
    playing = true;
    const t0 = performance.now();
    (function frame(now) {
      if (!playing) return;
      const p = clamp((now - t0) / ms, 0, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const h = from + (to - from) * eased;
      dial.value = h;
      renderScene(h);
      if (p < 1) requestAnimationFrame(frame); else playing = false;
    })(t0);
  }

  if (reduceMotion) {
    dial.value = 12.5; renderScene(12.5);
  } else {
    dial.value = 5.5; renderScene(5.5);
    setTimeout(() => playIntro(5.5, 12.5, 6000), 500);
  }

  /* ---------- 3. Savings calculator ---------- */
  const calc = {
    bill: $('#inBill'), roof: $('#inRoof'), tariff: $('#inTariff'),
    oBill: $('#outBill'), oRoof: $('#outRoof'), oTariff: $('#outTariff'),
    payback: $('#rPayback'), kw: $('#rKw'), save: $('#rSave'), net: $('#rNet'),
    cover: $('#rCover'), capex: $('#rCapex'), co2: $('#rCo2'), limit: $('#rLimit'),
    chart: $('#chart')
  };
  const SQFT_PER_KW = 100, UNITS_PER_KW_MONTH = 120, COST_PER_KW = 52000, DEGRADE = 0.005, YEARS = 25, GRID_CO2 = 0.82;

  function inr(n) {
    const sign = n < 0 ? '-' : '';
    const a = Math.abs(n);
    if (a >= 1e7) return sign + '₹' + (a / 1e7).toFixed(2) + ' Cr';
    if (a >= 1e5) return sign + '₹' + (a / 1e5).toFixed(1) + ' L';
    return sign + '₹' + Math.round(a).toLocaleString('en-IN');
  }

  function drawChart(cum, payback, capex) {
    const W = 560, H = 220, L = 8, R = 8, T = 18, B = 30;
    const min = -capex, max = Math.max(cum[YEARS], 1);
    const x = (y) => L + (W - L - R) * (y / YEARS);
    const y = (v) => T + (H - T - B) * (1 - (v - min) / (max - min));
    let s = '';
    s += `<line x1="${L}" x2="${W - R}" y1="${y(0)}" y2="${y(0)}" stroke="#0D1B33" stroke-width="1.5" stroke-dasharray="5 5"/>`;
    [0, 5, 10, 15, 20, 25].forEach((yr) => {
      s += `<text x="${x(yr)}" y="${H - 8}" font-size="12" fill="#55607A" text-anchor="${yr === 0 ? 'start' : yr === 25 ? 'end' : 'middle'}">${yr === 0 ? 'Start' : 'Year ' + yr}</text>`;
    });
    const pts = cum.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
    s += `<polyline points="${pts}" fill="none" stroke="#0B2A6F" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round"/>`;
    if (payback <= YEARS) {
      const px = x(payback), py = y(0);
      s += `<line x1="${px}" x2="${px}" y1="${py}" y2="${H - B}" stroke="#0D1B33" stroke-width="1.5"/>`;
      s += `<circle cx="${px}" cy="${py}" r="8" fill="#FFC21A" stroke="#0D1B33" stroke-width="3"/>`;
      const late = payback > 18;
      const tx = late ? px - 14 : px + 14;
      const ty = late ? py - 14 : py + 24;
      s += `<text x="${tx}" y="${ty}" font-size="14" font-weight="700" fill="#0D1B33" text-anchor="${late ? 'end' : 'start'}">Break-even, year ${payback.toFixed(1)}</text>`;
    }
    calc.chart.innerHTML = s;
  }

  function runCalc() {
    const bill = +calc.bill.value, roof = +calc.roof.value, tariff = +calc.tariff.value;
    calc.oBill.textContent = inr(bill);
    calc.oRoof.textContent = Number(roof).toLocaleString('en-IN') + ' sq ft';
    calc.oTariff.textContent = '₹' + tariff.toFixed(1);

    const unitsNeeded = bill / tariff;
    const roofKw = roof / SQFT_PER_KW;
    const needKw = unitsNeeded / UNITS_PER_KW_MONTH;
    const kw = Math.min(roofKw, needKw);
    const genMonth = kw * UNITS_PER_KW_MONTH;
    const saveMonth = genMonth * tariff;
    const capex = kw * COST_PER_KW;
    const annual = saveMonth * 12;

    const cum = [-capex];
    for (let i = 1; i <= YEARS; i++) cum.push(cum[i - 1] + annual * Math.pow(1 - DEGRADE, i - 1));
    let payback = Infinity;
    for (let i = 1; i <= YEARS; i++) {
      if (cum[i] >= 0) { payback = (i - 1) + (-cum[i - 1]) / (cum[i] - cum[i - 1]); break; }
    }

    calc.payback.textContent = payback <= YEARS ? payback.toFixed(1) + ' years' : 'over 25 years';
    calc.kw.textContent = (kw >= 100 ? Math.round(kw) : kw.toFixed(1)) + ' kW';
    calc.save.textContent = inr(saveMonth);
    calc.net.textContent = inr(cum[YEARS]);
    calc.cover.textContent = Math.round((genMonth / unitsNeeded) * 100) + '%';
    calc.capex.textContent = inr(capex);
    calc.co2.textContent = (genMonth * 12 * GRID_CO2 / 1000).toFixed(0) + ' tonnes';
    calc.limit.textContent = roofKw < needKw
      ? 'Your roof sets the plant size here. The rest of your bill stays with the grid.'
      : 'The plant is sized to your bill. Some roof area is left over.';
    drawChart(cum, payback, capex);
  }
  [calc.bill, calc.roof, calc.tariff].forEach((i) => i.addEventListener('input', runCalc));
  runCalc();

  /* ---------- 3b. Ask Dhoop assistant (scripted demo, sample data) ---------- */
  const aFeed = $('#aFeed'), aChips = $('#aChips'), aStatus = $('#aStatus');
  const aForm = $('#aForm'), aInput = $('#aInput');
  const sleep = (ms) => new Promise((res) => setTimeout(res, reduceMotion ? 0 : ms));
  const aMark = '<svg viewBox="0 0 32 32" aria-hidden="true"><rect width="32" height="32" rx="7" fill="#0B2A6F"/><path d="M6 22a10 10 0 0 1 20 0z" fill="#FFC21A"/><path d="M4 25h24" stroke="#fff" stroke-width="2"/></svg>';

  const AQ = [
    {
      chip: 'Why was Tuesday\u2019s output so low?',
      keys: ['tuesday', 'low', 'drop', 'output', 'why', 'dip', 'down', 'fault'],
      steps: ['Reading generation log, last 7 days', 'Comparing with the weather forecast', 'Checking panel strings on every block'],
      answer: 'Tuesday produced 610 kWh against a forecast of 890, which is 31% short. Cloud cover explains about two thirds of the gap. The rest comes from one string of panels on Block C that has run 11% below its neighbours since Tuesday morning. Dust or a loose connector is the usual cause.',
      viz: () => {
        const d = [['Mon', 884], ['Tue', 610], ['Wed', 902], ['Thu', 915], ['Fri', 897], ['Sat', 920], ['Sun', 905]];
        return `<div class="a-viz"><h4>Daily output in kWh, last 7 days</h4><div class="wk" style="--f:${890 / 1000}">${d.map(([n, v]) => `<div class="${v < 700 ? 'low' : ''}"><span class="bw"><i style="--h:${v / 1000 * 100}%"></i></span><span>${n}</span></div>`).join('')}</div><p class="fc-note">Dashed line is the forecast, 890 kWh.</p></div>`;
      },
      act: 'Suggested next step: ask your installer to inspect Block C, string 4.',
      src: ['Generation log', 'Forecast model', 'String monitor']
    },
    {
      chip: 'Who hasn\u2019t settled October\u2019s share?',
      keys: ['settle', 'share', 'owe', 'unpaid', 'pending', 'upi', 'dues', 'paid', 'pay'],
      steps: ['Reading UPI settlements, October', 'Matching payments to flats'],
      answer: 'Nine of 240 flats haven\u2019t settled October\u2019s share yet, which is \u20B93,708 in total. Six have an open UPI request. Three haven\u2019t opened it.',
      viz: () => `<div class="a-viz"><h4>Flats yet to settle</h4><ul class="flats">
        ${[['A-204', 'Request pending'], ['A-310', 'Request pending'], ['B-102', 'Not opened'], ['B-407', 'Request pending'], ['C-209', 'Not opened']].map(([f, s]) => `<li><b>${f}</b><span class="pill ${s === 'Not opened' ? 'nv' : ''}">${s}</span><b>\u20B9412</b></li>`).join('')}
        <li class="more">4 more flats</li></ul></div>`,
      act: 'Suggested next step: send a reminder to all nine flats.',
      src: ['UPI settlements', 'Flat register']
    },
    {
      chip: 'Will solar cover our common-area bill in November?',
      keys: ['november', 'cover', 'common', 'bill', 'forecast', 'next month', 'lift'],
      steps: ['Reading common-area meter history', 'Running November generation forecast'],
      answer: 'Yes, with room to spare. November is forecast to generate 24,600 kWh against 15,000 kWh of common-area use, so solar covers about 164% of it. The surplus is shared across flats as credit.',
      viz: () => `<div class="a-viz"><h4>November forecast, in kWh</h4><div class="cmp">
        <div class="r"><span>Solar output</span><div class="t"><i style="--w:100%"></i></div><b>24,600</b></div>
        <div class="r use"><span>Common-area use</span><div class="t"><i style="--w:${15000 / 24600 * 100}%"></i></div><b>15,000</b></div></div></div>`,
      act: '',
      src: ['Forecast model', 'Meter history']
    },
    {
      chip: 'Draft the AGM note for October',
      keys: ['agm', 'draft', 'note', 'summary', 'report', 'minutes', 'meeting'],
      steps: ['Reading generation log, October', 'Reading savings ledger', 'Reading approvals tracker'],
      answer: 'Here is a draft for the committee to review. It uses the same figures as the answers above.',
      viz: () => `<div class="a-viz a-draft"><span class="a-tag">Draft, not sent</span><b>AGM note, October</b><ul>
        <li>The plant generated 27,400 kWh, worth \u20B92.19 L at the current tariff.</li>
        <li>The common-area bill was covered in full. About \u20B999,000 was shared across 240 flats, \u20B9412 each.</li>
        <li>Nine flats are yet to settle. One string on Block C is being checked after a dip on Tuesday.</li></ul></div>`,
      act: '',
      src: ['Generation log', 'Savings ledger', 'Approvals tracker']
    }
  ];

  let aRun = 0;
  const aBtns = [];
  AQ.forEach((q, i) => {
    const li = document.createElement('li');
    const b = document.createElement('button');
    b.type = 'button'; b.textContent = q.chip;
    b.addEventListener('click', () => askRun(i, q.chip, false));
    li.appendChild(b); aChips.appendChild(li); aBtns.push(b);
  });
  const aBusy = (v) => aBtns.forEach((b) => { b.disabled = v; });

  function aMatch(text) {
    const t = text.toLowerCase(); let best = -1, score = 0;
    AQ.forEach((q, i) => { const s = q.keys.filter((k) => t.includes(k)).length; if (s > score) { score = s; best = i; } });
    return best;
  }

  async function askRun(i, question, instant) {
    const id = ++aRun, q = AQ[i];
    const wait = (ms) => (instant ? Promise.resolve() : sleep(ms));
    aBusy(true); aFeed.innerHTML = ''; aStatus.textContent = '';
    const u = document.createElement('p'); u.className = 'a-user'; u.textContent = question; aFeed.appendChild(u);
    const tr = document.createElement('ul'); tr.className = 'a-trace'; aFeed.appendChild(tr);
    for (const label of q.steps) {
      if (id !== aRun) return;
      const li = document.createElement('li'); li.textContent = label; tr.appendChild(li);
      await wait(480); if (id !== aRun) return;
      li.classList.add('done');
    }
    await wait(200); if (id !== aRun) return;
    const ans = document.createElement('div'); ans.className = 'a-ans';
    ans.innerHTML = `<div class="a-who">${aMark}Dhoop</div><p class="a-copy"></p>`;
    aFeed.appendChild(ans);
    const copy = $('.a-copy', ans);
    const spans = q.answer.split(' ').map((w) => { const s = document.createElement('span'); s.className = 'w'; s.textContent = w + ' '; copy.appendChild(s); return s; });
    for (const s of spans) { if (id !== aRun) return; s.classList.add('in'); await wait(26); }
    if (id !== aRun) return;
    const holder = document.createElement('div'); holder.innerHTML = q.viz();
    const viz = holder.firstElementChild; ans.appendChild(viz);
    await wait(60); viz.classList.add('a-grown'); await wait(300);
    if (q.act) { const a = document.createElement('p'); a.className = 'a-act'; a.textContent = q.act; ans.appendChild(a); }
    const src = document.createElement('div'); src.className = 'a-src';
    src.innerHTML = 'Sources ' + q.src.map((s) => `<span class="c">${s}</span>`).join('');
    ans.appendChild(src);
    aStatus.textContent = q.answer;
    aBusy(false);
  }

  aForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = aInput.value.trim();
    if (!text) { aInput.focus(); return; }
    aInput.value = '';
    const i = aMatch(text);
    if (i === -1) {
      aRun++; aBusy(false); aFeed.innerHTML = '';
      const u = document.createElement('p'); u.className = 'a-user'; u.textContent = text; aFeed.appendChild(u);
      const p = document.createElement('p'); p.className = 'a-empty';
      p.textContent = 'This demo only knows four sample questions, so pick one from the list. The real product answers from your own roof data, and says so when it can\u2019t.';
      aFeed.appendChild(p); aStatus.textContent = p.textContent;
      return;
    }
    askRun(i, text, false);
  });
  askRun(0, AQ[0].chip, true);

  /* ---------- 4. Pricing toggle ---------- */
  const billBtns = $$('.toggle button');
  const amts = $$('.amt');
  const notes = $$('.bill-note');
  const pers = $$('.price .per');
  const rupee = (n) => '₹' + n.toLocaleString('en-IN');

  function setBilling(mode) {
    billBtns.forEach((b) => {
      const on = b.dataset.bill === mode;
      b.classList.toggle('on', on);
      b.setAttribute('aria-pressed', String(on));
    });
    const planCards = $$('.plan');
    planCards.forEach((card) => {
      const amt = $('.amt', card);
      if (!amt) return;
      const base = +amt.dataset.price;
      const note = $('.bill-note', card);
      const per = $('.per', card);
      if (mode === 'year') {
        amt.textContent = rupee(Math.round(base * 10 / 12 / 10) * 10);
        note.textContent = 'Billed ' + rupee(base * 10) + ' once a year';
      } else {
        amt.textContent = rupee(base);
        note.innerHTML = '&nbsp;';
      }
      per.textContent = 'a month';
    });
  }
  billBtns.forEach((b) => b.addEventListener('click', () => setBilling(b.dataset.bill)));

  /* ---------- 5. Plan buttons pre-select the plan in the form ---------- */
  const planSelect = $('#fPlan');
  $$('a[data-plan]').forEach((a) => {
    a.addEventListener('click', () => {
      if (a.dataset.plan) planSelect.value = a.dataset.plan;
      if (a.getAttribute('href') === '#contact') {
        setTimeout(() => { if (!$('#demoForm').hidden) $('#fName').focus({ preventScroll: true }); }, reduceMotion ? 0 : 700);
      }
    });
  });

  /* ---------- 6. Demo form ---------- */
  const form = $('#demoForm');
  const success = $('#success');

  const rules = {
    fName: { err: 'eName', check: (v) => v.trim().length >= 2, msg: 'Enter your name.' },
    fEmail: {
      err: 'eEmail',
      check: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()),
      msg: 'Enter an email address like name@society.in.'
    },
    fOrg: { err: 'eOrg', check: (v) => v.trim().length >= 2, msg: 'Enter your society or organisation.' },
    fPhone: {
      err: 'ePhone',
      check: (v) => {
        const d = v.replace(/[\s-]/g, '').replace(/^(\+91|0)/, '');
        return d === '' || /^[6-9]\d{9}$/.test(d);
      },
      msg: 'Enter a 10-digit mobile number that starts with 6, 7, 8 or 9, or leave it empty.'
    },
    fFlats: { err: 'eFlats', check: (v) => v !== '', msg: 'Choose how many flats you have.' }
  };

  function validateField(id) {
    const input = document.getElementById(id);
    const rule = rules[id];
    const ok = rule.check(input.value);
    const field = input.closest('.field');
    const errEl = document.getElementById(rule.err);
    field.classList.toggle('invalid', !ok);
    input.setAttribute('aria-invalid', String(!ok));
    errEl.textContent = ok ? '' : rule.msg;
    return ok;
  }

  Object.keys(rules).forEach((id) => {
    const input = document.getElementById(id);
    input.addEventListener('blur', () => validateField(id));
    input.addEventListener('input', () => { if (input.closest('.field').classList.contains('invalid')) validateField(id); });
    input.addEventListener('change', () => { if (input.tagName === 'SELECT') validateField(id); });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const results = Object.keys(rules).map((id) => [id, validateField(id)]);
    const firstBad = results.find((r) => !r[1]);
    if (firstBad) { document.getElementById(firstBad[0]).focus(); return; }

    const first = $('#fName').value.trim().split(/\s+/)[0];
    $('#successText').textContent =
      'Thanks, ' + first + '. We would email ' + $('#fEmail').value.trim() +
      ' within one working day to fix a time for ' + $('#fOrg').value.trim() +
      '. This is a demo form, so nothing was actually sent.';
    form.hidden = true;
    success.hidden = false;
    success.focus();
  });

  $('#again').addEventListener('click', () => {
    form.reset();
    $$('.field.invalid').forEach((f) => f.classList.remove('invalid'));
    $$('.err').forEach((n) => { n.textContent = ''; });
    success.hidden = true;
    form.hidden = false;
    $('#fName').focus();
  });
})();
