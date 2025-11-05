export function setupReveal(selector: string = ".card"): void {
    const cards: NodeListOf<HTMLElement> = document.querySelectorAll(selector);

    if ("IntersectionObserver" in window) {
        const obs = new IntersectionObserver(
            (entries: IntersectionObserverEntry[]): void => {
                entries.forEach((e: IntersectionObserverEntry): void => {
                    if (e.isIntersecting) {
                        (e.target as HTMLElement).classList.add("visible");
                        obs.unobserve(e.target);
                    }
                });
            },
            { threshold: 0.15 }
        );

        cards.forEach((c: HTMLElement): void => obs.observe(c));
        return;
    }

    // fallback без IO
    const inViewport = (el: Element): boolean => {
        const rect: DOMRect = el.getBoundingClientRect();
        return rect.top < (window.innerHeight || document.documentElement.clientHeight) - 40;
    };

    const onScroll = (): void => {
        cards.forEach((c: HTMLElement): void => {
            if (!c.classList.contains("visible") && inViewport(c)) {
                c.classList.add("visible");
            }
        });
    };

    document.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
}
