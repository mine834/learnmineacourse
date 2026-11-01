import { Suspense } from 'react'
import TopikContent from './TopikContent'
import { createPublicCatalogClient } from '../lib/publicCatalog'
import { getPublishedCatalog } from '../lib/catalog.mjs'

export const dynamic = 'force-dynamic'

export default async function Topik() {
  const { books, errors } = await getPublishedCatalog(createPublicCatalogClient())
  if (errors.length) console.error('TOPIK catalog unavailable', errors)
  const topikBooks = books.filter(book => String(book.category || '').trim().toLowerCase() === 'topik')
  return <Suspense fallback={<div style={{ minHeight: '60vh' }} />}>
    <TopikContent books={topikBooks} loadError={errors.length > 0} />
  </Suspense>
}
