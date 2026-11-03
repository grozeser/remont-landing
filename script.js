// Меню на телефоне
const burger = document.querySelector('.burger');
const nav = document.getElementById('nav');
burger.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', open);
});
nav.addEventListener('click', (e) => {
    if (e.target.tagName === 'A') {
        nav.classList.remove('is-open');
        burger.setAttribute('aria-expanded', false);
    }
});

// Калькулятор: цена за м² по тарифу, вторичка дороже из-за демонтажа
const RATE = { cosmetic: 6500, capital: 11900, design: 17500 };
const DAYS = { cosmetic: [20, 0.3], capital: [40, 0.6], design: [70, 0.8] }; // база + дней на м²
const calcEl = document.getElementById('calc');
const area = document.getElementById('area');
const rub = (n) => (Math.round(n / 100) * 100).toLocaleString('ru-RU') + ' ₽';

function calc() {
    const tariff = calcEl.querySelector('[name=tariff]:checked').value;
    const old = calcEl.querySelector('[name=home]:checked').value === 'old';
    const m2 = +area.value;
    const extras = [...calcEl.querySelectorAll('[name=extra]:checked')].map((i) => i.value);
    const work = m2 * RATE[tariff] * (old ? 1.1 : 1);
    let extra = 0;
    if (extras.includes('floor')) extra += m2 * 0.3 * 2200; // тёплый пол примерно на трети площади
    if (extras.includes('trash')) extra += 15000;
    if (extras.includes('buy')) extra += work * 0.05;
    const [base, perM2] = DAYS[tariff];
    const days = Math.round(base + m2 * perM2 + (old ? 7 : 0));

    document.getElementById('areaOut').textContent = m2;
    document.getElementById('sum').textContent = rub(work + extra);
    document.getElementById('rWork').textContent = rub(work);
    document.getElementById('rExtra').textContent = extra ? rub(extra) : '—';
    document.getElementById('rTerm').textContent = `${days} дней`;
    document.querySelector('#leadForm [name=comment]').placeholder =
        `${m2} м², ${old ? 'вторичка' : 'новостройка'}, расчёт ${rub(work + extra)}`;
}
calcEl.addEventListener('input', calc);
calc();

// Кнопки «Рассчитать» в тарифах выбирают тариф в калькуляторе
document.querySelectorAll('[data-tariff]').forEach((btn) =>
    btn.addEventListener('click', () => {
        calcEl.querySelector(`[name=tariff][value=${btn.dataset.tariff}]`).checked = true;
        calc();
    }));

// Работы: интерьеры нарисованы SVG, чтобы не тянуть чужие фото
const WORKS = [
    { title: 'Двушка в новостройке', meta: ['62 м²', 'Капитальный', '58 дней'], wall: '#e9e3d8', floor: '#c89f72', accent: '#4f6d5e', kind: 'living' },
    { title: 'Студия под сдачу', meta: ['28 м²', 'Косметический', '24 дня'], wall: '#dfe6ea', floor: '#d8c3a5', accent: '#f97316', kind: 'bed' },
    { title: 'Трёшка по дизайн-проекту', meta: ['96 м²', 'Дизайнерский', '104 дня'], wall: '#2f3338', floor: '#8a6a4f', accent: '#d9b98c', kind: 'kitchen' },
];
const FURNITURE = {
    living: (a) => `<rect x="70" y="150" width="170" height="50" rx="12" fill="${a}"/><rect x="62" y="136" width="186" height="26" rx="12" fill="${a}" opacity=".85"/>
        <rect x="80" y="200" width="8" height="12" fill="#333"/><rect x="222" y="200" width="8" height="12" fill="#333"/>
        <circle cx="300" cy="196" r="22" fill="#fff" opacity=".9"/><path d="M300 60v40" stroke="#333" stroke-width="2"/><path d="M284 100h32l-6 18h-20z" fill="#f2c94c"/>`,
    bed: (a) => `<rect x="60" y="150" width="200" height="56" rx="6" fill="#fff"/><rect x="60" y="120" width="12" height="90" rx="4" fill="${a}"/>
        <rect x="80" y="140" width="56" height="22" rx="8" fill="#e8edf0"/><rect x="140" y="160" width="120" height="46" rx="6" fill="${a}" opacity=".85"/>
        <rect x="280" y="160" width="40" height="46" rx="4" fill="#c9b79c"/><circle cx="300" cy="146" r="12" fill="#f2c94c"/>`,
    kitchen: (a) => `<rect x="40" y="140" width="260" height="70" rx="4" fill="#1f2226"/><rect x="40" y="134" width="260" height="10" fill="${a}"/>
        <rect x="40" y="56" width="150" height="46" rx="4" fill="#1f2226"/><g fill="${a}"><rect x="60" y="164" width="40" height="3"/><rect x="140" y="164" width="40" height="3"/><rect x="220" y="164" width="40" height="3"/></g>
        <path d="M250 40v40M235 80h30" stroke="${a}" stroke-width="3"/><circle cx="250" cy="88" r="6" fill="#ffe8b0"/>`,
};
document.getElementById('worksGrid').innerHTML = WORKS.map((w) => `
    <article class="work">
        <svg viewBox="0 0 360 240" role="img" aria-label="${w.title}">
            <rect width="360" height="240" fill="${w.wall}"/>
            <path d="M0 200h360v40H0z" fill="${w.floor}"/>
            <path d="M0 200h360" stroke="rgba(0,0,0,.15)" stroke-width="4"/>
            ${w.kind === 'kitchen' ? '' : '<rect x="200" y="36" width="120" height="96" rx="4" fill="#cfe3f0" stroke="#fff" stroke-width="6"/>'}
            ${FURNITURE[w.kind](w.accent)}
        </svg>
        <div class="work__body">
            <h3>${w.title}</h3>
            <div class="work__meta">${w.meta.map((m) => `<span>${m}</span>`).join('')}</div>
        </div>
    </article>`).join('');

// Форма: проверка полей, без отправки (демо)
const form = document.getElementById('leadForm');
form.addEventListener('submit', (e) => {
    e.preventDefault();
    const err = document.getElementById('formError');
    const bad = [];
    const name = form.elements.name;
    const phone = form.elements.phone;
    name.setAttribute('aria-invalid', !name.value.trim());
    if (!name.value.trim()) bad.push('имя');
    const digits = phone.value.replace(/\D/g, '');
    const phoneOk = digits.length === 11 || digits.length === 10;
    phone.setAttribute('aria-invalid', !phoneOk);
    if (!phoneOk) bad.push('телефон');
    if (!form.elements.agree.checked) bad.push('согласие на обработку данных');
    err.hidden = !bad.length;
    err.textContent = bad.length ? `Проверьте: ${bad.join(', ')}` : '';
    if (bad.length) return;
    form.querySelector('button').hidden = true;
    document.getElementById('formOk').hidden = false;
});
