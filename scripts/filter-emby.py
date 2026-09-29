#!/usr/bin/env python3

import sys
from pathlib import Path


# 仅保留适合转换为 Mihomo domain MRS 的规则类型
ALLOWED_TYPES = {
    "DOMAIN",
    "DOMAIN-SUFFIX",
    "DOMAIN-KEYWORD",
}


def filter_emby(file_path: str) -> None:
    path = Path(file_path)

    if not path.exists():
        print(f"错误：文件不存在：{path}", file=sys.stderr)
        sys.exit(1)

    kept_rules = []
    removed_rules = []

    with path.open("r", encoding="utf-8") as f:
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

    # 直接覆盖原始 Emby.yaml
    with path.open("w", encoding="utf-8", newline="\n") as f:
        f.write("payload:\n")

        for rule in kept_rules:
            f.write(f"  - {rule}\n")

    print("Emby 规则过滤完成")
    print(f"保留规则：{len(kept_rules)}")
    print(f"过滤规则：{len(removed_rules)}")

    if removed_rules:
        print("\n已过滤规则：")
        for rule in removed_rules:
            print(f"  - {rule}")


def main():
    if len(sys.argv) != 2:
        print(
            f"用法：python {Path(sys.argv[0]).name} <Emby.yaml>",
            file=sys.stderr,
        )
        sys.exit(1)

    filter_emby(sys.argv[1])


if __name__ == "__main__":
    main()