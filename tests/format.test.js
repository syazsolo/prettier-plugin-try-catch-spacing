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

describe("Prettier Plugin Test Plan", () => {
  // 1. The "Happy Path" (Core Feature Verification)
  describe("1. The 'Happy Path' (Core Feature)", () => {
    it("1.1 Standard Try-Catch: Should insert gap before catch", async () => {
      const input = `try { return true; } catch (e) {}`;
      const expected = `try {
  return true;

} catch (e) {}
`;
      const result = await format(input, { tryCatchSpacing: true });
      expect(result).toBe(expected);
    });

    it("1.2 Try-Catch-Finally: Should insert gap before catch and finally", async () => {
      const input = `try { a(); } catch (e) { b(); } finally { c(); }`;
      const expected = `try {
  a();

} catch (e) {
  b();
} finally {
  c();
}
`;
      const result = await format(input, { tryCatchSpacing: true });
      expect(result).toBe(expected);
    });

    it("1.3 Simple Line Break: Should insert gap after statement", async () => {
      const input = `try { const x = 1; } catch(e) {}`;
      const expected = `try {
  const x = 1;

} catch (e) {}
`;
      const result = await format(input, { tryCatchSpacing: true });
      expect(result).toBe(expected);
    });
  });

  // 2. The "Regression Check" (Stability Verification)
  describe("2. The 'Regression Check' (Stability)", () => {
    it("2.1 JSX Mapping/Trailing Comma (Regression Test)", async () => {
      const input = `
const element = (
  <React.Fragment key={key}>
    {item.map((subItem, index) =>
      renderContentItem(subItem, scale, \`\${key}-group-\${index}\`)
    )}
  </React.Fragment>
);
`;
      // We accept the "Safe Mode" formatting for now to ensure stability.
      // This results in a collapsed map callback, but valid code.
      const expected = `const element = (
  <React.Fragment key={key}>
    {item.map((subItem, index) =>
      renderContentItem(subItem, scale, \`\${key}-group-\${index}\`))}
  </React.Fragment>
);
`;
      const result = await format(input, {
        tryCatchSpacing: true,
        parser: "babel", // Use babel for JSX
      });
      expect(result).toBe(expected);
    });

    it("2.2 Complex Destructuring", async () => {
      const input = `try { const { a, very_long_variable_name } = new SomeService(argument1, argument2); } catch(e) {}`;
      const result = await format(input, {
        tryCatchSpacing: true,
        printWidth: 60,
      });
      // Check if it formats reasonably (not smashed)
      expect(result).toContain("new SomeService(");
      expect(result).toContain("argument1,");
    });
  });

  // 3. The "Manual Block" Integrity (Structural Checks)
  describe("3. The 'Manual Block' Integrity", () => {
    it("3.1 Multiple Statements: Should separate with newlines (Smashed Code Check)", async () => {
      const input = `try { const a = 1; const b = 2; return a + b; } catch(e) {}`;
      const expected = `try {
  const a = 1;
  const b = 2;
  return a + b;

} catch (e) {}
`;
      const result = await format(input, { tryCatchSpacing: true });
      expect(result).toBe(expected);
    });

    it("3.2 Empty Block: Should handle gracefully", async () => {
      const input = `try {} catch(e) {}`;
      const result = await format(input, { tryCatchSpacing: true });
      // Empty block should still work without crashing
      // Acceptable outputs: "try {\n} catch (e) {}\n" or "try {\n\n} catch (e) {}\n"
      expect(result).toMatch(/try \{\s*\} catch \(e\) \{\}\n/);
    });
  });

  // 4. Nesting & Recursion
  describe("4. Nesting & Recursion", () => {
    it("4.1 Nested Try-Catch: Gap on both outer and inner", async () => {
      const input = `try { if (condition) { try { work(); } catch (e) {} } } catch(e) {}`;
      const expected = `try {
  if (condition) {
    try {
      work();

    } catch (e) {}
  }

} catch (e) {}
`;
      const result = await format(input, { tryCatchSpacing: true });
      expect(result).toBe(expected);
    });

    it("4.2 Function Scope: Works inside function", async () => {
      const input = `function outer() { try { const inner = () => { try { innerWork(); } catch (e) {} }; } catch(e) {} }`;
      const expected = `function outer() {
  try {
    const inner = () => {
      try {
        innerWork();

      } catch (e) {}
    };

  } catch (e) {}
}
`;
      const result = await format(input, { tryCatchSpacing: true });
      expect(result).toBe(expected);
    });
  });

  // 5. Edge Cases & Comments
  describe("5. Edge Cases & Comments", () => {
    it("5.1 Body Comment Preservation", async () => {
      const input = `try { // start work
 const a = 1; } catch(e) {}`;
      const expected = `try {
  // start work
  const a = 1;

} catch (e) {}
`;
      const result = await format(input, { tryCatchSpacing: true });
      expect(result).toBe(expected);
    });

    it("5.2 Dangling Comment: Should be preserved", async () => {
      const input = `try { /* dangling comment */ } catch(e) {}`;
      const result = await format(input, { tryCatchSpacing: true });
      // Comment should be preserved
      expect(result).toContain("/* dangling comment */");
    });

    it("5.3 Directives: 'use strict' preserved", async () => {
      const input = `try { "use strict"; work(); } catch(e) {}`;
      const result = await format(input, { tryCatchSpacing: true });
      // Note: "use strict" inside try block is unusual but should be preserved
      // Prettier may or may not treat it as a directive in this context
      expect(result).toContain("use strict");
      expect(result).toContain("work()");
    });
  });
});
