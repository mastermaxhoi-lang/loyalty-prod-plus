/* Общий JS прототипа «прод + доработки». Шапка, футер, панель прототипа, табы, FAQ, модалки, формы, таймеры, поиск с AI-помощником. */
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const store = { get(k, d) { try { const v = localStorage.getItem('proto-' + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem('proto-' + k, JSON.stringify(v)); } catch (e) {} } };
  window.$ = $; window.$$ = $$;

  // ---------- форматирование ----------
  const nf = n => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  const plural = (n, a, b, c) => { n = Math.abs(n) % 100; const n1 = n % 10; if (n > 10 && n < 20) return c; if (n1 > 1 && n1 < 5) return b; if (n1 === 1) return a; return c; };
  window.fmt = { nf, plural };

  // ---------- доработки: свич на каждую ----------
  // У каждой доработки в PAGE.dr есть key (и needs, если она видна только вместе с другой).
  // Состояние страницы в proto-f-<страница> = {key: true/false}. Общий тумблер «Доработки» пишет proto-dr
  // и сбрасывает постраничные состояния всех страниц. Разметка: data-f="key" прячется, когда доработка выключена;
  // data-asis-f="key" (вид прода) виден, только когда выключена; data-mk="key" снимает метку, когда выключена.
  const PG = window.PAGE || {}; const DR = (PG.dr || []).filter(d => d.key); const KEYS = DR.map(d => d.key);
  const F = {};
  (() => { const all = store.get('dr', true), saved = store.get('f-' + PG.id, null) || {}; KEYS.forEach(k => { F[k] = k in saved ? !!saved[k] : all; }); })();
  const anyOn = () => KEYS.length ? KEYS.some(k => F[k]) : store.get('dr', true);
  const applyF = () => { KEYS.forEach(k => document.body.classList.toggle('off-' + k, !F[k])); document.body.classList.toggle('dr-off', !anyOn()); };
  const fire = k => document.dispatchEvent(new CustomEvent('drchange', { detail: { key: k } }));
  window.proto = {
    keys: KEYS,
    on: k => (k in F ? F[k] : anyOn()),
    set(k, v) { if (!(k in F)) return; F[k] = !!v; store.set('f-' + PG.id, F); applyF(); fire(k); },
    all(v) { KEYS.forEach(k => { F[k] = !!v; }); store.set('dr', !!v); try { Object.keys(localStorage).filter(x => x.indexOf('proto-f-') === 0).forEach(x => localStorage.removeItem(x)); } catch (e) {} applyF(); fire('*'); },
  };
  { const st = document.createElement('style'); st.textContent = KEYS.map(k => `body.off-${k} [data-f~="${k}"],body:not(.off-${k}) [data-asis-f~="${k}"]{display:none!important}body.off-${k} [data-mk~="${k}"]{outline:0!important}body.off-${k} [data-mk~="${k}"]::after{display:none!important}`).join(''); document.head.appendChild(st); }
  if (document.body) applyF(); else document.addEventListener('DOMContentLoaded', applyF);

  // ---------- иконки ----------
  const ICON = {
    logo: '<svg width="28" height="44" viewBox="0 0 28 44" aria-label="Альфа-Банк"><path fill="#EF3124" d="M0 38h28v6H0z"/><path fill="#EF3124" d="M11.2 0h5.6L27 31h-6.4l-2.1-6.6H9.4L7.3 31H1L11.2 0zm-.2 18.6h6l-3-9.7-3 9.7z"/></svg>',
    search: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5 21 21" stroke-linecap="round"/><path d="M18.5 1.8l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z" fill="#fff" stroke="none"/></svg>',
    chev: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    chevR: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="m9 6 6 6-6 6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    x: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M6 6l12 12M18 6 6 18" stroke-linecap="round"/></svg>',
    shield: '<svg width="24" height="24" viewBox="0 0 24 24"><path fill="#B7B8BE" d="M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5l-8-3z"/><path fill="#fff" d="M11.2 7h1.6l3 9h-1.9l-.6-2h-2.6l-.6 2H8.2l3-9zm-.1 5.6h1.8l-.9-3-.9 3z"/></svg>',
    ppl: '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7z"/></svg>',
    loc: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><path d="M3 11 21 3l-8 18-2-8z"/></svg>',
  };
  window.ICON = ICON;

  // ---------- шапка ----------
  function header() {
    const el = $('#hdr'); if (!el) return;
    if (el.dataset.solo !== undefined) { el.outerHTML = `<header class="hdr solo"><div class="wrap"><a class="logo" href="главная.html">${ICON.logo}</a></div></header>`; return; }
    el.outerHTML = `<header class="hdr"><div class="wrap">
      <a class="logo" href="https://alfabank.ru/sme/" target="_blank" rel="noopener">${ICON.logo}</a>
      <nav class="nav"><a href="https://alfabank.ru/" target="_blank" rel="noopener">Частным лицам</a><a class="cur" href="https://alfabank.ru/sme/" target="_blank" rel="noopener">Малому бизнесу и ИП</a><a href="https://alfabank.ru/corporate/" target="_blank" rel="noopener">Среднему и крупному бизнесу</a></nav>
      <button class="search-btn" id="searchBtn" aria-label="Поиск по сайту" data-dr-search>${ICON.search}</button>
      <div class="hdr-r"><a href="главная.html" title="Альфа-Выгодно для бизнеса"><img class="heart" src="assets/img/heart.gif" alt=""></a><button class="btn btn-s btn-glass" onclick="toast('Онлайн-заявки: на проде открывается боковая панель со списком заявок')">Онлайн-заявки</button><button class="btn btn-s btn-red" onclick="toast('Вход в интернет-банк на прототипе не работает')">Войти</button></div>
    </div></header>`;
  }

  // ---------- футер ----------
  function footer() {
    const el = $('#ftr'); if (!el || !window.FOOTER) return;
    let crumbs = [];
    try { crumbs = JSON.parse(el.dataset.crumbs || '[]'); } catch (e) {}
    const F = window.FOOTER;
    const item = i => i.k === 'cap' ? `<div class="cap">${i.t}</div>` : i.k === 'lbl' ? `<div class="lbl">${i.t}</div>` : `<a class="lnk" href="${i.a || '#'}" target="_blank" rel="noopener">${i.t}</a>`;
    const mapItem = i => i.k === 'cap' ? `<div class="cap">${i.t}</div>` : i.k === 'grp' ? `<a class="grp" href="${abs(i.a)}" target="_blank" rel="noopener">${i.t}</a>` : `<a class="sub" href="${abs(i.a)}" target="_blank" rel="noopener">${i.t}</a>`;
    function abs(a) { return !a ? '#' : a.startsWith('/') ? 'https://alfabank.ru' + a : a; }
    el.outerHTML = `<footer class="ftr"><div class="wrap">
      ${crumbs.length ? `<div class="crumbs">${crumbs.map((c, i) => (i ? ICON.chevR : '') + (c[1] ? `<a href="${c[1]}">${c[0]}</a>` : `<span>${c[0]}</span>`)).join('')}</div>` : ''}
      <div class="cols">${F.top.map(c => `<div>${c.map(item).join('')}</div>`).join('')}</div>
      <div class="cols row2">
        <div><div class="cap">Местоположение</div><div class="icons" style="font-size:16px;font-weight:500">${ICON.loc} Москва</div></div>
        <div><div class="cap">Скачать приложение</div><a class="icons" href="https://alfabank.ru/sme/rko/abm/" target="_blank" rel="noopener"><img src="assets/img/f-app.png" alt="">Альфа‑Бизнес</a></div>
        <div><div class="cap">Для иностранных клиентов</div><div class="icons"><img src="assets/img/f-cn.png" alt="">中文 <img src="assets/img/f-en.png" alt="" style="margin-left:12px">Eng</div></div>
        <div><div class="cap">Наши соцсети</div><div class="icons"><img src="assets/img/f-tg.png" alt="Telegram"><img src="assets/img/f-vk.png" alt="ВКонтакте"></div></div>
      </div>
      <hr>
      <div class="cols map">${F.map.map(c => `<div>${c.map(mapItem).join('')}</div>`).join('')}</div>
      <div class="legal"><p>© 2001-2026. АО «Альфа-Банк», официальный сайт. Генеральная лицензия Банка России № 1326 от 16 января 2015 г. <a href="https://alfabank.ru/make-money/strahovanie_vkladov/" target="_blank" rel="noopener">АО «Альфа-Банк» является участником системы обязательного страхования вкладов.</a> <a href="https://alfabank.ru/about/annual_report/riskinfo/" target="_blank" rel="noopener">Информация о процентных ставках по договорам банковского вклада с физическими лицами.</a> <a href="http://www.e-disclosure.ru/portal/company.aspx?id=1389" target="_blank" rel="noopener">Центр раскрытия корпоративной информации.</a> <a href="https://alfabank.ru/about/legal/" target="_blank" rel="noopener">Раскрытие информации профессионального участника рынка ценных бумаг.</a> <a href="https://alfabank.ru/about/shareholders/" target="_blank" rel="noopener">Информация о лицах, под контролем либо значительным влиянием которых находится Банк.</a> Ул. Каланчевская, 27, Москва, 107078.</p>
      <p>АО «Альфа‑Банк» является оператором по обработке персональных данных. Подробная информация о принимаемых мерах при обработке персональных данных отражена <a href="https://alfabank.ru/about/pdn/" target="_blank" rel="noopener">в Политике в отношении обработки персональных данных.</a></p>
      <p><a href="https://alfabank.ru/about/cookies/" target="_blank" rel="noopener">АО «Альфа‑Банк» использует файлы «cookie» для улучшения пользовательского опыта</a> на веб-сайте, в том числе с использованием метрических программ Альфа‑Метрика, Яндекс.Метрика. Вы можете ограничить их использование в своём браузере.</p>
      <p><a href="https://alfabank.ru/about/rttech/" target="_blank" rel="noopener">На информационном ресурсе применяются рекомендательные технологии.</a></p></div>
    </div></footer>`;
  }

  // ---------- тост ----------
  window.toast = function (t) { let el = $('#toast'); if (!el) { el = document.createElement('div'); el.id = 'toast'; el.className = 'toast'; document.body.appendChild(el); } el.textContent = t; el.classList.add('on'); clearTimeout(el._t); el._t = setTimeout(() => el.classList.remove('on'), 2600); };

  // ---------- табы: <div class="tabs" data-tabs="grp"><button data-tab="a"> ... <div data-pane="grp:a"> ----------
  function tabs() {
    document.addEventListener('click', e => {
      const b = e.target.closest('[data-tabs] [data-tab]'); if (!b) return;
      const grp = b.closest('[data-tabs]').dataset.tabs;
      $$(`[data-tabs="${grp}"] [data-tab]`).forEach(x => x.classList.toggle('on', x === b));
      $$(`[data-pane^="${grp}:"]`).forEach(p => p.hidden = p.dataset.pane !== grp + ':' + b.dataset.tab);
      document.dispatchEvent(new CustomEvent('tab', { detail: { grp, tab: b.dataset.tab } }));
    });
  }

  // ---------- FAQ ----------
  function acc() {
    $$('.acc-q').forEach(q => { if (!q.querySelector('svg')) q.insertAdjacentHTML('beforeend', ICON.chev); });
    document.addEventListener('click', e => { const q = e.target.closest('.acc-q'); if (q) q.parentElement.classList.toggle('open'); });
  }

  // ---------- модалки: data-open="id" ----------
  function modals() {
    $$('.modal').forEach(m => { if (!m.querySelector('.x')) m.insertAdjacentHTML('afterbegin', `<button class="x" aria-label="Закрыть">${ICON.x}</button>`); });
    document.addEventListener('click', e => {
      const o = e.target.closest('[data-open]'); if (o) { e.preventDefault(); const m = $('#' + o.dataset.open); if (m) m.classList.add('open'); return; }
      if (e.target.closest('.modal .x') || e.target.classList.contains('modal-bg')) e.target.closest('.modal-bg').classList.remove('open');
      const go = e.target.closest('.modal [href="#form"]'); if (go) go.closest('.modal-bg').classList.remove('open');
    });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') { $$('.modal-bg.open, .srch-bg.open').forEach(m => m.classList.remove('open')); $('.drawer') && $('.drawer').classList.remove('open'); } });
  }

  // ---------- форма заявки: маска телефона ----------
  function forms() {
    $$('input[type=tel]').forEach(inp => {
      const fmtPhone = v => { let d = v.replace(/\D/g, ''); if (d.startsWith('7') || d.startsWith('8')) d = d.slice(1); d = d.slice(0, 10); let r = '+7 ('; r += d.slice(0, 3); if (d.length >= 3) r += ') '; r += d.slice(3, 6); if (d.length >= 6) r += '-'; r += d.slice(6, 8); if (d.length >= 8) r += '-'; r += d.slice(8, 10); return r; };
      inp.addEventListener('focus', () => { if (!inp.value) inp.value = '+7 ('; });
      inp.addEventListener('input', () => { inp.value = fmtPhone(inp.value); inp.closest('.field').classList.remove('err'); const er = inp.closest('form').querySelector('.field-err'); if (er) er.textContent = ''; });
    });
    document.addEventListener('submit', e => {
      const f = e.target.closest('form.lead'); if (!f) return; e.preventDefault();
      const inp = f.querySelector('input[type=tel]'); const d = inp.value.replace(/\D/g, '');
      if (d.length < 11) { inp.closest('.field').classList.add('err'); f.querySelector('.field-err').textContent = 'Введите номер телефона полностью'; return; }
      const mode = e.submitter && e.submitter.value === 'call' ? 'call' : 'online';
      f.innerHTML = `<div class="form-ok"><div class="ic">✓</div><div class="h4">${mode === 'call' ? 'Перезвоним в ближайшее время' : 'Заявка принята'}</div><p class="mut" style="margin-top:8px">Прототип: заявка никуда не отправлена. На проде «Заполнить онлайн» открывает анкету открытия счёта, «Перезвонить мне» создаёт заявку RKO_CALLBACK.</p></div>`;
    });
  }
  window.formHTML = function (submitText = 'Заполнить онлайн') {
    return `<form class="form-card lead" novalidate><div class="h3">Заявка на открытие счёта для бизнеса</div>
      <label class="field"><span>Телефон</span><input type="tel" inputmode="tel" autocomplete="tel" aria-label="Телефон"></label><div class="field-err"></div>
      <div class="form-btns"><button class="btn btn-m btn-grey" value="call">Перезвонить мне</button><button class="btn btn-m btn-red" value="online">${submitText}</button></div>
      <div class="safe">${ICON.shield}Мы гарантируем безопасность и сохранность ваших данных</div>
      <p class="agree">Нажимая кнопку «${submitText}» или «Перезвонить мне», вы подтверждаете, что согласны на <a href="#" onclick="event.preventDefault();toast('На проде открывается текст согласия на обработку персональных данных')">обработку персональных данных</a></p></form>`;
  };

  // ---------- таймеры: data-timer="ISO" data-fmt="words|clock|days" ----------
  function timers() {
    const tick = () => $$('[data-timer]').forEach(el => {
      let ms = new Date(el.dataset.timer) - Date.now(); if (ms < 0) { el.textContent = 'Акция завершена'; return; }
      const d = Math.floor(ms / 864e5), h = Math.floor(ms % 864e5 / 36e5), m = Math.floor(ms % 36e5 / 6e4), s = Math.floor(ms % 6e4 / 1e3);
      const p = n => String(n).padStart(2, '0');
      if (el.dataset.fmt === 'clock') el.textContent = `${p(d)}:${p(h)}:${p(m)}:${p(s)}`;
      else el.textContent = (d ? `${d} ${plural(d, 'день', 'дня', 'дней')} ` : '') + `${h} ${plural(h, 'час', 'часа', 'часов')} ${m} ${plural(m, 'минута', 'минуты', 'минут')}`;
    });
    tick(); setInterval(tick, 1000);
  }

  // ---------- панель прототипа ----------
  function demoBar() {
    const P = PG; const pages = [['главная', 'Главная'], ['витрина', 'Витрина'], ['альфа-пятница', 'Альфа-Пятница'], ['оффер', 'Оффер']];
    const marks = store.get('marks', false), coll = store.get('coll', matchMedia('(max-width: 768px)').matches);
    document.body.classList.toggle('marks', marks);
    const nameOf = k => (DR.find(d => d.key === k) || {}).name || k;
    const shortOf = k => nameOf(k).split(':')[0];
    const sw = (k, txt = '') => `<label class="sw" data-f-sw="${k}" title="Включить или выключить эту доработку"><i></i>${txt}</label>`;
    const bar = document.createElement('div'); bar.className = 'demo' + (coll ? ' collapsed' : '');
    bar.innerHTML = `<span class="ttl">Прототип</span>
      <span class="pg">${pages.map(p => `<a href="${p[0]}.html" class="${P.id === p[0] ? 'on' : ''}">${p[1]}</a>`).join('')}</span>
      ${KEYS.length ? '<label class="sw red" data-sw="dr" title="Все доработки страницы разом"><i></i>Доработки</label>' : '<span class="more" style="text-decoration:none">доработок нет</span>'}
      ${KEYS.length > 1 ? `<button class="fl" data-fl title="Включать доработки по одной">по одной <span class="n"></span></button>` : ''}
      <label class="sw ${marks ? 'on' : ''}" data-sw="marks"><i></i>Метки</label>
      <a href="#" class="more" data-drawer>Что внутри</a>
      <button class="min" title="Свернуть панель">${coll ? '▸' : '▾'}</button>
      ${KEYS.length > 1 ? `<div class="fpop" hidden><div class="fh"><b>Доработки по одной</b><span><button data-all="1">все</button><button data-all="0">как на проде</button></span></div>
        ${DR.map((d, i) => `<div class="fr">${sw(d.key, `<span class="t"><span class="chip-dr">${i + 1}</span>${d.name}</span>`)}${d.needs ? `<span class="dep" data-dep="${d.needs}">видна только вместе с «${shortOf(d.needs)}»</span>` : ''}${d.link ? `<span class="dep dep2">${d.link}</span>` : ''}</div>`).join('')}</div>` : ''}`;
    document.body.appendChild(bar);
    const pop = $('.fpop', bar);
    const dw = document.createElement('aside'); dw.className = 'drawer';
    dw.innerHTML = `<div class="dh"><div><div class="h4">${P.title || ''}: доработки в работе</div><p class="s mut" style="margin-top:6px">Основа: боевая страница, снята ${P.snap || '18.11.2026'} (${P.url || ''}). Поверх неё доработки из BRD и макетов. Каждую можно выключить отдельно, выключено всё = как на проде. Включите «Метки», чтобы видеть, где каждая.</p></div><button class="x" aria-label="Закрыть">${ICON.x}</button></div>
      <div class="db">${DR.length ? '' : '<div class="it"><b>Доработок в работе на этой странице нет</b></div>'}${DR.map((d, i) => `<div class="it"><div class="ih"><b><span class="chip-dr">${i + 1}</span>${d.name}</b>${sw(d.key)}</div>${d.needs ? `<p class="dep" data-dep="${d.needs}">Видна только вместе с «${shortOf(d.needs)}», она сейчас выключена.</p>` : ''}${d.link ? `<p class="dep dep2">${d.link}</p>` : ''}<p class="s" style="margin-top:6px">${d.what}</p><p class="src">${d.src}</p>${d.cond ? `<p class="cond">Условно: ${d.cond}</p>` : ''}${d.sel ? `<a href="#" class="go" data-go="${d.sel.replace(/"/g, '&quot;')}" data-k="${d.key}">Показать на странице →</a>` : ''}</div>`).join('')}
      ${(P.notes || []).length ? `<div class="it"><b>Что не вошло и почему</b>${P.notes.map(n => `<p class="src">${n}</p>`).join('')}</div>` : ''}</div>`;
    document.body.appendChild(dw);
    const sync = () => {
      $$('[data-sw="dr"]').forEach(x => x.classList.toggle('on', anyOn()));
      const c = $('[data-fl] .n', bar); if (c) c.textContent = `${KEYS.filter(k => F[k]).length}/${KEYS.length}`;
      $$('[data-f-sw]').forEach(x => x.classList.toggle('on', !!F[x.dataset.fSw]));
      $$('[data-dep]').forEach(x => { x.hidden = !!F[x.dataset.dep]; });
    };
    sync(); document.addEventListener('drchange', sync);
    document.addEventListener('click', e => {
      const fsw = e.target.closest('[data-f-sw]');
      if (fsw) { e.preventDefault(); const k = fsw.dataset.fSw; window.proto.set(k, !F[k]); toast(`«${nameOf(k)}»: ${F[k] ? 'включена' : 'выключена, как на проде'}`); return; }
      if (pop && !pop.hidden && !e.target.closest('.demo')) pop.hidden = true;
    });
    bar.addEventListener('click', e => {
      const s = e.target.closest('[data-sw]');
      if (s) { e.preventDefault(); const k = s.dataset.sw;
        if (k === 'dr') { const v = !anyOn(); window.proto.all(v); toast(v ? 'Все доработки включены' : 'Как на проде: снимки 18.11, оффер по скринам 22.11'); }
        else { const v = !s.classList.contains('on'); s.classList.toggle('on', v); store.set('marks', v); document.body.classList.toggle('marks', v); toast(v ? 'Метки доработок показаны' : 'Метки скрыты'); } }
      if (e.target.closest('[data-fl]')) pop.hidden = !pop.hidden;
      const al = e.target.closest('[data-all]'); if (al) { const v = al.dataset.all === '1'; window.proto.all(v); toast(v ? 'Все доработки включены' : 'Как на проде: снимки 18.11, оффер по скринам 22.11'); }
      if (e.target.closest('[data-drawer]')) { e.preventDefault(); if (pop) pop.hidden = true; dw.classList.add('open'); }
      if (e.target.closest('.min')) { const c = !bar.classList.contains('collapsed'); bar.classList.toggle('collapsed', c); store.set('coll', c); e.target.closest('.min').textContent = c ? '▸' : '▾'; }
    });
    dw.addEventListener('click', e => {
      if (e.target.closest('.x')) dw.classList.remove('open');
      const g = e.target.closest('[data-go]'); if (g) { e.preventDefault(); dw.classList.remove('open');
        if (!document.body.classList.contains('marks')) $('[data-sw="marks"]').click();
        const d = DR.find(x => x.key === g.dataset.k); if (d) { for (let k = d.needs; k; k = (DR.find(x => x.key === k) || {}).needs) if (!F[k]) window.proto.set(k, true); if (!F[d.key]) window.proto.set(d.key, true); }
        document.dispatchEvent(new CustomEvent('protofind', { detail: g.dataset.k })); // страница может раскрыть то, чего ещё нет на экране
        const t = $(g.dataset.go); if (t) { if (t.closest('[hidden]')) { const pane = t.closest('[data-pane]'); if (pane) { const [grp, tab] = pane.dataset.pane.split(':'); const b = $(`[data-tabs="${grp}"] [data-tab="${tab}"]`); b && b.click(); } } t.dispatchEvent(new CustomEvent('protogo', { bubbles: true })); (t.closest('.lenta') || t).scrollIntoView({ behavior: 'smooth', block: 'center' }); } }
    });
  }

  // ---------- поиск по сайту / AI-помощник ----------
  function search() {
    const btn = $('#searchBtn'); if (!btn) return;
    btn.setAttribute('data-dr', 'AI-помощник в поиске'); btn.setAttribute('data-mk', 'search');
    btn.addEventListener('click', () => {
      if (!window.proto.keys.includes('search') || !window.proto.on('search')) { window.open('https://alfabank.ru/smart-search/?rp-domain=business', '_blank'); toast('Как на проде: поиск открывается отдельной страницей'); return; }
      openSearch();
    });
  }
  const SECS = ['Весь сайт', 'Бизнес', 'Эквайринг', 'Ипотека', 'Корпорации'];
  function openSearch(q) {
    let bg = $('.srch-bg');
    if (!bg) {
      bg = document.createElement('div'); bg.className = 'srch-bg';
      bg.innerHTML = `<div class="srch" role="dialog" aria-label="Поиск по сайту"><div class="srch-top">
        <div class="srch-in"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#86868A" stroke-width="2"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5 21 21"/></svg><input id="srchQ" placeholder="Спросите про программу лояльности" autocomplete="off"><button class="x" aria-label="Закрыть" style="width:28px;height:28px">${ICON.x}</button></div>
        <div class="srch-secs">${SECS.map(s => `<button data-sec="${s}">${s}</button>`).join('')}<button class="loy on" data-sec="Лояльность">✦ Лояльность</button></div></div>
        <div class="srch-body" id="srchBody"></div></div>`;
      document.body.appendChild(bg);
      bg.addEventListener('click', e => {
        if (e.target === bg || e.target.closest('.srch-in .x')) bg.classList.remove('open');
        const s = e.target.closest('[data-sec]'); if (s) { $$('[data-sec]', bg).forEach(x => x.classList.toggle('on', x === s)); render(); }
        const sg = e.target.closest('[data-q]'); if (sg) { $('#srchQ').value = sg.dataset.q; render(); }
        const r = e.target.closest('.rate button'); if (r) { $$('.rate button', bg).forEach(x => x.classList.remove('on')); r.classList.add('on'); toast('Оценка ответа уходит в POST /feedback/feedbacks (предложение из разбора 17.11)'); }
      });
      $('#srchQ').addEventListener('keydown', e => { if (e.key === 'Enter') render(); });
    }
    bg.classList.add('open'); if (q) $('#srchQ').value = q; render(); setTimeout(() => $('#srchQ').focus(), 50);
  }
  window.openSearch = openSearch;
  const ALL = () => (window.DATA && window.DATA.offers) || [];
  function render() {
    const body = $('#srchBody'); const q = $('#srchQ').value.trim(); const sec = ($('.srch-secs .on') || {}).dataset.sec;
    const sugg = ['альфа выгодно для бизнеса', 'перевод баллов в рубли', 'альфа пятница', 'мое дело', 'реферальная программа'];
    if (sec !== 'Лояльность') { body.innerHTML = `<p class="mut">Раздел «${sec}»: обычная выдача поиска по сайту. В прототипе не подключена.</p><p class="s mut" style="margin-top:8px">По BRD v3.4 раздел «Лояльность» стоит рядом с этими разделами и отвечает только про программу. Вопросы про эквайринг, тарифы и кредиты остаются в «Бизнесе».</p>`; return; }
    if (!q) { body.innerHTML = `<p class="s mut">Частые вопросы из логов поиска (BRD v3.4, «Темы и примеры вопросов»)</p><div class="sugg">${sugg.map(s => `<button data-q="${s}">${s}</button>`).join('')}</div><p class="ai-note">Этап (б) AI-помощника: раздел «Лояльность» в поиске по сайту и прописанные сценарии ответов по частым запросам. Срок по BRD: I квартал 2027 после согласования легала, комплаенса и ИБ. Ответы в прототипе собраны из текстов страниц Лояльности на 18.11.2026.</p>`; return; }
    body.innerHTML = answer(q);
  }
  function mini(list) { return list.length ? `<p class="s" style="margin-top:16px;font-weight:700">Подходящие предложения <span class="chip-dr" style="margin-left:4px">этап (в)</span></p><div class="mini-vit">${list.slice(0, 3).map(o => `<a href="оффер.html?id=${o.id}"><img src="${o.logo}" alt=""><span><b>${o.name}</b><br>${o.label} ${o.value}</span></a>`).join('')}</div>` : ''; }
  function wrapAns(txt, b1, b2, src, extra = '') {
    return `<div class="ans"><div class="who"><span class="av">А</span>AI-помощник · раздел «Лояльность»</div><div class="txt">${txt}</div>
      <div class="branches"><div class="branch"><b>Если у вас ещё нет счёта</b>${b1}</div><div class="branch"><b>Если вы уже клиент Альфа-Бизнес</b>${b2}</div></div>
      ${extra}<a class="src-l" href="${src[1]}">Источник: ${src[0]} →</a>
      <div class="rate">Ответ помог? <button>Да 👍</button><button>Нет 👎</button></div>
      <p class="ai-note">Ответ сформирован помощником по страницам программы и может быть неполным. Условия акций и предложений смотрите в правилах.</p></div>`;
  }
  const OPEN = '<a href="главная.html#form">Открыть счёт →</a>', NIB = '<a href="https://link.alfabank.ru/partner-offers?utm_medium=site_main" target="_blank" rel="noopener">Открыть Альфа-Выгодно в интернет-банке →</a>';
  function answer(q) {
    const s = q.toLowerCase().replace(/ё/g, 'е');
    const hit = ALL().filter(o => { const n = o.name.toLowerCase().replace(/ё/g, 'е').replace(/\s/g, ' '); return s.length > 2 && (n.includes(s) || s.includes(n.split(' ')[0]) && n.split(' ')[0].length > 3); });
    if (/пятниц|недел[яи] выгоды|акци/.test(s)) return wrapAns('<p>Альфа-Пятница: еженедельная акция для бизнеса, кэшбэк баллами до 100% у партнёра недели.</p><p><b>Сейчас:</b> кэшбэк до 3000 баллов в Авито Путешествиях. 20 ноября оплатите бронирование бизнес-картой Альфа-Банка.</p><p><b>Дальше:</b> 23–27 ноября «Неделя выгоды», 4 декабря Лента PRO, 11 декабря следующая акция.</p>', '<p>Откройте счёт и бизнес-карту заранее, чтобы успеть к акции.</p>' + OPEN, '<p>Перейдите в Альфа-Выгодно в приложении или интернет-банке и выполните условия участия.</p>' + NIB, ['страница Альфа-Пятницы', 'альфа-пятница.html']);
    if (/реферал|рекоменд|друг|приглас/.test(s)) return wrapAns('<p>Реферальная программа: рекомендуйте друзьям продукты банка и получайте баллы и другие скидки от банка. На Главной: до 8000 баллов за каждую рекомендацию.</p>', '<p>Рекомендовать может участник программы, то есть клиент с расчётным счётом.</p>' + OPEN, '<p>Ссылка для друзей и условия в разделе Альфа-Выгодно.</p>' + NIB, ['Главная, «Как заработать баллы»', 'главная.html#earn']);
    if (hit.length || /партнер|предложен|скидк|промокод|магазин/.test(s)) { const list = hit.length ? hit : ALL().filter(o => o.top); return wrapAns(`<p>${hit.length ? `Нашёл в каталоге: ${hit.slice(0, 3).map(o => `<b>${o.name}</b>, ${o.label.toLowerCase()} ${o.value}`).join('; ')}.` : 'В каталоге партнёров 105 предложений: скидки, кэшбэк баллами и бесплатные периоды на сервисы для бизнеса.'}</p><p>Предложения доступны участникам программы, доступ к каталогу бесплатный.</p>`, '<p>Сначала откройте расчётный счёт, потом предложение активируется в Альфа-Выгодно.</p>' + OPEN, '<p>Откройте карточку предложения и следуйте инструкции: сайт партнёра, промокод или заявка.</p>' + NIB, ['Предложения партнёров', 'витрина.html'], mini(list)); }
    if (/балл|кэшбэк|кешбэк|начисл|потрат|рубл|курс|обмен|перевод/.test(s)) return wrapAns('<p>1 балл = 1 ₽. Баллы можно обменять на рубли (деньги придут на расчётный счёт), на предложения банка и партнёров или перевести в фонд «Линия жизни».</p><p>Кэшбэк начисляется 10 числа следующего месяца: за ноябрь придёт 10 декабря. Сколько баллов можно обменять в месяц, зависит от уровня: 20 000, 30 000 или 50 000 ₽.</p>', '<p>Баллы копят клиенты с расчётным счётом.</p>' + OPEN, '<p>Баланс и обмен на странице Альфа-Выгодно.</p>' + NIB, ['Главная, «Полезно знать»', 'главная.html#faq']);
    if (/программ|выгодно|лояльн|участ|правил|уров/.test(s)) return wrapAns('<p>Альфа-Выгодно для бизнеса: программа лояльности для клиентов Альфа-Банка с расчётным счётом. Баллы за действия по счёту, 3 уровня привилегий, 1 балл = 1 ₽.</p><p>Подробные правила: <a href="https://alfabank.servicecdn.ru/site-upload/35/e6/2245/Pravila_PL-2.pdf" target="_blank" rel="noopener">PDF на сайте банка</a>.</p>', '<p>Откройте расчётный счёт для бизнеса в рублях. Участие начинается после открытия.</p>' + OPEN, '<p>Перейдите на страницу программы в интернет-банке, участие уже доступно.</p>' + NIB, ['Главная, «Как стать участником»', 'главная.html#faq']);
    return `<div class="ans"><div class="who"><span class="av">А</span>AI-помощник · раздел «Лояльность»</div><p>Не нашёл ответа в разделе «Лояльность». Если вопрос про эквайринг, тарифы или кредиты, поищите в разделе «Бизнес».</p><div class="sugg"><button data-sec="Бизнес">Искать в «Бизнесе»</button><button data-q="альфа выгодно для бизнеса">Что за программа</button></div><p class="ai-note">Ответ «не нашли» уходит в разметку отдельным событием (BRD v3.4, «Список событий»).</p></div>`;
  }

  // ---------- гипотезы мастер-плана, общие для нескольких страниц (ключи client, voc, nav) ----------
  // 17. «Уже клиент, сразу в ЛК»: кнопка заявки сначала спрашивает, есть ли счёт. Самовыбор, без ИНН:
  // ответ по введённому ИНН раскрыл бы, обслуживается ли чужая компания в Альфе (разнос оппонента 09.11).
  function clientFork() {
    if (!KEYS.includes('client')) return;
    const fk = PG.fork || {};
    const bg = document.createElement('div'); bg.className = 'modal-bg'; bg.id = 'm-fork';
    bg.innerHTML = `<div class="modal fork"><h3 class="h3">У вас уже есть счёт в Альфа‑Банке?</h3>
      <div class="fork-opts"><a class="fopt" href="${fk.link || 'https://link.alfabank.ru/partner-offers?utm_medium=site_main'}" target="_blank" rel="noopener" data-fork="yes"><b>Да, счёт уже есть</b><span>${fk.yes || 'Откроем Альфа‑Выгодно в интернет-банке, заявка не нужна'}</span></a>
      <a class="fopt" href="#form" data-fork="no"><b>Нет, я новый клиент</b><span>Заполните заявку на счёт для бизнеса</span></a></div>
      <p class="s mut" style="margin-top:16px">Прототип: сейчас на проде действующий клиент попадает в ту же анкету, банк заводит ему заявку, ТМ звонит.</p></div>`;
    document.body.appendChild(bg);
    // отдельной кнопки для клиентов нет: одна кнопка заявки, выбор «счёт есть / новый клиент» в этом окне (Максим 21.11)
    document.addEventListener('click', e => {
      const a = e.target.closest('a[href="#form"]:not([data-nofork])'); // data-nofork: ссылка прямо на анкету
      if (!a || a.closest('.modal, .demo, .drawer') || !window.proto.on('client')) return;
      e.preventDefault(); e.stopPropagation(); bg.classList.add('open');
    }, true);
    bg.addEventListener('click', e => { if (e.target.closest('[data-fork="yes"]')) { bg.classList.remove('open'); toast('Уже клиент: в бою ведёт в интернет-банк, в прототипе открыта боевая ссылка'); } });
  }

  // 26. Опросник VOC: кнопка оценки как на проде Пятницы, после первого действия на странице сама задаёт вопрос
  function voc() {
    if (!KEYS.includes('voc')) return;
    const el = document.createElement('div'); el.className = 'fb voc no-pos'; el.dataset.f = 'voc';
    el.innerHTML = `<button class="vpill no-pos" aria-label="Оцените программу лояльности" data-dr="Опросник VOC · мастер-план, стр. 26" data-mk="voc"><svg width="22" height="22" viewBox="0 0 24 24" fill="#fff"><path d="M2 10h4v11H2zM8 21h9.3a2 2 0 0 0 2-1.6l1.6-7.4A2 2 0 0 0 19 9.6h-5.3l.8-4a1.8 1.8 0 0 0-3.2-1.4L8 9.5z"/></svg><span>Оцените программу лояльности</span></button>
      <div class="pan"><button class="vx" aria-label="Свернуть">×</button><div class="h5">${PG.vocQ || 'Насколько вам понятна программа лояльности?'}</div><div class="rb stars">${[1, 2, 3, 4, 5].map(n => `<button data-r="${n}" aria-label="${n}">★</button>`).join('')}</div>
      <label class="vl" for="vocT">Что конкретно вызвало у вас трудности?</label><textarea id="vocT" placeholder="Напишите пару слов"></textarea><button class="btn btn-s btn-red" data-vsend>Отправить</button></div>`;
    document.body.appendChild(el);
    const pan = $('.pan', el);
    $('.vpill', el).onclick = () => el.classList.add('open');
    pan.addEventListener('click', e => {
      if (e.target.closest('.vx')) { el.classList.remove('open'); return; }
      const r = e.target.closest('[data-r]'); if (r) { const n = +r.dataset.r; $$('[data-r]', pan).forEach(x => x.classList.toggle('on', +x.dataset.r <= n)); }
      if (e.target.closest('[data-vsend]')) { pan.innerHTML = '<div class="h5">Спасибо за отзыв!</div><p class="s mut" style="margin-top:6px">Прототип: отзыв никуда не отправлен.</p>'; setTimeout(() => el.classList.remove('open'), 1800); }
    });
    let asked = false;
    const after = PG.vocAfter || '[data-tab], [data-sort], [data-fav], #oGet';
    document.addEventListener('click', e => {
      if (asked || !e.isTrusted || !window.proto.on('voc') || !e.target.closest(after) || e.target.closest('.demo, .drawer, .fb')) return;
      asked = true; setTimeout(() => { if (window.proto.on('voc')) el.classList.add('open'); }, 1200);
    }, true);
  }

  // 28. Шапка раздела по образцу Альфа Будущего (скрин Максима 20.11): вместо шапки прода, пока свич включён
  function loyNav() {
    if (!KEYS.includes('nav')) return;
    const hdr = $('header.hdr'); if (!hdr) return;
    const links = [['главная.html', 'Программа лояльности'], ['витрина.html', 'Предложения партнёров'], ['альфа-пятница.html', 'Альфа‑Пятница']];
    const srch = $('#searchBtn');
    const el = document.createElement('header'); el.className = 'loynav'; el.dataset.f = 'nav';
    el.innerHTML = `<div class="wrap" data-dr="Шапка раздела по образцу Альфа Будущего · мастер-план, стр. 28" data-mk="nav">
      <a class="lg" href="главная.html" aria-label="Программа лояльности для бизнеса">${ICON.logo}<span class="nm">Программа лояльности для бизнеса<small>Альфа‑Выгодно</small></span></a>
      <nav>${links.slice(1).map(l => `<a href="${l[0]}" class="${l[0] === PG.id + '.html' ? 'on' : ''}">${l[1]}</a>`).join('')}</nav>
      <button class="ls" aria-label="Поиск по сайту">${ICON.search}</button>
      <button class="in">Войти</button>
      <button class="burger" aria-label="Меню программы" aria-expanded="false"><i></i><i></i><i></i></button>
      <div class="bpan" hidden>${links.map(l => `<a href="${l[0]}">${l[1]}</a>`).join('')}<a class="bin" href="#">Войти в интернет-банк</a></div></div>`;
    hdr.dataset.asisF = 'nav'; hdr.before(el);
    const b = $('.burger', el), p = $('.bpan', el);
    b.onclick = e => { e.stopPropagation(); p.hidden = !p.hidden; b.setAttribute('aria-expanded', String(!p.hidden)); };
    $('.in', el).onclick = $('.bin', el).onclick = e => { e.preventDefault(); toast('Вход в интернет-банк на прототипе не работает'); };
    $('.ls', el).onclick = () => { if (srch) srch.click(); else { window.open('https://alfabank.ru/smart-search/?rp-domain=business', '_blank'); toast('Как на проде: поиск открывается отдельной страницей'); } }; // у Пятницы в шапке прода поиска нет
    document.addEventListener('click', e => { if (!e.target.closest('.loynav')) p.hidden = true; });
  }

  // 16. бегущая строка: каждое событие один раз на круг (Максим 22.11: повтор одной фразы плохо, голая строка цифр не читается).
  // L = [{ icon, label, value: () => текст, href, key? }]. Дорожка = две одинаковые половины, в половине столько кругов, чтобы закрыть экран.
  window.ticker = (el, L) => {
    const SPEED = 40; // px в секунду
    const arr = '<svg class="arw" viewBox="0 0 26 18" fill="none" aria-hidden="true"><path d="M1 9h22M16 2l7 7-7 7" stroke="currentColor" stroke-width="3"/></svg>';
    const set = copy => L.map((x, i) => `<a href="${x.href}"${x.key ? ` data-f="${x.key}"` : ''}${copy ? ' tabindex="-1" aria-hidden="true"' : ''}><span class="ic" aria-hidden="true">${x.icon}</span><span class="tx"><small>${x.label}</small> <b data-l="${i}">${x.value()}</b></span>${arr}</a>`).join('');
    el.innerHTML = `<div class="trk"><div class="grp">${set(0)}</div><div class="grp" aria-hidden="true">${set(1)}</div></div>`;
    const trk = el.firstElementChild, [g1, g2] = trk.children; let sets = 1;
    const fit = () => {
      const one = g1.offsetWidth / sets; if (!one) return;
      const n = Math.max(1, Math.ceil(el.clientWidth / one));
      if (n !== sets) { sets = n; g1.innerHTML = set(0) + set(1).repeat(n - 1); g2.innerHTML = set(1).repeat(n); }
      trk.style.setProperty('--dur', g1.offsetWidth / SPEED + 's');
    };
    fit(); if (document.fonts) document.fonts.ready.then(fit);
    addEventListener('resize', fit); document.addEventListener('drchange', fit);
    el.addEventListener('protogo', e => { // «Показать на странице»: строка перематывается к событию
      const a = e.target.closest('a'), run = trk.getAnimations ? trk.getAnimations()[0] : null;
      if (a && run) run.currentTime = Math.max(0, a.offsetLeft - 24) / SPEED * 1000;
    });
    return i => el.querySelectorAll(`[data-l="${i}"]`).forEach(x => { x.textContent = L[i].value(); });
  };

  // ---------- старт ----------
  document.addEventListener('DOMContentLoaded', () => {
    $$('[data-form]').forEach(el => el.innerHTML = formHTML(el.dataset.form || 'Заполнить онлайн'));
    header(); loyNav(); footer(); tabs(); acc(); clientFork(); voc(); modals(); forms(); timers(); search(); demoBar();
    if (location.hash) { const t = $(location.hash); if (t) setTimeout(() => t.scrollIntoView(), 100); }
  });
})();
