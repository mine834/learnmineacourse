'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
export default function LegacyProductsRedirect(){const router=useRouter();useEffect(()=>{router.replace('/admin/books')},[router]);return <main style={{padding:32}}>Номын удирдлага руу шилжүүлж байна...</main>}
