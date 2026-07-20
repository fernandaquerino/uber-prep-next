// @vitest-environment jsdom
import { describe, it, expect, afterEach } from "vitest";
import { isEditableTarget } from "../global-timer-provider";

function mount(html: string): HTMLElement {
  document.body.innerHTML = html;
  return document.body.firstElementChild as HTMLElement;
}

afterEach(() => {
  document.body.innerHTML = "";
});

describe("isEditableTarget", () => {
  it("ignora atalhos em campos nativos", () => {
    expect(isEditableTarget(mount("<input />"))).toBe(true);
    expect(isEditableTarget(mount("<textarea></textarea>"))).toBe(true);
    expect(isEditableTarget(mount("<select></select>"))).toBe(true);
  });

  it("ignora atalhos dentro do Monaco (native edit context)", () => {
    const root = mount(
      `<div class="monaco-editor"><div class="native-edit-context" tabindex="0"></div></div>`,
    );
    const editContext = root.querySelector(".native-edit-context")!;
    expect(isEditableTarget(editContext)).toBe(true);
  });

  it("permite atalhos fora de áreas editáveis", () => {
    expect(isEditableTarget(mount("<div><button></button></div>"))).toBe(false);
    expect(isEditableTarget(null)).toBe(false);
  });
});
