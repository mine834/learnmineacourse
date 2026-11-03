'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

const defaults = {
  eyebrow: 'LEARNMINEA · DIGITAL LIBRARY',
  title: 'Цахим номын\nсан',
  description: 'Түвшин, зорилгодоо тохирсон цахим ном, гарын авлагаа сонгоод хаанаас ч сураарай.',
  buttonText: 'Номуудыг үзэх',
  gradientStart: '#D3E8FC',
  gradientEnd: '#E8F0F9',
}

export default function BooksHeroEditor() {
  const [form, setForm] = useState(defaults)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const { data: auth, error: authError } = await supabase.auth.getUser()
        if (authError) throw authError
        if (!auth?.user) throw new Error('Нэвтэрнэ үү.')

        const { data: allowed, error: roleError } = await supabase.rpc('is_admin')
        if (roleError || allowed !== true) throw new Error('Admin эрх шаардлагатай.')

        const { data, error } = await supabase
          .from('site_editor_settings')
          .select('content')
          .eq('id', 'books_hero')
          .maybeSingle()

        if (error) throw error
        if (active && data?.content) setForm({ ...defaults, ...data.content })
      } catch (err) {
        if (active) setMessage('Ачаалах алдаа: ' + err.message)
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => { active = false }
  }, [])

  function change(key, value) {
    setForm(previous => ({ ...previous, [key]: value }))
    setMessage('')
  }

  async function save() {
    setSaving(true)
    setMessage('')
    try {
      const { data: allowed, error: roleError } = await supabase.rpc('is_admin')
      if (roleError || allowed !== true) throw new Error('Admin эрх шаардлагатай.')

      const { data, error } = await supabase
        .from('site_editor_settings')
        .upsert({
          id: 'books_hero',
          content: form,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' })
        .select('id')
        .single()

      if (error) throw error
      if (data?.id !== 'books_hero') throw new Error('Хадгалалтыг баталгаажуулж чадсангүй.')

      setMessage('Хадгаллаа. /books хуудсаа шинэчлэн шалгаарай.')
    } catch (err) {
      setMessage('Хадгалах алдаа: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <section className="panel"><p>Цахим номын тохиргоог ачаалж байна...</p></section>

  const fields = [
    ['eyebrow', 'Жижиг гарчиг'],
    ['title', 'Том гарчиг'],
    ['description', 'Тайлбар'],
    ['buttonText', 'Товчны текст'],
  ]

  return (
    <section style={{
      background: '#fff',
      border: '1px solid #e0e7f0',
      borderRadius: 22,
      padding: '30px',
      marginBottom: 30,
      boxShadow: '0 5px 22px rgba(30,55,90,.035)',
    }}>
      <div style={{ marginBottom: 26 }}>
        <h2 style={{
          fontSize: 25,
          fontWeight: 750,
          color: '#203047',
          margin: '0 0 8px',
        }}>
          Цахим номын нүүр хэсэг
        </h2>
        <p style={{ color: '#7a8aa0', fontSize: 14, margin: 0 }}>
          /books хуудасны гарчиг, тайлбар, товч болон өнгө
        </p>
      </div>

      <div style={{ display: 'grid', gap: 20 }}>
        {fields.map(([key, label]) => (
          <label key={key} style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 9,
            fontWeight: 650,
            fontSize: 14,
            color: '#34465e',
          }}>
            {label}
            <textarea
              rows={key === 'description' ? 3 : key === 'title' ? 2 : 1}
              value={form[key] ?? ''}
              onChange={event => change(key, event.target.value)}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '13px 15px',
                border: '1px solid #d9e3ee',
                borderRadius: 12,
                background: '#f8fbff',
                color: '#223248',
                fontSize: 15,
                fontFamily: 'inherit',
                lineHeight: 1.6,
                resize: 'vertical',
                outlineColor: '#087bd2',
              }}
            />
          </label>
        ))}

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: 16,
        }}>
          {[
            ['gradientStart', 'Градиентийн эхний өнгө'],
            ['gradientEnd', 'Градиентийн сүүлийн өнгө'],
          ].map(([key, label]) => (
            <label key={key} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              padding: '14px 16px',
              border: '1px solid #d9e3ee',
              borderRadius: 12,
              background: '#f8fbff',
              fontSize: 14,
              fontWeight: 650,
              color: '#34465e',
            }}>
              <span>{label}</span>
              <input
                type="color"
                value={form[key]}
                onChange={event => change(key, event.target.value)}
                style={{ width: 48, height: 34, cursor: 'pointer' }}
              />
            </label>
          ))}
        </div>

        <div style={{
          height: 95,
          borderRadius: 14,
          border: '1px solid #e0e7f0',
          background: `linear-gradient(120deg, ${form.gradientStart}, ${form.gradientEnd})`,
        }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={save}
            disabled={saving}
            style={{
              background: '#087bd2',
              color: '#fff',
              border: 0,
              borderRadius: 12,
              padding: '14px 24px',
              fontSize: 15,
              fontWeight: 700,
              cursor: saving ? 'wait' : 'pointer',
            }}
          >
            {saving ? 'Хадгалж байна...' : 'Цахим номын тохиргоог хадгалах'}
          </button>
          {message && <p role="status" style={{ margin: 0, fontSize: 14 }}>{message}</p>}
        </div>
      </div>
    </section>
  )
}
