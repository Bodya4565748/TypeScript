// src/main.ts
import { setupModal } from "./modules/modal/modal.js";
import { setupReveal } from "./modules/scroll/reveal.js";
import { loadPosts } from "./modules/api/posts.js";
function animateTitle() {
    const h1 = document.querySelector("h1");
    if (!h1)
        return;
    h1.style.transition = "transform .6s ease, opacity .6s ease";
    h1.style.transform = "translateY(-6px)";
    h1.style.opacity = "0.85";
    setTimeout(() => {
        h1.style.transform = "translateY(0)";
        h1.style.opacity = "1";
    }, 0);
}
window.addEventListener("DOMContentLoaded", async () => {
    animateTitle();
    // модалка
    const modal = document.querySelector("#modal");
    const openBtn = document.querySelector("#openModalBtn");
    const closeBtn = document.querySelector("#closeModalBtn");
    if (modal)
        setupModal({ modal, openBtn: openBtn !== null && openBtn !== void 0 ? openBtn : undefined, closeBtn: closeBtn !== null && closeBtn !== void 0 ? closeBtn : undefined });
    // дані
    const cards = document.querySelector("#cards");
    if (cards) {
        await loadPosts(cards, 9);
        setupReveal(".card"); // IO або fallback
    }
});
