// src/ui/sidebar.test.js
import { describe, it, expect, beforeEach } from "vitest";
import { initSidebar } from "../ui/sidebar.js";

describe("sidebar", () => {
  let headingEl, chatEl, notesEl, diagramEl, sidebar;

  beforeEach(() => {
    document.body.innerHTML = `
      <div id="sidebar-heading"></div>
      <div id="sidebar-chat"></div>
      <ul id="sidebar-notes"></ul>
      <div id="sidebar-diagram-hint"></div>
    `;
    headingEl = document.getElementById("sidebar-heading");
    chatEl = document.getElementById("sidebar-chat");
    notesEl = document.getElementById("sidebar-notes");
    diagramEl = document.getElementById("sidebar-diagram-hint");

    sidebar = initSidebar({ headingEl, chatEl, notesEl, diagramEl });
  });

  it("updates heading, chat, notes, and diagram", () => {
    const content = {
      heading: "Test heading",
      chat: [
        { from: "user", text: "Hello?" },
        { from: "guide", text: "Hi!" }
      ],
      notes: ["Note 1", "Note 2"],
      diagramHint: "Draw something here"
    };

    sidebar.update(content);

    expect(headingEl.textContent).toBe("Test heading");
    expect(chatEl.querySelectorAll(".msg").length).toBe(2);
    expect(notesEl.querySelectorAll("li").length).toBe(2);
    expect(diagramEl.textContent).toBe("Draw something here");
  });
});
