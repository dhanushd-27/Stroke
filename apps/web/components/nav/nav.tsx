import React from 'react'
import NavLink from './nav-link'

export default function Nav() {
  return (
    <div className='hidden sm:flex gap-3 sm:gap-6 items-center justify-between'>
      <NavLink label='circle' />
      <NavLink label='triangle' />
    </div>
  )
}
