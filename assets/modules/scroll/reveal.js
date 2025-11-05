export function setupReveal(selector = ".card") {
    const cards = document.querySelectorAll(selector);
    if ("IntersectionObserver" in window) {
        const obs = new IntersectionObserver((entries) => {
            entries.forEach((e) => {
                if (e.isIntersecting) {
                    e.target.classList.add("visible");
                    obs.unobserve(e.target);
                }
            });
        }, { threshold: 0.15 });
        cards.forEach((c) => obs.observe(c));
        return;
    }
    // fallback без IO
    const inViewport = (el) => {
        const rect = el.getBoundingClientRect();
        return rect.top < (window.innerHeight || document.documentElement.clientHeight) - 40;
    };
    const onScroll = () => {
        cards.forEach((c) => {
            if (!c.classList.contains("visible") && inViewport(c)) {
                c.classList.add("visible");
            }
        });
    };
    document.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
}
