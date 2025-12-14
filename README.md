# prettier-plugin-try-catch-spacing

Enforce visual separation in error handling.

A Prettier plugin that automatically injects a whitespace gap before the closing brace of a try block. It separates the "happy path" from error handling, improving scanability and reducing visual density in control flow logic.

## ❌ Before

```javascript
try {
  const user = await db.find(id);
  return user;
} catch (error) {
  logger.error(error);
}
```

## ✅ After

```javascript
try {
  const user = await db.find(id);
  return user;
} catch (error) {
  logger.error(error);
}
```

## 📦 Installation

```bash
npm install --save-dev prettier prettier-plugin-try-catch-spacing
```

## ⚙️ Configuration

Add the plugin and enable the rule in your `.prettierrc`:

```json
{
  "plugins": ["prettier-plugin-try-catch-spacing"],
  "tryGap": true
}
```

| Option   | Default | Description                                               |
| -------- | ------- | --------------------------------------------------------- |
| `tryGap` | `false` | Inserts a hardline before the closing `}` of a try block. |

## 🛠️ How It Works

Unlike standard plugins that transform the AST (Abstract Syntax Tree), this plugin operates at the Printer level.

- **Printer Wrapping**: Intercepts Prettier's default estree printer.
- **Doc Manipulation**: Inspects the intermediate "Doc" structure of BlockStatements within TryStatements.
- **Layout Injection**: Dynamically inserts a hardline command into the output stream, enforcing vertical rhythm where the default engine forces compaction.

## 🤝 Compatibility

Designed to be polite. This plugin implements a dynamic printer resolution strategy:

- It detects if other AST-transforming plugins (like `prettier-plugin-jsdoc`) are active.
- It wraps the last active printer in the chain instead of overwriting it, ensuring full interoperability.

## License

MIT
