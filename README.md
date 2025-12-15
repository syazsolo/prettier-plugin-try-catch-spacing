# prettier-plugin-try-catch-spacing

Enforce visual separation in error handling.

## ❌ Before

<!-- prettier-ignore -->
```javascript
try {
  await db.find(id);
} catch (error) {
  logger.error(error);
}
```

## ✅ After

```javascript
try {
  await db.find(id);

} catch (error) {
  logger.error(error);
}
```

## 📦 Installation

```bash
npm install --save-dev prettier prettier-plugin-try-catch-spacing
```

## ⚙️ Configuration

Add to your `.prettierrc`:

```json
{
  "plugins": ["prettier-plugin-try-catch-spacing"],
  "tryCatchSpacing": true
}
```

<details>
<summary><strong>Advanced Details & Limitations</strong></summary>

### How It Works

This plugin operates at the **Printer** level, intercepting Prettier's `estree` printer to inject a `hardline` into the `BlockStatement` of `try` blocks.

### Known Limitations

- **JSX Formatting**: Because this plugin wraps the native printer, Prettier may disable some advanced formatting heuristics for complex JSX (e.g., collapsing mapped arrays instead of breaking them with a trailing comma). The code remains valid but may look slightly different than standard Prettier.

</details>

## License

MIT
