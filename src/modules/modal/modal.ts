import type { ModalRefs } from "../../types/dom";

export function setupModal(refs: Partial<ModalRefs>): void {
    const { modal, openBtn, closeBtn } = refs;

    if (!modal) return;

    let isOpen: boolean = false;

    const open = (): void => {
        modal.setAttribute("aria-hidden", "false");
        isOpen = true;
    };

    const close = (): void => {
        modal.setAttribute("aria-hidden", "true");
        isOpen = false;
    };

    openBtn?.addEventListener("click", (): void => open());
    closeBtn?.addEventListener("click", (): void => close());

    modal.addEventListener("click", (e: MouseEvent): void => {
        if (e.target === modal) close();
    });

    document.addEventListener("keydown", (e: KeyboardEvent): void => {
        if (e.key === "Escape" && isOpen) close();
    });
}
