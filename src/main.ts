// src/main.ts
import { setupModal } from "./modules/modal/modal.js";
import { setupReveal } from "./modules/scroll/reveal.js";
import { loadPosts } from "./modules/api/posts.js";
import type { NullableEl } from "./types/dom";

function animateTitle(): void {
    const h1: HTMLHeadingElement | null = document.querySelector("h1");
    if (!h1) return;
    h1.style.transition = "transform .6s ease, opacity .6s ease";
    h1.style.transform = "translateY(-6px)";
    h1.style.opacity = "0.85";
    setTimeout((): void => {
        h1.style.transform = "translateY(0)";
        h1.style.opacity = "1";
    }, 0);
}

window.addEventListener("DOMContentLoaded", async (): Promise<void> => {
    animateTitle();

    // модалка
    const modal: NullableEl<HTMLElement> = document.querySelector("#modal");
    const openBtn: NullableEl<HTMLButtonElement> = document.querySelector("#openModalBtn");
    const closeBtn: NullableEl<HTMLButtonElement> = document.querySelector("#closeModalBtn");
    if (modal) setupModal({ modal, openBtn: openBtn ?? undefined, closeBtn: closeBtn ?? undefined });

    // дані
    const cards: NullableEl<HTMLElement> = document.querySelector("#cards");
    if (cards) {
        await loadPosts(cards, 9);
        setupReveal(".card"); // IO або fallback
    }
});
