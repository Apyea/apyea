/**
 * Headless UI Listbox (especially with `anchor` + portal inside Dialog) can miss
 * outside pointer events. Close open listboxes when the user clicks elsewhere.
 */
let guardInstalled = false;

export function ensureListboxOutsideClickGuard() {
  if (guardInstalled || typeof document === "undefined") return;
  guardInstalled = true;

  document.addEventListener(
    "pointerdown",
    (event) => {
      const target = event.target;
      if (!(target instanceof Node)) return;

      const openButtons = document.querySelectorAll(
        'button[aria-haspopup="listbox"][aria-expanded="true"]',
      );

      openButtons.forEach((btn) => {
        const controls = btn.getAttribute("aria-controls");
        const panel = controls ? document.getElementById(controls) : null;
        if (btn.contains(target) || panel?.contains(target)) return;

        btn.dispatchEvent(
          new KeyboardEvent("keydown", {
            key: "Escape",
            code: "Escape",
            bubbles: true,
            cancelable: true,
          }),
        );
      });
    },
    true,
  );
}