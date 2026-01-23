import React from 'react'

type NavLinkProps = {
  onClick?: () => void;
  label: string;
}
export default function NavLink({ label, onClick }: NavLinkProps) {
  return (
    <button onClick={onClick} className='text-text-primary hover:text-silver active:text-silver transition-all duration-300 text-xs md:text-sm tracking-wide'>{label}</button>
  )
}
