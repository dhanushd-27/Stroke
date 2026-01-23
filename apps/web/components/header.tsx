import Image from 'next/image'
import React from 'react'
import { ThemeToggler } from './theme-toggler'
import GithubLink from './github'
import Nav from './nav/nav'

export default function Header() {
  return (
    <header className='w-full flex items-center justify-between'>
      <Image src="/logo.png" alt="Logo" width={36} height={36} />
      {/* <Nav /> */}
      <div className='flex items-center gap-6'>
        <GithubLink />
        <ThemeToggler />
      </div>
    </header>
  )
}
