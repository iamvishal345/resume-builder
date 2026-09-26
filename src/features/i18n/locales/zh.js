export default {
  nav: {
    features: "功能",
    about: "关于",
    privacy: "隐私",
    start: "开始使用",
    home: "Cavren 首页",
  },
  footer: {
    blurb:
      "免费且注重隐私的简历制作工具。提供引导式编辑、实时预览和诚实的导出功能。除非你主动选择，否则数据不会离开浏览器。",
    product: "产品",
    learn: "了解更多",
    start: "开始",
    features: "功能",
    resumes: "我的简历",
    export: "导出",
    about: "关于",
    support: "支持",
    privacy: "隐私",
    contact: "联系",
    build: "制作简历",
    ai: "AI 起草",
    coffee: "请我喝咖啡",
  },
  steps: {
    details: "基本信息",
    summary: "个人简介",
    experience: "工作经历",
    education: "教育经历",
    skills: "技能",
    extras: "其他信息",
    label: "简历章节",
  },
  sections: {
    summary: "个人简介",
    experience: "工作经历",
    education: "教育经历",
    skills: "技能",
  },
  editor: {
    view: "编辑器视图",
    edit: "编辑",
    preview: "预览",
    letter: "求职信",
    command: "命令面板 (Ctrl+K)",
    aiPrefs: "AI 偏好设置",
    themeToLight: "切换到浅色模式",
    themeToDark: "切换到深色模式",
    undo: "撤销 (Ctrl+Z)",
    redo: "重做 (Ctrl+Shift+Z)",
    versions: "版本",
    versionsHint: "本地快照",
    library: "我的简历",
    libraryHint: "全部简历",
    import: "导入",
    check: "检查简历",
    match: "职位匹配",
    fit: "调整为单页",
    pdf: "下载 PDF",
    docx: "下载 DOCX",
    saved: "已保存在此浏览器中",
  },
  dash: {
    title: "你的简历",
    blurb:
      "完全本地的简历库 (IndexedDB)。将 .r.json、.cavren.json 或 JSON Resume 文件放到任意位置即可恢复，不会上传任何内容。",
    dataPrivacy: "数据与隐私",
    restore: "恢复",
    newResume: "新建简历",
  },
  ownership: {
    tipTitle: "你的数据留在这里",
    tipBody:
      "简历保存在此浏览器中。你可以随时打开“数据与隐私”下载完整备份或清除本地数据。",
    tipDismiss: "知道了",
    tipOpen: "打开数据与隐私",
  },
  a11y: {
    skip: "跳到内容",
    locale: "语言",
    paper: "纸张大小",
  },
  backup: {
    encryptedTitle: "加密备份（可选）",
    encryptedBody:
      "使用你的口令保护同一份完整备份（在浏览器中使用 AES-GCM）。Cavren 无法恢复该口令。",
    passphrase: "口令",
    passphraseConfirm: "确认口令",
    downloadEncrypted: "下载加密备份",
    restoreEncrypted: "恢复加密备份",
    needPassphrase: "请输入此文件的口令。",
    mismatch: "两次输入的口令不一致。",
    weak: "请使用至少 8 个字符。",
    wrongPass: "口令错误或文件已损坏。",
  },
  marketing: {
    nav: {
      primary: "主导航",
      footer: "页脚",
    },
    theme: {
      toggle: "切换主题",
    },
    footer: {
      legal: "隐私优先 · 无追踪器 · 无广告",
    },
    home: {
      metaTitle: "制作一份让你获得机会的简历。",
      metaDescription:
        "快速、免费且注重隐私的简历制作工具。提供引导式章节、实时预览和诚实的 PDF 或 DOCX 导出——无需注册、无需追踪，数据留在你的设备上。",
      ogTitle: "Cavren——支持 PDF 和 DOCX 导出的离线、免费、注重隐私的简历制作工具",
      heroPrefix: "制作一份让你",
      heroHighlight: "获得机会的简历",
      lede:
        "引导式章节、实时预览和免费 PDF 或 DOCX 导出——全部在设备上完成。无需注册、上传或追踪。",
      start: "免费开始",
      featuresCta: "查看功能",
      offline: "支持离线使用",
      local: "数据留在本地",
      exports: "诚实的免费导出",
      journeyTitle: "几分钟内从空白页到 PDF",
      journeySubtitle: "一条清晰路径，每一步都有精致预览。",
      steps: {
        guided: {
          title: "引导式写作",
          description:
            "基本信息、工作经历、教育、技能、简介和其他内容——支持富文本和拖拽排序。",
        },
        check: {
          title: "检查并完善",
          description:
            "评分、连贯性和温和提示会在招聘人员发现之前，帮助你找出重复和单薄之处。",
        },
        export: {
          title: "导出并发送",
          description:
            "下载与预览一致的 PDF 或 DOCX，或根据粘贴的职位描述调整内容。",
        },
      },
      featuresTitle: "为制作优秀简历而设计",
      featuresSubtitle: "制作、检查和导出，同时不牺牲隐私。",
      features: {
        export: {
          title: "PDF 和 DOCX 导出",
          description:
            "从预览中的同一布局生成可直接打印的 PDF 或 Word；只需时也可导出为单页。",
        },
        import: {
          title: "导入已有内容",
          description:
            "导入 PDF、Word 文件或 Cavren 备份，并继续使用自己的内容完成简历。",
        },
        templates: {
          title: "可比较的模板",
          description:
            "更换布局、色彩和字体，或在决定前并排比较两个模板。",
        },
        ai: {
          title: "属于你的 AI",
          description:
            "使用 Chrome AI 或自己的 API 密钥，可选地生成初稿并润色要点；绝不通过 Cavren 代理。",
        },
        check: {
          title: "检查简历",
          description:
            "发送前查看实时评分、连贯性检查、可读性提示和成果表达建议。",
        },
        private: {
          title: "默认注重隐私",
          description:
            "数据存储在设备上的 IndexedDB。无需账户或分析 SDK。安装为 PWA 后仍可离线编辑。",
        },
      },
      ctaTitle: "准备好就开始",
      ctaBody: "你的数据留在这里。下一份简历只需几分钟。",
      ctaButton: "立即制作简历",
    },
    features: {
      metaTitle: "功能",
      metaDescription:
        "Cavren 的全部功能：引导式编辑、实时预览、PDF/DOCX 导出、导入、AI 起草、简历检查、职位匹配和完整隐私保护。",
      ogTitle: "Cavren 功能——一个可检查、匹配和导出的编辑器",
      heroTitle: "一个可检查、匹配和导出的编辑器",
      heroDescription:
        "六个引导式步骤让实时预览始终与表单并排显示。导出、导入、AI 和检查功能会将草稿变成你可以放心发送的简历。",
      start: "免费开始",
      privacy: "了解隐私保护",
      capabilitiesTitle: "你将获得",
      capabilitiesSubtitle: "让简历更容易编写、也更不容易出错的实用功能。",
      capabilities: {
        export: {
          title: "导出 PDF 和 DOCX",
          description:
            "从预览布局生成可直接打印的 PDF 或 Word。可导出整份简历或单独一页。",
        },
        import: {
          title: "导入任何内容",
          description:
            "粘贴文本，或导入 PDF、.docx 或 Cavren 备份，在保留已写内容的同时重新整理其余部分。",
        },
        ai: {
          title: "AI 起草与润色",
          description:
            "根据职位名称生成初稿、润色要点并从经历中提取技能——仅使用 Chrome AI 或你的 API 密钥。",
        },
        check: {
          title: "检查简历",
          description: "实时完整度评分、连贯性检查、可读性提示和成果表达建议。",
        },
        match: {
          title: "职位匹配",
          description:
            "粘贴职位描述，查找缺失关键词、获得定制建议和匹配分数。",
        },
        compare: {
          title: "模板与比较",
          description: "提供布局、配色和字体，并可在投递前并排比较。",
        },
        backup: {
          title: "备份与版本",
          description:
            "支持便携的 .r.json 备份、本地版本快照，以及可选的浏览器端 Drive 备份。",
        },
        private: {
          title: "注重隐私并支持离线",
          description: "无需账户或分析。数据存储在设备上的 IndexedDB；安装 PWA 后仍可离线编辑。",
        },
      },
      stepsTitle: "编辑器的工作方式",
      stepsSubtitle: "六个清晰步骤——不会遗漏任何内容，所有信息集中一处。",
      steps: {
        details: {
          title: "个人信息",
          description: "姓名、职位、联系方式、照片，以及 GitHub 或 LinkedIn 等社交链接。",
        },
        work: {
          title: "工作经历",
          description:
            "用富文本记录成就——可选用 AI 润色要点，并拖拽调整顺序。",
        },
        education: {
          title: "教育经历",
          description: "在同一个简洁编辑器中管理学历、学校和专业。",
        },
        skills: {
          title: "技能",
          description: "列出招聘人员关注的技能，标注熟练程度，或从经历中建议技能。",
        },
        summary: {
          title: "个人简介",
          description: "用简洁的文字串联经历、技能和目标，并使用浏览器拼写检查。",
        },
        extras: {
          title: "其他章节",
          description: "添加语言、证书等信息，并可在“自定义”中复制或重新排序。",
        },
      },
      ctaTitle: "免费试用——免费且注重隐私",
      ctaBody: "无需注册，无需上传。只是更快做出更好简历的方法。",
    },
    about: {
      metaTitle: "关于与支持",
      metaDescription:
        "关于 {name} 与支持——由 {owner} 打造的离线简历制作工具。离线优先、无广告、无追踪器，数据留在你的设备上。",
      title: "关于与支持",
      lede: "你好，我是 {owner}。我打造 {name}，是因为它正是我想要工具：快速、免费且注重隐私。所有功能都在浏览器中运行，数据留在你的设备上，导出文件由你的计算机生成。",
      principles: "产品原则",
      values: {
        offline: "离线优先",
        ads: "无广告",
        trackers: "无追踪器",
        account: "无需账户",
        exports: "无付费导出",
      },
      shortTitle: "简单说",
      shortBody:
        "无需账户。无需上传。没有追踪、广告或付费墙，也不会把任何功能藏在“导出前免费”之后。我们直接提供它，因为简历工具应该尊重你的时间和隐私。",
      privacyPrefix: "“",
      privacyLink: "隐私页面",
      privacyMiddle: "解释了每一个字节的去向（除非你主动要求，否则哪儿也不去）。 ",
      featuresLink: "功能",
      featuresMiddle:
        "介绍了它能做什么，包括可选的 AI；AI 只与你自行配置的服务商通信。",
      supportTitle: "获取支持",
      questionsTitle: "问题与反馈",
      questionsBody: "有不清楚的地方或想法？直接发邮件给我，我会全部阅读。",
      bugsTitle: "问题与缺陷",
      bugsBody:
        "如果遇到问题，请附上复现步骤和预期结果。所有内容都在本地运行，我无法查看你的简历。",
      reportIssue: "报告问题",
      coffeeTitle: "喜欢吗？请我喝杯咖啡",
      coffeeBody:
        "Cavren 永远免费——没有广告、没有付费导出，也没有被锁定的功能。如果它为你节省了时间，咖啡是一种可选的感谢方式。",
      coffeeButton: "请我喝咖啡",
      qrLabel: "扫描二维码请我喝咖啡",
      qrAlt: "请我喝咖啡的二维码",
      ctaTitle: "试一试",
      ctaBody: "免费、本地，而且属于你——第一份简历只需几分钟。",
      ctaButton: "免费开始",
    },
    privacy: {
      metaTitle: "隐私",
      metaDescription: "Cavren 隐私政策：你的数据留在设备上。没有服务器，也没有数据收集。",
      title: "隐私",
      lede:
        "简单来说，Cavren 是一款社区型、离线优先的工具。你的简历留在设备上。我们不会为内容运行应用服务器，不要求账户，也不会嵌入分析或广告追踪器。",
      dataTitle: "数据存储位置",
      dataBody:
        "简历存储在此浏览器的 IndexedDB 中。你下载的备份（.rjson、PDF、DOCX 或可选的加密包）是电脑上的普通文件。该备份的加密仅在浏览器中运行，Cavren 无法恢复口令。可选的版本快照也保存在此设备的 IndexedDB 中。",
      collectTitle: "我们收集什么",
      collectAccount: "制作或导出无需账户、姓名或电子邮件地址。",
      collectAnalytics: "没有分析、广告或会话回放脚本。",
      collectFonts: "字体随应用提供，我们不会加载第三方追踪域名。",
      aiTitle: "可选 AI",
      aiBody:
        "在你配置之前，AI 功能处于关闭状态。你可以使用设备上的 Chrome AI，也可以提供自己的 API 密钥。你明确发送的文本只会发送给该服务商，绝不会发送给 Cavren 托管的模型。你可以随时在 AI 设置中清除密钥。",
      driveTitle: "可选的 Google Drive 备份",
      driveBodyBefore: "启用 Drive 备份后，OAuth 会在浏览器中连接 Google。备份文件会写入 ",
      driveBodyEmphasis: "你的",
      driveBodyAfter: " Drive。Cavren 不运行同步服务器。令牌会保留在此浏览器中。",
      exportsTitle: "导出与离线使用",
      exportsBeforeLink: "PDF 和 DOCX 在本地生成。你也可以导出 Markdown、纯文本或 ",
      jsonResume: "JSON Resume",
      exportsAfterLink:
        " 文件供其他工具使用。安装为 PWA（或访问一次）后，应用可以离线编辑和导出。只有可选 AI API 和 Drive 需要网络。",
      contactTitle: "联系",
      contactBeforeEmail: "有问题吗？请联系 ",
      email: "{email}",
      contactBetween: "，或访问 ",
      contactLink: "联系页面",
      contactAfter: "。",
    },
    contact: {
      metaTitle: "联系",
      metaDescription: "联系 {name}。报告问题、提出想法或打个招呼，邮件都是最好的方式。",
      title: "联系",
      lede: "发现缺陷、有想法，或只是想打个招呼？我很乐意了解你的想法。",
      bestTitle: "联系我最方便的方式",
      emailLabel: "电子邮件：",
      bugs: "问题与功能请求：请发送到此地址，并附上复现步骤和预期结果。",
      beforeTitle: "发送之前",
      beforeBody:
        "由于所有内容都在本地运行，我无法查看你的简历或浏览器数据。请分享步骤和预期行为，而不是粘贴个人简历内容。",
      browsePrefix: "想先浏览一下？请查看",
      supportLink: "支持",
      browseMiddle: "或",
      privacyLink: "隐私",
      browseEnd: "页面。",
      cta: "发送邮件",
    },
    offline: {
      metaTitle: "离线",
      metaDescription: "Cavren 当前离线。打开缓存页面或重新连接以继续。",
      title: "你当前处于离线状态",
      body:
        "访问过一次后，Cavren 即使没有网络也能继续工作。请从安装或历史记录中打开“我的简历”——编辑和导出都会留在此设备上。",
      resumes: "我的简历",
      home: "首页",
      note: "可选 AI API 和 Google Drive 备份会等待你重新联网。",
    },
    notFound: {
      metaTitle: "找不到页面",
      metaDescription: "你要找的页面不存在或已被移动。",
      title: "404 — 找不到页面",
      body: "此 URL 不存在或已被移动。你的简历仍在原来的位置——就在此设备上。",
      resumes: "前往我的简历",
      home: "返回首页",
    },
  },
};
