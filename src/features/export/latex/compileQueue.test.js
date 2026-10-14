import { describe, expect, it } from "vitest";
import { createCompileQueue } from "./compileQueue.js";

describe("createCompileQueue", () => {
  it("runs the next compile only after the previous one finishes", async () => {
    const queue = createCompileQueue();
    const events = [];
    let release;
    const gate = new Promise((resolve) => {
      release = resolve;
    });
    const first = queue(async () => {
      events.push("first");
      await gate;
      events.push("first-done");
      return "one";
    });
    const second = queue(async () => {
      events.push("second");
      return "two";
    });
    await Promise.resolve();
    expect(events).toEqual(["first"]);
    release();
    await expect(first).resolves.toBe("one");
    await expect(second).resolves.toBe("two");
    expect(events).toEqual(["first", "first-done", "second"]);
  });

  it("keeps the queue moving after a compile fails", async () => {
    const queue = createCompileQueue();
    const events = [];
    await expect(
      queue(async () => {
        events.push("bad");
        throw new Error("tex");
      }),
    ).rejects.toThrow("tex");
    await queue(async () => {
      events.push("next");
    });
    expect(events).toEqual(["bad", "next"]);
  });
});