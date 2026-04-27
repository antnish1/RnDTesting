#!/usr/bin/env python3
"""Continuous website design intelligence agent.

This script inspects a target website and benchmark websites, then produces a
report with theme/style gaps and modernization ideas.
"""

from __future__ import annotations

import argparse
import datetime as dt
import json
import re
import urllib.error
import urllib.parse
import urllib.request
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
from typing import Dict, List


class StyleSignalParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.class_names: List[str] = []
        self.inline_styles: List[str] = []
        self.stylesheet_links: List[str] = []
        self.font_mentions: List[str] = []

    def handle_starttag(self, tag: str, attrs):
        attr_map = dict(attrs)
        class_attr = attr_map.get("class", "")
        if class_attr:
            self.class_names.extend(class_attr.split())

        style = attr_map.get("style", "")
        if style:
            self.inline_styles.append(style)

        rel = attr_map.get("rel", "")
        href = attr_map.get("href", "")
        if tag == "link" and "stylesheet" in rel and href:
            self.stylesheet_links.append(href)

        if tag in {"body", "div", "section", "header", "main", "footer"} and style:
            self.font_mentions.extend(re.findall(r"font-family\s*:\s*([^;]+)", style, re.IGNORECASE))


HEX_COLOR_RE = re.compile(r"#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})\b")
FRAMEWORK_HINTS = {
    "tailwind": ["tailwind", "tw-", "bg-", "text-", "md:"],
    "bootstrap": ["bootstrap", "btn-", "container", "row", "col-"],
    "material": ["material", "mat-"],
}
UI_PATTERN_HINTS = {
    "hero section": ["hero", "banner", "jumbotron"],
    "card grid": ["card", "grid", "tile"],
    "sticky header": ["sticky", "navbar", "top-0"],
    "cta button": ["cta", "btn", "button-primary", "primary-btn"],
}


def fetch_html(url: str, timeout: int = 15) -> str:
    req = urllib.request.Request(
        url,
        headers={"User-Agent": "DesignAgent/1.0 (+website-style-monitor)"},
    )
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        content_type = resp.headers.get("content-type", "")
        if "text/html" not in content_type and content_type:
            raise ValueError(f"Unsupported content type: {content_type}")
        charset = "utf-8"
        if "charset=" in content_type:
            charset = content_type.split("charset=")[-1].split(";")[0].strip()
        return resp.read().decode(charset, errors="replace")


def extract_signals(html: str) -> Dict[str, object]:
    parser = StyleSignalParser()
    parser.feed(html)

    joined = "\n".join(parser.inline_styles)
    colors = HEX_COLOR_RE.findall(html) + HEX_COLOR_RE.findall(joined)
    color_counts = Counter(c.lower() for c in colors)

    class_counts = Counter(parser.class_names)

    framework_hits: Dict[str, int] = {}
    lower_html = html.lower()
    for framework, hints in FRAMEWORK_HINTS.items():
        framework_hits[framework] = sum(lower_html.count(h) for h in hints)

    patterns: Dict[str, int] = {}
    classes_joined = " ".join(parser.class_names).lower()
    for label, hints in UI_PATTERN_HINTS.items():
        patterns[label] = sum(classes_joined.count(h) + lower_html.count(h) for h in hints)

    return {
        "top_colors": color_counts.most_common(8),
        "top_classes": class_counts.most_common(12),
        "framework_hints": framework_hits,
        "ui_patterns": patterns,
        "stylesheets": parser.stylesheet_links[:15],
        "font_mentions": parser.font_mentions[:10],
    }


def compare_target_to_benchmarks(target: Dict[str, object], benchmarks: List[Dict[str, object]]) -> List[str]:
    ideas: List[str] = []

    target_colors = {c for c, _ in target["top_colors"]} if target["top_colors"] else set()
    bench_colors = set()
    for b in benchmarks:
        bench_colors.update(c for c, _ in b["top_colors"])

    new_colors = [c for c in bench_colors if c not in target_colors]
    if new_colors:
        ideas.append(f"Test a refined accent palette from benchmark patterns: {', '.join(new_colors[:5])}.")

    target_framework = max(target["framework_hints"], key=target["framework_hints"].get)
    bench_frameworks = [max(b["framework_hints"], key=b["framework_hints"].get) for b in benchmarks if b["framework_hints"]]
    popular_framework = Counter(bench_frameworks).most_common(1)
    if popular_framework and popular_framework[0][0] != target_framework:
        ideas.append(
            f"Target appears closest to '{target_framework}', while benchmarks lean toward '{popular_framework[0][0]}'; consider aligning component patterns."
        )

    target_patterns = target["ui_patterns"]
    benchmark_avg_patterns = Counter()
    for b in benchmarks:
        benchmark_avg_patterns.update(b["ui_patterns"])

    for pattern_name, benchmark_count in benchmark_avg_patterns.items():
        if benchmark_count > target_patterns.get(pattern_name, 0):
            ideas.append(f"Increase usage of {pattern_name} components to match industry visual conventions.")

    if not ideas:
        ideas.append("Keep current visual direction and focus on accessibility and spacing consistency audits.")

    ideas.append("Run this agent daily and track design diffs to avoid one-time redesign drift.")
    return ideas[:10]


def run_agent(target_url: str, benchmark_urls: List[str]) -> Dict[str, object]:
    target_error = None
    target_signals: Dict[str, object] = {}
    try:
        target_html = fetch_html(target_url)
        target_signals = extract_signals(target_html)
    except (urllib.error.URLError, ValueError, TimeoutError) as exc:
        target_error = str(exc)

    benchmark_reports = []
    benchmark_signals = []
    for url in benchmark_urls:
        try:
            html = fetch_html(url)
            sig = extract_signals(html)
            benchmark_reports.append({"url": url, "signals": sig})
            benchmark_signals.append(sig)
        except (urllib.error.URLError, ValueError, TimeoutError) as exc:
            benchmark_reports.append({"url": url, "error": str(exc)})

    if target_error:
        ideas = [
            "Could not fetch the target website. Check network access, firewall, or anti-bot protections.",
            "Retry with a publicly accessible target URL and run on a network with outbound HTTPS access.",
        ]
    elif benchmark_signals:
        ideas = compare_target_to_benchmarks(target_signals, benchmark_signals)
    else:
        ideas = [
            "Could not fetch benchmark websites; review connectivity or blocked pages.",
            "Preload a curated benchmark list with public, crawlable pages.",
        ]

    return {
        "generated_at_utc": dt.datetime.now(dt.timezone.utc).isoformat(),
        "target": {"url": target_url, "signals": target_signals, "error": target_error},
        "benchmarks": benchmark_reports,
        "recommended_ideas": ideas,
    }


def load_config(path: Path) -> Dict[str, object]:
    return json.loads(path.read_text(encoding="utf-8"))


def main() -> int:
    parser = argparse.ArgumentParser(description="Website modernization intelligence agent")
    parser.add_argument("--target", help="Target website URL")
    parser.add_argument("--benchmarks", nargs="*", default=[], help="Benchmark website URLs")
    parser.add_argument("--config", help="Path to JSON config file")
    parser.add_argument("--output", default="design_agent_report.json", help="Output JSON report path")

    args = parser.parse_args()

    target = args.target
    benchmarks = args.benchmarks

    if args.config:
        cfg = load_config(Path(args.config))
        target = target or cfg.get("target")
        benchmarks = benchmarks or cfg.get("benchmarks", [])

    if not target:
        raise SystemExit("Target URL is required (via --target or config).")

    report = run_agent(target, benchmarks)
    Path(args.output).write_text(json.dumps(report, indent=2), encoding="utf-8")
    print(f"Saved report to {args.output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
