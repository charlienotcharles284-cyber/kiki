#!/usr/bin/env python3
"""
Filter iCloud rules from Apple.yaml and Apple_Domain.yaml.

Usage:
    python filter-icloud.py \
        Rules/iCloud.yaml \
        Rules/Apple.yaml \
        Rules/Apple_Filtered.yaml \
        Apple_Domain.yaml \
        Apple_Domain_Filtered.yaml
"""

import argparse
import re
from pathlib import Path


def normalize_domain(domain: str) -> str:
    """Normalize a domain for comparison."""
    domain = domain.strip().strip("'\"").lower()

    # Clash DOMAIN-SUFFIX / rule-provider style prefix
    if domain.startswith("+."):
        domain = domain[2:]
    elif domain.startswith("."):
        domain = domain[1:]

    return domain.rstrip(".")


def parse_icloud_rules(path: Path):
    """Read iCloud rules and return suffix/keyword sets."""
    suffixes = set()
    keywords = set()

    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()

        # DOMAIN-SUFFIX,example.com
        match = re.match(
            r"^-\s*DOMAIN-SUFFIX\s*,\s*(.+?)\s*$",
            line,
            re.IGNORECASE,
        )

        if match:
            suffixes.add(normalize_domain(match.group(1)))
            continue

        # DOMAIN-KEYWORD,example.com
        match = re.match(
            r"^-\s*DOMAIN-KEYWORD\s*,\s*(.+?)\s*$",
            line,
            re.IGNORECASE,
        )

        if match:
            keywords.add(normalize_domain(match.group(1)))
            continue

    return suffixes, keywords


def domain_matches_suffix(domain: str, suffix: str) -> bool:
    """Return True when domain equals suffix or is a subdomain of suffix."""
    domain = normalize_domain(domain)
    suffix = normalize_domain(suffix)

    return domain == suffix or domain.endswith("." + suffix)


def domain_is_icloud(domain: str, suffixes, keywords) -> bool:
    """Check whether a domain belongs to the iCloud rule set."""
    domain = normalize_domain(domain)

    # Match iCloud DOMAIN-SUFFIX rules.
    for suffix in suffixes:
        if domain_matches_suffix(domain, suffix):
            return True

    # Match iCloud DOMAIN-KEYWORD rules.
    for keyword in keywords:
        if keyword and keyword in domain:
            return True

    return False


def rule_is_icloud(rule: str, suffixes, keywords) -> bool:
    """Check whether a Clash rule should be removed."""
    match = re.match(
        r"^-\s*([A-Z0-9-]+)\s*,\s*(.+?)\s*$",
        rule.strip(),
        re.IGNORECASE,
    )

    if not match:
        return False

    rule_type = match.group(1).upper()
    value = match.group(2).strip().strip("'\"")

    if rule_type in {"DOMAIN", "DOMAIN-SUFFIX"}:
        return domain_is_icloud(
            value,
            suffixes,
            keywords,
        )

    if rule_type == "DOMAIN-KEYWORD":
        keyword = normalize_domain(value)

        # Exact keyword match.
        if keyword in keywords:
            return True

        # Match a keyword containing an iCloud keyword.
        for icloud_keyword in keywords:
            if icloud_keyword and icloud_keyword in keyword:
                return True

        # Match a keyword that is itself an iCloud suffix.
        for suffix in suffixes:
            if keyword == suffix:
                return True

    return False


def filter_clash_yaml(
    input_path: Path,
    output_path: Path,
    suffixes,
    keywords,
):
    """Filter payload rules while preserving the original YAML structure."""
    lines = input_path.read_text(
        encoding="utf-8"
    ).splitlines()

    output_lines = []
    removed = 0

    for line in lines:
        if line.lstrip().startswith("- "):
            if rule_is_icloud(
                line,
                suffixes,
                keywords,
            ):
                removed += 1
                continue

        output_lines.append(line)

    output_path.parent.mkdir(
        parents=True,
        exist_ok=True,
    )

    output_path.write_text(
        "\n".join(output_lines) + "\n",
        encoding="utf-8",
    )

    return removed


def filter_domain_yaml(
    input_path: Path,
    output_path: Path,
    suffixes,
    keywords,
):
    """Filter Apple_Domain.yaml while preserving its structure."""
    lines = input_path.read_text(
        encoding="utf-8"
    ).splitlines()

    output_lines = []
    removed = 0

    for line in lines:
        stripped = line.strip()

        if stripped.startswith("- "):
            value = stripped[2:].strip().strip("'\"")

            if domain_is_icloud(
                value,
                suffixes,
                keywords,
            ):
                removed += 1
                continue

        output_lines.append(line)

    output_path.parent.mkdir(
        parents=True,
        exist_ok=True,
    )

    output_path.write_text(
        "\n".join(output_lines) + "\n",
        encoding="utf-8",
    )

    return removed


def main():
    parser = argparse.ArgumentParser(
        description="Remove iCloud rules from Apple rule sets."
    )

    parser.add_argument(
        "icloud",
        type=Path,
        help="iCloud.yaml",
    )

    parser.add_argument(
        "apple",
        type=Path,
        help="Apple.yaml",
    )

    parser.add_argument(
        "apple_filtered",
        type=Path,
        help="Filtered Apple.yaml output",
    )

    parser.add_argument(
        "apple_domain",
        type=Path,
        help="Apple_Domain.yaml",
    )

    parser.add_argument(
        "apple_domain_filtered",
        type=Path,
        help="Filtered Apple_Domain.yaml output",
    )

    args = parser.parse_args()

    suffixes, keywords = parse_icloud_rules(
        args.icloud
    )

    if not suffixes and not keywords:
        raise RuntimeError(
            f"No iCloud DOMAIN-SUFFIX or "
            f"DOMAIN-KEYWORD rules found in "
            f"{args.icloud}"
        )

    removed_apple = filter_clash_yaml(
        args.apple,
        args.apple_filtered,
        suffixes,
        keywords,
    )

    removed_apple_domain = filter_domain_yaml(
        args.apple_domain,
        args.apple_domain_filtered,
        suffixes,
        keywords,
    )

    print(
        f"iCloud rules loaded: "
        f"{len(suffixes)} DOMAIN-SUFFIX, "
        f"{len(keywords)} DOMAIN-KEYWORD"
    )

    print(
        f"Removed from Apple.yaml: "
        f"{removed_apple}"
    )

    print(
        f"Removed from Apple_Domain.yaml: "
        f"{removed_apple_domain}"
    )


if __name__ == "__main__":
    main()
