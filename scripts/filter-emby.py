#!/usr/bin/env python3

import sys
from pathlib import Path


# 允许进入 Mihomo domain MRS 的规则类型
ALLOWED_TYPES = {
    "DOMAIN",
    "DOMAIN-SUFFIX",
    "DOMAIN-KEYWORD",
}


def filter_emby(input_file: str, output_file: str) -> None:
    input_path = Path(input_file)
    output_path = Path(output_file)

    if not input_path.exists():
        print(f"错误：输入文件不存在：{input_path}", file=sys.stderr)
        sys.exit(1)

    kept_rules = []
    removed_rules = []

    with input_path.open("r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()

            # 跳过空行、注释和 payload:
            if not line or line.startswith("#") or line == "payload:":
                continue

            # 去掉 YAML 列表前缀
            if line.startswith("- "):
                rule = line[2:].strip()
            else:
                rule = line

            rule_type = rule.split(",", 1)[0].strip().upper()

            if rule_type in ALLOWED_TYPES:
                kept_rules.append(rule)
            else:
                removed_rules.append(rule)

    output_path.parent.mkdir(parents=True, exist_ok=True)

    # 输出标准 Clash Rule Provider YAML
    with output_path.open("w", encoding="utf-8", newline="\n") as f:
        f.write("payload:\n")
        for rule in kept_rules:
            f.write(f"  - {rule}\n")

    print(f"Emby 规则过滤完成")
    print(f"保留规则：{len(kept_rules)}")
    print(f"过滤规则：{len(removed_rules)}")

    if removed_rules:
        print("\n已过滤以下规则：")
        for rule in removed_rules:
            print(f"  - {rule}")


def main():
    if len(sys.argv) != 3:
        print(
            f"用法：python {Path(sys.argv[0]).name} <输入文件> <输出文件>",
            file=sys.stderr,
        )
        sys.exit(1)

    filter_emby(sys.argv[1], sys.argv[2])


if __name__ == "__main__":
    main()
