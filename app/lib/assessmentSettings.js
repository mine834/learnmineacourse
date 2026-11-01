import { createPublicCatalogClient } from './publicCatalog'
import { googleFormUrl, PLAN_CONTENT_KEY } from './googleForm.mjs'

export async function getPlanFormUrl() {
  const fallback = googleFormUrl(process.env.NEXT_PUBLIC_PLAN_FORM_URL || '')
  try {
    const { data, error } = await createPublicCatalogClient().from('site_content')
      .select('button_url').eq('content_key', PLAN_CONTENT_KEY).eq('published', true).maybeSingle()
    if (error) console.error('Plan form settings unavailable', error.message)
    return googleFormUrl(data?.button_url || '') || fallback
  } catch {
    return fallback
  }
}
