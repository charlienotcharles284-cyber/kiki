/* Runestone V3 — routing-only Hako post-merge override.
 * Import the raw JavaScript URL, save, and select it after node-source merging.
 * Network settings and node objects are retained. Rules and groups are replaced.
 * URL import is a snapshot: re-import to upgrade. See docs/RUNESTONE_V3.md.
 */
const RUNESTONE = {repository: "kiki-rgb-00/kiki", personal: false};

function main(config) {
  // Hako 当前选中的所有机场节点都会合并到 config.proxies。
  const currentProxies = Array.isArray(config && config.proxies)
    ? config.proxies
    : [];

  const currentProxyNames = currentProxies
    .map(p =>
      typeof p === "string"
        ? p
        : (p && typeof p.name === "string" ? p.name : null)
    )
    .filter(Boolean);

  if (!config || typeof config !== "object" || Array.isArray(config)) {
    throw new Error("Runestone: expected a configuration object");
  }

  if (!currentProxies.length) {
    throw new Error(
      "Runestone: no materialized nodes; select node sources and use the post-merge script stage"
    );
  }

  if (
    currentProxies.some(
      p =>
        !p ||
        typeof p !== "object" ||
        typeof p.name !== "string" ||
        !p.name.trim()
    )
  ) {
    throw new Error(
      "Runestone: every node must be an object with a non-empty name"
    );
  }

  if (new Set(currentProxyNames).size !== currentProxyNames.length) {
    throw new Error(
      "Runestone: duplicate node names; rename conflicting nodes in the source"
    );
  }

  // Preserve client-owned networking and provider fields.
  // Replace routing below.
  const fixed = Object.assign({}, config);

  fixed.mode = "rule";

  fixed.profile = Object.assign(
    {},
    config.profile,
    {"store-selected": true}
  );

  fixed.proxies = currentProxies;
  fixed["proxy-groups"] = [];

  // ============================================================
  // 1. 主策略组
  //
  // Auto 组故意不在这里生成。
  // Auto 会在普通服务策略组之后生成。
  // ============================================================

  fixed["proxy-groups"].push(
    {
      "name": "PROXY-Gate",
      "type": "select",
      "icon": "https://fastly.jsdelivr.net/gh/Koolson/Qure/IconSet/Color/Final.png",
      "proxies": [
        "🖥️ All-Nodes",
        "DIRECT"
      ]
    },

    {
      "name": "Apple Push",
      "type": "fallback",
      "icon": "https://fastly.jsdelivr.net/gh/Koolson/Qure/IconSet/Color/Apple.png",
      "proxies": [
        "APNs-Fallback",
        "DIRECT"
      ],
      "url": "http://captive.apple.com/hotspot-detect.html",
      "interval": 300
    },

    {
      "name": "🖥️ All-Nodes",
      "type": "select",
      "proxies": currentProxyNames.slice(),
      "icon": "https://fastly.jsdelivr.net/gh/Koolson/Qure/IconSet/Color/Server.png"
    }
  );

  // ============================================================
  // 2. 保留的普通服务策略组
  //
  // GPT
  // Microsoft
  // Google
  // Apple
  // X
  // Telegram
  // Github
  // ============================================================

  fixed["proxy-groups"].push({
    "name": "GPT",
    "type": "select",
    "icon": "https://raw.githubusercontent.com/kiki-rgb-00/kiki/refs/heads/main/Ti/ChatGPT.png",
    "proxies": [
      "🖥️ All-Nodes",
      "PROXY-Gate",
      "DIRECT"
    ]
  });

  // Microsoft
  //
  // Microsoft / Copilot 共用 Microsoft 策略组。
  // 具体规则通过 Microsoft.mrs、Copilot_Domain.mrs
  // 和 Copilot_IP.mrs 提供。
  fixed["proxy-groups"].push({
    "name": "Microsoft",
    "type": "select",
    "icon": "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Microsoft.png",
    "proxies": [
      "🖥️ All-Nodes",
      "PROXY-Gate",
      "DIRECT"
    ]
  });

  fixed["proxy-groups"].push({
    "name": "Google",
    "type": "select",
    "icon": "https://raw.githubusercontent.com/kiki-rgb-00/kiki/refs/heads/main/Ti/Google.PNG",
    "proxies": [
      "🖥️ All-Nodes",
      "PROXY-Gate",
      "DIRECT"
    ]
  });

  // Apple
  fixed["proxy-groups"].push({
    "name": "Apple",
    "type": "select",
    "icon": "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Apple_2.png",
    "proxies": [
      "🖥️ All-Nodes",
      "PROXY-Gate",
      "DIRECT"
    ]
  });

  fixed["proxy-groups"].push({
    "name": "X",
    "type": "select",
    "icon": "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/X.png",
    "proxies": [
      "🖥️ All-Nodes",
      "PROXY-Gate",
      "DIRECT"
    ]
  });

  fixed["proxy-groups"].push({
    "name": "Telegram",
    "type": "select",
    "icon": "https://fastly.jsdelivr.net/gh/Koolson/Qure/IconSet/Color/Telegram.png",
    "proxies": [
      "🖥️ All-Nodes",
      "PROXY-Gate",
      "DIRECT"
    ]
  });

  fixed["proxy-groups"].push({
    "name": "Github",
    "type": "select",
    "icon": "https://fastly.jsdelivr.net/gh/Koolson/Qure/IconSet/Color/GitHub.png",
    "proxies": [
      "🖥️ All-Nodes",
      "PROXY-Gate",
      "DIRECT"
    ]
  });

  // ============================================================
  // 3. 地区 Auto
  //
  // 仅保留：
  // US / SG / HK / JP / TW
  //
  // 没有对应节点则不生成该地区组。
  // ============================================================

  const regionGroups = [
    {
      key: "US",
      name: "🇺🇸 US",
      filter: /([\[]US[\]]|^US$|USA|United[ _-]?States|\bUS\b|美国|美國|🇺🇸)/i,
      icon: "https://fastly.jsdelivr.net/gh/Koolson/Qure/IconSet/Color/United_States.png"
    },

    {
      key: "SG",
      name: "🇸🇬 SG",
      filter: /([\[]SG[\]]|^SG$|Singapore|\bSG\b|新加坡|狮城|🇸🇬)/i,
      icon: "https://fastly.jsdelivr.net/gh/Koolson/Qure/IconSet/Color/Singapore.png"
    },

    {
      key: "HK",
      name: "🇭🇰 HK",
      filter: /([\[]HK[\]]|^HK$|Hong[ _-]?Kong|\bHK\b|香港|🇭🇰)/i,
      icon: "https://fastly.jsdelivr.net/gh/Koolson/Qure/IconSet/Color/Hong_Kong.png"
    },

    {
      key: "JP",
      name: "🇯🇵 JP",
      filter: /([\[]JP[\]]|^JP$|Japan|\bJP\b|日本|东京|大阪|🇯🇵)/i,
      icon: "https://fastly.jsdelivr.net/gh/Koolson/Qure/IconSet/Color/Japan.png"
    },

    {
      key: "TW",
      name: "🇹🇼 TW",
      filter: /([\[]TW[\]]|^TW$|Taiwan|Taibei|Taipei|\bTW\b|台湾|臺灣|台北|高雄|🇹🇼)/i,
      icon: "https://fastly.jsdelivr.net/gh/Koolson/Qure/IconSet/Color/Taiwan.png"
    }
  ];

  const existingRegionalAutos = [];

  regionGroups.forEach(region => {
    const matched = currentProxyNames.filter(
      name => region.filter.test(name)
    );

    const autoName = region.name + "-Auto";

    // 没有节点则完全不生成该地区组。
    if (matched.length === 0) {
      return;
    }

    fixed["proxy-groups"].push({
      name: autoName,
      type: "url-test",
      proxies: matched,
      icon: region.icon,
      url: "http://www.gstatic.com/generate_204",
      interval: 900,
      tolerance: 50
    });

    existingRegionalAutos.push(autoName);
  });

  // ============================================================
  // 4. 将实际存在的 Auto 组加入保留的服务策略组
  // ============================================================

  const serviceProxyChoices = [
    "🖥️ All-Nodes",
    ...existingRegionalAutos,
    "PROXY-Gate",
    "DIRECT"
  ];

  const serviceGroupNames = [
    "GPT",
    "Microsoft",
    "Google",
    "Apple",
    "X",
    "Telegram",
    "Github"
  ];

  fixed["proxy-groups"].forEach(group => {
    if (serviceGroupNames.includes(group.name)) {
      group.proxies = serviceProxyChoices.slice();
    }
  });

  // ============================================================
  // 5. PROXY-Gate
  //
  // 只加入实际存在的地区 Auto。
  // ============================================================

  const proxyGate = fixed["proxy-groups"].find(
    group => group.name === "PROXY-Gate"
  );

  if (proxyGate) {
    proxyGate.proxies = [
      "🖥️ All-Nodes",
      ...existingRegionalAutos,
      "DIRECT"
    ];
  }

  // ============================================================
  // 6. Apple Push 专用 APNs-Fallback
  //
  // 只引用实际生成的地区 Auto。
  //
  // Apple Push：
  //   ├─ APNs-Fallback
  //   └─ DIRECT
  // ============================================================

  fixed["proxy-groups"].push({
    name: "APNs-Fallback",
    type: "fallback",
    proxies: existingRegionalAutos.length
      ? existingRegionalAutos
      : currentProxyNames.slice(),
    icon: "https://fastly.jsdelivr.net/gh/Koolson/Qure/IconSet/Color/Apple.png",
    url: "http://captive.apple.com/hotspot-detect.html",
    interval: 300
  });

  // ============================================================
  // Rules
  // ============================================================

  fixed.rules = [
    "IP-CIDR,192.168.0.0/16,DIRECT,no-resolve",
    "IP-CIDR,10.0.0.0/8,DIRECT,no-resolve",
    "IP-CIDR,172.16.0.0/12,DIRECT,no-resolve",
    "IP-CIDR,127.0.0.0/8,DIRECT,no-resolve",
    "GEOIP,LAN,DIRECT,no-resolve",

    // ==========================================================
    // Apple Push
    // 必须位于普通 Apple 规则之前
    // ==========================================================

    "DOMAIN-SUFFIX,push.apple.com,Apple Push",
    "DOMAIN-SUFFIX,push-apple.com.akadns.net,Apple Push",
    "DOMAIN-KEYWORD,apple.com.edgekey.net,Apple Push",

    "IP-CIDR,17.249.0.0/16,Apple Push,no-resolve",
    "IP-CIDR,17.252.0.0/16,Apple Push,no-resolve",
    "IP-CIDR,17.57.144.0/22,Apple Push,no-resolve",
    "IP-CIDR,17.188.128.0/18,Apple Push,no-resolve",
    "IP-CIDR,17.188.20.0/23,Apple Push,no-resolve",

    "IP-CIDR6,2620:149:a44::/48,Apple Push,no-resolve",
    "IP-CIDR6,2403:300:a42::/48,Apple Push,no-resolve",
    "IP-CIDR6,2403:300:a51::/48,Apple Push,no-resolve",
    "IP-CIDR6,2a01:b740:a42::/48,Apple Push,no-resolve",

    // ==========================================================
    // 广告 / 隐私
    // ==========================================================

    "RULE-SET,AdvertisingLite,REJECT",
    "RULE-SET,AdvertisingLite_Domain,REJECT",
    "RULE-SET,Privacy,REJECT",
    "RULE-SET,Privacy_Domain,REJECT",
    "RULE-SET,ACL4SSR_BanAD,REJECT",
    "RULE-SET,ACL4SSR_BanProgramAD,REJECT",

    // ==========================================================
    // 加密货币
    //
    // 保留，因为仍然统一进入 PROXY-Gate。
    // ==========================================================

    "DOMAIN-SUFFIX,aicoin.com,PROXY-Gate",
    "DOMAIN-SUFFIX,coinbase.com,PROXY-Gate",
    "DOMAIN-SUFFIX,binance.com,PROXY-Gate",
    "DOMAIN-SUFFIX,kraken.com,PROXY-Gate",
    "DOMAIN-SUFFIX,crypto.com,PROXY-Gate",
    "DOMAIN-SUFFIX,okx.com,PROXY-Gate",
    "DOMAIN-SUFFIX,bybit.com,PROXY-Gate",
    "DOMAIN-SUFFIX,bitget.com,PROXY-Gate",
    "DOMAIN-SUFFIX,gemini.com,PROXY-Gate",
    "DOMAIN-SUFFIX,metamask.io,PROXY-Gate",
    "DOMAIN-SUFFIX,phantom.com,PROXY-Gate",
    "DOMAIN-SUFFIX,trustwallet.com,PROXY-Gate",
    "DOMAIN-SUFFIX,ledger.com,PROXY-Gate",

    // ==========================================================
    // GPT
    // ==========================================================

    "DOMAIN-SUFFIX,chatgpt.com,GPT",
    "DOMAIN-SUFFIX,openai.com,GPT",
    "DOMAIN-SUFFIX,auth.openai.com,GPT",
    "DOMAIN-SUFFIX,oaistatic.com,GPT",
    "DOMAIN-SUFFIX,oaiusercontent.com,GPT",
    "DOMAIN,android.chat.openai.com,GPT",
    "DOMAIN,auth0.openai.com,GPT",
    "DOMAIN,chat.openai.com,GPT",
    "DOMAIN,desktop.chat.openai.com,GPT",
    "DOMAIN,ios.chat.openai.com,GPT",
    "DOMAIN,tcr9i.chat.openai.com,GPT",
    "DOMAIN,cdn.openaimerge.com,GPT",
    "DOMAIN,ws.chatgpt.com,GPT",
    "DOMAIN,setup.auth.openai.com,GPT",
    "DOMAIN,cdn.workos.com,GPT",
    "DOMAIN,forwarder.workos.com,GPT",
    "DOMAIN,images.workoscdn.com,GPT",
    "DOMAIN,workos.imgix.net,GPT",
    "DOMAIN,setup.workos.com,GPT",
    "DOMAIN,ct.sendgrid.net,GPT",
    "DOMAIN,oaistatsig.com,GPT",
    "DOMAIN,intercom.io,GPT",
    "DOMAIN,intercomcdn.com,GPT",
    "DOMAIN,js.intercomcdn.com,GPT",
    "DOMAIN,js.stripe.com,GPT",
    "DOMAIN,o207216.ingest.sentry.io,GPT",
    "DOMAIN,o33249.ingest.sentry.io,GPT",
    "DOMAIN,rum.browser-intake-datadoghq.com,GPT",
    "DOMAIN,challenges.cloudflare.com,GPT",
    "DOMAIN,humb.apple.com,GPT",

    // ==========================================================
    // Microsoft / Copilot
    //
    // Microsoft.mrs / Copilot_Domain.mrs / Copilot_IP.mrs
    // 统一进入 Microsoft。
    // ==========================================================

    "RULE-SET,Copilot_Domain,Microsoft",
    "RULE-SET,Copilot_IP,Microsoft",
    "RULE-SET,Microsoft,Microsoft",

    // ==========================================================
    // Apple
    // ==========================================================

    "RULE-SET,Apple,Apple",
    "RULE-SET,Apple_Domain,Apple",

    // ==========================================================
    // Google
    // ==========================================================

    "DOMAIN-SUFFIX,gmail.com,Google",
    "DOMAIN-SUFFIX,googleusercontent.com,Google",
    "DOMAIN-SUFFIX,gstatic.com,Google",
    "DOMAIN-SUFFIX,googleapis.com,Google",

    // ==========================================================
    // X
    // ==========================================================

    "DOMAIN-SUFFIX,x.com,X",
    "DOMAIN-SUFFIX,twitter.com,X",
    "DOMAIN-SUFFIX,t.co,X",
    "DOMAIN-SUFFIX,twimg.com,X",

    // ==========================================================
    // Telegram
    // ==========================================================

    "DOMAIN-SUFFIX,telegram.org,Telegram",
    "DOMAIN-SUFFIX,telegram.me,Telegram",
    "DOMAIN-SUFFIX,t.me,Telegram",
    "DOMAIN-SUFFIX,tdesktop.com,Telegram",
    "DOMAIN-SUFFIX,telegra.ph,Telegram",
    "DOMAIN-SUFFIX,telegram.dog,Telegram",

    "IP-CIDR,91.108.4.0/22,Telegram,no-resolve",
    "IP-CIDR,91.108.8.0/22,Telegram,no-resolve",
    "IP-CIDR,91.108.12.0/22,Telegram,no-resolve",
    "IP-CIDR,91.108.16.0/22,Telegram,no-resolve",
    "IP-CIDR,91.108.20.0/22,Telegram,no-resolve",
    "IP-CIDR,91.108.56.0/22,Telegram,no-resolve",
    "IP-CIDR,149.154.160.0/20,Telegram,no-resolve",

    "IP-CIDR6,2001:b28:f23d::/48,Telegram,no-resolve",
    "IP-CIDR6,2001:b28:f23f::/48,Telegram,no-resolve",
    "IP-CIDR6,2001:67c:4e8::/48,Telegram,no-resolve",

    // ==========================================================
    // Github
    // ==========================================================

    "DOMAIN-SUFFIX,github.com,Github",
    "DOMAIN-SUFFIX,githubusercontent.com,Github",
    "DOMAIN-SUFFIX,githubassets.com,Github",
    "DOMAIN-SUFFIX,raw.githubusercontent.com,Github",
    "DOMAIN-SUFFIX,github.io,Github",
    "DOMAIN-SUFFIX,github.dev,Github",
    "DOMAIN-SUFFIX,githubstatus.com,Github",

    // ==========================================================
    // 中国大陆
    // ==========================================================

    "RULE-SET,ChinaMax,DIRECT",
    "RULE-SET,ChinaMax_Domain,DIRECT",
    "RULE-SET,ChinaMax_IP,DIRECT",
    "GEOSITE,CN,DIRECT",
    "GEOIP,CN,DIRECT,no-resolve",

    // ==========================================================
    // 最终兜底
    // ==========================================================

    "MATCH,PROXY-Gate"
  ];

  // ============================================================
  // Rule Providers
  //
  // 这里只保留当前 rules 实际引用的 Provider。
  //
  // 已删除服务对应的 Provider：
  // iCloud / Emby / Pixiv / LinkedIn 等均已删除。
  // ============================================================

  fixed["rule-providers"] = {
    "Apple": {
      "type": "http",
      "behavior": "classical",
      "format": "yaml",
      "interval": 86400,
      "url": "https://raw.githubusercontent.com/kiki-rgb-00/kiki/refs/heads/main/Rules/Apple.yaml"
    },

    "Apple_Domain": {
      "type": "http",
      "behavior": "domain",
      "format": "mrs",
      "interval": 86400,
      "url": "https://raw.githubusercontent.com/kiki-rgb-00/kiki/refs/heads/main/MRS/Apple_Domain.mrs"
    },

    "AdvertisingLite": {
      "type": "http",
      "behavior": "classical",
      "format": "yaml",
      "interval": 86400,
      "url": "https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/refs/heads/master/rule/Clash/AdvertisingLite/AdvertisingLite.yaml"
    },

    "AdvertisingLite_Domain": {
      "type": "http",
      "behavior": "domain",
      "format": "mrs",
      "interval": 86400,
      "url": "https://raw.githubusercontent.com/kiki-rgb-00/kiki/refs/heads/main/MRS/AdvertisingLite_Domain.mrs"
    },

    "Privacy": {
      "type": "http",
      "behavior": "classical",
      "format": "yaml",
      "interval": 86400,
      "url": "https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/refs/heads/master/rule/Clash/Privacy/Privacy.yaml"
    },

    "Privacy_Domain": {
      "type": "http",
      "behavior": "domain",
      "format": "mrs",
      "interval": 86400,
      "url": "https://raw.githubusercontent.com/kiki-rgb-00/kiki/refs/heads/main/MRS/Privacy_Domain.mrs"
    },

    "ACL4SSR_BanAD": {
      "type": "http",
      "behavior": "domain",
      "format": "mrs",
      "interval": 86400,
      "url": "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/mrs/BanAD_domain.mrs"
    },

    "ACL4SSR_BanProgramAD": {
      "type": "http",
      "behavior": "domain",
      "format": "mrs",
      "interval": 86400,
      "url": "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/mrs/BanProgramAD_domain.mrs"
    },

    "ChinaMax": {
      "type": "http",
      "behavior": "classical",
      "format": "yaml",
      "interval": 86400,
      "url": "https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/refs/heads/master/rule/Clash/ChinaMax/ChinaMax.yaml"
    },

    "ChinaMax_Domain": {
      "type": "http",
      "behavior": "domain",
      "format": "mrs",
      "interval": 86400,
      "url": "https://raw.githubusercontent.com/kiki-rgb-00/kiki/refs/heads/main/MRS/ChinaMax_Domain.mrs"
    },

    "ChinaMax_IP": {
      "type": "http",
      "behavior": "ipcidr",
      "format": "mrs",
      "interval": 86400,
      "url": "https://raw.githubusercontent.com/kiki-rgb-00/kiki/refs/heads/main/MRS/ChinaMax_IP.mrs"
    },

    "Microsoft": {
      "type": "http",
      "behavior": "domain",
      "format": "mrs",
      "interval": 86400,
      "url": "https://raw.githubusercontent.com/kiki-rgb-00/kiki/refs/heads/main/MRS/Microsoft.mrs"
    },

    "Copilot_Domain": {
      "type": "http",
      "behavior": "domain",
      "format": "mrs",
      "interval": 86400,
      "url": "https://raw.githubusercontent.com/kiki-rgb-00/kiki/refs/heads/main/MRS/Copilot_Domain.mrs"
    },

    "Copilot_IP": {
      "type": "http",
      "behavior": "ipcidr",
      "format": "mrs",
      "interval": 86400,
      "url": "https://raw.githubusercontent.com/kiki-rgb-00/kiki/refs/heads/main/MRS/Copilot_IP.mrs"
    }
  };

  // All project-owned MRS resources follow one configurable repository.
  Object.values(fixed["rule-providers"]).forEach(provider => {
    provider.url = provider.url.replace(
      "Sydney-Moses/Network-Profiles",
      RUNESTONE.repository
    );
  });

  fixed.rules = [...new Set(fixed.rules)];

  // ============================================================
  // Personal mode
  // ============================================================

  const groups = fixed["proxy-groups"];
  const available = new Set(groups.map(g => g.name));

  const regions = {
    JP: "🇯🇵 JP",
    SG: "🇸🇬 SG",
    HK: "🇭🇰 HK",
    TW: "🇹🇼 TW",
    US: "🇺🇸 US"
  };

  const order = {
    "PROXY-Gate": ["SG", "JP", "HK"],
    GPT: ["JP", "SG", "TW", "US"],
    Microsoft: ["US", "JP", "SG"],
    Google: ["JP", "SG", "HK"],
    Github: ["JP", "SG", "HK", "US"],
    X: ["JP", "TW", "SG"],
    Telegram: ["SG", "JP", "HK"]
  };

  if (RUNESTONE.personal) {
    groups.forEach(group => {
      if (order[group.name]) {
        const preferred = order[group.name]
          .map(k => regions[k] + "-Auto")
          .filter(n => available.has(n));

        group.proxies = [
          ...new Set([
            ...preferred,
            ...group.proxies
          ])
        ];
      }

      if (group.name === "Apple") {
        group.proxies = [
          "DIRECT",
          ...group.proxies.filter(n => n !== "DIRECT")
        ];
      }

      if (group.name === "Apple Push") {
        group.proxies = [
          "DIRECT",
          "APNs-Fallback"
        ];
      }
    });
  }

  // ============================================================
  // 冲突检查
  // ============================================================

  // Never silently shadow a node with a generated group or built-in outbound.
  const reserved = new Set([
    "DIRECT",
    "REJECT",
    "REJECT-DROP",
    "PASS",
    "PASS-RULE",
    "COMPATIBLE",
    ...groups.map(g => g.name)
  ]);

  if (currentProxyNames.some(name => reserved.has(name))) {
    throw new Error(
      "Runestone: node name conflicts with a generated group or built-in outbound"
    );
  }

  if (
    groups.some(g =>
      Object.prototype.hasOwnProperty.call(
        config["proxy-providers"] || {},
        g.name
      )
    )
  ) {
    throw new Error(
      "Runestone: provider name conflicts with a generated group"
    );
  }

  const knownOutbounds = new Set([
    ...reserved,
    ...currentProxyNames
  ]);

  if (
    currentProxies.some(
      p =>
        p["dialer-proxy"] &&
        !knownOutbounds.has(p["dialer-proxy"])
    )
  ) {
    throw new Error(
      "Runestone: dialer-proxy references a source group that routing replacement would remove"
    );
  }

  return fixed;
}