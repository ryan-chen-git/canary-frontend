'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

interface EmailCopyButtonProps {
  email: string
}

export function EmailCopyButton({ email }: EmailCopyButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(email)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className="relative inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
    >
      <span>{email}</span>
      {copied ? (
        <Check className="h-3 w-3 text-green-500" />
      ) : (
        <Copy className="h-3 w-3" />
      )}
      {copied && (
        <span className="absolute -right-14 text-green-500 text-xs">Copied!</span>
      )}
    </button>
  )
}
