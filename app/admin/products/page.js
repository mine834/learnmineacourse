'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

export default function ProductsAdmin() {
  const router = useRouter()

  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState(null)

  const [form, setForm] = useState({
    title: '',
    slug: '',
    description: '',
    price: '',
    old_price: '',
    order_url: '',
    image_url: '',
    published: true,
  })

  const [imageFile, setImageFile] = useState(null)

  useEffect(() => {
    initialize()
  }, [])

  async function initialize() {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login')
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      router.push('/dashboard')
      return
    }

    await loadProducts()
    setLoading(false)
  }

  async function loadProducts() {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      alert(error.message)
      return
    }

    setProducts(data || [])
  }

  function changeForm(e) {
    const { name, value, type, checked } = e.target

    setForm((previous) => ({
      ...previous,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  function createSlug(title) {
    return title
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\p{L}\p{N}-]/gu, '')
  }

  async function uploadImage() {
    if (!imageFile) return form.image_url

    const extension = imageFile.name.split('.').pop()

    const fileName =
      `${Date.now()}-${Math.random()
        .toString(36)
        .substring(2)}.${extension}`

    const { error } = await supabase.storage
      .from('product-images')
      .upload(fileName, imageFile)

    if (error) {
      throw error
    }

    const { data } = supabase.storage
      .from('product-images')
      .getPublicUrl(fileName)

    return data.publicUrl
  }

  async function saveProduct(e) {
    e.preventDefault()

    if (!form.title.trim()) {
      alert('Бүтээгдэхүүний нэр оруулна уу.')
      return
    }

    setSaving(true)

    try {
      const imageUrl = await uploadImage()

      const productData = {
        title: form.title,
        slug: form.slug || createSlug(form.title),
        description: form.description,
        price: form.price ? Number(form.price) : 0,
        old_price: form.old_price
          ? Number(form.old_price)
          : null,
        order_url: form.order_url,
        image_url: imageUrl,
        published: form.published,
      }

      let error

      if (editingId) {
        const result = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingId)

        error = result.error
      } else {
        const result = await supabase
          .from('products')
          .insert(productData)

        error = result.error
      }

      if (error) throw error

      resetForm()
      await loadProducts()

      alert(
        editingId
          ? 'Бүтээгдэхүүн шинэчлэгдлээ.'
          : 'Бүтээгдэхүүн нэмэгдлээ.'
      )
    } catch (error) {
      alert(error.message)
    }

    setSaving(false)
  }

  function editProduct(product) {
    setEditingId(product.id)

    setForm({
      title: product.title || '',
      slug: product.slug || '',
      description: product.description || '',
      price: product.price || '',
      old_price: product.old_price || '',
      order_url: product.order_url || '',
      image_url: product.image_url || '',
      published: product.published ?? true,
    })

    setImageFile(null)

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  async function deleteProduct(id) {
    const confirmed = window.confirm(
      'Энэ бүтээгдэхүүнийг устгах уу?'
    )

    if (!confirmed) return

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)

    if (error) {
      alert(error.message)
      return
    }

    await loadProducts()
  }

  function resetForm() {
    setEditingId(null)
    setImageFile(null)

    setForm({
      title: '',
      slug: '',
      description: '',
      price: '',
      old_price: '',
      order_url: '',
      image_url: '',
      published: true,
    })
  }

  if (loading) {
    return (
      <main style={styles.center}>
        <p>Уншиж байна...</p>
      </main>
    )
  }

  return (
    <main style={styles.page}>
      <div style={styles.top}>
        <div>
          <button
            onClick={() => router.push('/admin')}
            style={styles.back}
          >
            ← Dashboard
          </button>

          <p style={styles.eyebrow}>LEARN·MINEA ADMIN</p>
          <h1 style={styles.title}>Бүтээгдэхүүн</h1>

          <p style={styles.subtitle}>
            Ном, үнэ, зураг болон тайлбараа эндээс удирдана.
          </p>
        </div>
      </div>

      <section style={styles.editor}>
        <h2>
          {editingId
            ? 'Бүтээгдэхүүн засах'
            : '+ Шинэ бүтээгдэхүүн'}
        </h2>

        <form onSubmit={saveProduct}>
          <label style={styles.label}>
            Бүтээгдэхүүний нэр
          </label>

          <input
            style={styles.input}
            name="title"
            value={form.title}
            onChange={changeForm}
            placeholder="Жишээ: TOPIK II тактик"
          />

          <label style={styles.label}>Slug</label>

          <input
            style={styles.input}
            name="slug"
            value={form.slug}
            onChange={changeForm}
            placeholder="Хоосон орхивол автоматаар үүснэ"
          />

          <div style={styles.twoColumns}>
            <div>
              <label style={styles.label}>Үнэ</label>

              <input
                style={styles.input}
                type="number"
                name="price"
                value={form.price}
                onChange={changeForm}
                placeholder="14900"
              />
            </div>

            <div>
              <label style={styles.label}>
                Хуучин үнэ
              </label>

              <input
                style={styles.input}
                type="number"
                name="old_price"
                value={form.old_price}
                onChange={changeForm}
                placeholder="34900"
              />
            </div>
          </div>

          <label style={styles.label}>Тайлбар</label>

          <textarea
            style={styles.textarea}
            name="description"
            value={form.description}
            onChange={changeForm}
            placeholder="Бүтээгдэхүүний тайлбар..."
          />

          <label style={styles.label}>Зураг</label>

          {form.image_url && (
            <img
              src={form.image_url}
              alt=""
              style={styles.preview}
            />
          )}

          <input
            style={styles.file}
            type="file"
            accept="image/*"
            onChange={(e) =>
              setImageFile(e.target.files?.[0] || null)
            }
          />

          {imageFile && (
            <p style={styles.fileName}>
              Сонгосон: {imageFile.name}
            </p>
          )}

          <label style={styles.label}>
            Захиалгын холбоос
          </label>

          <input
            style={styles.input}
            name="order_url"
            value={form.order_url}
            onChange={changeForm}
            placeholder="Google Form эсвэл order URL"
          />

          <label style={styles.checkbox}>
            <input
              type="checkbox"
              name="published"
              checked={form.published}
              onChange={changeForm}
            />

            Сайт дээр харуулах
          </label>

          <div style={styles.buttons}>
            <button
              type="submit"
              disabled={saving}
              style={styles.save}
            >
              {saving
                ? 'Хадгалж байна...'
                : editingId
                  ? 'Өөрчлөлт хадгалах'
                  : 'Бүтээгдэхүүн нэмэх'}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                style={styles.cancel}
              >
                Болих
              </button>
            )}
          </div>
        </form>
      </section>

      <section style={styles.listSection}>
        <h2>Одоогийн бүтээгдэхүүнүүд</h2>

        {products.length === 0 ? (
          <div style={styles.empty}>
            Одоогоор бүтээгдэхүүн байхгүй.
          </div>
        ) : (
          <div style={styles.grid}>
            {products.map((product) => (
              <article
                key={product.id}
                style={styles.productCard}
              >
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.title}
                    style={styles.productImage}
                  />
                ) : (
                  <div style={styles.noImage}>
                    Зураггүй
                  </div>
                )}

                <div style={styles.productBody}>
                  <div style={styles.statusRow}>
                    <span
                      style={
                        product.published
                          ? styles.published
                          : styles.hidden
                      }
                    >
                      {product.published
                        ? 'Published'
                        : 'Hidden'}
                    </span>
                  </div>

                  <h3>{product.title}</h3>

                  <p style={styles.description}>
                    {product.description}
                  </p>

                  <div style={styles.priceRow}>
                    <strong>
                      ₮
                      {Number(
                        product.price || 0
                      ).toLocaleString()}
                    </strong>

                    {product.old_price && (
                      <del style={styles.oldPrice}>
                        ₮
                        {Number(
                          product.old_price
                        ).toLocaleString()}
                      </del>
                    )}
                  </div>

                  <div style={styles.cardButtons}>
                    <button
                      onClick={() =>
                        editProduct(product)
                      }
                      style={styles.edit}
                    >
                      Засах
                    </button>

                    <button
                      onClick={() =>
                        deleteProduct(product.id)
                      }
                      style={styles.delete}
                    >
                      Устгах
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}

const styles = {
  center: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  page: {
    minHeight: '100vh',
    background: '#f8f7ff',
    padding: '45px',
    fontFamily: 'Arial, sans-serif',
    color: '#20202a',
  },

  top: {
    maxWidth: '1100px',
    margin: '0 auto 30px',
  },

  back: {
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    padding: 0,
    marginBottom: '25px',
  },

  eyebrow: {
    color: '#6c5ce7',
    fontSize: '12px',
    fontWeight: '800',
  },

  title: {
    fontSize: '38px',
    margin: '5px 0',
  },

  subtitle: {
    color: '#777',
  },

  editor: {
    maxWidth: '1100px',
    margin: '0 auto',
    background: 'white',
    padding: '32px',
    borderRadius: '22px',
  },

  label: {
    display: 'block',
    fontWeight: '700',
    marginTop: '20px',
    marginBottom: '8px',
  },

  input: {
    width: '100%',
    boxSizing: 'border-box',
    padding: '14px',
    border: '1px solid #ddd',
    borderRadius: '11px',
    fontSize: '15px',
  },

  textarea: {
    width: '100%',
    minHeight: '130px',
    boxSizing: 'border-box',
    padding: '14px',
    border: '1px solid #ddd',
    borderRadius: '11px',
    fontSize: '15px',
    resize: 'vertical',
  },

  twoColumns: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '18px',
  },

  file: {
    display: 'block',
    marginTop: '8px',
  },

  fileName: {
    fontSize: '13px',
    color: '#6c5ce7',
  },

  preview: {
    width: '140px',
    height: '180px',
    objectFit: 'cover',
    borderRadius: '12px',
    display: 'block',
    marginBottom: '10px',
  },

  checkbox: {
    display: 'flex',
    gap: '10px',
    marginTop: '22px',
    alignItems: 'center',
  },

  buttons: {
    display: 'flex',
    gap: '12px',
    marginTop: '28px',
  },

  save: {
    border: 'none',
    background: '#6c5ce7',
    color: 'white',
    padding: '14px 24px',
    borderRadius: '12px',
    fontWeight: '700',
    cursor: 'pointer',
  },

  cancel: {
    border: '1px solid #ddd',
    background: 'white',
    padding: '14px 24px',
    borderRadius: '12px',
    cursor: 'pointer',
  },

  listSection: {
    maxWidth: '1100px',
    margin: '40px auto',
  },

  empty: {
    background: 'white',
    padding: '30px',
    borderRadius: '18px',
    color: '#777',
  },

  grid: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(auto-fill, minmax(240px, 1fr))',
    gap: '20px',
  },

  productCard: {
    background: 'white',
    borderRadius: '18px',
    overflow: 'hidden',
  },

  productImage: {
    width: '100%',
    height: '260px',
    objectFit: 'cover',
  },

  noImage: {
    height: '260px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#eee',
    color: '#888',
  },

  productBody: {
    padding: '20px',
  },

  statusRow: {
    marginBottom: '10px',
  },

  published: {
    background: '#ecfff5',
    padding: '5px 9px',
    borderRadius: '20px',
    fontSize: '11px',
  },

  hidden: {
    background: '#f1f1f1',
    padding: '5px 9px',
    borderRadius: '20px',
    fontSize: '11px',
  },

  description: {
    color: '#777',
    lineHeight: '1.5',
    fontSize: '14px',
  },

  priceRow: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
    marginTop: '15px',
  },

  oldPrice: {
    color: '#999',
    fontSize: '13px',
  },

  cardButtons: {
    display: 'flex',
    gap: '8px',
    marginTop: '18px',
  },

  edit: {
    flex: 1,
    border: 'none',
    background: '#6c5ce7',
    color: 'white',
    padding: '10px',
    borderRadius: '9px',
    cursor: 'pointer',
  },

  delete: {
    flex: 1,
    border: '1px solid #ddd',
    background: 'white',
    padding: '10px',
    borderRadius: '9px',
    cursor: 'pointer',
  },
}