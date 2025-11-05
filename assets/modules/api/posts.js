export async function loadPosts(container, limit = 9) {
    const url = `https://jsonplaceholder.typicode.com/posts?_limit=${limit}`;
    try {
        const res = await fetch(url);
        if (!res.ok)
            throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const frag = document.createDocumentFragment();
        data.forEach((p) => {
            const card = document.createElement("div");
            card.className = "card";
            const h3 = document.createElement("h3");
            h3.textContent = p.title;
            const body = document.createElement("p");
            body.textContent = p.body;
            card.append(h3, body);
            frag.append(card);
        });
        container.innerHTML = "";
        container.append(frag);
    }
    catch (err) {
        const card = document.createElement("div");
        card.className = "card visible";
        card.innerHTML = `<h3>Помилка</h3><p>Не вдалося завантажити дані.</p>`;
        container.append(card);
        // можна ще прокинути помилку у консоль
        console.error(err);
    }
}
