# RnDTesting

Website trial project with a built-in **Website Modernization Agent** that can monitor a target site, compare it against similar websites, and continuously suggest theme/styling improvements.

## Website Modernization Agent

Use `tools/design_agent.py` to:
- inspect your website's style signals (colors, classes, UI patterns),
- compare against benchmark websites,
- generate ongoing design ideas in a JSON report.

### Quick start

```bash
python3 tools/design_agent.py \
  --config tools/design_agent_config.example.json \
  --output design_agent_report.json
```

### Example benchmark sources to research

When building your benchmark list, include sites in your domain (for example auto-parts or B2B ordering portals), then rotate them monthly.

## Supporting docs

- Agent overview: `agents/website_design_agent.md`
- Config template: `tools/design_agent_config.example.json`
