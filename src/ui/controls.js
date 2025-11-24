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

  function updateButtons(currentIndex, totalScenes) {
    // Hide Previous button on first page
    if (currentIndex === 0) {
      prevButton.style.display = 'none';
    } else {
      prevButton.style.display = '';
    }

    // Hide Next button on last page
    if (currentIndex === totalScenes - 1) {
      nextButton.style.display = 'none';
    } else {
      nextButton.style.display = '';
    }
  }

  return {
    updateButtons,
    destroy() {
      // Optional: remove listeners if you need
      prevButton.replaceWith(prevButton.cloneNode(true));
      nextButton.replaceWith(nextButton.cloneNode(true));
    }
  };
}
