#!/usr/bin/env python3
"""
Filter iCloud rules from Apple.yaml / Apple_Domain.yaml
and prepare iCloud domain rules for MRS conversion.

Usage:
    python filter-icloud.py \
        Rules/iCloud.yaml \
        Rules/Apple.yaml \
        Rules/Apple.yaml \
        .tmp/rules/Apple_Domain.yaml \
        .tmp/rules/Apple_Domain_Filtered.yaml \
        .tmp/rules/iCloud_Domain.txt
"""

import argparse
import re
from pathlib import Path


def normalize_domain(domain: str) -> str:
    """Normalize a domain for comparison."""
    domain = domain.strip().strip("'\"").lower()

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

        match = re.match(
            r"^-\s*DOMAIN-SUFFIX\s*,\s*(.+?)\s*$",
            line,
            re.IGNORECASE,
        )

        if match:
            suffixes.add(normalize_domain(match.group(1)))
            continue

        match = re.match(
            r"^-\s*DOMAIN-KEYWORD\s*,\s*(.+?)\s*$",
            line,
            re.IGNORECASE,
        )

        if match:
            keywords.add(normalize_domain(match.group(1)))
            continue

    return suffixes, keywords


def parse_icloud_domain_rules(path: Path):
    """
    Extract DOMAIN and DOMAIN-SUFFIX rules from Clash classical YAML.

    Output format for Mihomo domain rules:
      DOMAIN        -> example.com
      DOMAIN-SUFFIX -> +.example.com

    DOMAIN-KEYWORD is intentionally excluded because MRS domain
    rules cannot preserve Clash keyword semantics.
    """
    rules = []

    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()

        match = re.match(
            r"^-\s*(DOMAIN|DOMAIN-SUFFIX)\s*,\s*(.+?)\s*$",
            line,
            re.IGNORECASE,
        )

        if not match:
            continue

        rule_type = match.group(1).upper()
        domain = normalize_domain(match.group(2))

        if not domain:
            continue

        if rule_type == "DOMAIN":
            rules.append(domain)
        elif rule_type == "DOMAIN-SUFFIX":
            rules.append(f"+.{domain}")

    return sorted(set(rules))


def domain_matches_suffix(domain: str, suffix: str) -> bool:
    domain = normalize_domain(domain)
    suffix = normalize_domain(suffix)

    return domain == suffix or domain.endswith("." + suffix)


def domain_is_icloud(domain: str, suffixes, keywords) -> bool:
    domain = normalize_domain(domain)

    for suffix in suffixes:
        if domain_matches_suffix(domain, suffix):
            return True

    for keyword in keywords:
        if keyword and keyword in domain:
            return True

    return False


def rule_is_icloud(rule: str, suffixes, keywords) -> bool:
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

        if keyword in keywords:
            return True

        for icloud_keyword in keywords:
            if icloud_keyword and icloud_keyword in keyword:
                return True

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


def write_mrs_domain_source(
    input_path: Path,
    output_path: Path,
):
    """
    Convert Clash DOMAIN / DOMAIN-SUFFIX rules into
    Mihomo domain-rule text format.
    """
    rules = parse_icloud_domain_rules(input_path)

    output_path.parent.mkdir(
        parents=True,
        exist_ok=True,
    )

    output_path.write_text(
        "\n".join(rules) + "\n",
        encoding="utf-8",
    )

    return rules


def main():
    parser = argparse.ArgumentParser(
        description="Filter iCloud rules and prepare MRS domain source."
    )

    parser.add_argument("icloud")
    parser.add_argument("apple")
    parser.add_argument("apple_filtered")
    parser.add_argument("apple_domain")
    parser.add_argument("apple_domain_filtered")
    parser.add_argument("icloud_domain_output")

    args = parser.parse_args()

    icloud_path = Path(args.icloud)

    suffixes, keywords = parse_icloud_rules(
        icloud_path
    )

    if not suffixes and not keywords:
        raise RuntimeError(
            f"No iCloud DOMAIN-SUFFIX or DOMAIN-KEYWORD "
            f"rules found in {icloud_path}"
        )

    removed_apple = filter_clash_yaml(
        Path(args.apple),
        Path(args.apple_filtered),
        suffixes,
        keywords,
    )

    removed_apple_domain = filter_domain_yaml(
        Path(args.apple_domain),
        Path(args.apple_domain_filtered),
        suffixes,
        keywords,
    )

    mrs_rules = write_mrs_domain_source(
        icloud_path,
        Path(args.icloud_domain_output),
    )

    print(
        f"iCloud rules loaded: "
        f"{len(suffixes)} DOMAIN-SUFFIX, "
        f"{len(keywords)} DOMAIN-KEYWORD"
    )

    print(
        f"iCloud MRS domain rules: "
        f"{len(mrs_rules)}"
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