import type { Post } from "../../types/post";

export async function loadPosts(container: HTMLElement, limit: number = 9): Promise<void> {
    const url: string = `https://jsonplaceholder.typicode.com/posts?_limit=${limit}`;
    try {
        const res: Response = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: Post[] = await res.json();

        const frag: DocumentFragment = document.createDocumentFragment();

        data.forEach((p: Post): void => {
            const card: HTMLDivElement = document.createElement("div");
            card.className = "card";
            const h3: HTMLHeadingElement = document.createElement("h3");
            h3.textContent = p.title;
            const body: HTMLParagraphElement = document.createElement("p");
            body.textContent = p.body;
            card.append(h3, body);
            frag.append(card);
        });

        container.innerHTML = "";
        container.append(frag);
    } catch (err: unknown) {
        const card: HTMLDivElement = document.createElement("div");
        card.className = "card visible";
        card.innerHTML = `<h3>Помилка</h3><p>Не вдалося завантажити дані.</p>`;
        container.append(card);
        // можна ще прокинути помилку у консоль
        console.error(err);
    }
}
