
import { googleFormUrl } from './googleForm.mjs'

export const HOME_CONTENT_KEY = 'homepage_sections'

const studyCards = [
  {
    symbol: '가',
    title: 'Үгийн сан',
    body: 'Өдөр тутамд хамгийн түрүүнд хэрэглэх үгс',
    url: '/books',
  },
  {
    symbol: '-요',
    title: 'Дүрэм',
    body: 'Цээжлэх бус, утгаар нь ойлгох дүрэм',
    url: '/topik',
  },
  {
    symbol: '말',
    title: 'Бодит яриа',
    body: 'Нөхцөл бүрд шууд хэрэглэж болох харилцан яриа',
    url: '#conversation',
  },
  {
    symbol: '컷',
    title: 'K-Drama',
    body: 'Киноноос байнга сонсогддог амьд хэллэг',
    url: '/kdrama',
  },
]

const questions = [
  {
    question: 'Анхан шатнаас эхэлж болох уу?',
    answer: 'Тийм. Үгийн сан, дүрэм, өдөр тутмын ярианаас өөрийн түвшинд тохирсон материалаа сонгон эхэлж болно.',
  },
  {
    question: 'Дижитал номоо хэрхэн үзэх вэ?',
    answer: 'Номын сангаас номоо сонгоод PDF Preview хэсгээр эхний хуудсуудыг үзэж болно.',
  },
  {
    question: 'Хичээлүүд үнэгүй юу?',
    answer: 'Сайтын нээлттэй танилцуулга, жишээ хэллэгүүдийг үнэгүй үзнэ. Төлбөртэй материалын үнэ тусдаа харагдана.',
  },
  {
    question: 'TOPIK-д зориулсан материал бий юу?',
    answer: 'TOPIK-ийн стратеги, үгийн сан болон бэлтгэлийн материалуудыг TOPIK болон номын сангийн хэсгээс үзээрэй.',
  },
]

const reasons = [
  {
    title: 'Бүгдийг биш, хэрэгтэйг',
    body: 'Таны зорилгод хүргэх үг, дүрэм, нөхцөлд төвлөрнө.',
  },
  {
    title: 'Цээжлэхээс илүү ойлгох',
    body: 'Яагаад ингэж хэлдгийг утга, жишээгээр тайлбарлана.',
  },
  {
    title: 'Цагаа үр дүнтэй ашиглах',
    body: 'Богино хичээл бүр тодорхой нэг үр дүнтэй.',
  },
  {
    title: 'Материал дээр нэмэх нь чиглүүлэг',
    body: 'Дижитал материалаа хэрхэн ашиглах алхмыг хамт өгнө.',
  },
]

const footerText = {
  description: 'Хэл сурахыг өөртөө ойр, амьдралд хэрэгтэй болгоно.',
  learn_heading: 'СУРАХ',
  site_heading: 'LEARNMINEA',
  topik: 'TOPIK',
  kdrama: 'K-Drama',
  books: 'Цахим ном',
  home: 'Нүүр',
  assessment: 'Сурах арга барил',
  faq: 'Түгээмэл асуулт',
  contact: 'Холбоо барих',
  copyright: '© 2026 LearnMinea. Бүх эрх хуулиар хамгаалагдсан.',
  rights: 'Дижитал материалын эрх, таталтыг серверээр баталгаажуулна.',
}

export const homeContentDefaults = {
  hero: {
    eyebrow: 'ӨӨРИЙН ХЭМНЭЛЭЭР, БОДИТ ХЭРЭГЛЭЭНЭЭС',
    title: 'Хэл сурахад\nихийг биш,\nзөвийг сур.',
    body: 'Өөрийн түвшин, зорилго, сурах арга барилдаа тохирсон хичээл, цахим ном, бодит хэрэглээний материалаа нэг дороос олоорой.',
    search_placeholder: 'Жишээ нь: кафед хэрхэн захиалах вэ?',
    search_button: 'Хайх →',
  },

  study: {
    eyebrow: 'ЭХЛЭХ ХЭСЭГ',
    title: 'Өнөөдөр юу сурах вэ?',
    body: 'Өнөөдөр танд хэрэгтэй нэг жижиг сэдвээс эхлээд тогтвортой урагшлаарай.',
    cards: studyCards,
  },

  topikInfo: {
    eyebrow: 'TOPIK · KOREAN LANGUAGE TEST',
    title: 'TOPIK',
    body: 'Солонгос хэлний түвшин тогтоох шалгалтын мэдээлэл',
    card1_symbol: '?',
    card1_title: 'TOPIK гэж юу вэ?',
    card1_body: 'Шалгалтын бүтэц, түвшин болон бэлтгэлийн талаарх үндсэн мэдээлэл.',
    card1_link_text: 'Дэлгэрэнгүй үзэх →',
    card2_symbol: '✓',
    card2_title: 'TOPIK шалгалтад бүртгүүлэх',
    card2_body: 'Шалгалтын бүртгэл, хугацаа болон шаардлагатай мэдээллийг шалгаарай.',
    card2_link_text: 'Дэлгэрэнгүй үзэх →',
  },
  gksInfo: {
    eyebrow: 'GLOBAL KOREA SCHOLARSHIP',
    title: 'Засгийн газрын тэтгэлэг · GKS',
    body: 'Солонгосын засгийн газрын тэтгэлэгт хөтөлбөрийн танилцуулга',
    summary: 'GKS-ийн дэлгэрэнгүй мэдээлэл',
    requirements_title: 'Тавигдах шаардлага',
    requirements_body: 'Нас, иргэншил, боловсрол болон сурлагын дүнгийн шаардлага нь тухайн жилийн албан ёсны удирдамжаас хамаарна.',
    documents_title: 'Бүрдүүлэх материал',
    documents_list: 'Application Form\nPersonal Statement\nStudy Plan\nRecommendation Letter\nБоловсрол, иргэншлийг нотлох баримтууд\nШаардлагатай бол орчуулга, нотариат, апостиль',
    tracks_title: 'Материал өгөх зам',
    tracks_body: 'Embassy Track болон University Track гэсэн үндсэн замуудтай.',
    selection_title: 'Шалгаруулалт ба бэлтгэл',
    selection_body: 'Сурлагын үзүүлэлт, материалын үнэлгээ болон шаардлагатай тохиолдолд ярилцлагад үндэслэнэ.',
    official_link_text: 'Албан ёсны мэдээлэл ↗',
    more_text: 'Дэлгэрэнгүй ↓',
    requirements_list: 'Иргэншил: Тухайн жилийн удирдамжийн шаардлагыг шалгах\nНас: Хөтөлбөр, түвшнээс хамаарна\nСурлагын дүн: Албан ёсны босго болон тооцох аргыг шалгах\nХэлний мэдлэг: Шаардлага болон нэмэлт давуу талыг удирдамжаас шалгах',
    optional_title: 'Нэмэлт материал',
    optional_list: 'TOPIK, IELTS эсвэл TOEFL онооны баримт (байгаа бол)\nШагнал, сертификат (зөвшөөрөгдсөн бол)',
    documents_note: 'Бичиг баримтын жагсаалт, баталгаажуулалт болон хугацаа нь жил бүр өөрчлөгдөж болно. Тухайн жилийн албан ёсны удирдамжийг заавал шалгаарай.',
    preparation_title: 'Хэзээнээс бэлдэх вэ?',
    preparation_body: 'Их сургууль, мэргэжлээ судлах; хэлний оноо, эссэ, зөвлөмжийн захидал болон баталгаажуулах бичиг баримтаа урьдчилан төлөвлөх.',
    apostille_title: 'Нотариат ба Апостиль',
    apostille_body: 'Орчуулга, нотариат, апостиль болон эх хувийн шаардлагыг тухайн жилийн заавар, хүлээн авах байгууллагын нөхцөлтэй тулган шалгана.',
    consultation_text: 'Зөвлөгөө авах →',
    consultation_url: '/survey',

  },
  conversation: {
    eyebrow: 'ӨНӨӨДРИЙН ЯРИА',
    korean: '아이스 아메리카노 한 잔 주세요.',
    translation: 'Нэг мөстэй американо өгнө үү.',
    tip: '♧ 한 잔 нь аяга уух зүйл тоолох хэллэг. 주세요-г хүсэлтээ эелдгээр хэлэхдээ ашиглана.',
    side_eyebrow: 'АМЬД ХЭРЭГЛЭЭНИЙ СОЛОНГОС ХЭЛ',
    side_title: 'Солонгос хэлийг амьд хэрэглээнээс сур',
    side_body: 'Дүрмийг дангаар нь бус, яг хэрэглэх нөхцөл, өнгө аяс, богино жишээтэй нь ойлгоно.',
    button_text: 'Дэлгэрэнгүй үзэх →',
    button_url: '/kdrama',
  },

  books: {
    featured_book_ids: ['', '', '', ''],
    eyebrow: 'ЦАХИМ НОМЫН САН',
    title: 'Сурах материалаа сонго',
    body: 'Түвшин, зорилгодоо тохирсон цахим ном, материалуудаа үзээрэй.',
    button_text: 'Бүх номыг үзэх →',
    button_url: '/books',
    empty_text: 'Одоогоор нийтлэгдсэн ном алга байна.',
  },

  assessment: {
    eyebrow: 'СУРАХ АРГА БАРИЛ',
    title: 'Танд тохирох сурах аргаа олъё',
    body: '5–7 минутын асуулгаар таны зорилго, одоогийн арга, боломжит цагийг тодруулж, бодит төлөвлөгөө санал болгоно.',
    button_text: 'Үнэлгээг эхлүүлэх →',
    button_url: '/assessment/questions',
    duration: '5–7',
    duration_unit: 'минут',
    benefits: [
      'Сурах арга барил',
      'Хувийн хөтөлбөр',
      'Дөрвөн чадварын тэнцвэр',
    ],
    style: {
      background: '#191919',
      card_background: '#292929',
      card_border: '#494949',
      eyebrow_color: '#e6c9bd',
      heading_color: '#ffffff',
      body_color: '#9b9ba3',
      card_text_color: '#ffffff',
      muted_text_color: '#a3a3aa',
      button_background: '#ffffff',
      button_text_color: '#191919',
      heading_size: 58,
      body_size: 24,
      eyebrow_size: 14,
      duration_size: 112,
      benefit_size: 24,
      button_size: 18,
      section_padding: 90,
      card_radius: 36,
    },
  },

  why: {
    eyebrow: 'ЯАГААД LEARNMINEA ВЭ',
    title: 'Илүү их контент биш. Илүү зөв чиглэл.',
    reasons,
  },

  lifestyle: {
    enabled: true,
    eyebrow: 'БОДИТ АМЬДРАЛ, БОДИТ ХЭЛ',
    title: 'Хичээлээс гараад шууд хэрэглэгддэг хэл',
    body: 'Кафе, сургууль, ажил, нийтийн тээвэр, өдөр тутмын уулзалт. Амьдрал дээр танд хэрэг болох мөчөөс хичээл эхэлнэ.',
    image_url: '',
    tags: ['Кафе', 'Сургууль', 'Ажил', 'Тээвэр', 'Өдөр тутам'],
  },

  testimonials: {
    enabled: true,
    eyebrow: 'СУРАЛЦАГЧДЫН СЭТГЭГДЭЛ',
    title: 'Суралцагчид LearnMinea-г хэрхэн ашиглаж байна',
    reviews: [],
  },

  registration: {
    enabled: true,
    eyebrow: 'ONLINE COURSE',
    title: 'Онлайн сургалтад бүртгүүлэх',
    body: 'Багшийн чиглүүлэгтэй, түвшинд тохирсон онлайн сургалтын бүртгэл.',
    button_text: 'Бүртгүүлэх',
    button_url: '',
  },

  faq: {
    eyebrow: 'ТУСЛАМЖ',
    title: 'Түгээмэл асуулт',
    items: questions,
  },

  finalCta: {
    eyebrow: 'ЭХЛЭХЭД БЭЛЭН ҮҮ?',
    title: 'Өөрт тохирох аргаар өнөөдөр эхэл.',
    body: 'Таны сурах зорилго, түвшин, боломжит цагт тохирсон эхний алхмаа олоорой.',
    button_text: 'Сурах аргаа тодорхойлох →',
    button_url: '/assessment/questions',
  },

  footer: {
    logo: 'learnminea',
    instagram: 'https://www.instagram.com/',
    facebook: 'https://www.facebook.com/',
    email: '',
    MN: footerText,
    EN: {
      topikInfo: { eyebrow: 'TOPIK · KOREAN LANGUAGE TEST', title: 'TOPIK', body: 'Korean language proficiency test information', card1_title: 'What is TOPIK?', card1_body: 'Learn about the exam format, levels, and preparation.', card1_link_text: 'Learn more →', card2_title: 'TOPIK registration', card2_body: 'Check registration dates and requirements.', card2_link_text: 'Learn more →' },
      gksInfo: { eyebrow: 'GLOBAL KOREA SCHOLARSHIP', title: 'Global Korea Scholarship · GKS', body: 'Introduction to the Korean government scholarship', summary: 'GKS details', requirements_title: 'Eligibility', requirements_body: 'Age, nationality, education, and GPA requirements depend on the official annual guidelines.', documents_title: 'Required documents', documents_list: 'Application Form\nPersonal Statement\nStudy Plan\nRecommendation Letter\nEducation and nationality certificates\nTranslations, notarization, or apostille if required', tracks_title: 'Application tracks', tracks_body: 'Embassy Track and University Track.', selection_title: 'Selection and preparation', selection_body: 'Selection considers academic records, application materials, and interviews where required.', official_link_text: 'Official information ↗' },
      description: 'Making language learning practical and personal.',
      learn_heading: 'LEARN',
      site_heading: 'LEARNMINEA',
      topik: 'TOPIK',
      kdrama: 'K-Drama',
      books: 'E-books',
      home: 'Home',
      assessment: 'Learning style',
      faq: 'FAQ',
      contact: 'Contact',
      copyright: '© 2026 LearnMinea. All rights reserved.',
      rights: 'Digital purchases and downloads are verified securely.',
    },
    KR: {
      topikInfo: { eyebrow: 'TOPIK · 한국어능력시험', title: 'TOPIK', body: '한국어능력시험 안내', card1_title: 'TOPIK이란?', card1_body: '시험 구성, 급수 및 준비 정보를 확인하세요.', card1_link_text: '자세히 보기 →', card2_title: 'TOPIK 시험 접수', card2_body: '접수 일정과 필요한 정보를 확인하세요.', card2_link_text: '자세히 보기 →' },
      gksInfo: { eyebrow: 'GLOBAL KOREA SCHOLARSHIP', title: '정부초청외국인장학금 · GKS', body: '한국 정부 장학금 프로그램 안내', summary: 'GKS 상세 정보', requirements_title: '지원 자격', requirements_body: '연령, 국적, 학력, 성적 기준은 해당 연도 공식 모집 요강을 확인하세요.', documents_title: '제출 서류', documents_list: '지원서\n자기소개서\n학업계획서\n추천서\n학력 및 국적 증명 서류\n필요시 번역, 공증 및 아포스티유', tracks_title: '지원 경로', tracks_body: '대사관 전형과 대학 전형이 있습니다.', selection_title: '선발 및 준비', selection_body: '학업 성적, 서류 심사 및 필요한 경우 면접을 바탕으로 선발합니다.', official_link_text: '공식 정보 ↗' },
      description: '언어 학습을 더 가깝고 실용적으로 만듭니다.',
      learn_heading: '학습',
      site_heading: 'LEARNMINEA',
      topik: 'TOPIK',
      kdrama: 'K-Drama',
      books: '전자책',
      home: '홈',
      assessment: '학습 유형',
      faq: '자주 묻는 질문',
      contact: '문의하기',
      copyright: '© 2026 LearnMinea. 모든 권리 보유.',
      rights: '디지털 자료의 구매 및 다운로드는 서버에서 확인됩니다.',
    },
  },

  translations: {
    EN: {
      hero: {
        eyebrow: 'LEARN AT YOUR OWN PACE',
        title: 'Learn smarter,\nnot harder.',
        body: 'Discover Korean lessons, e-books and practical learning resources matched to your goals.',
        search_placeholder: 'Try: ordering at a café',
        search_button: 'Search →',
      },
      study: {
        eyebrow: 'GET STARTED',
        title: 'What will you learn today?',
        body: 'Start with one useful topic and build your progress.',
        cards: [
          { title: 'Vocabulary', body: 'Useful everyday words' },
          { title: 'Grammar', body: 'Understand how Korean works' },
          { title: 'Conversation', body: 'Speak in real situations' },
          { title: 'K-Drama', body: 'Natural phrases from dramas' },
        ],
      },
      conversation: {
        eyebrow: 'TODAY’S CONVERSATION',
        translation: 'One iced Americano, please.',
        tip: '한 잔 counts cups of drinks; 주세요 makes a polite request.',
        side_eyebrow: 'REAL-LIFE KOREAN',
        side_title: 'Learn Korean through everyday life',
        side_body: 'Learn expressions in context, with natural examples.',
        button_text: 'Explore more →',
      },
      books: {
        eyebrow: 'DIGITAL LIBRARY',
        title: 'Find your learning resources',
        body: 'Explore e-books for your level and goals.',
        button_text: 'Browse all books →',
        empty_text: 'No books are published yet.',
      },
      assessment: {
        eyebrow: 'LEARNING STYLE',
        title: 'Find your best way to learn',
        body: 'A 5–7 minute assessment helps you clarify your goals and create a practical study plan.',
        button_text: 'Start assessment →',
        duration_unit: 'minutes',
        benefits: ['Learning style', 'Personal study plan', 'Balanced language skills'],
      },
      why: {
        eyebrow: 'WHY LEARNMINEA?',
        title: 'Less noise. Better direction.',
        reasons: [
          { title: 'Focus on what matters', body: 'Study what supports your goals.' },
          { title: 'Understand, don’t just memorize', body: 'Learn the meaning behind expressions.' },
          { title: 'Make your time count', body: 'Every short lesson has a clear purpose.' },
          { title: 'Materials with guidance', body: 'Know how to use every resource.' },
        ],
      },
      lifestyle: {
        eyebrow: 'REAL LIFE, REAL LANGUAGE',
        title: 'Korean you can use right away',
        body: 'From cafés to work and school, learn expressions you really need.',
        tags: ['Café', 'School', 'Work', 'Transport', 'Everyday life'],
      },
      testimonials: {
        eyebrow: 'STUDENT REVIEWS',
        title: 'How students use LearnMinea',
      },
      registration: {
        eyebrow: 'ONLINE COURSE',
        title: 'Join an online course',
        body: 'Guided learning designed for your level.',
        button_text: 'Register',
      },
      faq: {
        eyebrow: 'HELP',
        title: 'Frequently asked questions',
        items: [
          { question: 'Can beginners start here?', answer: 'Yes. Choose materials that match your current level.' },
          { question: 'How can I preview an e-book?', answer: 'Open the library and check the available PDF preview.' },
          { question: 'Are lessons free?', answer: 'Open resources are free; paid materials show their prices.' },
          { question: 'Do you have TOPIK resources?', answer: 'Yes. Explore the TOPIK and digital library sections.' },
        ],
      },
      finalCta: {
        eyebrow: 'READY TO BEGIN?',
        title: 'Start with the right approach.',
        body: 'Find your next step based on your goals and schedule.',
        button_text: 'Find my learning style →',
      },
    },

    KR: {
      hero: {
        eyebrow: '나만의 속도로 배우는 한국어',
        title: '많이보다\n제대로 배우세요.',
        body: '목표와 수준에 맞는 한국어 수업, 전자책, 실생활 학습 자료를 만나 보세요.',
        search_placeholder: '예: 카페에서 주문하기',
        search_button: '검색 →',
      },
      study: {
        eyebrow: '학습 시작',
        title: '오늘은 무엇을 배울까요?',
        body: '오늘 필요한 작은 주제부터 꾸준히 시작해 보세요.',
        cards: [
          { title: '어휘', body: '일상에서 자주 쓰는 단어' },
          { title: '문법', body: '의미로 이해하는 문법' },
          { title: '실전 회화', body: '바로 사용할 수 있는 표현' },
          { title: 'K-Drama', body: '드라마 속 자연스러운 표현' },
        ],
      },
      conversation: {
        eyebrow: '오늘의 회화',
        translation: '아이스 아메리카노 한 잔을 부탁하는 표현입니다.',
        tip: '한 잔은 음료를 세는 단위이며, 주세요는 공손한 요청 표현입니다.',
        side_eyebrow: '실생활 한국어',
        side_title: '실생활에서 한국어를 배우세요',
        side_body: '상황과 뉘앙스를 함께 이해해 보세요.',
        button_text: '더 알아보기 →',
      },
      books: {
        eyebrow: '전자책 라이브러리',
        title: '나에게 맞는 학습 자료',
        body: '수준과 목표에 맞는 전자책을 찾아보세요.',
        button_text: '전체 전자책 보기 →',
        empty_text: '아직 등록된 전자책이 없습니다.',
      },
      assessment: {
        eyebrow: '학습 유형',
        title: '나에게 맞는 학습법을 찾아보세요',
        body: '5~7분 설문으로 목표와 학습 습관을 확인하고 실용적인 계획을 세워 보세요.',
        button_text: '진단 시작하기 →',
        duration_unit: '분',
        benefits: ['학습 유형', '맞춤형 학습 계획', '네 가지 영역의 균형'],
      },
      why: {
        eyebrow: '왜 LEARNMINEA일까요?',
        title: '더 많은 콘텐츠보다 올바른 방향.',
        reasons: [
          { title: '필요한 것에 집중', body: '목표에 필요한 내용부터 배웁니다.' },
          { title: '암기보다 이해', body: '표현의 의미와 사용법을 이해합니다.' },
          { title: '효율적인 시간 활용', body: '짧은 수업에도 명확한 목표가 있습니다.' },
          { title: '자료와 학습 가이드', body: '자료 활용 방법까지 안내합니다.' },
        ],
      },
      lifestyle: {
        eyebrow: '실생활 한국어',
        title: '바로 사용할 수 있는 표현',
        body: '카페, 학교, 직장, 교통수단 등 일상에 필요한 표현을 배워요.',
        tags: ['카페', '학교', '직장', '교통', '일상'],
      },
      testimonials: {
        eyebrow: '학습자 후기',
        title: 'LearnMinea 학습자 이야기',
      },
      registration: {
        eyebrow: '온라인 수업',
        title: '온라인 수업 신청',
        body: '수준에 맞춘 체계적인 수업을 만나 보세요.',
        button_text: '신청하기',
      },
      faq: {
        eyebrow: '도움말',
        title: '자주 묻는 질문',
        items: [
          { question: '초보자도 시작할 수 있나요?', answer: '네. 현재 수준에 맞는 자료부터 시작할 수 있습니다.' },
          { question: '전자책 미리보기는 어떻게 하나요?', answer: '전자책 페이지에서 PDF 미리보기를 확인하세요.' },
          { question: '무료 자료도 있나요?', answer: '공개 자료는 무료이며 유료 자료는 가격이 표시됩니다.' },
          { question: 'TOPIK 자료도 있나요?', answer: 'TOPIK 및 전자책 메뉴에서 확인할 수 있습니다.' },
        ],
      },
      finalCta: {
        eyebrow: '시작할 준비가 되셨나요?',
        title: '나에게 맞는 방법으로 시작하세요.',
        body: '목표와 시간에 맞는 첫걸음을 찾아보세요.',
        button_text: '학습 유형 알아보기 →',
      },
    },
  },
}

const isObject = value =>
  value !== null &&
  typeof value === 'object' &&
  !Array.isArray(value)

const text = value =>
  typeof value === 'string' ? value.trim() : ''

export function safeImageUrl(value) {
  try {
    const url = new URL(text(value))
    return ['https:', 'http:'].includes(url.protocol) &&
      !url.username &&
      !url.password
      ? url.href
      : ''
  } catch {
    return ''
  }
}

export function safeHomeLink(value) {
  const link = text(value)
  if (
    link.startsWith('/') &&
    !link.startsWith('//') &&
    !link.includes('\\')
  ) return link

  if (link.startsWith('#') && /^#[a-zA-Z0-9_-]+$/.test(link)) {
    return link
  }

  return safeImageUrl(link)
}

function mergeKnown(defaults, input) {
  if (Array.isArray(defaults)) {
    if (!Array.isArray(input)) return structuredClone(defaults)

    return input.slice(0, 30).map((item, index) => {
      const template = defaults[index] ??
        defaults[0] ??
        (isObject(item) ? {} : '')

      return mergeKnown(template, item)
    })
  }

  if (isObject(defaults)) {
    const result = {}

    for (const [key, value] of Object.entries(defaults)) {
      result[key] = mergeKnown(value, isObject(input) ? input[key] : undefined)
    }

    return result
  }

  if (typeof defaults === 'boolean') {
    return typeof input === 'boolean' ? input : defaults
  }

  if (typeof defaults === 'number') {
    const number = Number(input)
    return input !== undefined && input !== null &&
      input !== '' && Number.isFinite(number)
      ? Math.max(0, Math.min(200, number))
      : defaults
  }

  return typeof input === 'string' ? input : defaults
}

export function normalizeHomeContent(input) {
  const source = isObject(input) ? input : {}
  const result = mergeKnown(homeContentDefaults, source)

  result.lifestyle.image_url = safeImageUrl(
    result.lifestyle.image_url
  )

  result.lifestyle.tags = result.lifestyle.tags
    .map(text)
    .filter(Boolean)

  result.registration.button_url = googleFormUrl(
    result.registration.button_url
  )

  for (const section of ['conversation', 'books', 'assessment', 'finalCta']) {
    result[section].button_url =
      safeHomeLink(result[section].button_url) ||
      homeContentDefaults[section].button_url
  }

  result.footer.instagram = safeImageUrl(result.footer.instagram)
  result.footer.facebook = safeImageUrl(result.footer.facebook)

  const email = text(result.footer.email)
  result.footer.email =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : ''

  result.testimonials.reviews = (
    Array.isArray(source.testimonials?.reviews)
      ? source.testimonials.reviews
      : []
  ).slice(0, 30).map((review, index) => ({
    id: text(review?.id) || `review-${index}`,
    name: text(review?.name),
    text: text(review?.text),
    caption: text(review?.caption),
    published: review?.published === true,
  }))

  for (const key of Object.keys(result.assessment.style)) {
    const original = homeContentDefaults.assessment.style[key]
    if (typeof original === 'string') {
      const color = result.assessment.style[key]
      result.assessment.style[key] =
        /^#[0-9a-fA-F]{6}$/.test(color) ? color : original
    }
  }

  for (const language of ['EN', 'KR']) {
    for (const section of ['study', 'conversation', 'books', 'assessment', 'finalCta']) {
      const translated = result.translations[language]?.[section]
      if (translated?.button_url) {
        translated.button_url = safeHomeLink(translated.button_url)
      }
    }
  }

  return result
}

export function parseHomeContent(body) {
  try {
    return normalizeHomeContent(
      typeof body === 'string' ? JSON.parse(body) : body
    )
  } catch {
    return normalizeHomeContent(null)
  }
}

export function localizeHomeContent(content, language = 'MN') {
  const clean = normalizeHomeContent(content)

  if (language === 'MN') return clean

  const translated = clean.translations[
    language === '한국' ? 'KR' : language
  ]

  if (!translated) return clean

  const result = structuredClone(clean)

  for (const [section, values] of Object.entries(translated)) {
    if (!isObject(result[section]) || !isObject(values)) continue

    for (const [key, value] of Object.entries(values)) {
      if (Array.isArray(value) && Array.isArray(result[section][key])) {
        result[section][key] = result[section][key].map((item, index) => {
          const translatedItem = value[index]

          if (isObject(item) && isObject(translatedItem)) {
            return { ...item, ...translatedItem }
          }

          return translatedItem ?? item
        })
      } else if (
        typeof value === 'string' &&
        value !== ''
      ) {
        result[section][key] = value
      }
    }
  }

  return result
}

export function publicHomeContent(content) {
  const clean = normalizeHomeContent(content)

  clean.testimonials.reviews =
    clean.testimonials.enabled
      ? clean.testimonials.reviews.filter(
          review => review.published && review.text
        )
      : []

  return clean
}

export async function getHomeContent(client) {
  const { data, error } = await client
    .from('site_content')
    .select('body,published')
    .eq('content_key', HOME_CONTENT_KEY)
    .eq('published', true)
    .maybeSingle()

  if (error) {
    return {
      content: publicHomeContent(null),
      error,
    }
  }

  return {
    content: publicHomeContent(parseHomeContent(data?.body)),
    error: null,
  }
}
