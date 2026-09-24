import { describe, expect, it } from "vitest";
import {
  moveInOrder,
  extraRefOf,
  catalogKindOf,
  isExtra,
} from "./order.js";

describe("resume order", () => {
  it("moves items in order", () => {
    const order = ["summary", "experience", "skills"];
    expect(moveInOrder(order, "experience", "up")).toEqual([
      "experience",
      "summary",
      "skills",
    ]);
    expect(moveInOrder(order, "summary", "down")).toEqual([
      "experience",
      "summary",
      "skills",
    ]);
  });

  it("handles extra refs and kinds", () => {
    expect(isExtra("extra:42")).toBe(true);
    expect(extraRefOf({ id: 9 })).toBe("extra:9");
    expect(catalogKindOf({ id: 100, kind: 5 })).toBe(5);
    expect(catalogKindOf({ id: 3 })).toBe(3);
  });
});
