/*
 * 服务分类配置｜Android FlClash版
 *
 *
 * 结构：
 * 1. 主策略组
 * 2. 普通服务策略组
 * 3. 根据实际节点动态生成地区 Auto
 * 4. Global-Fallback
 * 5. Rules
 * 6. Android PROCESS-NAME App 分流
 * 7. Rule Providers
 */

function main(config) {
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

  const fixed = {
    "mixed-port": 7890,
    "allow-lan": false,
    "bind-address": "*",
    "mode": "rule",
    "log-level": "info",
    "external-controller": "127.0.0.1:9090",
    "unified-delay": true,
    "tcp-concurrent": true,
    "ipv6": true,

    /*
     * Android / FlClash TUN
     *
     * mixed：Android 环境下兼顾性能与兼容性
     * auto-route：接管系统流量
     * auto-detect-interface：自动选择出口网卡
     * strict-route：减少绕过 TUN 的可能
     */
    "tun": {
      "enable": true,
      "stack": "mixed",
      "auto-route": true,
      "auto-detect-interface": true,
      "strict-route": true,
      "dns-hijack": [
        "any:53",
        "tcp://any:53"
      ]
    },

    /*
     * 启用进程识别。
     *
     * Android 下 PROCESS-NAME 可用于按照 App
     * 的 package name 对流量进行分流。
     */
    "find-process-mode": "strict",

    "dns": {
      "enable": true,
      "respect-rules": true,
      "ipv6": true,
      "prefer-h3": false,
      "enhanced-mode": "fake-ip",
      "fake-ip-range": "198.18.0.1/16",

      "default-nameserver": [
        "223.5.5.5",
        "119.29.29.29",
        "2400:3200::1"
      ],

      "nameserver": [
        "https://dns.cloudflare.com/dns-query",
        "https://dns.google/dns-query"
      ],

      "proxy-server-nameserver-policy": null,

      "proxy-server-nameserver": [
        "https://dns.alidns.com/dns-query",
        "https://doh.pub/dns-query"
      ],

      "direct-nameserver": [
        "https://dns.alidns.com/dns-query",
        "https://doh.pub/dns-query"
      ],

      "nameserver-policy": {
        "dns.cloudflare.com": [
          "1.1.1.1",
          "1.0.0.1"
        ],

        "dns.google": [
          "8.8.8.8",
          "8.8.4.4"
        ],

        "dns.quad9.net": [
          "9.9.9.9",
          "149.112.112.112"
        ],

        "dns.alidns.com": [
          "223.5.5.5",
          "223.6.6.6"
        ],

        "doh.pub": [
          "1.12.12.12",
          "120.53.53.53"
        ],

        "geosite:cn": [
          "https://dns.alidns.com/dns-query",
          "https://doh.pub/dns-query"
        ]
      },

      "fallback": [
        "https://anycast.uncensoreddns.org/dns-query"
      ],

      "fallback-filter": {
        "geoip": true,
        "geoip-code": "CN",
        "ipcidr": [
          "240.0.0.0/4",
          "127.0.0.0/8",
          "0.0.0.0/32"
        ]
      },

      "fake-ip-filter": [
        "*.lan",
        "*.local",
        "localhost",
        "*.msftconnecttest.com",
        "*.msftncsi.com",
        "*.msidentity.com",
        "stun.*",
        "+.stun.*.*",
        "+.stun.*.*.*",
        "+.stun.*.*.*.*",
        "+.stun.*.*.*.*.*",
        "+.weixin.com",
        "+.wechat.com",
        "+.qq.com",
        "+.tencent.com",
        "speedtest.net"
      ]
    },

    "profile": {
      "store-selected": true,
      "store-fake-ip": true
    }
  };

  fixed.proxies = currentProxies;
  fixed["proxy-groups"] = [];

  /*
   * =========================
   * 主策略组
   * =========================
   */

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
      "name": "🖥️ All-Nodes",
      "type": "select",
      "proxies": currentProxyNames.slice(),
      "icon": "https://fastly.jsdelivr.net/gh/Koolson/Qure/IconSet/Color/Server.png"
    }
  );

  /*
   * =========================
   * 普通服务策略组
   * =========================
   */

  fixed["proxy-groups"].push({
    "name": "YouTube",
    "type": "select",
    "icon": "https://fastly.jsdelivr.net/gh/Koolson/Qure/IconSet/Color/YouTube.png",
    "proxies": [
      "🖥️ All-Nodes",
      "PROXY-Gate",
      "DIRECT"
    ]
  });

  fixed["proxy-groups"].push({
    "name": "Netflix",
    "type": "select",
    "icon": "https://fastly.jsdelivr.net/gh/Koolson/Qure/IconSet/Color/Netflix.png",
    "proxies": [
      "🖥️ All-Nodes",
      "PROXY-Gate",
      "DIRECT"
    ]
  });

  fixed["proxy-groups"].push({
    "name": "Disney+",
    "type": "select",
    "icon": "https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Disney+.png",
    "proxies": [
      "🖥️ All-Nodes",
      "PROXY-Gate",
      "DIRECT"
    ]
  });

  fixed["proxy-groups"].push({
    "name": "Emby",
    "type": "select",
    "icon": "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Emby.png",
    "proxies": [
      "🖥️ All-Nodes",
      "PROXY-Gate",
      "DIRECT"
    ]
  });

  fixed["proxy-groups"].push({
    "name": "Spotify",
    "type": "select",
    "icon": "https://fastly.jsdelivr.net/gh/Koolson/Qure/IconSet/Color/Spotify.png",
    "proxies": [
      "🖥️ All-Nodes",
      "PROXY-Gate",
      "DIRECT"
    ]
  });

  fixed["proxy-groups"].push({
    "name": "TikTok",
    "type": "select",
    "icon": "https://fastly.jsdelivr.net/gh/Koolson/Qure/IconSet/Color/TikTok.png",
    "proxies": [
      "🖥️ All-Nodes",
      "PROXY-Gate",
      "DIRECT"
    ]
  });

  fixed["proxy-groups"].push({
    "name": "Twitch",
    "type": "select",
    "icon": "https://fastly.jsdelivr.net/gh/Koolson/Qure/IconSet/Color/Twitch.png",
    "proxies": [
      "🖥️ All-Nodes",
      "PROXY-Gate",
      "DIRECT"
    ]
  });

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

  fixed["proxy-groups"].push({
    "name": "Gemini",
    "type": "select",
    "icon": "https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/png/google-gemini.png",
    "proxies": [
      "🖥️ All-Nodes",
      "PROXY-Gate",
      "DIRECT"
    ]
  });

  fixed["proxy-groups"].push({
    "name": "Claude",
    "type": "select",
    "icon": "https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/png/anthropic.png",
    "proxies": [
      "🖥️ All-Nodes",
      "PROXY-Gate",
      "DIRECT"
    ]
  });

  fixed["proxy-groups"].push({
    "name": "Grok",
    "type": "select",
    "icon": "https://raw.githubusercontent.com/luestr/IconResource/main/App_icon/120px/Grok.png",
    "proxies": [
      "🖥️ All-Nodes",
      "PROXY-Gate",
      "DIRECT"
    ]
  });

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
    "name": "OneDrive",
    "type": "select",
    "icon": "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/OneDrive.png",
    "proxies": [
      "🖥️ All-Nodes",
      "PROXY-Gate",
      "DIRECT"
    ]
  });

  fixed["proxy-groups"].push({
    "name": "Outlook",
    "type": "select",
    "icon": "https://raw.githubusercontent.com/kiki-rgb-00/kiki/refs/heads/main/Ti/Outlook.png",
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

  fixed["proxy-groups"].push({
    "name": "Amazon",
    "type": "select",
    "icon": "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Amazon.png",
    "proxies": [
      "🖥️ All-Nodes",
      "PROXY-Gate",
      "DIRECT"
    ]
  });

  fixed["proxy-groups"].push({
    "name": "Meta",
    "type": "select",
    "icon": "https://raw.githubusercontent.com/kiki-rgb-00/kiki/refs/heads/main/Ti/Meta.png",
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
    "name": "WhatsApp",
    "type": "select",
    "icon": "https://raw.githubusercontent.com/kiki-rgb-00/kiki/refs/heads/main/Ti/WhatsApp_1.png",
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

  fixed["proxy-groups"].push({
    "name": "Speedtest",
    "type": "select",
    "icon": "https://cdn.jsdelivr.net/gh/Koolson/Qure/IconSet/Color/Speedtest.png",
    "proxies": [
      "🖥️ All-Nodes",
      "PROXY-Gate",
      "DIRECT"
    ]
  });

  /*
   * =========================
   * 地区 Auto
   * =========================
   */

  const regionGroups = [
    {
      key: "US",
      name: "🇺🇸 US",
      filter: /([\[]US[\]]|^US$|USA|United[ _-]?States|\bUS\b|美国|美國|🇺🇸)/i,
      icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Auto.png"
    },
    {
      key: "SG",
      name: "🇸🇬 SG",
      filter: /([\[]SG[\]]|^SG$|Singapore|\bSG\b|新加坡|狮城|🇸🇬)/i,
      icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Auto.png"
    },
    {
      key: "HK",
      name: "🇭🇰 HK",
      filter: /([\[]HK[\]]|^HK$|Hong[ _-]?Kong|\bHK\b|香港|🇭🇰)/i,
      icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Auto.png"
    },
    {
      key: "JP",
      name: "🇯🇵 JP",
      filter: /([\[]JP[\]]|^JP$|Japan|\bJP\b|日本|东京|大阪|🇯🇵)/i,
      icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Auto.png"
    },
    {
      key: "TW",
      name: "🇹🇼 TW",
      filter: /([\[]TW[\]]|^TW$|Taiwan|Taibei|Taipei|\bTW\b|台湾|臺灣|台北|高雄|🇹🇼)/i,
      icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Auto.png"
    },
    {
      key: "UK",
      name: "🇬🇧 UK",
      filter: /([\[]UK[\]]|^UK$|United[ _-]?Kingdom|Britain|England|\bUK\b|英国|英國|伦敦|🇬🇧)/i,
      icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Auto.png"
    },
    {
      key: "DE",
      name: "🇩🇪 DE",
      filter: /([\[]DE[\]]|^DE$|Germany|Deutschland|\bDE\b|德国|德國|法兰克福|🇩🇪)/i,
      icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Auto.png"
    },
    {
      key: "FR",
      name: "🇫🇷 FR",
      filter: /([\[]FR[\]]|^FR$|France|\bFR\b|法国|法國|巴黎|🇫🇷)/i,
      icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Auto.png"
    },
    {
      key: "RU",
      name: "🇷🇺 RU",
      filter: /([\[]RU[\]]|^RU$|Russia|Russian[ _-]?Federation|\bRU\b|俄罗斯|俄羅斯|莫斯科|伯力|🇷🇺)/i,
      icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Auto.png"
    },
    {
      key: "CA",
      name: "🇨🇦 CA",
      filter: /([\[]CA[\]]|^CA$|Canada|\bCA\b|加拿大|🇨🇦)/i,
      icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Auto.png"
    },
    {
      key: "AU",
      name: "🇦🇺 AU",
      filter: /([\[]AU[\]]|^AU$|Australia|\bAU\b|澳大利亚|澳洲|澳大利亞|🇦🇺)/i,
      icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Auto.png"
    },
    {
      key: "KR",
      name: "🇰🇷 KR",
      filter: /([\[]KR[\]]|^KR$|Korea|South[ _-]?Korea|\bKR\b|韩国|韓國|首尔|首爾|🇰🇷)/i,
      icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Auto.png"
    },
    {
      key: "IT",
      name: "🇮🇹 IT",
      filter: /([\[]IT[\]]|^IT$|Italy|Italian|\bIT\b|意大利|義大利|米兰|米蘭|罗马|羅馬|🇮🇹)/i,
      icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Auto.png"
    },
    {
      key: "ES",
      name: "🇪🇸 ES",
      filter: /([\[]ES[\]]|^ES$|Spain|Spanish|\bES\b|西班牙|马德里|馬德里|🇪🇸)/i,
      icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Auto.png"
    },
    {
      key: "NL",
      name: "🇳🇱 NL",
      filter: /([\[]NL[\]]|^NL$|Netherlands|Dutch|\bNL\b|荷兰|荷蘭|阿姆斯特丹|🇳🇱)/i,
      icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Auto.png"
    },
    {
      key: "FI",
      name: "🇫🇮 FI",
      filter: /([\[]FI[\]]|^FI$|Finland|Finnish|\bFI\b|芬兰|芬蘭|赫尔辛基|赫爾辛基|🇫🇮)/i,
      icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Auto.png"
    },
    {
      key: "NO",
      name: "🇳🇴 NO",
      filter: /([\[]NO[\]]|^NO$|Norway|Norwegian|\bNO\b|挪威|奥斯陆|奧斯陸|🇳🇴)/i,
      icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Auto.png"
    },
    {
      key: "SE",
      name: "🇸🇪 SE",
      filter: /([\[]SE[\]]|^SE$|Sweden|Swedish|\bSE\b|瑞典|斯德哥尔摩|斯德哥爾摩|🇸🇪)/i,
      icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Auto.png"
    },
    {
      key: "CH",
      name: "🇨🇭 CH",
      filter: /([\[]CH[\]]|^CH$|Switzerland|Swiss|\bCH\b|瑞士|苏黎世|蘇黎世|日内瓦|日內瓦|🇨🇭)/i,
      icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Auto.png"
    },
    {
      key: "PL",
      name: "🇵🇱 PL",
      filter: /([\[]PL[\]]|^PL$|Poland|Polish|\bPL\b|波兰|波蘭|华沙|華沙|🇵🇱)/i,
      icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Auto.png"
    },
    {
      key: "MY",
      name: "🇲🇾 MY",
      filter: /([\[]MY[\]]|^MY$|Malaysia|Malaysian|\bMY\b|马来西亚|馬來西亞|吉隆坡|🇲🇾)/i,
      icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Auto.png"
    }
  ];

  const existingRegionalAutos = [];

  regionGroups.forEach(region => {
    const matched = currentProxyNames.filter(
      name => region.filter.test(name)
    );

    const autoName = region.name + "-Auto";

    if (matched.length < 2) {
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

  const serviceProxyChoices = [
    "🖥️ All-Nodes",
    ...(existingRegionalAutos.length
      ? ["🌍 Global-Fallback"]
      : []),
    ...existingRegionalAutos,
    "PROXY-Gate",
    "DIRECT"
  ];

  const serviceGroupNames = [
    "YouTube",
    "Netflix",
    "Disney+",
    "Emby",
    "Spotify",
    "TikTok",
    "Twitch",
    "GPT",
    "Gemini",
    "Claude",
    "Grok",
    "Microsoft",
    "OneDrive",
    "Outlook",
    "Google",
    "Amazon",
    "Meta",
    "X",
    "WhatsApp",
    "Telegram",
    "Github",
    "Speedtest"
  ];

  fixed["proxy-groups"].forEach(group => {
    if (serviceGroupNames.includes(group.name)) {
      group.proxies = serviceProxyChoices.slice();
    }
  });

  const proxyGate = fixed["proxy-groups"].find(
    group => group.name === "PROXY-Gate"
  );

  if (proxyGate) {
    proxyGate.proxies = [
      "🖥️ All-Nodes",
      ...(existingRegionalAutos.length
        ? ["🌍 Global-Fallback"]
        : []),
      ...existingRegionalAutos,
      "DIRECT"
    ];
  }

  /*
   * =========================
   * Global Fallback
   * =========================
   */

  if (existingRegionalAutos.length) {
    fixed["proxy-groups"].push({
      name: "🌍 Global-Fallback",
      type: "fallback",
      proxies: existingRegionalAutos,
      icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Available_1.png",
      url: "http://www.gstatic.com/generate_204",
      interval: 600
    });
  }

  /*
   * =========================
   * Rules
   *
   * 顺序：
   * 1. LAN
   * 2. 广告 / 隐私 REJECT
   * 3. Android PROCESS-NAME
   * 4. 服务 DOMAIN / RULE-SET
   * 5. China
   * 6. MATCH
   * =========================
   */

  fixed.rules = [
    /*
     * LAN / 本地网络
     */

    "IP-CIDR,192.168.0.0/16,DIRECT,no-resolve",
    "IP-CIDR,10.0.0.0/8,DIRECT,no-resolve",
    "IP-CIDR,172.16.0.0/12,DIRECT,no-resolve",
    "IP-CIDR,127.0.0.0/8,DIRECT,no-resolve",
    "GEOIP,LAN,DIRECT,no-resolve",

    /*
     * =========================
     * 广告 / 隐私
     *
     * 必须位于 PROCESS-NAME 前面。
     * 防止 App 级规则抢先命中广告请求。
     * =========================
     */

    "RULE-SET,AdvertisingLite,REJECT",
    "RULE-SET,AdvertisingLite_Domain,REJECT",
    "RULE-SET,Privacy,REJECT",
    "RULE-SET,Privacy_Domain,REJECT",
    "RULE-SET,ACL4SSR_BanAD,REJECT",
    "RULE-SET,ACL4SSR_BanProgramAD,REJECT",

    /*
     * =========================
     * Android App 级分流
     *
     * 广告 / 隐私规则之后，
     * 各服务 DOMAIN / RULE-SET 之前。
     *
     * 这样可以实现：
     *
     * 广告请求
     *   → REJECT
     *
     * 普通 App 流量
     *   → PROCESS-NAME
     *   → 对应服务策略组
     *
     * PROCESS-NAME 仅作为 Android App
     * 级分流使用。
     * =========================
     */

    /*
     * YouTube
     */
    "PROCESS-NAME,com.google.android.youtube,YouTube",

    /*
     * Netflix
     */
    "PROCESS-NAME,com.netflix.mediaclient,Netflix",

    /*
     * Spotify
     */
    "PROCESS-NAME,com.spotify.music,Spotify",

    /*
     * TikTok
     */
    "PROCESS-NAME,com.zhiliaoapp.musically,TikTok",

    /*
     * Twitch
     */
    "PROCESS-NAME,com.twitch.android.app,Twitch",

    /*
     * ChatGPT
     */
    "PROCESS-NAME,com.openai.chatgpt,GPT",

    /*
     * Claude
     */
    "PROCESS-NAME,com.anthropic.claude,Claude",

    /*
     * Gemini
     */
    "PROCESS-NAME,com.google.android.apps.bard,Gemini",

    /*
     * Microsoft Outlook
     */
    "PROCESS-NAME,com.microsoft.office.outlook,Outlook",

    /*
     * OneDrive
     */
    "PROCESS-NAME,com.microsoft.skydrive,OneDrive",

    /*
     * Google
     */
    "PROCESS-NAME,com.google.android.googlequicksearchbox,Google",

    /*
     * Amazon
     */
    "PROCESS-NAME,com.amazon.mShop.android.shopping,Amazon",

    /*
     * Facebook
     */
    "PROCESS-NAME,com.facebook.katana,Meta",

    /*
     * Instagram
     */
    "PROCESS-NAME,com.instagram.android,Meta",

    /*
     * X
     */
    "PROCESS-NAME,com.twitter.android,X",

    /*
     * WhatsApp
     */
    "PROCESS-NAME,com.whatsapp,WhatsApp",

    /*
     * Telegram
     */
    "PROCESS-NAME,org.telegram.messenger,Telegram",

    /*
     * GitHub
     */
    "PROCESS-NAME,com.github.android,Github",

    /*
     * =========================
     * Crypto
     * =========================
     */

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

    /*
     * =========================
     * YouTube
     * =========================
     */

    "DOMAIN-SUFFIX,youtube.com,YouTube",
    "DOMAIN-SUFFIX,youtu.be,YouTube",
    "DOMAIN-SUFFIX,youtube-nocookie.com,YouTube",
    "DOMAIN-SUFFIX,youtubei.googleapis.com,YouTube",
    "DOMAIN-SUFFIX,youtube.googleapis.com,YouTube",
    "DOMAIN-SUFFIX,ytimg.com,YouTube",
    "DOMAIN-SUFFIX,googlevideo.com,YouTube",
    "DOMAIN-SUFFIX,ggpht.com,YouTube",

    /*
     * =========================
     * Netflix
     * =========================
     */

    "DOMAIN-SUFFIX,netflix.com,Netflix",
    "DOMAIN-SUFFIX,netflix.net,Netflix",
    "DOMAIN-SUFFIX,netflix.ca,Netflix",
    "DOMAIN-SUFFIX,nflxext.com,Netflix",
    "DOMAIN-SUFFIX,nflximg.com,Netflix",
    "DOMAIN-SUFFIX,nflximg.net,Netflix",
    "DOMAIN-SUFFIX,nflxsearch.net,Netflix",
    "DOMAIN-SUFFIX,nflxso.net,Netflix",
    "DOMAIN-SUFFIX,nflxvideo.net,Netflix",
    "DOMAIN-SUFFIX,netflixdnstest0.com,Netflix",
    "DOMAIN-SUFFIX,netflixdnstest1.com,Netflix",
    "DOMAIN-SUFFIX,netflixdnstest2.com,Netflix",
    "DOMAIN-SUFFIX,netflixdnstest3.com,Netflix",
    "DOMAIN-SUFFIX,netflixdnstest4.com,Netflix",
    "DOMAIN-SUFFIX,netflixdnstest5.com,Netflix",
    "DOMAIN-SUFFIX,netflixdnstest6.com,Netflix",
    "DOMAIN-SUFFIX,netflixdnstest7.com,Netflix",
    "DOMAIN-SUFFIX,netflixdnstest8.com,Netflix",
    "DOMAIN-SUFFIX,netflixdnstest9.com,Netflix",
    "DOMAIN-SUFFIX,netflixdnstest10.com,Netflix",
    "DOMAIN-SUFFIX,netflixinvestor.com,Netflix",
    "DOMAIN-SUFFIX,netflixtechblog.com,Netflix",
    "DOMAIN,netflix.com.edgesuite.net,Netflix",

    /*
     * =========================
     * Disney+
     * =========================
     */

    "DOMAIN-SUFFIX,disneyplus.com,Disney+",
    "DOMAIN-SUFFIX,disney-plus.net,Disney+",
    "DOMAIN-SUFFIX,dssott.com,Disney+",
    "DOMAIN-SUFFIX,dssedge.com,Disney+",
    "DOMAIN-SUFFIX,bamgrid.com,Disney+",
    "DOMAIN-SUFFIX,media.dssott.com,Disney+",
    "DOMAIN-SUFFIX,disney.playback.edge.bamgrid.com,Disney+",
    "DOMAIN-SUFFIX,star.playback.edge.bamgrid.com,Disney+",
    "DOMAIN-SUFFIX,search-api-disney.bamgrid.com,Disney+",

    /*
     * =========================
     * Emby
     * =========================
     */

    "RULE-SET,Emby,Emby",

    /*
     * =========================
     * Spotify
     * =========================
     */

    "DOMAIN-SUFFIX,spotify.com,Spotify",
    "DOMAIN-SUFFIX,spotifycdn.com,Spotify",
    "DOMAIN-SUFFIX,scdn.co,Spotify",
    "DOMAIN-SUFFIX,spclient.wg.spotify.com,Spotify",
    "DOMAIN-SUFFIX,api-partner.spotify.com,Spotify",
    "DOMAIN-SUFFIX,heads4-ak-spotify-com.akamaized.net,Spotify",

    /*
     * =========================
     * TikTok
     * =========================
     */

    "DOMAIN-SUFFIX,tiktok.com,TikTok",
    "DOMAIN-SUFFIX,tiktokcdn.com,TikTok",
    "DOMAIN-SUFFIX,tiktokcdn-us.com,TikTok",
    "DOMAIN-SUFFIX,tiktokv.com,TikTok",
    "DOMAIN-SUFFIX,tiktokd.org,TikTok",
    "DOMAIN-SUFFIX,ibytedtos.com,TikTok",
    "DOMAIN-SUFFIX,ibyteimg.com,TikTok",
    "DOMAIN-SUFFIX,byteoversea.com,TikTok",
    "DOMAIN-SUFFIX,muscdn.com,TikTok",
    "DOMAIN-SUFFIX,musical.ly,TikTok",

    /*
     * =========================
     * Twitch
     * =========================
     */

    "DOMAIN-SUFFIX,twitch.tv,Twitch",
    "DOMAIN-SUFFIX,twitchcdn.net,Twitch",
    "DOMAIN-SUFFIX,jtvnw.net,Twitch",
    "DOMAIN-SUFFIX,ttvnw.net,Twitch",
    "DOMAIN-SUFFIX,twitchsvc.net,Twitch",

    /*
     * =========================
     * GPT / OpenAI
     * =========================
     */

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

    /*
     * =========================
     * Gemini
     * =========================
     */

    "DOMAIN-SUFFIX,gemini.google.com,Gemini",
    "DOMAIN-SUFFIX,aistudio.google.com,Gemini",
    "DOMAIN-SUFFIX,deepmind.com,Gemini",
    "DOMAIN-SUFFIX,deepmind.google,Gemini",
    "DOMAIN-SUFFIX,gemini.googleusercontent.com,Gemini",
    "DOMAIN-SUFFIX,makersuite.google.com,Gemini",

    /*
     * =========================
     * Claude
     * =========================
     */

    "DOMAIN-SUFFIX,claude.ai,Claude",
    "DOMAIN-SUFFIX,anthropic.com,Claude",
    "DOMAIN-SUFFIX,claudeusercontent.com,Claude",
    "DOMAIN-SUFFIX,claudeusercontent.com.cdn.cloudflare.net,Claude",

    /*
     * =========================
     * Microsoft / Copilot
     * =========================
     */

    "RULE-SET,Copilot_Domain,Microsoft",
    "RULE-SET,Copilot_IP,Microsoft",
    "RULE-SET,Microsoft,Microsoft",

    /*
     * =========================
     * OneDrive
     * =========================
     */

    "DOMAIN-SUFFIX,1drv.com,OneDrive",
    "DOMAIN-SUFFIX,1drv.ms,OneDrive",
    "DOMAIN-SUFFIX,livefilestore.com,OneDrive",
    "DOMAIN-SUFFIX,microsoftpersonalcontent.com,OneDrive",
    "DOMAIN-SUFFIX,oneclient.sfx.ms,OneDrive",
    "DOMAIN-SUFFIX,onedrive.com,OneDrive",
    "DOMAIN-SUFFIX,onedrive.co,OneDrive",
    "DOMAIN-SUFFIX,onedrive.co.uk,OneDrive",
    "DOMAIN-SUFFIX,onedrive.eu,OneDrive",
    "DOMAIN-SUFFIX,onedrive.live.com,OneDrive",
    "DOMAIN-SUFFIX,onedrive.net,OneDrive",
    "DOMAIN-SUFFIX,onedrive.org,OneDrive",
    "DOMAIN-SUFFIX,photos.live.com,OneDrive",
    "DOMAIN-SUFFIX,skydrive.wns.windows.com,OneDrive",
    "DOMAIN-SUFFIX,storage.live.com,OneDrive",
    "DOMAIN-SUFFIX,storage.msn.com,OneDrive",

    /*
     * =========================
     * Outlook
     * =========================
     */

    "DOMAIN-SUFFIX,acompli.com,Outlook",
    "DOMAIN-SUFFIX,acompli.net,Outlook",
    "DOMAIN-SUFFIX,hotmail.com,Outlook",
    "DOMAIN-SUFFIX,hotmail.co,Outlook",
    "DOMAIN-SUFFIX,hotmail.eu,Outlook",
    "DOMAIN-SUFFIX,hotmail.net,Outlook",
    "DOMAIN-SUFFIX,hotmail.org,Outlook",
    "DOMAIN-SUFFIX,outlook.cn,Outlook",
    "DOMAIN-SUFFIX,outlook.com,Outlook",
    "DOMAIN-SUFFIX,outlookgroups.ms,Outlook",
    "DOMAIN-SUFFIX,outlookmobile.com,Outlook",
    "DOMAIN-SUFFIX,microsoftemail.com,Outlook",

    /*
     * =========================
     * Grok
     * =========================
     */

    "DOMAIN-SUFFIX,grok.com,Grok",
    "DOMAIN-SUFFIX,x.ai,Grok",
    "DOMAIN-KEYWORD,grok,Grok",

    /*
     * =========================
     * Amazon
     * =========================
     */

    "DOMAIN-SUFFIX,amazon.com,Amazon",
    "DOMAIN-SUFFIX,amazon.co.uk,Amazon",
    "DOMAIN-SUFFIX,amazon.de,Amazon",
    "DOMAIN-SUFFIX,amazon.fr,Amazon",
    "DOMAIN-SUFFIX,amazon.it,Amazon",
    "DOMAIN-SUFFIX,amazon.es,Amazon",
    "DOMAIN-SUFFIX,amazon.co.jp,Amazon",
    "DOMAIN-SUFFIX,amazon.ca,Amazon",
    "DOMAIN-SUFFIX,amazon.com.au,Amazon",
    "DOMAIN-SUFFIX,amazon.in,Amazon",
    "DOMAIN-SUFFIX,amazon.com.mx,Amazon",
    "DOMAIN-SUFFIX,amazon.com.br,Amazon",
    "DOMAIN-SUFFIX,amazon.nl,Amazon",
    "DOMAIN-SUFFIX,amazon.pl,Amazon",
    "DOMAIN-SUFFIX,amazon.se,Amazon",
    "DOMAIN-SUFFIX,amazon.sg,Amazon",
    "DOMAIN-SUFFIX,amazon.ae,Amazon",
    "DOMAIN-SUFFIX,amazon.sa,Amazon",
    "DOMAIN-SUFFIX,amazon.com.tr,Amazon",
    "DOMAIN-SUFFIX,amazon.eg,Amazon",
    "DOMAIN-SUFFIX,amazon.co.za,Amazon",
    "DOMAIN-SUFFIX,images-amazon.com,Amazon",
    "DOMAIN-SUFFIX,ssl-images-amazon.com,Amazon",
    "DOMAIN-SUFFIX,media-amazon.com,Amazon",
    "DOMAIN-SUFFIX,amazon-adsystem.com,Amazon",
    "DOMAIN-SUFFIX,amazonpay.com,Amazon",
    "DOMAIN-SUFFIX,amazonpay.in,Amazon",
    "DOMAIN-SUFFIX,amazonpay.com.br,Amazon",

    /*
     * =========================
     * Google
     * =========================
     */

    "DOMAIN-KEYWORD,google,Google",
    "DOMAIN-SUFFIX,gmail.com,Google",
    "DOMAIN-SUFFIX,googleusercontent.com,Google",
    "DOMAIN-SUFFIX,gstatic.com,Google",
    "DOMAIN-SUFFIX,googleapis.com,Google",

    /*
     * =========================
     * Meta
     * =========================
     */

    "DOMAIN-SUFFIX,facebook.com,Meta",
    "DOMAIN-SUFFIX,facebook.net,Meta",
    "DOMAIN-SUFFIX,fbcdn.net,Meta",
    "DOMAIN-SUFFIX,fbsbx.com,Meta",
    "DOMAIN-SUFFIX,fb.com,Meta",
    "DOMAIN-SUFFIX,instagram.com,Meta",
    "DOMAIN-SUFFIX,cdninstagram.com,Meta",
    "DOMAIN-SUFFIX,instagram.net,Meta",
    "DOMAIN-SUFFIX,threads.com,Meta",
    "DOMAIN-SUFFIX,threads.net,Meta",
    "DOMAIN-SUFFIX,messenger.com,Meta",
    "DOMAIN-SUFFIX,meta.ai,Meta",
    "DOMAIN-SUFFIX,ai.meta.com,Meta",
    "DOMAIN-SUFFIX,muse.ai,Meta",

    /*
     * =========================
     * X
     * =========================
     */

    "DOMAIN-SUFFIX,x.com,X",
    "DOMAIN-SUFFIX,twitter.com,X",
    "DOMAIN-SUFFIX,t.co,X",
    "DOMAIN-SUFFIX,twimg.com,X",

    /*
     * =========================
     * WhatsApp
     * =========================
     */

    "DOMAIN-SUFFIX,whatsapp.com,WhatsApp",
    "DOMAIN-SUFFIX,whatsapp.net,WhatsApp",
    "DOMAIN-SUFFIX,wa.me,WhatsApp",
    "DOMAIN-SUFFIX,whatsapp.org,WhatsApp",

    /*
     * =========================
     * Telegram
     * =========================
     */

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

    /*
     * =========================
     * GitHub
     * =========================
     */

    "DOMAIN-SUFFIX,github.com,Github",
    "DOMAIN-SUFFIX,githubusercontent.com,Github",
    "DOMAIN-SUFFIX,githubassets.com,Github",
    "DOMAIN-SUFFIX,raw.githubusercontent.com,Github",
    "DOMAIN-SUFFIX,github.io,Github",
    "DOMAIN-SUFFIX,github.dev,Github",
    "DOMAIN-SUFFIX,githubstatus.com,Github",

    /*
     * =========================
     * Speedtest
     * =========================
     */

    "DOMAIN-SUFFIX,speedtest.net,Speedtest",
    "DOMAIN-SUFFIX,speedtest.com,Speedtest",
    "DOMAIN-SUFFIX,ookla.com,Speedtest",
    "DOMAIN-SUFFIX,ooklaserver.net,Speedtest",
    "DOMAIN-SUFFIX,ookla.net,Speedtest",
    "DOMAIN-SUFFIX,speedtestcustom.com,Speedtest",

    /*
     * =========================
     * 中国大陆
     * =========================
     */

    "RULE-SET,ChinaMax,DIRECT",
    "RULE-SET,ChinaMax_Domain,DIRECT",
    "RULE-SET,ChinaMax_IP,DIRECT",
    "GEOSITE,CN,DIRECT",
    "GEOIP,CN,DIRECT,no-resolve",

    /*
     * =========================
     * 最终兜底
     * =========================
     */

    "MATCH,PROXY-Gate"
  ];

  /*
   * =========================
   * Rule Providers
   * =========================
   *
   * Android 版移除：
   * - Apple
   * - Apple_Domain
   * - iCloud
   *
   * 保留：
   * - 广告
   * - 隐私
   * - ChinaMax
   * - Microsoft / Copilot
   * - Emby
   */

  fixed["rule-providers"] = {
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
    },

    "Emby": {
      "type": "http",
      "behavior": "domain",
      "format": "mrs",
      "interval": 86400,
      "url": "https://raw.githubusercontent.com/kiki-rgb-00/kiki/refs/heads/main/MRS/Emby.mrs"
    }
  };

  return fixed;
}