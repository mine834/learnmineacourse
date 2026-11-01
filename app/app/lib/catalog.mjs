// Both public pages use this catalog; never substitute hard-coded sample products.
export function descriptionText(value = '') {
  return String(value)
    .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, '')
    .replace(/<\/(p|div|h[1-6]|li)>|<br\s*\/?>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .trim()
}

export function normalizeBook(row, source) {
  return {
    id: row.id,
    source,
    title: row.title,
    description: descriptionText(row.description),
    price: row.price,
    old_price: source === 'products' ? row.old_price : null,
    cover_url: source === 'products' ? row.image_url : row.cover_url,
    order_url: source === 'products' && /^https?:\/\//i.test(row.order_url || '')
      ? row.order_url : null,
    preview_path: source === 'book_previews' ? row.preview_path : null,
    created_at: row.created_at,
  }
}

export async function getPublishedCatalog(client) {
  const results = await Promise.all([
    client.from('products').select('id,title,description,price,old_price,image_url,order_url,created_at')
      .eq('published', true).order('created_at', { ascending: false }),
    client.from('book_previews').select('id,title,description,price,cover_url,preview_path,created_at')
      .eq('is_published', true).order('created_at', { ascending: false }),
  ])
  const sources = ['products', 'book_previews']
  const books = results.flatMap((result, index) =>
    result.error ? [] : (result.data || []).map(row => normalizeBook(row, sources[index]))
  ).sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''))
  return { books, errors: results.flatMap((result, index) =>
    result.error ? [{ source: sources[index], message: result.error.message }] : []) }
}

export async function getPublishedBook(client, id) {
  // Invalid IDs should be a 404, not a database UUID error.
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return { book: null, error: null }
  }
  const results = await Promise.all([
    client.from('products').select('id,title,description,price,old_price,image_url,order_url,created_at')
      .eq('id', id).eq('published', true).maybeSingle(),
    client.from('book_previews').select('id,title,description,price,cover_url,preview_path,created_at')
      .eq('id', id).eq('is_published', true).maybeSingle(),
  ])
  for (const [index, result] of results.entries()) {
    if (!result.error && result.data) {
      return { book: normalizeBook(result.data, ['products', 'book_previews'][index]), error: null }
    }
  }
  return { book: null, error: results.find(result => result.error)?.error || null }
}
