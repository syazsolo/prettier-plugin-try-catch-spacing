import { doc } from "prettier";
import * as estreePlugin from "prettier/plugins/estree";

const { hardline } = doc.builders;

// Get the default estree printer directly
const defaultPrinter = estreePlugin.printers.estree;

export const options = {
  tryCatchSpacing: {
    type: "boolean",
    category: "Global",
    default: false,
    description:
      "Insert a newline before the closing brace of a try block followed by a catch block.",
  },
};

const myPrinter = {
  ...defaultPrinter,
  print(path, options, print) {
    const node = path.node;
    const parent = path.parent;

    // Dynamic resolution: Find the appropriate printer to wrap.
    // We look for the last loaded plugin that handles 'estree', excluding ourselves.
    let properPrinter = defaultPrinter;

    if (options.plugins) {
      for (const plugin of options.plugins) {
        if (plugin.printers && plugin.printers.estree) {
          const candidate = plugin.printers.estree;
          // Ensure it's a valid printer object with a print function
          // and avoid wrapping ourselves (infinite recursion risk)
          if (
            candidate !== myPrinter &&
            typeof candidate === "object" &&
            typeof candidate.print === "function"
          ) {
            properPrinter = candidate;
          }
        }
      }
    }

    // Get the default doc using the resolved printer
    const defaultDoc = properPrinter.print(path, options, print);

    // Only modify try block body when tryGap is enabled
    if (
      options.tryCatchSpacing &&
      node.type === "BlockStatement" &&
      parent &&
      parent.type === "TryStatement" &&
      parent.handler && // Must have a catch block
      parent.block === node // Must be the try block itself
    ) {
      return insertGapBeforeClosingBrace(defaultDoc);
    }

    return defaultDoc;
  },
};

export const printers = {
  estree: myPrinter,
};

function insertGapBeforeClosingBrace(docNode) {
  // Handle array docs
  if (Array.isArray(docNode)) {
    const newDoc = [...docNode];
    const lastIndex = newDoc.length - 1;
    if (newDoc[lastIndex] === "}") {
      newDoc.splice(lastIndex, 0, hardline);
    }
    return newDoc;
  }

  // Handle group docs
  if (docNode && docNode.type === "group" && Array.isArray(docNode.contents)) {
    return {
      ...docNode,
      contents: insertGapBeforeClosingBrace(docNode.contents),
    };
  }

  // Handle other array-like contents
  if (docNode && Array.isArray(docNode.contents)) {
    return {
      ...docNode,
      contents: insertGapBeforeClosingBrace(docNode.contents),
    };
  }

  return docNode;
}
