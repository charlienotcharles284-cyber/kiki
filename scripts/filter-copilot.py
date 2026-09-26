#!/usr/bin/env python3

import sys
import yaml


DOMAIN_TYPES = {
    "DOMAIN",
    "DOMAIN-SUFFIX",
}

IP_TYPES = {
    "IP-CIDR",
    "IP-CIDR6",
}


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

    return parts[1].strip()


def main():
    if len(sys.argv) != 4:
        print(
            "Usage: python filter-copilot.py "
            "<input.yaml> <domain-output.yaml> <ip-output.yaml>"
        )
        sys.exit(1)

    input_file = sys.argv[1]
    domain_output = sys.argv[2]
    ip_output = sys.argv[3]

    with open(input_file, "r", encoding="utf-8") as f:
        data = yaml.safe_load(f)

    if not isinstance(data, dict):
        raise ValueError("Input YAML is not a valid mapping.")

    payload = data.get("payload", [])

    if not isinstance(payload, list):
        raise ValueError("Input YAML does not contain a valid payload list.")

    domain_rules = []
    ip_rules = []

    removed_counts = {}

    for rule in payload:
        rule_type = get_rule_type(rule)
        rule_value = get_rule_value(rule)

        # =========================
        # Domain rules
        # =========================

        if rule_type in DOMAIN_TYPES:
            domain_rules.append(rule)

        # =========================
        # IP-CIDR rules
        # =========================

        elif rule_type in IP_TYPES:
            if rule_value:
                # MRS ipcidr YAML requires
                # the raw CIDR value only.
                ip_rules.append(rule_value)
            else:
                removed_counts["EMPTY-IP-CIDR"] = (
                    removed_counts.get("EMPTY-IP-CIDR", 0) + 1
                )

        # =========================
        # Unsupported rules
        # =========================

        else:
            if rule_type is None:
                reason = "INVALID"
            else:
                reason = rule_type

            removed_counts[reason] = (
                removed_counts.get(reason, 0) + 1
            )

    domain_data = {
        "payload": domain_rules
    }

    ip_data = {
        "payload": ip_rules
    }

    with open(domain_output, "w", encoding="utf-8") as f:
        yaml.safe_dump(
            domain_data,
            f,
            allow_unicode=True,
            sort_keys=False,
            default_flow_style=False,
        )

    with open(ip_output, "w", encoding="utf-8") as f:
        yaml.safe_dump(
            ip_data,
            f,
            allow_unicode=True,
            sort_keys=False,
            default_flow_style=False,
        )

    print(f"Input rules          : {len(payload)}")
    print(f"Domain rules         : {len(domain_rules)}")
    print(f"IP-CIDR rules        : {len(ip_rules)}")
    print(
        f"Removed unsupported  : "
        f"{len(payload) - len(domain_rules) - len(ip_rules)}"
    )

    if removed_counts:
        print("\nRemoved by category:")

        for reason, count in sorted(removed_counts.items()):
            print(f"  {reason}: {count}")


if __name__ == "__main__":
    main()