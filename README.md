# RnDTesting

Website trial project.

## Manager AI Agent

The manager dashboard includes an AI briefing panel that sends current dashboard metrics to a server-side Gemini endpoint at `/api/manager-ai`.

Set these environment variables in your hosting provider:

```bash
GEMINI_API_KEY=your_google_ai_studio_key
GEMINI_MODEL=gemini-3-flash-preview
```

Keep the Gemini key server-side only. Do not paste it into `index.html`.

For internal-only testing, `index.html` also has a browser-side fallback:

```js
const GEMINI_BROWSER_API_KEY = "";
```

Paste the key there only if you accept that anyone who can open the website files can read and reuse the key. Restrict the key to your website domain and the Generative Language API before using this option.
