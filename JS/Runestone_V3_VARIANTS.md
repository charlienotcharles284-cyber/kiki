# Runestone V3 Stable 与 MIPS Beta

两个版本使用相同的策略组、地区 Auto、分流规则和远程规则集。每次修改 Stable 后运行 `node scripts/build-v3-mips.cjs` 重新生成 Beta。

| 版本 | 文件 | 网络设置行为 | 适用场景 |
|---|---|---|---|
| Stable | `Runestone_V3.js` | 保留 Hako 传入的 DNS、TUN、stack、端口等配置 | 日常使用；由用户或 Hako 决定 MIPS/gVisor |
| MIPS Beta | `Runestone_V3_MIPS.js` | 只把 `tun.stack` 改为 `mips`，其余网络设置保持不变 | MIPS 对照测试；不希望使用 V2 整套网络覆写的用户 |

Stable 在 Hako 原配置已经选择 MIPS 时同样会运行 MIPS。Beta 的作用是显式强制 MIPS，便于在相同节点、DNS 和规则条件下与 Stable 对比。

这次 Stable 同时从 V2 移植了 Amazon 分流。Amazon 组覆盖主要国际商城、静态资源和 Amazon Pay，没有匹配整个 `amazonaws.com`，以免接管普通 AWS 服务。

维护命令：

```bash
node scripts/build-v3-mips.cjs
node scripts/build-v3-mips.cjs --check
node --check JS/Runestone_V3.js
node --check JS/Runestone_V3_MIPS.js
```
