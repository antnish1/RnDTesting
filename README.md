# RnDTesting

Website trial project.

## Manager AI Agent

The manager dashboard includes an AI briefing panel that sends current dashboard metrics to a server-side Gemini endpoint at `/api/manager-ai`.

Set these environment variables in your hosting provider:

```bash
GEMINI_API_KEY=your_google_ai_studio_key
GEMINI_MODEL=gemini-2.5-flash
```

Keep the Gemini key server-side only. Do not paste it into `index.html`.

For internal-only testing, `index.html` also has a browser-side fallback:

```js
const GEMINI_BROWSER_API_KEY = "";
```

Do not commit a real key. Use the dashboard's **Set Key** button to save the Gemini key in your browser localStorage for GitHub Pages/static hosting tests. Restrict the key to your website domain and the Generative Language API before using this option.

The manager AI agent builds a compact database snapshot from the tables the current logged-in user can read, including recent requests plus relevant users, inventory, branch, and machine data when the question needs it. Supabase row-level security and the browser publishable key still control what data is available.
