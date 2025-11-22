// src/ui/controls.test.js
import { describe, it, expect, beforeEach, vi } from "vitest";
import { initControls } from "../ui/controls.js";

describe("controls", () => {
  let prevBtn, nextBtn;

  beforeEach(() => {
    document.body.innerHTML = `
      <button id="btn-prev">Prev</button>
      <button id="btn-next">Next</button>
    `;
    prevBtn = document.getElementById("btn-prev");
    nextBtn = document.getElementById("btn-next");
  });

  it("calls handlers on click", () => {
    const onPrev = vi.fn();
    const onNext = vi.fn();

    initControls({ prevButton: prevBtn, nextButton: nextBtn, onPrev, onNext });

    prevBtn.click();
    nextBtn.click();

    expect(onPrev).toHaveBeenCalledTimes(1);
    expect(onNext).toHaveBeenCalledTimes(1);
  });
});
