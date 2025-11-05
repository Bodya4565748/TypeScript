export function setupModal(refs) {
    const { modal, openBtn, closeBtn } = refs;
    if (!modal)
        return;
    let isOpen = false;
    const open = () => {
        modal.setAttribute("aria-hidden", "false");
        isOpen = true;
    };
    const close = () => {
        modal.setAttribute("aria-hidden", "true");
        isOpen = false;
    };
    openBtn === null || openBtn === void 0 ? void 0 : openBtn.addEventListener("click", () => open());
    closeBtn === null || closeBtn === void 0 ? void 0 : closeBtn.addEventListener("click", () => close());
    modal.addEventListener("click", (e) => {
        if (e.target === modal)
            close();
    });
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && isOpen)
            close();
    });
}
