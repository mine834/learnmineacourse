export const PLAN_CONTENT_KEY = 'assessment_plan'
export function googleFormUrl(value) {
  try {
    const url = new URL(String(value).trim())
    if (url.protocol !== 'https:' || url.username || url.password) return ''
    if (url.hostname === 'forms.gle' && url.pathname.length > 1) return url.href
    if (url.hostname === 'docs.google.com' && /^\/forms\/(?:u\/\d+\/)?d\/(?:e\/)?[^/]+\/viewform\/?$/.test(url.pathname)) return url.href
  } catch {}
  return ''
}
