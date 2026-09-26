#!/usr/bin/env python3

import sys
import yaml


# =========================
# Configuration
# =========================

ONEDRIVE_SUFFIXES = {
    "1drv.ms",
    "1drv.com",
    "livefilestore.com",
    "microsoftpersonalcontent.com",
    "onedrive.com",
    "onedrive.co",
    "onedrive.co.uk",
    "onedrive.eu",
    "onedrive.net",
    "onedrive.org",
}

OUTLOOK_SUFFIXES = {
    "acompli.com",
    "acompli.net",
    "hotmail",
    "hotmail.co",
    "hotmail.com",
    "hotmail.eu",
    "hotmail.net",
    "hotmail.org",
    "microsoftemail.com",
    "outlook.cn",
    "outlook.com",
    "outlookgroups.ms",
    "outlookmobile.com",
}

ONEDRIVE_KEYWORDS = {
    "1drv",
    "onedrive",
    "skydrive",
}


# =========================
# Helpers
# =========================

def get_rule_type(rule):
    if not isinstance(rule, str):
        return None

    parts = rule.split(",", 2)

    if not parts:
        return None

    return parts[0].strip().upper()


def get_rule_value(rule):
    parts = rule.split(",", 2)

    if len(parts) < 2:
        return ""

    return parts[1].strip().lower()


def should_remove(rule):
    rule_type = get_rule_type(rule)
    value = get_rule_value(rule)

    # MRS domain 不支持 classical 中的进程规则
    if rule_type == "PROCESS-NAME":
        return True, "PROCESS-NAME"

    # MRS domain 不支持 DOMAIN-KEYWORD
    if rule_type == "DOMAIN-KEYWORD":
        return True, "DOMAIN-KEYWORD"

    # 只处理真正的域名规则
    if rule_type not in {"DOMAIN", "DOMAIN-SUFFIX"}:
        return True, f"UNSUPPORTED:{rule_type}"

    # OneDrive
    if value in ONEDRIVE_SUFFIXES:
        return True, "OneDrive"

    if rule_type == "DOMAIN-KEYWORD" and value in ONEDRIVE_KEYWORDS:
        return True, "OneDrive"

    # Outlook / Hotmail / Microsoft Mail
    if value in OUTLOOK_SUFFIXES:
        return True, "Outlook"

    return False, None


# =========================
# Main
# =========================

def main():
    if len(sys.argv) != 3:
        print(
            "Usage: python filter-microsoft.py "
            "<input.yaml> <output.yaml>"
        )
        sys.exit(1)

    input_file = sys.argv[1]
    output_file = sys.argv[2]

    with open(input_file, "r", encoding="utf-8") as f:
        data = yaml.safe_load(f)

    if not isinstance(data, dict):
        raise ValueError("Input YAML is not a valid mapping.")

    payload = data.get("payload", [])

    if not isinstance(payload, list):
        raise ValueError("Input YAML does not contain a valid payload list.")

    filtered = []

    removed_counts = {}

    for rule in payload:
        remove, reason = should_remove(rule)

        if remove:
            removed_counts[reason] = removed_counts.get(reason, 0) + 1
            continue

        filtered.append(rule)

    output = {
        "payload": filtered
    }

    with open(output_file, "w", encoding="utf-8") as f:
        yaml.safe_dump(
            output,
            f,
            allow_unicode=True,
            sort_keys=False,
            default_flow_style=False,
        )

    print(f"Input rules : {len(payload)}")
    print(f"Output rules: {len(filtered)}")
    print(f"Removed     : {len(payload) - len(filtered)}")

    if removed_counts:
        print("\nRemoved by category:")

        for reason, count in sorted(removed_counts.items()):
            print(f"  {reason}: {count}")


if __name__ == "__main__":
    main()