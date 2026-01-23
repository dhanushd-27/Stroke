import { AppLink } from '@repo/ui/link'
import React from 'react'
import Link from 'next/link'

export default function GithubLink() {
  return (
    <AppLink href="https://github.com/dhanushd-27/Stroke" as={Link}>
      Github
    </AppLink>
  )
}
