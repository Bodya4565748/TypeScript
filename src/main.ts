// Прості типи для прикладу
const siteTitle: string = "TS Template — Demo";
let isModalOpen: boolean = false;

// Елементи DOM з чіткими типами
const openBtn: HTMLButtonElement | null = document.querySelector("#openModalBtn");
const closeBtn: HTMLButtonElement | null = document.querySelector("#closeModalBtn");
const modalEl: HTMLElement | null = document.querySelector("#modal");
const cardsEl: HTMLElement | null = document.querySelector("#cards");

// 1) Відкриття/закриття модалки (click + ESC + бекдроп)
function openModal(): void {
    if (!modalEl) return;
    modalEl.setAttribute("aria-hidden", "false");
    isModalOpen = true;
}

function closeModal(): void {
    if (!modalEl) return;
    modalEl.setAttribute("aria-hidden", "true");
    isModalOpen = false;
}

if (openBtn) {
    openBtn.addEventListener("click", (): void => openModal());
}
if (closeBtn) {
    closeBtn.addEventListener("click", (): void => closeModal());
}
if (modalEl) {
    modalEl.addEventListener("click", (e: MouseEvent): void => {
        const target = e.target as HTMLElement;
        if (target === modalEl) {
            closeModal();
        }
    });
}

document.addEventListener("keydown", (e: KeyboardEvent): void => {
    if (e.key === "Escape" && isModalOpen) closeModal();
});

// 2) Scroll listener: додаємо клас видимості карткам при появі у вікні
function inViewport(el: Element): boolean {
    const rect: DOMRect = el.getBoundingClientRect();
    const vh: number = window.innerHeight || document.documentElement.clientHeight;
    return rect.top < vh - 40; // невеликий офсет
}

function handleScroll(): void {
    const cards: NodeListOf<HTMLElement> = document.querySelectorAll(".card");
    cards.forEach((c: HTMLElement): void => {
        if (!c.classList.contains("visible") && inViewport(c)) {
            c.classList.add("visible");
        }
    });
}
document.addEventListener("scroll", handleScroll, { passive: true });

// 3) Fetch даних із JSONPlaceholder і відображення
type Post = {
    userId: number;
    id: number;
    title: string;
    body: string;
};

async function loadPosts(limit: number = 8): Promise<void> {
    const endpoint: string = `https://jsonplaceholder.typicode.com/posts?_limit=${limit}`;
    try {
        const res: Response = await fetch(endpoint);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: Post[] = await res.json();

        if (!cardsEl) return;
        const frag: DocumentFragment = document.createDocumentFragment();

        data.forEach((p: Post): void => {
            const card: HTMLDivElement = document.createElement("div");
            card.className = "card";
            const title: HTMLHeadingElement = document.createElement("h3");
            title.textContent = p.title;
            const body: HTMLParagraphElement = document.createElement("p");
            body.textContent = p.body;
            card.append(title, body);
            frag.append(card);
        });

        cardsEl.innerHTML = "";
        cardsEl.append(frag);

        // одразу перевіримо на видимість для першого завантаження
        handleScroll();
    } catch (err: unknown) {
        console.error("Не вдалося завантажити пости:", err);
        if (cardsEl) {
            const fail: HTMLDivElement = document.createElement("div");
            fail.className = "card visible";
            fail.innerHTML = `<h3>Помилка</h3><p>Не вдалося завантажити дані.</p>`;
            cardsEl.append(fail);
        }
    }
}

// 4) Невелика «анімація» заголовка при завантаженні
function animateTitle(): void {
    document.title = siteTitle;
    const h1: HTMLHeadingElement | null = document.querySelector("h1");
    if (h1) {
        h1.style.transition = "transform .6s ease, opacity .6s ease";
        h1.style.transform = "translateY(-6px)";
        h1.style.opacity = "0.85";
        setTimeout((): void => {
            h1.style.transform = "translateY(0)";
            h1.style.opacity = "1";
        }, 0);
    }
}

// Старт
window.addEventListener("DOMContentLoaded", (): void => {
    animateTitle();
    loadPosts(9);
});
