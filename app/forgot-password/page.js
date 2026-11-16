'use client'

import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '../lib/supabase'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function submit(e) {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setError('')
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      if (error) throw error
      setMessage('Хэрэв энэ имэйл бүртгэлтэй бол сэргээх холбоос илгээгдлээ. Inbox болон Spam хавтсаа шалгана уу.')
    } catch (err) {
      console.error(err)
      setError('Имэйл илгээхэд алдаа гарлаа. Дахин оролдоно уу.')
    } finally {
      setLoading(false)
    }
  }

  return <main style={styles.page}>
    <section style={styles.card}>
      <b>LEARN<span style={{color:'#0879D1'}}>·</span>MINEA</b>
      <h1>Нууц үг сэргээх</h1>
      <p>Бүртгэлтэй имэйл хаягаа оруулна уу.</p>
      <form onSubmit={submit}>
        <input type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="name@email.com" style={styles.input}/>
        {error && <p style={{color:'#c62828'}}>{error}</p>}
        {message && <p style={{color:'#167347',lineHeight:1.6}}>{message}</p>}
        <button disabled={loading} style={styles.button}>{loading?'Илгээж байна...':'Сэргээх холбоос авах →'}</button>
      </form>
      <Link href="/login">← Нэвтрэх хуудас руу буцах</Link>
    </section>
  </main>
}

const styles = {
  page:{minHeight:'100vh',background:'#F8F7FF',display:'grid',placeItems:'center',padding:24},
  card:{width:'100%',maxWidth:440,boxSizing:'border-box',background:'#fff',border:'1px solid #EAE6F5',borderRadius:24,padding:40,boxShadow:'0 20px 60px rgba(48,40,100,.07)'},
  input:{width:'100%',boxSizing:'border-box',padding:14,border:'1px solid #E1DDEC',borderRadius:12,margin:'12px 0 18px'},
  button:{width:'100%',padding:15,border:0,borderRadius:12,background:'#0879D1',color:'#fff',fontWeight:800,cursor:'pointer',marginBottom:20},
}
