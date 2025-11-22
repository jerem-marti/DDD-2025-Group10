// src/ui/controls.js

/**
 * Initialize navigation controls.
 */
export function initControls({ prevButton, nextButton, onPrev, onNext }) {
  if (!prevButton || !nextButton) {
    throw new Error("Controls: missing buttons");
  }
  if (typeof onPrev !== "function" || typeof onNext !== "function") {
    throw new Error("Controls: onPrev/onNext must be functions");
  }

  prevButton.addEventListener("click", () => {
    onPrev();
  });

  nextButton.addEventListener("click", () => {
    onNext();
  });

  return {
    destroy() {
      // Optional: remove listeners if you need
      prevButton.replaceWith(prevButton.cloneNode(true));
      nextButton.replaceWith(nextButton.cloneNode(true));
    }
  };
}
