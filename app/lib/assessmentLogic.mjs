import { questions } from './assessmentData.mjs'

export function scoreAnswers(answers) {
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

export function getTopTags(score, count = 5) {
  return Object.entries(score)
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([tag]) => tag);
}


export const ASSESSMENT_KEY = 'learn-minea-assessment'

export function validAnswers(answers) {
  return Object.fromEntries(questions.flatMap(question => {
    const value = answers?.[question.id]
    return Number.isInteger(value) && value >= 0 && value < question.options.length
      ? [[question.id, value]] : []
  }))
}

export function assessmentPayload(answers) {
  const clean = validAnswers(answers)
  if (Object.keys(clean).length !== questions.length) throw new Error('Бүх асуултад хариулсны дараа үр дүнгээ харна уу.')
  const score = scoreAnswers(clean)
  return { answers: clean, score, topTags: getTopTags(score), completedAt: new Date().toISOString() }
}

export function saveAssessment(payload, local, session) {
  const value = JSON.stringify(payload)
  try { local.setItem(ASSESSMENT_KEY, value); return } catch {}
  try { session.setItem(ASSESSMENT_KEY, value); return } catch {}
  throw new Error('Үр дүнг хадгалж чадсангүй. Browser-ийн хадгалах эрхийг шалгаад дахин оролдоно уу.')
}

export function readAssessment(local, session) {
  const results = []
  for (const storage of [local, session]) {
    try {
      const raw = JSON.parse(storage.getItem(ASSESSMENT_KEY))
      if (!raw) continue
      const result = assessmentPayload(raw.answers)
      result.completedAt = Number.isFinite(Date.parse(raw.completedAt)) ? raw.completedAt : null
      results.push(result)
    } catch {}
  }
  return results.sort((a, b) => (Date.parse(b.completedAt) || 0) - (Date.parse(a.completedAt) || 0))[0] || null
}
