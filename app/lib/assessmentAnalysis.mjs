import { scoreAnswers } from './assessmentLogic.mjs'

const methods = {
  visual: {
    emoji: "🎨",
    name: "Харааны болон бүтэцтэй материал",
    description:
      "Зураг, хүснэгт, схем, өнгөөр ялгасан тэмдэглэл чамд илүү тохиромжтой санагддаг.",
    advice:
      "Дүрмээ нэг хүснэгтэд нэгтгээд, жишээ өгүүлбэрийг өнгөөр ялгаж тэмдэглээрэй.",
  },
  auditory: {
    emoji: "🎧",
    name: "Сонсож, тайлбарлуулж сурах",
    description:
      "Сонсох, чангаар давтах, хэн нэгний тайлбарыг сонсох аргыг илүүд үздэг.",
    advice:
      "Богино аудиог сонсоод, дагаж хэлээд, дараа нь өөрийн үгээр тайлбарлаарай.",
  },
  practice: {
    emoji: "🛠️",
    name: "Шууд хэрэглэж сурах",
    description:
      "Шинэ зүйлээ зөвхөн уншихаас илүү дасгал хийж, хэрэглэж үзэхийг илүүд үздэг.",
    advice:
      "Шинэ дүрэм бүрээр 3 өгүүлбэр зохиож, нэгийг нь бодит ярианд хэрэглээрэй.",
  },
  social: {
    emoji: "💬",
    name: "Харилцан ярилцаж сурах",
    description:
      "Хүнтэй ярилцах, асуулт асуух, санаагаа тайлбарлах үед сурах сонирхол чинь нэмэгддэг.",
    advice:
      "Өдөр бүр нэг жижиг асуултад солонгосоор хариулж, боломжтой үедээ хамтрагчтай давтаарай.",
  },
  reading: {
    emoji: "📖",
    name: "Уншиж, задлан ойлгох",
    description:
      "Бичгээр өгсөн тайлбар, жишээ, бүтцийг нягталж сурах аргыг илүүд үздэг.",
    advice:
      "Богино эх уншаад шинэ хэллэгээ тэмдэглэж, өөр өгүүлбэрт ашиглаарай.",
  },
};

const obstacles = {
  vocabulary: {
    emoji: "🧠",
    title: "Үг тогтоох ба эргэн санах",
    detail:
      "Шинэ үгийг таних болон хэрэгтэй үедээ санаж ашиглах хоёр өөр чадвар. Давталтаа хэрэглээтэй хослуулаарай.",
    action:
      "Өдөрт 5–8 үг сонгоод тус бүрээр нь өгүүлбэр зохио. Маргааш нь харахгүйгээр эргэн сана.",
  },
  grammar: {
    emoji: "🧩",
    title: "Дүрмийг бодит хэрэглээнд оруулах",
    detail:
      "Дүрмийн тайлбарыг ойлгох нь эхлэл. Өөрөө өгүүлбэр бүтээх үед мэдлэг илүү хэрэглээтэй болно.",
    action:
      "Нэг дүрэм сонгоод 3 өөр нөхцөлд ашигласан өгүүлбэр бичиж, нэгийг нь чангаар хэл.",
  },
  speaking: {
    emoji: "🗣️",
    title: "Мэддэг зүйлээ ярьж гаргах",
    detail:
      "Мэддэг үг, дүрмээ ярианд ашиглахын тулд бага хэмжээний тогтмол speaking practice хэрэгтэй.",
    action:
      "Өдөр бүр нэг асуултад 30–60 секунд солонгосоор хариулж, дуугаа бичиж сонс.",
  },
  consistency: {
    emoji: "📆",
    title: "Тогтмол сурах хэмнэл",
    detail:
      "Хэт том төлөвлөгөө барихаас илүү бага боловч тогтвортой хийдэг дадал чамд тустай байж болно.",
    action:
      "Эхний 7 хоногт өдөр бүр хийх хамгийн жижиг 10 минутын даалгавраа тогтоо.",
  },
  overwhelm: {
    emoji: "🌪️",
    title: "Олон зүйлээс юуг эхлэхээ сонгох",
    detail:
      "Олон материал, олон зорилго зэрэгцэхэд анхаарал сарних магадлалтай.",
    action:
      "Нэг долоо хоногт нэг үндсэн skill, нэг ном эсвэл нэг төрлийн материалыг гол болго.",
  },
  confidence: {
    emoji: "💜",
    title: "Алдаа гаргахаас эмээх",
    detail:
      "Алдаа гаргах нь сурах үйл явцын нэг хэсэг. Эхлээд аюулгүй, бага дарамттай орчинд дадлага хий.",
    action:
      "Өөртөө зориулж 3 өгүүлбэр чангаар хэл. Дараа нь зөвхөн нэг алдаагаа зас.",
  },
  motivation: {
    emoji: "✨",
    title: "Ахиц болон урам зоригоо хадгалах",
    detail:
      "Ахиц шууд мэдэгдэхгүй үед сурах хүсэл буурах боломжтой. Хийсэн зүйлээ хэмжиж харах нь тустай.",
    action:
      "Өдөр бүр сурсан нэг хэллэг, хийсэн нэг дасгалаа тэмдэглэж 7 хоногийн дараа эргэн хар.",
  },
  focus: {
    emoji: "🎯",
    title: "Анхаарлаа төвлөрүүлэх",
    detail:
      "Сурах орчин болон анхаарал сарниулах зүйлсийг багасгах нь хичээлийн чанарт нөлөөлж болно.",
    action:
      "15 минутын session эхлүүлэхдээ утасны notification-оо хааж, нэг л даалгавар хий.",
  },
};

const skills = {
  speaking: {
    title: "Ярих",
    emoji: "🗣️",
    task: "Нэг сэдвээр 5 өгүүлбэр хэлж, 1 минутын voice recording хийх",
  },
  listening: {
    title: "Сонсох",
    emoji: "🎧",
    task: "1–2 минутын аудиог 2 удаа сонсоод гол санааг хэлэх",
  },
  reading: {
    title: "Унших",
    emoji: "📖",
    task: "Богино эх уншаад 3 гол санаа болон 5 хэрэгтэй хэллэг тэмдэглэх",
  },
  writing: {
    title: "Бичих",
    emoji: "✍️",
    task: "Нэг сэдвээр 5 өгүүлбэр бичээд дүрэм, үгийн сонголтоо шалгах",
  },
};

function option(answers, id) {
  const value = answers?.[id];
  return Number.isInteger(value) && value >= 0 && value <= 3
    ? value
    : null;
}

export function analyze(data) {
  const answers = data.answers || {};
  const score = scoreAnswers(answers);

  const styleScores = {
    visual: (score.visual || 0) + (option(answers, 15) === 0 ? 2 : 0),
    auditory:
      (score.auditory || 0) + (option(answers, 15) === 1 ? 2 : 0),
    practice:
      (score.practice || 0) +
      (score.kinesthetic || 0) +
      (option(answers, 15) === 2 ? 2 : 0),
    social:
      (score.social || 0) + (option(answers, 15) === 3 ? 2 : 0),
    reading: score.reading || 0,
  };

  const topMethods = Object.entries(styleScores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([key]) => methods[key]);

  const directObstacle = ["vocabulary", "grammar", "speaking", "consistency"][
    option(answers, 10) ?? 3
  ];

  const secondaryObstacle = [
    "overwhelm",
    "motivation",
    "motivation",
    "consistency",
  ][option(answers, 12) ?? 0];

  const obstacle = obstacles[directObstacle];
  const secondary = obstacles[secondaryObstacle];

  const skillScore = {
    speaking: 0,
    listening: 0,
    reading: 0,
    writing: 0,
  };

  // 5–8-р асуултын бодит хэрэглээний хүндрэлээс skill-ийг тодорхойлно.
  for (let id = 5; id <= 8; id++) {
    const answer = option(answers, id);
    const skill = ["speaking", "listening", "reading", "writing"][id - 5];

    if (answer !== null) {
      skillScore[skill] += answer === 0 ? 0 : answer === 3 ? 3 : 2;
    }
  }

  // 2–3-р асуултын зорилгыг давхар харгалзана.
  if (option(answers, 2) === 2) skillScore.speaking += 2;
  if (option(answers, 2) === 3) skillScore.listening += 2;
  if (option(answers, 3) === 1) skillScore.speaking += 2;
  if (option(answers, 3) === 2) skillScore.listening += 2;

  const priorityKey = Object.entries(skillScore).sort(
    (a, b) => b[1] - a[1]
  )[0][0];

  const minutes = [15, 35, 60, 20][option(answers, 4) ?? 1];

  const rhythm = [
    "Өдөр бүр бага багаар",
    "7 хоногт 3–4 удаа",
    "Цөөн өдөр гүнзгий",
    "Уян хатан хуваарь",
  ][option(answers, 27) ?? 0];

  const goal = [
    "Шалгалт болон суралцах зорилго",
    "Ажил, карьерын боломж",
    "Чөлөөтэй харилцах",
    "Контент ойлгож, сонирхлоороо сурах",
  ][option(answers, 2) ?? 0];

  const focus = [
    "Сурах аргаа сайжруулах",
    "Гацдаг шалтгаанаа ойлгох",
    "Тогтвортой дадал бий болгох",
    "Хаанаас эхлэхээ тодорхойлох",
  ][option(answers, 28) ?? 0];

  return {
    topMethods,
    obstacle,
    secondary,
    priority: skills[priorityKey],
    minutes,
    rhythm,
    goal,
    focus,
    count: Object.keys(answers).filter(
      (id) => option(answers, id) !== null
    ).length,
  };
}

