# Website Modernization Agent (Continuous Design Intelligence)

This agent continuously monitors your website and compares it with selected benchmark websites to suggest modern UI upgrades.

## What it does
1. Monitors your current website styles (colors, classes, CSS patterns, layout hints).
2. Crawls benchmark websites from your industry.
3. Detects trend gaps (theme, typography, component patterns).
4. Produces repeated design ideas in JSON reports.

## Suggested continuous loop
- Frequency: daily or weekly.
- Inputs: your website + 3–10 benchmark URLs.
- Output: `design_agent_report.json`.
- Action: push top ideas into design backlog after quick human review.

## Run locally
```bash
python3 tools/design_agent.py --config tools/design_agent_config.example.json --output design_agent_report.json
```

## Automation options
- Cron on Linux/macOS.
- GitHub Actions scheduled workflow.
- CI/CD post-deploy design intelligence pass.

## Important guardrails
- Do not copy competitor assets verbatim.
- Borrow patterns, spacing systems, and hierarchy principles.
- Keep brand colors and voice aligned with your identity.
- Validate accessibility (contrast, keyboard navigation, semantics).
