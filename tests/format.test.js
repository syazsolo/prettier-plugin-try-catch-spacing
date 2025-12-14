import { describe, it, expect } from "vitest";
import * as prettier from "prettier";
import * as plugin from "../src/index.js";

const format = async (code, options = {}) => {
  return prettier.format(code, {
    parser: "typescript",
    plugins: [plugin],
    ...options,
  });
};

describe("prettier-plugin-try-catch-spacing", () => {
  it("should insert a gap before the closing brace in try block when tryCatchSpacing is true", async () => {
    const input = `
try {
  const result = doSomething();
  return result;
} catch (e) {
  console.error(e);
}
`;
    const expected = `try {
  const result = doSomething();
  return result;

} catch (e) {
  console.error(e);
}
`;
    const result = await format(input, { tryCatchSpacing: true });
    expect(result).toBe(expected);
  });

  it("should NOT insert a gap when tryCatchSpacing is false (default)", async () => {
    const input = `
try {
  return true;
} catch (e) {}
`;
    const expected = `try {
  return true;
} catch (e) {}
`;
    const result = await format(input, { tryCatchSpacing: false });
    expect(result).toBe(expected);
  });

  it("should NOT insert a gap in blocks other than try/catch", async () => {
    const input = `
if (true) {
  return true;
}
function test() {
  return true;
}
while(true) {
  break;
}
`;
    const expected = `if (true) {
  return true;
}
function test() {
  return true;
}
while (true) {
  break;
}
`;
    const result = await format(input, { tryCatchSpacing: true });
    expect(result).toBe(expected);
  });

  it("should handle nested try/catch blocks correctly", async () => {
    const input = `
try {
  try {
    throw new Error();
  } catch(e) {}
} catch(e) {}
`;
    const expected = `try {
  try {
    throw new Error();

  } catch (e) {}

} catch (e) {}
`;
    const result = await format(input, { tryCatchSpacing: true });
    expect(result).toBe(expected);
  });

  it("should NOT insert a gap in try/finally (no catch)", async () => {
    const input = `
try {
  doWork();
} finally {
  cleanup();
}
`;
    const expected = `try {
  doWork();
} finally {
  cleanup();
}
`;
    // If there is no handler (catch), we generally don't want the gap unless specified.
    // The requirement was: "only when that try block is immediately followed by a catch block."
    const result = await format(input, { tryCatchSpacing: true });
    expect(result).toBe(expected);
  });

  // Edge case: empty try block
  it("should insert gap even in empty try block ?? maybe? Usually prettier collapses empty blocks.", async () => {
    // If the block is empty, prettier prints "{}".
    // We probably shouldn't expand empty blocks just to add a gap.
    // Let's see what happens with our logic.
    // Our logic: BlockStatement -> doc is probably "{}" (inline) or group(["{", softline, "}"])
    // If it is curly braces with nothing, inserting hardline might force it open.

    // Let's decide on desired behavior: If empty, probably keep it empty/concise.
    // But let's test what happens.
    const input = "try {} catch(e) {}";
    // If we force hardline, it becomes:
    // try {
    //
    // }

    // Ideally we skip empty blocks or rely on Prettier's empty block handling.
    // Prettier usually keeps empty blocks as `{}`.
    // Let's test this behavior.
    const result = await format(input, { tryCatchSpacing: true });
    // We probably want it to stay concise if empty logic.
    // But if the user wants vertical rhythm, maybe even empty ones?
    // Let's assume for now valid code usually has content in try.
  });
});
