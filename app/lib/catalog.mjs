import sanitizeHtml from 'sanitize-html'

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

// Keep the editor's semantic formatting without executing stored HTML.
export function safeDescriptionHtml(value = '') {
  return sanitizeHtml(String(value), {
    allowedTags: ['p', 'div', 'br', 'strong', 'b', 'em', 'i', 'u', 's',
      'h1', 'h2', 'h3', 'ul', 'ol', 'li', 'blockquote', 'a', 'span'],
    allowedAttributes: { a: ['href', 'target', 'rel'] },
    allowedSchemes: ['http', 'https', 'mailto'],
    allowProtocolRelative: false,
    transformTags: {
      a: (tagName, attribs) => ({ tagName, attribs: {
        href: attribs.href || '', target: '_blank', rel: 'noopener noreferrer',
      } }),
    },
  })
}

export function normalizeBook(row, source) {
  return {
    id: row.id,
    source,
    title: row.title,
    description: descriptionText(row.description),
    description_html: safeDescriptionHtml(row.description),
    price: row.price,
    old_price: source === 'products' ? row.old_price : null,
    cover_url: source === 'products' ? row.image_url : row.cover_url,
    order_url: source === 'products' && /^https?:\/\//i.test(row.order_url || '')
      ? row.order_url : null,
    preview_path: row.preview_path || null,
    preview_bucket: source === 'products' ? 'product-previews' : 'book-previews',
    category: row.category || null,
    level: row.level || null,
    product_type: row.product_type || null,
    created_at: row.created_at,
  }
}

// Single source of truth: products. Keep legacy book_previews table untouched.
const fields = 'id,title,description,price,old_price,image_url,order_url,preview_path,category,level,product_type,created_at'

export async function getPublishedCatalog(client) {
  const { data, error } = await client.from('products').select(fields)
    .eq('published', true).order('created_at', { ascending: false })
  return {
    books: (data || []).map(row => normalizeBook(row, 'products')),
    errors: error ? [{ source: 'products', message: error.message }] : [],
  }
}

export async function getPublishedBook(client, id) {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return { book: null, error: null }
  }
  const { data, error } = await client.from('products').select(fields)
    .eq('id', id).eq('published', true).maybeSingle()
  return { book: data ? normalizeBook(data, 'products') : null, error }
}
