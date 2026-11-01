import OriginalHome from './OriginalHome'
import { getPublishedCatalog } from './lib/catalog.mjs'
import { createPublicCatalogClient } from './lib/publicCatalog'
import { getHomeContent } from './lib/homeContent.mjs'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const client = createPublicCatalogClient()
  const [{ books, errors }, { content: homeContent, error: homeError }] =
    await Promise.all([
      getPublishedCatalog(client),
      getHomeContent(client),
    ])

  if (homeError) {
    console.error('Homepage content query failed:', homeError.message)
  }

  if (errors.length) {
    console.error('Catalog query failed:', errors)
  }

  let editorSettings = {}

  const { data: editorData, error: editorError } = await client
    .from('site_editor_settings')
    .select('content')
    .eq('id', 'homepage')
    .maybeSingle()

  if (editorError) {
    console.error('Homepage editor settings:', editorError.message)
  } else {
    editorSettings = editorData?.content || {}
  }

  return (
    <OriginalHome
      books={books || []}
      homeContent={homeContent}
      editorSettings={editorSettings}
    />
  )
}
