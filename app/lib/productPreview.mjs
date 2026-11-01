export const PREVIEW_BUCKET = 'product-previews'
export const MAX_PREVIEW_BYTES = 20 * 1024 * 1024

export async function validatePreview(file) {
  if (!file) return
  if (!/\.pdf$/i.test(file.name) || (file.type && file.type !== 'application/pdf')) {
    throw new Error('Preview-д зөвхөн PDF файл сонгоно уу.')
  }
  if (!file.size || file.size > MAX_PREVIEW_BYTES) {
    throw new Error('Preview PDF нь 20 MB-аас бага, хоосон биш байх ёстой.')
  }
  const header = new TextDecoder().decode(await file.slice(0, 5).arrayBuffer())
  if (header !== '%PDF-') throw new Error('Сонгосон файл хүчинтэй PDF файл биш байна.')
}

export async function uploadProductPreview(client, file) {
  await validatePreview(file)
  const path = `${crypto.randomUUID()}.pdf`
  const { error } = await client.storage.from(PREVIEW_BUCKET)
    .upload(path, file, { contentType: 'application/pdf', upsert: false })
  if (error) throw error
  return path
}
