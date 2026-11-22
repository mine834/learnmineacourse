import { Suspense } from 'react'
import TopikContent from './TopikContent'
import { createPublicCatalogClient } from '../lib/publicCatalog'
import { getPublishedCatalog } from '../lib/catalog.mjs'
import { getHomeContent } from '../lib/homeContent.mjs'

export const revalidate = 60

export default async function Topik() {
  const client = createPublicCatalogClient({ revalidate: 60 })
  const [{ books, errors }, { content: homeContent, error: contentError }] = await Promise.all([
    getPublishedCatalog(client),
    getHomeContent(client),
  ])
  if (contentError) console.error('TOPIK content unavailable', contentError.message)
  if (errors.length) console.error('TOPIK catalog unavailable', errors)
  const topikBooks = books.filter(book => String(book.category || '').trim().toLowerCase() === 'topik')
  return <Suspense fallback={<div style={{ minHeight: '60vh' }} />}>
    <TopikContent books={topikBooks} loadError={errors.length > 0} registration={homeContent.topikInfo} />
  </Suspense>
}
