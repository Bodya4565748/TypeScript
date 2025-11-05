"use strict";
// Прості типи для прикладу
const siteTitle = "TS Template — Demo";
let isModalOpen = false;
// Елементи DOM з чіткими типами
const openBtn = document.querySelector("#openModalBtn");
const closeBtn = document.querySelector("#closeModalBtn");
const modalEl = document.querySelector("#modal");
const cardsEl = document.querySelector("#cards");
// 1) Відкриття/закриття модалки (click + ESC + бекдроп)
function openModal() {
    if (!modalEl)
        return;
    modalEl.setAttribute("aria-hidden", "false");
    isModalOpen = true;
}
function closeModal() {
    if (!modalEl)
        return;
    modalEl.setAttribute("aria-hidden", "true");
    isModalOpen = false;
}
if (openBtn) {
    openBtn.addEventListener("click", () => openModal());
}
if (closeBtn) {
    closeBtn.addEventListener("click", () => closeModal());
}
if (modalEl) {
    modalEl.addEventListener("click", (e) => {
        const target = e.target;
        if (target === modalEl) {
            closeModal();
        }
    });
}
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isModalOpen)
        closeModal();
});
// 2) Scroll listener: додаємо клас видимості карткам при появі у вікні
function inViewport(el) {
    const rect = el.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight;
    return rect.top < vh - 40; // невеликий офсет
}
function handleScroll() {
    const cards = document.querySelectorAll(".card");
    cards.forEach((c) => {
        if (!c.classList.contains("visible") && inViewport(c)) {
            c.classList.add("visible");
        }
    });
}
document.addEventListener("scroll", handleScroll, { passive: true });
async function loadPosts(limit = 8) {
    const endpoint = `https://jsonplaceholder.typicode.com/posts?_limit=${limit}`;
    try {
        const res = await fetch(endpoint);
        if (!res.ok)
            throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!cardsEl)
            return;
        const frag = document.createDocumentFragment();
        data.forEach((p) => {
            const card = document.createElement("div");
            card.className = "card";
            const title = document.createElement("h3");
            title.textContent = p.title;
            const body = document.createElement("p");
            body.textContent = p.body;
            card.append(title, body);
            frag.append(card);
        });
        cardsEl.innerHTML = "";
        cardsEl.append(frag);
        // одразу перевіримо на видимість для першого завантаження
        handleScroll();
    }
    catch (err) {
        console.error("Не вдалося завантажити пости:", err);
        if (cardsEl) {
            const fail = document.createElement("div");
            fail.className = "card visible";
            fail.innerHTML = `<h3>Помилка</h3><p>Не вдалося завантажити дані.</p>`;
            cardsEl.append(fail);
        }
    }
}
// 4) Невелика «анімація» заголовка при завантаженні
function animateTitle() {
    document.title = siteTitle;
    const h1 = document.querySelector("h1");
    if (h1) {
        h1.style.transition = "transform .6s ease, opacity .6s ease";
        h1.style.transform = "translateY(-6px)";
        h1.style.opacity = "0.85";
        setTimeout(() => {
            h1.style.transform = "translateY(0)";
            h1.style.opacity = "1";
        }, 0);
    }
}
// Старт
window.addEventListener("DOMContentLoaded", () => {
    animateTitle();
    loadPosts(9);
});
