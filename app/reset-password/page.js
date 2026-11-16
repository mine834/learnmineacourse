'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '../lib/supabase'

export default function ResetPasswordPage() {
  const [ready,setReady] = useState(false)
  const [password,setPassword] = useState('')
  const [confirm,setConfirm] = useState('')
  const [loading,setLoading] = useState(false)
  const [error,setError] = useState('')
  const [message,setMessage] = useState('')

  useEffect(() => {
    let active = true
    supabase.auth.getSession().then(({data,error}) => {
      if (!active) return
      if (error || !data.session) setError('Сэргээх холбоос хүчингүй эсвэл хугацаа нь дууссан байна. Дахин холбоос авна уу.')
      else setReady(true)
    })
    const {data:listener} = supabase.auth.onAuthStateChange((event,session) => {
      if (active && event === 'PASSWORD_RECOVERY' && session) {
        setReady(true)
        setError('')
      }
    })
    return () => {
      active = false
      listener.subscription.unsubscribe()
    }
  }, [])

  async function submit(e) {
    e.preventDefault()
    setError('')
    if (password.length < 8) return setError('Нууц үг хамгийн багадаа 8 тэмдэгт байна.')
    if (password !== confirm) return setError('Нууц үгнүүд таарахгүй байна.')
    setLoading(true)
    try {
      const {error} = await supabase.auth.updateUser({password})
      if (error) throw error
      setMessage('Нууц үг амжилттай шинэчлэгдлээ. Одоо нэвтэрч болно.')
      await supabase.auth.signOut()
    } catch (err) {
      console.error(err)
      setError('Нууц үг шинэчлэхэд алдаа гарлаа. Дахин холбоос авна уу.')
    } finally {
      setLoading(false)
    }
  }

  return <main style={styles.page}>
    <section style={styles.card}>
      <b>LEARN<span style={{color:'#0879D1'}}>·</span>MINEA</b>
      <h1>Шинэ нууц үг</h1>
      <p>Шинэ нууц үгээ хоёр удаа оруулна уу.</p>
      {ready && !message && <form onSubmit={submit}>
        <input type="password" required minLength={8} autoComplete="new-password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Шинэ нууц үг" style={styles.input}/>
        <input type="password" required minLength={8} autoComplete="new-password" value={confirm} onChange={e=>setConfirm(e.target.value)} placeholder="Нууц үг давтах" style={styles.input}/>
        <button disabled={loading} style={styles.button}>{loading?'Хадгалж байна...':'Нууц үг шинэчлэх →'}</button>
      </form>}
      {error && <p style={{color:'#c62828',lineHeight:1.6}}>{error}</p>}
      {message && <p style={{color:'#167347',lineHeight:1.6}}>{message}</p>}
      <Link href="/login">← Нэвтрэх хуудас руу буцах</Link>
    </section>
  </main>
}

const styles = {
  page:{minHeight:'100vh',background:'#F8F7FF',display:'grid',placeItems:'center',padding:24},
  card:{width:'100%',maxWidth:440,boxSizing:'border-box',background:'#fff',border:'1px solid #EAE6F5',borderRadius:24,padding:40,boxShadow:'0 20px 60px rgba(48,40,100,.07)'},
  input:{width:'100%',boxSizing:'border-box',padding:14,border:'1px solid #E1DDEC',borderRadius:12,margin:'10px 0'},
  button:{width:'100%',padding:15,border:0,borderRadius:12,background:'#0879D1',color:'#fff',fontWeight:800,cursor:'pointer',margin:'12px 0 20px'},
}
