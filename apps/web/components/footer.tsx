import React from 'react'

import { AppLink } from '@repo/ui/link'
import Link from 'next/link'


export default function Footer() {
  return (
    <footer className="flex justify-between items-center w-full text-xs md:text-sm">
      <p>
        Inspired by -{' '}
        <AppLink href="https://neal.fun/perfect-circle/" as={Link}>
          Neal.fun
        </AppLink>
      </p>
      <p>Built by -{' '}
        <AppLink href="https://x.com/orcatwt" as={Link}>
          Dhanush
        </AppLink>
      </p>
    </footer>
  )
}
