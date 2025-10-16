// components/Navbar.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Navbar() {
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()
      setUser(data.user)
    }

    getUser()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/' // redirect to home on logout
  }

  return (
    <nav className="w-full flex justify-between items-center p-4 bg-blue-600 text-white">
      <div className="space-x-4">
        <Link href="/" className={pathname === '/' ? 'font-bold' : ''}>
          Map
        </Link>
        <Link href="/favorites" className={pathname === '/favorites' ? 'font-bold' : ''}>
          Favorites
        </Link>
      </div>
      <div>
        {user ? (
          <button onClick={handleLogout} className="underline">
            Logout
          </button>
        ) : (
          <Link href="/login" className={pathname === '/login' ? 'font-bold underline' : 'underline'}>
            Login
          </Link>
        )}
      </div>
    </nav>
  )
} 

// Include this component in your layout.tsx
// <Navbar /> above the {children} line
