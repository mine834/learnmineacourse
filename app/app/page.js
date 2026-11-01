import HomeClient from './HomeClient'
import { getPublishedCatalog } from './lib/catalog.mjs'
import { createPublicCatalogClient } from './lib/publicCatalog'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const { books, errors } = await getPublishedCatalog(createPublicCatalogClient())
  if (errors.length) console.error('Public catalog query failed', errors)
  return <HomeClient books={books} catalogError={errors.length > 0} />
}
