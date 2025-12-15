import { parsers as babelParsers } from "prettier/plugins/babel";
import { parsers as flowParsers } from "prettier/plugins/flow";
import { parsers as typescriptParsers } from "prettier/plugins/typescript";
import * as estreePlugin from "prettier/plugins/estree";
import { doc } from "prettier";

const { hardline, indent, join } = doc.builders;

// The fallback base printer
const basePrinter = estreePlugin.printers.estree;
console.log("BasePrinter Type:", typeof basePrinter);
if (typeof basePrinter === "object") {
  console.log("BasePrinter keys:", Object.keys(basePrinter));
} else if (typeof basePrinter === "function") {
  console.log("BasePrinter name:", basePrinter.name);
}

export const options = {
  tryCatchSpacing: {
    type: "boolean",
    category: "Global",
    default: false,
    description:
      "Insert a newline before the closing brace of a try block followed by a catch block.",
  },
};

const AST_FORMAT = "estree";

export const parsers = {
  babel: babelParsers.babel,
  "babel-flow": babelParsers["babel-flow"],
  "babel-ts": babelParsers["babel-ts"],
  flow: flowParsers.flow,
  typescript: typescriptParsers.typescript,
};

// RESOLUTION HELPER
function getEstreePrinter(options) {
  let bestCandidate = basePrinter;

  if (options.plugins) {
    for (const plugin of options.plugins) {
      if (plugin.printers && plugin.printers.estree) {
        const candidate = plugin.printers.estree;

        // CRITICAL: Skip ourselves to avoid infinite recursion!
        if (candidate === printerProxy) continue;

        // The builtin estree printer is an object.
        // Some "unnamed" plugins (likely internal/parsers) might expose a function that doesn't behave as we expect for 'estree'.
        // We filter out function printers for 'estree' to be safe, unless valid context suggests otherwise.
        if (
          typeof candidate === "object" &&
          typeof candidate.print === "function"
        ) {
          bestCandidate = candidate;
        } else if (typeof candidate === "function") {
          // Log a warning if we encounter a function-type printer for 'estree' and skip it.
          // This is because Prettier's estree printer is typically an object with methods.
          // console.warn(
          //   `[prettier-plugin-try-catch] Skipping function-type 'estree' printer from plugin '${plugin.name || "unnamed"}' as it's not the expected object format.`,
          // );
        }
      }
    }
  }
  return bestCandidate;
}

// PRINTER PROXY definition
// We use Object.create(basePrinter) to inherit all default behavior/properties (like handleComments, massageAstNode, etc.)
// and only override what we need.

// PRINTER PROXY definition
const printerProxy = {
  ...basePrinter,

  print(path, options, print) {
    const node = path.node;

    // Check for our specific target: The BlockStatement of a TryStatement
    if (
      options.tryCatchSpacing &&
      node.type === "BlockStatement" &&
      path.parent &&
      path.parent.type === "TryStatement" &&
      path.parent.handler &&
      path.parent.block === node
    ) {
      // CRITICAL: Only use manual block construction when body has statements.
      // If body is empty (possibly with only comments), delegate to basePrinter
      // to avoid losing dangling comments.
      if (node.body && node.body.length > 0) {
        // Manual Block Construction Strategy:
        // constructing: {
        //   indent(
        //     hardline
        //     join(hardline, body)
        //   )
        //   hardline  <- Standard newline
        //   hardline  <- The Gap (our feature)
        // }
        const bodyParts = path.map(print, "body");
        return [
          "{",
          indent([hardline, join(hardline, bodyParts)]),
          hardline, // Newline after body
          hardline, // The Gap
          "}",
        ];
      }
      // For empty blocks (with or without comments), fall through to basePrinter
    }

    // Default: Delegate to basePrinter
    return basePrinter.print.call(basePrinter, path, options, print);
  },

  embed(path, options) {
    const printer = getEstreePrinter(options);

    if (printer && typeof printer.embed === "function") {
      return printer.embed.call(printer, path, options);
    }
    if (basePrinter.embed) {
      return basePrinter.embed.call(basePrinter, path, options);
    }
    return null;
  },
};

export const printers = {
  [AST_FORMAT]: printerProxy,
};
