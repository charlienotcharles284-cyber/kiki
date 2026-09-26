#!/usr/bin/env python3

import sys
import yaml


# ============================================================
# Microsoft Rule Filter
#
# Input:
#   Blackmatrix7 Microsoft.yaml
#
# Output:
#   Filtered Microsoft.yaml
#
# Purpose:
#   1. Remove OneDrive-specific rules
#   2. Remove Outlook / Hotmail-specific mail rules
#   3. Remove OneDrive process rules
#   4. Keep Microsoft 365 / Office / Copilot dependencies
#      and other Microsoft infrastructure
#
# Important:
#   Shared Microsoft infrastructure such as live.com,
#   microsoftonline.com, office.com, etc. is intentionally kept.
# ============================================================


if len(sys.argv) != 3:
    print(
        "Usage: python filter-microsoft.py "
        "<input.yaml> <output.yaml>"
    )
    sys.exit(1)


INPUT_FILE = sys.argv[1]
OUTPUT_FILE = sys.argv[2]


# ============================================================
# OneDrive
# ============================================================

ONEDRIVE_SUFFIXES = {
    "1drv.ms",
    "1drv.com",
    "livefilestore.com",
    "microsoftpersonalcontent.com",

    "onedrive.co",
    "onedrive.co.uk",
    "onedrive.eu",
    "onedrive.net",
    "onedrive.org",
    "onedrive.com",
}


ONEDRIVE_KEYWORDS = {
    "1drv",
    "onedrive",
    "skydrive",
}


ONEDRIVE_PROCESS_NAMES = {
    "OneDrive",
    "OneDriveUpdater",
}


# ============================================================
# Outlook / Hotmail mail services
#
# Only remove domains that can be reasonably identified
# as mail-specific.
#
# Shared Microsoft infrastructure such as live.com is
# intentionally NOT removed.
# ============================================================

MAIL_SUFFIXES = {
    # Outlook
    "outlook.cn",
    "outlook.com",
    "outlookgroups.ms",
    "outlookmobile.com",

    # Hotmail
    "hotmail",
    "hotmail.co",
    "hotmail.com",
    "hotmail.eu",
    "hotmail.net",
    "hotmail.org",

    # Outlook mobile backend
    "acompli.com",
    "acompli.net",

    # Microsoft email-related domain
    "microsoftemail.com",
}


# ============================================================
# Load YAML
# ============================================================

with open(INPUT_FILE, "r", encoding="utf-8") as f:
    data = yaml.safe_load(f)


if not isinstance(data, dict):
    raise ValueError("Invalid YAML structure")


payload = data.get("payload", [])

if not isinstance(payload, list):
    raise ValueError("Invalid payload structure")


# ============================================================
# Filter
# ============================================================

filtered = []

removed_onedrive = []
removed_mail = []
removed_process = []


for rule in payload:

    if not isinstance(rule, str):
        filtered.append(rule)
        continue

    parts = rule.split(",", 1)

    if len(parts) != 2:
        filtered.append(rule)
        continue

    rule_type = parts[0].strip()
    value = parts[1].strip()

    # --------------------------------------------------------
    # Remove OneDrive process rules
    # --------------------------------------------------------

    if rule_type == "PROCESS-NAME":
        if value in ONEDRIVE_PROCESS_NAMES:
            removed_process.append(rule)
            continue

    # --------------------------------------------------------
    # Remove OneDrive domain suffixes
    # --------------------------------------------------------

    if rule_type == "DOMAIN-SUFFIX":
        if value in ONEDRIVE_SUFFIXES:
            removed_onedrive.append(rule)
            continue

        if value in MAIL_SUFFIXES:
            removed_mail.append(rule)
            continue

    # --------------------------------------------------------
    # Remove OneDrive keyword rules
    # --------------------------------------------------------

    if rule_type == "DOMAIN-KEYWORD":
        if value in ONEDRIVE_KEYWORDS:
            removed_onedrive.append(rule)
            continue

    # --------------------------------------------------------
    # Keep everything else
    # --------------------------------------------------------

    filtered.append(rule)


# ============================================================
# Update metadata
# ============================================================

data["payload"] = filtered


# ============================================================
# Write output
# ============================================================

with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
    yaml.safe_dump(
        data,
        f,
        allow_unicode=True,
        sort_keys=False,
        default_flow_style=False,
    )


# ============================================================
# Report
# ============================================================

print("Microsoft rule filtering completed.")
print(f"Original rules : {len(payload)}")
print(f"Output rules   : {len(filtered)}")
print(f"OneDrive       : {len(removed_onedrive)} removed")
print(f"Mail           : {len(removed_mail)} removed")
print(f"Process        : {len(removed_process)} removed")
print(f"Output         : {OUTPUT_FILE}")

if removed_onedrive:
    print("\nRemoved OneDrive rules:")
    for rule in removed_onedrive:
        print(f"  {rule}")

if removed_mail:
    print("\nRemoved mail rules:")
    for rule in removed_mail:
        print(f"  {rule}")

if removed_process:
    print("\nRemoved process rules:")
    for rule in removed_process:
        print(f"  {rule}")
