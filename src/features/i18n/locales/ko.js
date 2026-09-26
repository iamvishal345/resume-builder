export default {
  nav: {
    features: "기능",
    about: "소개",
    privacy: "개인정보 보호",
    start: "시작하기",
    home: "Cavren 홈",
  },
  footer: {
    blurb:
      "무료이고 개인정보를 존중하는 이력서 빌더입니다. 안내된 편집, 실시간 미리보기, 투명한 내보내기를 제공합니다. 직접 선택하지 않는 한 데이터가 브라우저를 벗어나지 않습니다.",
    product: "제품",
    learn: "알아보기",
    start: "시작",
    features: "기능",
    resumes: "내 이력서",
    export: "내보내기",
    about: "소개",
    support: "지원",
    privacy: "개인정보 보호",
    contact: "문의",
    build: "이력서 만들기",
    ai: "AI 초안 작성",
    coffee: "커피 한 잔 사 주세요",
  },
  steps: {
    details: "기본 정보",
    summary: "요약",
    experience: "경력",
    education: "학력",
    skills: "기술",
    extras: "추가 정보",
    label: "이력서 섹션",
  },
  sections: {
    summary: "요약",
    experience: "경력",
    education: "학력",
    skills: "기술",
  },
  editor: {
    view: "편집기 보기",
    edit: "편집",
    preview: "미리보기",
    letter: "커버 레터",
    command: "명령 팔레트 (Ctrl+K)",
    aiPrefs: "AI 설정",
    themeToLight: "밝은 모드로 전환",
    themeToDark: "어두운 모드로 전환",
    undo: "실행 취소 (Ctrl+Z)",
    redo: "다시 실행 (Ctrl+Shift+Z)",
    versions: "버전",
    versionsHint: "로컬 스냅샷",
    library: "내 이력서",
    libraryHint: "모든 이력서",
    import: "가져오기",
    check: "이력서 검사",
    match: "공고 적합도",
    fit: "한 페이지에 맞추기",
    pdf: "PDF 다운로드",
    docx: "DOCX 다운로드",
    saved: "이 브라우저에 저장됨",
  },
  dash: {
    title: "내 이력서",
    blurb:
      "로컬 전용 라이브러리(IndexedDB)입니다. .r.json, .cavren.json 또는 JSON Resume 파일을 원하는 곳에 놓으면 복원됩니다. 업로드되는 데이터는 없습니다.",
    dataPrivacy: "데이터 및 개인정보",
    restore: "복원",
    newResume: "새 이력서",
  },
  ownership: {
    tipTitle: "데이터는 여기에 남습니다",
    tipBody:
      "이력서는 이 브라우저에 저장됩니다. 전체 백업을 내려받거나 로컬 데이터를 지우려면 언제든지 데이터 및 개인정보를 열 수 있습니다.",
    tipDismiss: "알겠습니다",
    tipOpen: "데이터 및 개인정보 열기",
  },
  a11y: {
    skip: "본문으로 건너뛰기",
    locale: "언어",
    paper: "용지 크기",
  },
  backup: {
    encryptedTitle: "암호화 백업(선택 사항)",
    encryptedBody:
      "동일한 전체 팩을 비밀번호로 보호합니다(브라우저에서 AES-GCM). Cavren은 비밀번호를 복구할 수 없습니다.",
    passphrase: "비밀번호",
    passphraseConfirm: "비밀번호 확인",
    downloadEncrypted: "암호화본 다운로드",
    restoreEncrypted: "암호화본 복원",
    needPassphrase: "이 파일의 비밀번호를 입력하세요.",
    mismatch: "비밀번호가 일치하지 않습니다.",
    weak: "8자 이상 사용하세요.",
    wrongPass: "비밀번호가 틀렸거나 파일이 손상되었습니다.",
  },
  marketing: {
    nav: {
      primary: "주 탐색",
      footer: "바닥글",
    },
    theme: {
      toggle: "테마 전환",
    },
    footer: {
      legal: "설계부터 개인정보 보호 · 추적기 없음 · 광고 없음",
    },
    home: {
      metaTitle: "채용의 계기가 되는 이력서를 만들어 보세요.",
      metaDescription:
        "빠르고 무료이며 개인정보를 존중하는 이력서 빌더입니다. 안내된 섹션, 실시간 미리보기, 투명한 PDF 또는 DOCX 내보내기를 제공합니다. 가입이나 추적 없이 데이터는 기기에 남습니다.",
      ogTitle: "Cavren — PDF 및 DOCX 내보내기를 지원하는 오프라인 무료 개인정보 보호 이력서 빌더",
      heroPrefix: "채용의 계기가 되는",
      heroHighlight: "이력서를 만들어 보세요",
      lede:
        "안내된 섹션, 실시간 미리보기, 무료 PDF 또는 DOCX 내보내기를 기기에서 사용하세요. 가입, 업로드, 추적이 필요 없습니다.",
      start: "무료로 시작하기",
      featuresCta: "기능 보기",
      offline: "오프라인에서도 작동",
      local: "데이터는 기기에 보관",
      exports: "투명한 무료 내보내기",
      journeyTitle: "빈 페이지에서 PDF까지 단 몇 분",
      journeySubtitle: "하나의 간단한 경로와 모든 단계의 섬세한 미리보기.",
      steps: {
        guided: {
          title: "안내에 따라 작성",
          description:
            "기본 정보, 경력, 학력, 기술, 요약, 추가 정보를 서식 텍스트와 드래그 정렬로 작성할 수 있습니다.",
        },
        check: {
          title: "검사하고 다듬기",
          description:
            "점수, 일관성, 부드러운 안내가 중복과 얕은 내용을 채용 담당자가 발견하기 전에 알려 줍니다.",
        },
        export: {
          title: "내보내고 보내기",
          description:
            "미리보기와 같은 PDF 또는 DOCX를 내려받고, 붙여 넣은 공고 설명에 맞춰 내용을 조정할 수 있습니다.",
        },
      },
      featuresTitle: "이력서 제작에 맞게 설계됨",
      featuresSubtitle: "개인정보를 포기하지 않고 만들고, 검사하고, 내보내세요.",
      features: {
        export: {
          title: "PDF 및 DOCX 내보내기",
          description:
            "미리보기와 같은 레이아웃으로 인쇄 준비가 된 PDF 또는 Word를 만드세요. 필요하면 한 페이지로도 가능합니다.",
        },
        import: {
          title: "가져온 자료로 계속하기",
          description:
            "PDF, Word 파일 또는 Cavren 백업을 가져와 자신의 내용을 바탕으로 계속 작성하세요.",
        },
        templates: {
          title: "비교할 수 있는 템플릿",
          description:
            "레이아웃, 색상, 글꼴을 바꾸거나 선택하기 전에 두 템플릿을 나란히 비교하세요.",
        },
        ai: {
          title: "내 것이 되는 AI",
          description:
            "Chrome AI 또는 내 API 키로 선택적 초안과 불릿 다듬기를 사용하세요. Cavren 프록시는 거치지 않습니다.",
        },
        check: {
          title: "이력서 검사",
          description:
            "실시간 점수, 일관성 검사, 읽기 수준 힌트, 전송 전 성과 표현 도구를 확인하세요.",
        },
        private: {
          title: "기본적으로 비공개",
          description:
            "기기의 IndexedDB를 사용합니다. 계정이나 분석 SDK가 없으며 PWA로 설치해 오프라인에서도 편집할 수 있습니다.",
        },
      },
      ctaTitle: "준비되면 시작하세요",
      ctaBody: "데이터는 여기에 남습니다. 다음 이력서는 몇 분이면 만들 수 있습니다.",
      ctaButton: "지금 이력서 만들기",
    },
    features: {
      metaTitle: "기능",
      metaDescription:
        "Cavren의 모든 기능: 안내된 편집, 실시간 미리보기, PDF/DOCX 내보내기, 가져오기, AI 초안, 이력서 검사, 공고 매칭, 완전한 개인정보 보호.",
      ogTitle: "Cavren 기능 — 검사하고, 맞추고, 내보내는 편집기",
      heroTitle: "검사하고, 맞추고, 내보내는 편집기",
      heroDescription:
        "여섯 단계의 안내가 양식 옆에 실시간 미리보기를 유지합니다. 내보내기, 가져오기, AI와 검사를 통해 초안을 자신 있게 보낼 수 있는 이력서로 만드세요.",
      start: "무료로 시작하기",
      privacy: "개인정보 보호 방식",
      capabilitiesTitle: "제공하는 기능",
      capabilitiesSubtitle: "이력서 작성을 쉽게 하고 실수를 어렵게 만드는 기능입니다.",
      capabilities: {
        export: {
          title: "PDF 및 DOCX 내보내기",
          description:
            "미리보기 레이아웃으로 인쇄 준비가 된 PDF 또는 Word를 만드세요. 전체 이력서나 한 페이지만 내보낼 수 있습니다.",
        },
        import: {
          title: "무엇이든 가져오기",
          description:
            "텍스트를 붙여 넣거나 PDF, .docx, Cavren 백업을 가져와 작성한 내용을 유지하고 나머지를 다시 구성하세요.",
        },
        ai: {
          title: "AI 초안 및 다듬기",
          description:
            "직무명으로 첫 초안을 만들고, 불릿을 개선하며, 경험에서 기술을 찾으세요. Chrome AI 또는 내 API 키만 사용합니다.",
        },
        check: {
          title: "이력서 검사",
          description: "실시간 완성도 점수, 일관성 검사, 읽기 수준 힌트, 성과 표현 도구를 제공합니다.",
        },
        match: {
          title: "공고 매칭",
          description:
            "공고 설명을 붙여 넣어 부족한 키워드, 맞춤 제안, 매칭 점수를 확인하세요.",
        },
        compare: {
          title: "템플릿 및 비교",
          description: "레이아웃, 팔레트, 글꼴을 선택하고 지원 전에 나란히 비교할 수 있습니다.",
        },
        backup: {
          title: "백업 및 버전",
          description:
            "휴대용 .r.json 백업, 로컬 버전 스냅샷, 브라우저에서 선택적으로 사용할 수 있는 Drive 백업을 지원합니다.",
        },
        private: {
          title: "비공개 및 오프라인",
          description: "계정과 분석 기능이 없습니다. 기기의 IndexedDB를 사용하고 PWA를 설치해 오프라인에서 편집하세요.",
        },
      },
      stepsTitle: "편집기 사용법",
      stepsSubtitle: "분명한 여섯 단계 — 놓치는 것 없이 모두 한곳에 모았습니다.",
      steps: {
        details: {
          title: "개인 정보",
          description: "이름, 직무, 연락처, 사진, GitHub와 LinkedIn 같은 소셜 링크.",
        },
        work: {
          title: "경력",
          description:
            "서식 텍스트로 작성한 성과가 있는 직무입니다. 선택형 AI로 불릿을 다듬고 드래그로 순서를 바꾸세요.",
        },
        education: {
          title: "학력",
          description: "학위, 학교, 전공을 깔끔한 편집기에서 한곳에 관리하세요.",
        },
        skills: {
          title: "기술",
          description: "채용 담당자가 찾는 기술을 입력하고 숙련도를 표시하거나 경험에서 기술을 제안받으세요.",
        },
        summary: {
          title: "요약",
          description: "경력, 기술, 목표를 연결하는 간결한 요약입니다. 브라우저 맞춤법 검사를 사용할 수 있습니다.",
        },
        extras: {
          title: "추가 섹션",
          description: "언어, 자격증 등을 추가할 수 있습니다. 사용자 지정에서 복제하거나 순서를 바꾸세요.",
        },
      },
      ctaTitle: "무료로/private하게 사용해 보세요",
      ctaBody: "가입도 업로드도 필요 없습니다. 더 좋은 이력서로 가는 빠른 방법일 뿐입니다.",
    },
    about: {
      metaTitle: "소개 및 지원",
      metaDescription:
        "{name} 소개 및 지원. {owner}가 만든 오프라인 이력서 빌더로 오프라인 우선, 광고 없음, 추적기 없음, 데이터는 기기에 남습니다.",
      title: "소개 및 지원",
      lede: "안녕하세요, {owner}입니다. 빠르고 무료이며 개인정보를 존중하는 도구, 바로 그것을 만들기 위해 {name}을 만들었습니다. 모든 기능은 브라우저에서 실행되고 데이터는 기기에 남습니다. 내보내기는 내 컴퓨터에서 생성됩니다.",
      principles: "제품 원칙",
      values: {
        offline: "오프라인 우선",
        ads: "광고 없음",
        trackers: "추적기 없음",
        account: "계정 없음",
        exports: "유료 내보내기 없음",
      },
      shortTitle: "한 줄 요약",
      shortBody:
        "계정도, 업로드도, 추적·광고·페이월도 없습니다. ‘내보내기 전까지 무료’라는 이름으로 무엇도 가리지 않습니다. 이력서 도구는 사용자의 시간과 개인정보를 존중해야 하므로 그대로 제공합니다.",
      privacyPrefix: "",
      privacyLink: "개인정보 보호 페이지",
      privacyMiddle: "는 모든 바이트가 어디로 가는지와 원하지 않는 한 어디에도 가지 않는 이유를 설명합니다. ",
      featuresLink: "기능",
      featuresMiddle:
        " 페이지는 무엇을 할 수 있는지 보여줍니다. 선택형 AI도 사용자가 직접 설정한 제공자와만 통신합니다.",
      supportTitle: "지원 받기",
      questionsTitle: "질문과 의견",
      questionsBody: "궁금한 점이나 아이디어가 있으면 직접 이메일 주세요. 모두 읽습니다.",
      bugsTitle: "버그와 문제",
      bugsBody:
        "문제가 있으면 재현 단계와 기대한 동작을 함께 알려주세요. 모든 것이 로컬에서 실행되므로 이력서는 볼 수 없습니다.",
      reportIssue: "문제 신고",
      coffeeTitle: "마음에 드셨나요? 커피 한 잔 사 주세요",
      coffeeBody:
        "Cavren은 영원히 무료입니다. 광고, 유료 내보내기, 잠긴 기능이 없습니다. 시간을 아꼈다면 커피 한 잔은 선택적인 감사 표현입니다.",
      coffeeButton: "커피 한 잔 사 주세요",
      qrLabel: "QR 코드를 스캔해 커피를 사 주세요",
      qrAlt: "커피 구매 QR 코드",
      ctaTitle: "한번 해 보세요",
      ctaBody: "무료이고, 로컬이며, 당신의 것입니다. 첫 이력서는 몇 분이면 완성됩니다.",
      ctaButton: "무료로 시작하기",
    },
    privacy: {
      metaTitle: "개인정보 보호",
      metaDescription: "Cavren 개인정보 보호 정책: 데이터는 기기에 남습니다. 서버도 데이터 수집도 없습니다.",
      title: "개인정보 보호",
      lede:
        "간단히 말하면 Cavren은 지역 기반 로컬 우선 도구입니다. 이력서는 기기에 남습니다. 콘텐츠를 위한 앱 서버를 운영하지 않고, 계정을 요구하지 않으며, 분석이나 광고 추적기를 포함하지 않습니다.",
      dataTitle: "데이터가 있는 곳",
      dataBody:
        "이력서는 이 브라우저의 IndexedDB에 저장됩니다. 다운로드한 백업(.r.json, PDF, DOCX 또는 비밀번호로 선택적으로 암호화한 팩)은 컴퓨터의 일반 파일입니다. 해당 팩의 암호화는 브라우저에서만 실행되며 Cavren은 비밀번호를 복구할 수 없습니다. 선택적 버전 스냅샷도 이 기기의 IndexedDB에 남습니다.",
      collectTitle: "수집하는 정보",
      collectAccount: "만들거나 내보내려면 계정, 이름, 이메일 주소가 필요하지 않습니다.",
      collectAnalytics: "분석, 광고, 세션 재생 스크립트가 없습니다.",
      collectFonts: "글꼴은 앱과 함께 제공되며 제3자 추적 도메인을 불러오지 않습니다.",
      aiTitle: "선택형 AI",
      aiBody:
        "AI 기능은 설정할 때까지 꺼져 있습니다. 기기의 Chrome AI를 사용하거나 자체 API 키를 입력할 수 있습니다. 명시적으로 보낸 텍스트는 해당 제공자에게만 전달되며 Cavren이 호스팅한 모델에는 전달되지 않습니다. AI 설정에서 언제든지 키를 지울 수 있습니다.",
      driveTitle: "선택형 Google Drive 백업",
      driveBodyBefore: "Drive 백업을 켜면 OAuth가 브라우저에서 Google에 연결됩니다. 백업 파일은 ",
      driveBodyEmphasis: "내",
      driveBodyAfter: " Drive에 기록됩니다. Cavren은 동기화 서버를 운영하지 않습니다. 토큰은 이 브라우저에 남습니다.",
      exportsTitle: "내보내기와 오프라인 사용",
      exportsBeforeLink: "PDF와 DOCX는 로컬에서 생성됩니다. Markdown, 일반 텍스트 또는 ",
      jsonResume: "JSON Resume",
      exportsAfterLink:
        " 파일을 다른 도구용으로 내보낼 수도 있습니다. PWA로 설치하거나 한 번 방문한 뒤에는 편집과 내보내기를 오프라인에서 할 수 있습니다. 선택형 AI API와 Drive에만 네트워크가 필요합니다.",
      contactTitle: "문의",
      contactBeforeEmail: "질문이 있으면 ",
      email: "{email}",
      contactBetween: "로 문의하거나 ",
      contactLink: "문의",
      contactAfter: " 페이지를 방문하세요.",
    },
    contact: {
      metaTitle: "문의",
      metaDescription: "{name}에 문의하세요. 버그, 아이디어, 인사말은 이메일이 가장 좋습니다.",
      title: "문의",
      lede: "버그를 찾았거나 아이디어가 있거나 단순히 인사하고 싶다면 기꺼이 들을게요.",
      bestTitle: "연락하는 가장 좋은 방법",
      emailLabel: "이메일: ",
      bugs: "버그와 기능 요청: 같은 주소로 재현 단계와 기대한 동작을 함께 보내주세요.",
      beforeTitle: "메시지를 쓰기 전에",
      beforeBody:
        "모든 것이 로컬에서 실행되므로 이력서나 브라우저 데이터는 볼 수 없습니다. 개인 이력서 내용을 붙여 넣지 말고 단계와 기대 동작을 공유해 주세요.",
      browsePrefix: "먼저 둘러보고 싶나요? ",
      supportLink: "지원",
      browseMiddle: " 또는 ",
      privacyLink: "개인정보 보호",
      browseEnd: " 페이지를 확인하세요.",
      cta: "이메일 보내기",
    },
    offline: {
      metaTitle: "오프라인",
      metaDescription: "Cavren이 오프라인 상태입니다. 캐시된 페이지를 열거나 다시 연결해 계속하세요.",
      title: "오프라인 상태입니다",
      body:
        "한 번 방문한 뒤에는 Cavren이 네트워크 없이도 계속 작동합니다. 설치된 앱이나 기록에서 내 이력서를 여세요. 편집과 내보내기는 이 기기에 남습니다.",
      resumes: "내 이력서",
      home: "홈",
      note: "선택형 AI API와 Google Drive 백업은 다시 온라인이 될 때까지 기다립니다.",
    },
    notFound: {
      metaTitle: "페이지를 찾을 수 없음",
      metaDescription: "찾으시는 페이지가 존재하지 않거나 이동되었습니다.",
      title: "404 — 페이지를 찾을 수 없음",
      body: "이 URL은 존재하지 않거나 이동되었습니다. 이력서는 그대로 이 기기에 남아 있습니다.",
      resumes: "내 이력서로 이동",
      home: "홈으로 돌아가기",
    },
  },
};
