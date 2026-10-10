"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const PURPLE = "#6C5CE7";

const sections = [
  {
    id: "goal",
    label: "01",
    emoji: "🎯",
    title: "Зорилго",
    shortTitle: "Яагаад сурч байна вэ?",
    description:
      "Солонгос хэл чиний амьдралд ямар байр суурьтай байгааг эхлээд харъя.",
    transitionEmoji: "✨",
    transitionTitle: "Чиний сурах зорилго тодорхой боллоо.",
    transitionText:
      "Одоо одоогийн түвшин болон хэл ашиглахдаа өөрийгөө хэрхэн мэдэрдгийг харъя.",
  },
  {
    id: "level",
    label: "02",
    emoji: "🌱",
    title: "Одоогийн түвшин",
    shortTitle: "Одоо хаана явж байна вэ?",
    description:
      "Өөрийгөө шалгалтын оноогоор биш, бодит хэрэглээгээр нь үнэлээрэй.",
    transitionEmoji: "🧭",
    transitionTitle: "Одоогийн байрлал чинь харагдаж эхэллээ.",
    transitionText:
      "Дараагийн хэсэгт чамайг хамгийн их удаашруулдаг зүйл юу болохыг олъё.",
  },
  {
    id: "struggle",
    label: "03",
    emoji: "🧩",
    title: "Гацдаг хэсэг",
    shortTitle: "Юун дээр хамгийн их гацдаг вэ?",
    description:
      "Сурах үед чинь хамгийн их энерги авдаг хэсгийг тодорхойлъё.",
    transitionEmoji: "💡",
    transitionTitle: "Гол саад чинь илүү тодорхой боллоо.",
    transitionText:
      "Одоо шинэ зүйлийг ямар аргаар хамгийн амархан ойлгодгийг чинь харъя.",
  },
  {
    id: "style",
    label: "04",
    emoji: "🧠",
    title: "Сурах арга",
    shortTitle: "Яаж сурахад амар байдаг вэ?",
    description:
      "Чамд тохирохгүй аргаар удаан суухаас илүү тохирох аргаа олох нь чухал.",
    transitionEmoji: "🔍",
    transitionTitle: "Чиний сурах хэв маяг зурагдаж байна.",
    transitionText:
      "Одоо сурсан зүйлээ тогтоох, давтах хэв маягийг чинь харъя.",
  },
  {
    id: "habit",
    label: "05",
    emoji: "🔁",
    title: "Дадал",
    shortTitle: "Яаж давтаж, тогтоодог вэ?",
    description:
      "Тогтвортой ахиц гаргахад чиний бодит дадал ямар нөлөөтэйг харъя.",
    transitionEmoji: "🌿",
    transitionTitle: "Чиний давталтын хэв маяг тодорхой боллоо.",
    transitionText:
      "Сүүлийн хэсэгт сурах орчин, хэмнэл чинь чамд хэр тохирдгийг харъя.",
  },
  {
    id: "environment",
    label: "06",
    emoji: "☁️",
    title: "Орчин & хэмнэл",
    shortTitle: "Ямар орчинд илүү сайн сурдаг вэ?",
    description:
      "Чиний анхаарал, хэмнэл, сурах орчин ямар үед хамгийн сайн ажилладгийг олъё.",
    transitionEmoji: "💜",
    transitionTitle: "Боллоо. Чиний сурах зураглал бэлэн.",
    transitionText:
      "Одоо хариултуудыг чинь нэгтгээд чамд тохирох сурах арга, гол саад, дараагийн алхмыг гаргана.",
  },
];

const questions = [
  {
    id: 1,
    section: "goal",
    emoji: "🎯",
    question: "Одоогоор солонгос хэл чиний амьдралд хэр чухал вэ?",
    sub: "Хамгийн ойр санагдаж байгаа хариултаа сонгоорой.",
    options: [
      {
        emoji: "🚀",
        text: "Маш чухал — тодорхой зорилготой",
        tags: ["goal", "structured"],
      },
      {
        emoji: "📅",
        text: "Чухал, гэхдээ тогтмол хийж чаддаггүй",
        tags: ["goal", "consistency"],
      },
      {
        emoji: "💜",
        text: "Сонирхлоороо сурч байгаа",
        tags: ["interest", "flexible"],
      },
      {
        emoji: "🌱",
        text: "Одоохондоо сайн мэдэхгүй байна",
        tags: ["explore", "flexible"],
      },
    ],
  },
  {
    id: 2,
    section: "goal",
    emoji: "✈️",
    question: "Солонгос хэл сурах хамгийн том шалтгаан чинь юу вэ?",
    sub: "Яг одоо хамгийн хүчтэй байгаа зорилгоо сонго.",
    options: [
      {
        emoji: "🎓",
        text: "Сургууль, TOPIK эсвэл шалгалтын зорилго",
        tags: ["exam", "structured"],
      },
      {
        emoji: "💼",
        text: "Ажил, карьер эсвэл ирээдүйн боломж",
        tags: ["career", "goal"],
      },
      {
        emoji: "🗣️",
        text: "Хүмүүстэй чөлөөтэй харилцах",
        tags: ["speaking", "social"],
      },
      {
        emoji: "🎬",
        text: "Контент, кино, дууг илүү сайн ойлгох",
        tags: ["interest", "listening"],
      },
    ],
  },
  {
    id: 3,
    section: "goal",
    emoji: "✨",
    question: "Хэл чинь мэдэгдэхүйц сайжирвал хамгийн түрүүнд юу өөрчлөгдөх вэ?",
    sub: "Чиний хувьд “ахиц” яг юу гэсэн үг вэ?",
    options: [
      {
        emoji: "📈",
        text: "Шалгалтын оноо, түвшин өсөх",
        tags: ["exam", "result"],
      },
      {
        emoji: "💬",
        text: "Ярихдаа бага бодож, илүү шууд хэлдэг болох",
        tags: ["speaking", "fluency"],
      },
      {
        emoji: "👂",
        text: "Сонссон зүйлээ орчуулалгүй ойлгодог болох",
        tags: ["listening", "fluency"],
      },
      {
        emoji: "📚",
        text: "Өдөр тутам тогтвортой сурдаг болох",
        tags: ["consistency", "habit"],
      },
    ],
  },
  {
    id: 4,
    section: "goal",
    emoji: "⏳",
    question: "Өдөрт бодитоор хэдий хэмжээний цаг гаргаж чадна гэж боддог вэ?",
    sub: "Идеал биш — үнэхээр барьж чадах хэмжээгээ сонго.",
    options: [
      {
        emoji: "⚡",
        text: "10–20 минут",
        tags: ["micro", "consistency"],
      },
      {
        emoji: "🕐",
        text: "30–45 минут",
        tags: ["balanced", "structured"],
      },
      {
        emoji: "🔥",
        text: "1 цаг ба түүнээс дээш",
        tags: ["intensive", "structured"],
      },
      {
        emoji: "🌊",
        text: "Өдрөөсөө шалтгаалаад өөр өөр",
        tags: ["flexible", "consistency"],
      },
    ],
  },

  {
    id: 5,
    section: "level",
    emoji: "🗣️",
    question: "Солонгосоор ярих үедээ өөрийгөө яаж мэдэрдэг вэ?",
    sub: "Төгс байх шаардлагагүй. Бодит мэдрэмжээ сонго.",
    options: [
      {
        emoji: "😎",
        text: "Бага багаар ярьдаг, ер нь айхгүй",
        tags: ["speaking", "confidence"],
      },
      {
        emoji: "🤔",
        text: "Юу хэлэхээ мэддэг ч өгүүлбэр болгоход удаан",
        tags: ["speaking", "grammar"],
      },
      {
        emoji: "😵‍💫",
        text: "Мэддэг үгс маань ярих үед орж ирдэггүй",
        tags: ["speaking", "vocabulary"],
      },
      {
        emoji: "🙈",
        text: "Алдаа гаргахаас айгаад ярихаас зайлсхийдэг",
        tags: ["speaking", "confidence"],
      },
    ],
  },
  {
    id: 6,
    section: "level",
    emoji: "👂",
    question: "Солонгос яриа сонсоход хамгийн ойр нь аль вэ?",
    sub: "Кино, хичээл, өдөр тутмын яриаг бодоод үз.",
    options: [
      {
        emoji: "✨",
        text: "Ерөнхий санааг ихэнхдээ ойлгодог",
        tags: ["listening", "confidence"],
      },
      {
        emoji: "🧩",
        text: "Танил үгсийг барьдаг ч бүтэн санаа алдагддаг",
        tags: ["listening", "vocabulary"],
      },
      {
        emoji: "🐢",
        text: "Удаан яривал ойлгоно, хурдан болохоор гацдаг",
        tags: ["listening", "speed"],
      },
      {
        emoji: "🌫️",
        text: "Сонсох хэсэг одоогоор хамгийн хэцүү",
        tags: ["listening", "struggle"],
      },
    ],
  },
  {
    id: 7,
    section: "level",
    emoji: "📖",
    question: "Уншихдаа ихэвчлэн юу болдог вэ?",
    sub: "Нийтлэл, TOPIK текст эсвэл хичээлийн материалыг бодоорой.",
    options: [
      {
        emoji: "⚡",
        text: "Ерөнхий утгыг хурдан барьдаг",
        tags: ["reading", "confidence"],
      },
      {
        emoji: "🔎",
        text: "Мэдэхгүй үг бүр дээр зогсох гээд байдаг",
        tags: ["reading", "vocabulary"],
      },
      {
        emoji: "🧱",
        text: "Урт өгүүлбэрийн бүтэц дээр гацдаг",
        tags: ["reading", "grammar"],
      },
      {
        emoji: "⏰",
        text: "Ойлгодог ч хэт удаан уншдаг",
        tags: ["reading", "speed"],
      },
    ],
  },
  {
    id: 8,
    section: "level",
    emoji: "✍️",
    question: "Солонгосоор бичих үед хамгийн ойр мэдрэмж аль вэ?",
    sub: "Богино мессежээс эхлээд эссэ хүртэл бодож болно.",
    options: [
      {
        emoji: "📝",
        text: "Санаагаа ерөнхийдөө бичиж чадна",
        tags: ["writing", "confidence"],
      },
      {
        emoji: "🧠",
        text: "Юу бичихээ мэддэг ч дүрэм дээр эргэлздэг",
        tags: ["writing", "grammar"],
      },
      {
        emoji: "📦",
        text: "Үг мэддэг ч өгүүлбэрүүд нэг хэвийн болдог",
        tags: ["writing", "vocabulary"],
      },
      {
        emoji: "🫥",
        text: "Эхлэхээсээ л гацдаг",
        tags: ["writing", "confidence"],
      },
    ],
  },
  {
    id: 9,
    section: "level",
    emoji: "🌡️",
    question: "Одоогийн солонгос хэлний түвшнээ өөрөө хэд гэж мэдэрдэг вэ?",
    sub: "Шалгалтын оноо биш — өөрийн бодит мэдрэмжээр.",
    options: [
      {
        emoji: "🌱",
        text: "Анхан — сууриа бүрдүүлж байгаа",
        tags: ["beginner"],
      },
      {
        emoji: "🌿",
        text: "Анхан дунд — ойлголт байгаа ч тогтворгүй",
        tags: ["lower"],
      },
      {
        emoji: "🌳",
        text: "Дунд — хэрэглэж чаддаг ч гацдаг хэсэгтэй",
        tags: ["intermediate"],
      },
      {
        emoji: "🚀",
        text: "Дундаас дээш — нарийвчлал, хурд дээр ажиллах хэрэгтэй",
        tags: ["advanced"],
      },
    ],
  },

  {
    id: 10,
    section: "struggle",
    emoji: "🚧",
    question: "Солонгос хэл сурахад чамайг хамгийн их удаашруулдаг зүйл юу вэ?",
    sub: "Хамгийн олон удаа давтагддаг саадаа сонго.",
    options: [
      {
        emoji: "🧠",
        text: "Үг цээжилсэн ч удалгүй мартдаг",
        tags: ["vocabulary", "memory"],
      },
      {
        emoji: "🧱",
        text: "Дүрэм мэддэг ч бодит үед ашиглаж чаддаггүй",
        tags: ["grammar", "practice"],
      },
      {
        emoji: "😶",
        text: "Ойлгодог мөртлөө ярьж гаргаж чаддаггүй",
        tags: ["speaking", "practice"],
      },
      {
        emoji: "📆",
        text: "Тогтмол сууж чаддаггүй",
        tags: ["consistency", "habit"],
      },
    ],
  },
  {
    id: 11,
    section: "struggle",
    emoji: "💭",
    question: "Ямар нэг зүйл ойлгохгүй гацах үед хамгийн түрүүнд юу хийдэг вэ?",
    sub: "Өөрийн автомат үйлдлээ бодоод сонго.",
    options: [
      {
        emoji: "👀",
        text: "Өөр жишээ, зураг, хүснэгт хайдаг",
        tags: ["visual", "examples"],
      },
      {
        emoji: "💬",
        text: "Өөр тайлбар хайх эсвэл хүнээс асуудаг",
        tags: ["auditory", "social"],
      },
      {
        emoji: "🛠️",
        text: "Өөрөө жишээ хийж үзээд ойлгохыг хичээдэг",
        tags: ["practice", "kinesthetic"],
      },
      {
        emoji: "🚶",
        text: "Түр орхиод дараа нь буцаж ирдэг",
        tags: ["flexible", "habit"],
      },
    ],
  },
  {
    id: 12,
    section: "struggle",
    emoji: "😮‍💨",
    question: "Хичээл хийх хүсэлгүй болох үед гол шалтгаан нь юу байдаг вэ?",
    sub: "Өөрийгөө шүүхгүйгээр хамгийн үнэн хариултаа сонго.",
    options: [
      {
        emoji: "🌪️",
        text: "Юунаас эхлэхээ мэдэхгүй, хэт олон зүйл санагддаг",
        tags: ["overwhelm", "structured"],
      },
      {
        emoji: "📉",
        text: "Ахиц харагдахгүй болохоор мотиваци буурдаг",
        tags: ["motivation", "result"],
      },
      {
        emoji: "🥱",
        text: "Материал нэг хэвийн, уйтгартай санагддаг",
        tags: ["interest", "variety"],
      },
      {
        emoji: "⌛",
        text: "Цаг гаргах хэцүү байдаг",
        tags: ["consistency", "micro"],
      },
    ],
  },
  {
    id: 13,
    section: "struggle",
    emoji: "🪞",
    question: "Алдаа гаргахад дотроо хамгийн их юу гэж боддог вэ?",
    sub: "Чиний сурах итгэлд нөлөөлдөг бодлыг олъё.",
    options: [
      {
        emoji: "😣",
        text: "Яагаад ийм амархан юмыг чадахгүй байна аа",
        tags: ["confidence", "perfection"],
      },
      {
        emoji: "🔍",
        text: "Яг хаана алдсанаа олъё гэж боддог",
        tags: ["analysis", "growth"],
      },
      {
        emoji: "🙈",
        text: "Алдаагаа бусдад харуулах дургүй",
        tags: ["confidence", "social"],
      },
      {
        emoji: "➡️",
        text: "Нэг их бодолгүй дараагийн зүйл рүү ордог",
        tags: ["speed", "review"],
      },
    ],
  },
  {
    id: 14,
    section: "struggle",
    emoji: "🛟",
    question: "Бүр больмоор санагдах үед чамд юу хамгийн их тус болдог вэ?",
    sub: "Дахин хөдөлгөж чаддаг зүйлээ сонго.",
    options: [
      {
        emoji: "🧠",
        text: "Яагаад эхэлснээ дахин санах",
        tags: ["goal", "motivation"],
      },
      {
        emoji: "🗣️",
        text: "Хэн нэгэнтэй ярьж, чиглэл авах",
        tags: ["social", "motivation"],
      },
      {
        emoji: "✅",
        text: "Маш жижиг, хурдан дуусгах даалгавар хийх",
        tags: ["micro", "habit"],
      },
      {
        emoji: "🌟",
        text: "Өмнөх ахицаа харах",
        tags: ["result", "motivation"],
      },
    ],
  },

  {
    id: 15,
    section: "style",
    emoji: "🤩",
    question: "Хичээл дээр ямар зүйл хийхэд илүү сонирхолтой санагддаг вэ?",
    sub: "Анхаарал чинь хамгийн амархан хаана тогтдог вэ?",
    options: [
      {
        emoji: "📊",
        text: "Гоё бүтэцтэй тэмдэглэл, зураг, схем харах",
        tags: ["visual"],
      },
      {
        emoji: "🎧",
        text: "Сонсож, тайлбар сонсох",
        tags: ["auditory"],
      },
      {
        emoji: "🎮",
        text: "Quiz, дасгал, шууд хийж үзэх",
        tags: ["kinesthetic", "practice"],
      },
      {
        emoji: "💬",
        text: "Хүнтэй ярилцаж, хамт ажиллах",
        tags: ["social"],
      },
    ],
  },
  {
    id: 16,
    section: "style",
    emoji: "💡",
    question: "Шинэ дүрэм үзэхдээ аль арга хамгийн сайн ажилладаг вэ?",
    sub: "Өмнө нь хурдан ойлгож байсан үеэ бодоорой.",
    options: [
      {
        emoji: "🗺️",
        text: "Хүснэгт, бүтэц, олон жишээг зэрэг харах",
        tags: ["visual", "structured"],
      },
      {
        emoji: "🎙️",
        text: "Хэн нэгнээр энгийнээр тайлбарлуулах",
        tags: ["auditory", "social"],
      },
      {
        emoji: "✍️",
        text: "Шууд өөрөө өгүүлбэр зохиож ашиглах",
        tags: ["kinesthetic", "practice"],
      },
      {
        emoji: "🔁",
        text: "Жишээг олон удаа харж байж дүрмийг өөрөө мэдрэх",
        tags: ["examples", "pattern"],
      },
    ],
  },
  {
    id: 17,
    section: "style",
    emoji: "🧩",
    question: "Шинэ үгийг хамгийн сайн яаж тогтоодог вэ?",
    sub: "Чамд хамгийн удаан үлддэг аргаа сонго.",
    options: [
      {
        emoji: "📸",
        text: "Үг хаана, ямар байдлаар харагдсаныг санах",
        tags: ["visual", "memory"],
      },
      {
        emoji: "🎧",
        text: "Дуудлага, сонсогдож байсан хэлбэрийг санах",
        tags: ["auditory", "memory"],
      },
      {
        emoji: "🎬",
        text: "Ямар нөхцөлд хэрэглэснийг нь санах",
        tags: ["context", "practice"],
      },
      {
        emoji: "✍️",
        text: "Өөрөө бичиж, өгүүлбэрт хэрэглэж байж тогтоох",
        tags: ["kinesthetic", "memory"],
      },
    ],
  },
  {
    id: 18,
    section: "style",
    emoji: "📚",
    question: "Ямар төрлийн материалд хамгийн дуртай вэ?",
    sub: "Суух хүсэл хамгийн их төрүүлдэг материалаа сонго.",
    options: [
      {
        emoji: "🎨",
        text: "Видео, зураг, инфографик",
        tags: ["visual", "variety"],
      },
      {
        emoji: "🎵",
        text: "Аудио, подкаст, сонсох материал",
        tags: ["auditory"],
      },
      {
        emoji: "🕹️",
        text: "Интерактив дасгал, quiz, бодит practice",
        tags: ["kinesthetic", "practice"],
      },
      {
        emoji: "📖",
        text: "Ном, тайлбар, бичгээр унших материал",
        tags: ["reading", "structured"],
      },
    ],
  },
  {
    id: 19,
    section: "style",
    emoji: "🧠",
    question: "Нэг шинэ зүйлийг сайн ойлгосноо яаж мэддэг вэ?",
    sub: "Чиний хувьд “ойлгосон” гэдэг ямар үед батлагддаг вэ?",
    options: [
      {
        emoji: "👁️",
        text: "Хараад бүтэц нь шууд ойлгогддог болсон үед",
        tags: ["visual"],
      },
      {
        emoji: "🗣️",
        text: "Өөрийн үгээр тайлбарлаж чаддаг болсон үед",
        tags: ["auditory", "social"],
      },
      {
        emoji: "🛠️",
        text: "Бодит дасгал дээр өөрөө ашиглаж чадсан үед",
        tags: ["kinesthetic", "practice"],
      },
      {
        emoji: "🔄",
        text: "Өөр нөхцөлд ч хэрэглэж чадсан үед",
        tags: ["transfer", "practice"],
      },
    ],
  },

  {
    id: 20,
    section: "habit",
    emoji: "🔁",
    question: "Хичээлээ давтахдаа ихэвчлэн ямар арга хэрэглэдэг вэ?",
    sub: "Хамгийн бодит дадлаа сонго.",
    options: [
      {
        emoji: "📱",
        text: "Контент, видео, нийтлэлээр давтдаг",
        tags: ["interest", "visual"],
      },
      {
        emoji: "🎧",
        text: "Сонсож, чангаар хэлж давтдаг",
        tags: ["auditory", "speaking"],
      },
      {
        emoji: "💻",
        text: "Дасгал, quiz, тэмдэглэл хийдэг",
        tags: ["practice", "structured"],
      },
      {
        emoji: "😅",
        text: "Тогтсон давтах арга одоогоор байхгүй",
        tags: ["consistency", "habit"],
      },
    ],
  },
  {
    id: 21,
    section: "habit",
    emoji: "📆",
    question: "Хичээл хийх хэв маяг чинь аль нь вэ?",
    sub: "Үнэнээрээ л 😌",
    options: [
      {
        emoji: "🗓️",
        text: "Төлөвлөгөө гаргаад ихэнхдээ дагадаг",
        tags: ["structured", "consistency"],
      },
      {
        emoji: "🎢",
        text: "Эхэндээ сайн явдаг ч дундаасаа сулардаг",
        tags: ["motivation", "consistency"],
      },
      {
        emoji: "🔥",
        text: "Deadline ойртохоор маш их хийдэг",
        tags: ["intensive", "consistency"],
      },
      {
        emoji: "🌊",
        text: "Mood болон завнаасаа хамаардаг",
        tags: ["flexible", "consistency"],
      },
    ],
  },
  {
    id: 22,
    section: "habit",
    emoji: "⏱️",
    question: "Нэг удаа хичээллэхэд аль хэлбэр чамд илүү бодитой вэ?",
    sub: "Удаан суух биш, тогтвортой хийж чадах хэмжээгээ сонго.",
    options: [
      {
        emoji: "⚡",
        text: "10–15 минутын жижиг session",
        tags: ["micro", "habit"],
      },
      {
        emoji: "☕",
        text: "30 минут орчим төвлөрөх",
        tags: ["balanced", "habit"],
      },
      {
        emoji: "📚",
        text: "1 цаг орчим нэг сэдэв дээр суух",
        tags: ["deep", "structured"],
      },
      {
        emoji: "🌙",
        text: "Нэг суухаараа удаан, гэхдээ хааяа",
        tags: ["intensive", "consistency"],
      },
    ],
  },
  {
    id: 23,
    section: "habit",
    emoji: "🧪",
    question: "Сурсан зүйлээ бодит хэрэглээнд хэр их туршдаг вэ?",
    sub: "Ярих, бичих, мессежлэх зэрэг бодит хэрэглээг бод.",
    options: [
      {
        emoji: "🚀",
        text: "Бараг өдөр бүр ямар нэг байдлаар хэрэглэдэг",
        tags: ["practice", "confidence"],
      },
      {
        emoji: "🌱",
        text: "Заримдаа зориуд хэрэглэж үздэг",
        tags: ["practice", "balanced"],
      },
      {
        emoji: "📖",
        text: "Ихэвчлэн сураад л өнгөрдөг",
        tags: ["passive", "structured"],
      },
      {
        emoji: "🙈",
        text: "Хэрэглэхээс жаахан айдаг",
        tags: ["confidence", "practice"],
      },
    ],
  },

  {
    id: 24,
    section: "environment",
    emoji: "🎧",
    question: "Ихэвчлэн ямар орчинд солонгос хэлээ давтдаг вэ?",
    sub: "Хамгийн олон давтагддаг орчноо сонго.",
    options: [
      {
        emoji: "☕",
        text: "Ширээний ард, төвлөрсөн орчинд",
        tags: ["structured", "deep"],
      },
      {
        emoji: "🚌",
        text: "Явах замдаа, утсаараа",
        tags: ["micro", "flexible"],
      },
      {
        emoji: "🏫",
        text: "Хичээл, сургалт эсвэл бусадтай хамт",
        tags: ["social", "structured"],
      },
      {
        emoji: "🌊",
        text: "Өдөр бүр өөр өөр",
        tags: ["flexible"],
      },
    ],
  },
  {
    id: 25,
    section: "environment",
    emoji: "🔕",
    question: "Төвлөрөхөд чинь хамгийн их саад болдог зүйл юу вэ?",
    sub: "Хичээл эхэлсний дараах бодит байдлаа бодоорой.",
    options: [
      {
        emoji: "📱",
        text: "Утас, social media",
        tags: ["focus", "environment"],
      },
      {
        emoji: "🧠",
        text: "Өөр хийх ажлууд толгойд орж ирдэг",
        tags: ["overwhelm", "focus"],
      },
      {
        emoji: "🥱",
        text: "Ядаргаа, энерги багатай байх",
        tags: ["energy", "habit"],
      },
      {
        emoji: "🌪️",
        text: "Тогтсон орчин, цаг байдаггүй",
        tags: ["environment", "consistency"],
      },
    ],
  },
  {
    id: 26,
    section: "environment",
    emoji: "🤝",
    question: "Хариуцлагатай байхад аль нь хамгийн их туслах вэ?",
    sub: "Чамайг бодитоор хөдөлгөх зүйлээ сонго.",
    options: [
      {
        emoji: "✅",
        text: "Өдөр бүр хийх жижиг checklist",
        tags: ["structured", "micro"],
      },
      {
        emoji: "👥",
        text: "Хамт сурах хүн эсвэл баг",
        tags: ["social", "motivation"],
      },
      {
        emoji: "📈",
        text: "Ахицын тоо, progress харах",
        tags: ["result", "motivation"],
      },
      {
        emoji: "🔔",
        text: "Тогтсон цаг, reminder",
        tags: ["consistency", "habit"],
      },
    ],
  },
  {
    id: 27,
    section: "environment",
    emoji: "🌤️",
    question: "Хэл сурахад ямар хэмнэл чамд илүү тохирох вэ?",
    sub: "Хэт төгс биш, удаан барьж чадах хэмнэлээ сонго.",
    options: [
      {
        emoji: "🌱",
        text: "Өдөр бүр бага багаар",
        tags: ["micro", "consistency"],
      },
      {
        emoji: "📅",
        text: "7 хоногт 3–4 удаа тодорхой session",
        tags: ["balanced", "structured"],
      },
      {
        emoji: "🔥",
        text: "Цөөн өдөр боловч урт, гүн session",
        tags: ["intensive", "deep"],
      },
      {
        emoji: "🌀",
        text: "Уян хатан, завтай үедээ",
        tags: ["flexible"],
      },
    ],
  },
  {
    id: 28,
    section: "environment",
    emoji: "💜",
    question: "Энэ assessment-аас хамгийн их юу мэдэж авмаар байна?",
    sub: "Эцсийн analysis-аа юунд төвлөрүүлэхийг хүсэж байгаагаа сонго.",
    options: [
      {
        emoji: "🧠",
        text: "Надад яг ямар сурах арга тохирохыг",
        tags: ["style_focus"],
      },
      {
        emoji: "🚧",
        text: "Яагаад байнга гацдагаа",
        tags: ["struggle_focus"],
      },
      {
        emoji: "📆",
        text: "Яаж тогтвортой сурахыг",
        tags: ["habit_focus"],
      },
      {
        emoji: "🗺️",
        text: "Одоо яг юунаас эхлэхээ",
        tags: ["plan_focus"],
      },
    ],
  },
];

function getSectionQuestions(sectionId) {
  return questions.filter((question) => question.section === sectionId);
}

function scoreAnswers(answers) {
  const score = {};

  Object.entries(answers).forEach(([questionId, optionIndex]) => {
    const question = questions.find(
      (item) => item.id === Number(questionId)
    );

    const option = question?.options?.[optionIndex];

    option?.tags?.forEach((tag) => {
      score[tag] = (score[tag] || 0) + 1;
    });
  });

  return score;
}

function getTopTags(score, count = 5) {
  return Object.entries(score)
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([tag]) => tag);
}

export default function AssessmentQuestionsPage() {
  const router = useRouter();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [selectedOption, setSelectedOption] = useState(null);
  const [showTransition, setShowTransition] = useState(false);
  const [finishedSection, setFinishedSection] = useState(null);

  const currentQuestion = questions[currentIndex];

  const currentSectionIndex = sections.findIndex(
    (section) => section.id === currentQuestion?.section
  );

  const currentSection = sections[currentSectionIndex];

  const sectionQuestions = useMemo(
    () => getSectionQuestions(currentQuestion?.section),
    [currentQuestion?.section]
  );

  const questionPositionInSection = sectionQuestions.findIndex(
    (question) => question.id === currentQuestion?.id
  );

  const totalProgress =
    questions.length === 0
      ? 0
      : Math.round(((currentIndex + 1) / questions.length) * 100);

  function saveForResult(nextAnswers) {
    if (typeof window === "undefined") return;

    const score = scoreAnswers(nextAnswers);
    const topTags = getTopTags(score);

    localStorage.setItem(
      "learn-minea-assessment",
      JSON.stringify({
        answers: nextAnswers,
        score,
        topTags,
        completedAt: new Date().toISOString(),
      })
    );
  }

  function handleSelect(optionIndex) {
    if (selectedOption !== null) return;

    setSelectedOption(optionIndex);

    const nextAnswers = {
      ...answers,
      [currentQuestion.id]: optionIndex,
    };

    setAnswers(nextAnswers);

    const isLastQuestion =
      currentIndex === questions.length - 1;

    const nextQuestion = questions[currentIndex + 1];

    const isEndOfSection =
      isLastQuestion ||
      nextQuestion?.section !== currentQuestion.section;

    window.setTimeout(() => {
      setSelectedOption(null);

      if (isEndOfSection) {
        setFinishedSection(currentSection);
        setShowTransition(true);
        return;
      }

      setCurrentIndex((previous) => previous + 1);
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }, 260);
  }

  function continueAfterTransition() {
    const isLastQuestion =
      currentIndex === questions.length - 1;

    if (isLastQuestion) {
      saveForResult(answers);
      router.push("/assessment/result");
      return;
    }

    setShowTransition(false);
    setFinishedSection(null);
    setCurrentIndex((previous) => previous + 1);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function goBack() {
    if (currentIndex === 0) {
      router.push("/assessment");
      return;
    }

    const previousIndex = currentIndex - 1;
    const previousQuestion = questions[previousIndex];

    setAnswers((previous) => {
      const copy = { ...previous };
      delete copy[previousQuestion.id];
      return copy;
    });

    setSelectedOption(null);
    setCurrentIndex(previousIndex);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  if (!currentQuestion) return null;

  if (showTransition && finishedSection) {
    const isFinal =
      currentIndex === questions.length - 1;

    const nextSection = !isFinal
      ? sections[currentSectionIndex + 1]
      : null;

    return (
      <main style={styles.page}>
        <div style={styles.transitionWrap}>
          <div style={styles.brandRow}>
            <span style={styles.brandDot} />
            <span style={styles.brand}>
              LEARN·MINEA
            </span>
          </div>

          <div style={styles.sectionMiniProgress}>
            {sections.map((section, index) => {
              const completed =
                index <= currentSectionIndex;

              return (
                <div
                  key={section.id}
                  style={{
                    ...styles.sectionMiniBar,
                    background: completed
                      ? PURPLE
                      : "#E9E7F2",
                  }}
                />
              );
            })}
          </div>

          <div style={styles.transitionCard}>
            <div style={styles.transitionTop}>
              <div style={styles.transitionIcon}>
                {finishedSection.transitionEmoji}
              </div>

              <div style={styles.transitionEyebrow}>
                {finishedSection.label} ·{" "}
                {finishedSection.title.toUpperCase()}
              </div>

              <h1 style={styles.transitionTitle}>
                {finishedSection.transitionTitle}
              </h1>

              <p style={styles.transitionText}>
                {finishedSection.transitionText}
              </p>
            </div>

            {!isFinal ? (
              <div style={styles.nextBlock}>
                <div style={styles.nextIcon}>
                  {nextSection?.emoji}
                </div>

                <div>
                  <div style={styles.nextLabel}>
                    Дараагийн хэсэг
                  </div>

                  <div style={styles.nextTitle}>
                    {nextSection?.title}
                  </div>

                  <div style={styles.nextDescription}>
                    {nextSection?.shortTitle}
                  </div>
                </div>
              </div>
            ) : (
              <div style={styles.finalBlock}>
                <div style={styles.finalEmoji}>
                  ✨
                </div>

                <div>
                  <div style={styles.nextLabel}>
                    28 / 28 АСУУЛТ
                  </div>

                  <div style={styles.nextTitle}>
                    Чиний analysis бэлэн
                  </div>

                  <div style={styles.nextDescription}>
                    Хариултуудаас чинь сурах хэв
                    маяг, гол саад, тохирох хэмнэлийг
                    нэгтгэнэ.
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={continueAfterTransition}
              style={styles.continueButton}
            >
              <span>
                {isFinal
                  ? "Үр дүнгээ харах"
                  : "Дараагийн хэсэг"}
              </span>

              <span style={{ fontSize: 22 }}>→</span>
            </button>
          </div>

          <div style={styles.transitionQuote}>
            <span style={{ color: PURPLE }}>✦</span>
            Чамд тохирох арга гэдэг хамгийн хэцүү
            аргыг сонгох биш, удаан хугацаанд
            үргэлжлүүлж чадах аргаа олох юм.
          </div>
        </div>
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <div style={styles.quizWrap}>
        <header style={styles.header}>
          <div style={styles.headerTop}>
            <div style={styles.brandRow}>
              <span style={styles.brandDot} />
              <span style={styles.brand}>
                LEARN·MINEA
              </span>
            </div>

            <div style={styles.counter}>
              {String(currentIndex + 1).padStart(
                2,
                "0"
              )}{" "}
              / {questions.length}
            </div>
          </div>

          <div style={styles.progressTrack}>
            <div
              style={{
                ...styles.progressFill,
                width: `${totalProgress}%`,
              }}
            />
          </div>

          <div style={styles.sectionHeader}>
            <div style={styles.sectionIcon}>
              {currentSection.emoji}
            </div>

            <div style={{ flex: 1 }}>
              <div style={styles.sectionLabel}>
                ХЭСЭГ {currentSection.label} ·{" "}
                {currentSection.title}
              </div>

              <div style={styles.sectionProgressText}>
                {questionPositionInSection + 1} /{" "}
                {sectionQuestions.length}
              </div>
            </div>
          </div>
        </header>

        <section style={styles.questionCard}>
          <div style={styles.questionEmoji}>
            {currentQuestion.emoji}
          </div>

          <h1 style={styles.questionTitle}>
            {currentQuestion.question}
          </h1>

          <p style={styles.questionSub}>
            {currentQuestion.sub}
          </p>

          <div style={styles.options}>
            {currentQuestion.options.map(
              (option, optionIndex) => {
                const selected =
                  selectedOption === optionIndex;

                return (
                  <button
                    key={optionIndex}
                    type="button"
                    onClick={() =>
                      handleSelect(optionIndex)
                    }
                    style={{
                      ...styles.option,
                      ...(selected
                        ? styles.optionSelected
                        : {}),
                    }}
                  >
                    <div
                      style={{
                        ...styles.radio,
                        ...(selected
                          ? styles.radioSelected
                          : {}),
                      }}
                    >
                      {selected ? "✓" : ""}
                    </div>

                    <div style={styles.optionEmoji}>
                      {option.emoji}
                    </div>

                    <div style={styles.optionText}>
                      {option.text}
                    </div>
                  </button>
                );
              }
            )}
          </div>
        </section>

        <footer style={styles.footer}>
          <button
            onClick={goBack}
            style={styles.backButton}
          >
            ← Буцах
          </button>

          <div style={styles.footerHint}>
            Нэг хариулт сонгоход автоматаар
            үргэлжилнэ
          </div>
        </footer>
      </div>

      <style jsx global>{`
        * {
          box-sizing: border-box;
        }

        html {
          background: #fbfaff;
        }

        body {
          margin: 0;
          background: #fbfaff;
          color: #15141a;
        }

        button {
          font-family: inherit;
        }

        @media (max-width: 700px) {
          .assessment-hide-mobile {
            display: none;
          }
        }
      `}</style>
    </main>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at 15% 0%, rgba(108,92,231,0.08), transparent 30%), #FBFAFF",
    color: "#15141A",
  },

  quizWrap: {
    width: "min(920px, calc(100% - 32px))",
    margin: "0 auto",
    padding: "34px 0 54px",
  },

  header: {
    marginBottom: 28,
  },

  headerTop: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 20,
    marginBottom: 20,
  },

  brandRow: {
    display: "flex",
    alignItems: "center",
    gap: 9,
  },

  brandDot: {
    width: 11,
    height: 11,
    borderRadius: 999,
    background: PURPLE,
    boxShadow:
      "0 0 0 6px rgba(108,92,231,.10)",
  },

  brand: {
    fontSize: 14,
    fontWeight: 900,
    letterSpacing: "0.13em",
  },

  counter: {
    fontSize: 14,
    fontWeight: 800,
    color: "#8B8797",
    letterSpacing: "0.08em",
  },

  progressTrack: {
    width: "100%",
    height: 8,
    borderRadius: 999,
    background: "#E9E7F0",
    overflow: "hidden",
    marginBottom: 24,
  },

  progressFill: {
    height: "100%",
    borderRadius: 999,
    background: PURPLE,
    transition: "width .35s ease",
  },

  sectionHeader: {
    display: "flex",
    alignItems: "center",
    gap: 14,
  },

  sectionIcon: {
    width: 52,
    height: 52,
    borderRadius: 18,
    display: "grid",
    placeItems: "center",
    background: "#EFEDFF",
    fontSize: 24,
  },

  sectionLabel: {
    color: PURPLE,
    fontSize: 12,
    fontWeight: 900,
    letterSpacing: "0.1em",
    marginBottom: 4,
  },

  sectionProgressText: {
    color: "#9893A5",
    fontSize: 13,
    fontWeight: 700,
  },

  questionCard: {
    background: "#FFFFFF",
    border: "1px solid #ECEAF2",
    borderRadius: 32,
    padding: "clamp(26px, 5vw, 54px)",
    boxShadow:
      "0 24px 70px rgba(29, 22, 58, 0.07)",
  },

  questionEmoji: {
    width: 58,
    height: 58,
    display: "grid",
    placeItems: "center",
    borderRadius: 20,
    background: "#F1EFFF",
    fontSize: 28,
    marginBottom: 26,
  },

  questionTitle: {
    margin: 0,
    maxWidth: 760,
    fontSize: "clamp(29px, 5vw, 46px)",
    lineHeight: 1.16,
    letterSpacing: "-0.04em",
    fontWeight: 900,
  },

  questionSub: {
    margin: "16px 0 34px",
    color: "#716D7D",
    fontSize: "clamp(16px, 2vw, 19px)",
    lineHeight: 1.65,
  },

  options: {
    display: "grid",
    gap: 13,
  },

  option: {
    width: "100%",
    minHeight: 84,
    display: "flex",
    alignItems: "center",
    gap: 16,
    textAlign: "left",
    padding: "17px 20px",
    borderRadius: 22,
    border: "1.5px solid #E7E4ED",
    background: "#FFFFFF",
    cursor: "pointer",
    transition:
      "border-color .18s ease, background .18s ease, transform .18s ease",
    color: "#373340",
  },

  optionSelected: {
  border: `2px solid ${PURPLE}`,
  background: "#F0EEFF",
  transform: "translateY(-1px)",
},

  radio: {
    width: 34,
    height: 34,
    flex: "0 0 34px",
    borderRadius: 999,
    border: "2px solid #D2CEDA",
    display: "grid",
    placeItems: "center",
    fontWeight: 900,
    color: "#FFFFFF",
    fontSize: 17,
  },

 radioSelected: {
  background: PURPLE,
  border: `2px solid ${PURPLE}`,
},

  optionEmoji: {
    fontSize: 25,
    width: 34,
    textAlign: "center",
    flex: "0 0 34px",
  },

  optionText: {
    fontSize: "clamp(16px, 2vw, 19px)",
    lineHeight: 1.45,
    fontWeight: 700,
  },

  footer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 20,
    padding: "22px 6px 0",
  },

  backButton: {
    border: 0,
    background: "transparent",
    color: "#625E6D",
    fontSize: 15,
    fontWeight: 800,
    cursor: "pointer",
    padding: "10px 0",
  },

  footerHint: {
    fontSize: 13,
    color: "#A19CAA",
    textAlign: "right",
  },

  transitionWrap: {
    width: "min(820px, calc(100% - 32px))",
    minHeight: "100vh",
    margin: "0 auto",
    padding: "42px 0 60px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },

  sectionMiniProgress: {
    display: "grid",
    gridTemplateColumns: "repeat(6, 1fr)",
    gap: 8,
    margin: "24px 0",
  },

  sectionMiniBar: {
    height: 7,
    borderRadius: 999,
  },

  transitionCard: {
    background: "#FFFFFF",
    border: "1px solid #ECEAF2",
    borderRadius: 34,
    padding: "clamp(28px, 6vw, 58px)",
    boxShadow:
      "0 28px 80px rgba(34, 24, 78, .08)",
  },

  transitionTop: {
    marginBottom: 36,
  },

  transitionIcon: {
    width: 78,
    height: 78,
    borderRadius: 26,
    display: "grid",
    placeItems: "center",
    fontSize: 38,
    background: "#EFEDFF",
    marginBottom: 26,
  },

  transitionEyebrow: {
    color: PURPLE,
    fontSize: 12,
    fontWeight: 900,
    letterSpacing: "0.12em",
    marginBottom: 13,
  },

  transitionTitle: {
    margin: 0,
    maxWidth: 650,
    fontSize: "clamp(34px, 6vw, 55px)",
    lineHeight: 1.08,
    letterSpacing: "-0.045em",
    fontWeight: 900,
  },

  transitionText: {
    maxWidth: 650,
    margin: "20px 0 0",
    color: "#6D6879",
    fontSize: "clamp(17px, 2.5vw, 20px)",
    lineHeight: 1.7,
  },

  nextBlock: {
    display: "flex",
    alignItems: "center",
    gap: 18,
    background: "#F8F7FF",
    border: "1px solid #E9E6FF",
    borderRadius: 24,
    padding: 22,
    marginBottom: 20,
  },

  finalBlock: {
    display: "flex",
    alignItems: "center",
    gap: 18,
    background:
      "linear-gradient(135deg, #F4F1FF 0%, #FBFAFF 100%)",
    border: "1px solid #E5E0FF",
    borderRadius: 24,
    padding: 22,
    marginBottom: 20,
  },

  nextIcon: {
    width: 54,
    height: 54,
    borderRadius: 18,
    background: "#FFFFFF",
    display: "grid",
    placeItems: "center",
    fontSize: 27,
    flex: "0 0 54px",
  },

  finalEmoji: {
    width: 54,
    height: 54,
    borderRadius: 18,
    background: "#FFFFFF",
    display: "grid",
    placeItems: "center",
    fontSize: 27,
    flex: "0 0 54px",
  },

  nextLabel: {
    color: "#8B8597",
    fontSize: 12,
    fontWeight: 800,
    marginBottom: 4,
  },

  nextTitle: {
    fontSize: 19,
    fontWeight: 900,
    marginBottom: 3,
  },

  nextDescription: {
    color: "#797383",
    fontSize: 14,
    lineHeight: 1.5,
  },

  continueButton: {
    width: "100%",
    minHeight: 68,
    border: 0,
    borderRadius: 22,
    background: "#17151D",
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: 900,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
  },

  transitionQuote: {
    margin: "22px auto 0",
    maxWidth: 620,
    color: "#898492",
    textAlign: "center",
    fontSize: 13,
    lineHeight: 1.7,
  },
};