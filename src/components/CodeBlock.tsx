'use client'

import { useEffect, useState } from 'react'
import 'prismjs/themes/prism-tomorrow.css'

interface CodeBlockProps {
  children: string
  className?: string
  inline?: boolean
}

export default function CodeBlock({ children, className, inline }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)
  
  // Extract language from className (e.g., "language-javascript")
  const language = className?.replace(/language-/, '') || 'text'
  
  useEffect(() => {
    if (!inline && typeof window !== 'undefined') {
      // Dynamically import Prism to avoid SSR issues
      import('prismjs').then((Prism) => {
        // Import language components based on the detected language
        const loadLanguage = async () => {
          try {
            switch (language) {
              case 'javascript':
              case 'js':
                await import('prismjs/components/prism-javascript')
                break
              case 'typescript':
              case 'ts':
                await import('prismjs/components/prism-typescript')
                break
              case 'jsx':
                await import('prismjs/components/prism-jsx')
                break
              case 'tsx':
                await import('prismjs/components/prism-tsx')
                break
              case 'css':
                await import('prismjs/components/prism-css')
                break
              case 'python':
                await import('prismjs/components/prism-python')
                break
              case 'bash':
              case 'sh':
                await import('prismjs/components/prism-bash')
                break
              case 'json':
                await import('prismjs/components/prism-json')
                break
              case 'markdown':
              case 'md':
                await import('prismjs/components/prism-markdown')
                break
              case 'sql':
                await import('prismjs/components/prism-sql')
                break
            }
          } catch {
            // Silent fail - unsupported language falls back to plain text
          }
          
          setTimeout(() => {
            Prism.default.highlightAll()
          }, 0)
        }
        
        loadLanguage()
      })
    }
  }, [inline, children, language])
  
  const handleCopy = async () => {
    await navigator.clipboard.writeText(children)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  
  if (inline) {
    return (
      <code className={`${className || ''} inline-code`} style={{
        backgroundColor: '#f3f4f6',
        padding: '0.125rem 0.375rem',
        borderRadius: '0.25rem',
        fontSize: '0.875rem',
        fontFamily: 'monospace'
      }}>
        {children}
      </code>
    )
  }
  
  return (
    <div className="code-block relative" style={{position: 'relative', marginBottom: '1.5rem'}}>
      <button
        onClick={handleCopy}
        aria-label={copied ? 'Copied to clipboard' : 'Copy code to clipboard'}
        className="copy-button"
        style={{
          position: 'absolute',
          top: '0.5rem',
          right: '0.5rem',
          padding: '0.25rem 0.5rem',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          color: '#fff',
          border: 'none',
          borderRadius: '0.25rem',
          fontSize: '0.75rem',
          cursor: 'pointer',
          zIndex: 1,
          transition: 'background-color 0.2s'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'
        }}
      >
        {copied ? 'Copied!' : 'Copy'}
      </button>
      <pre style={{
        backgroundColor: '#1f2937',
        color: '#f3f4f6',
        padding: '1rem',
        paddingTop: '2.5rem',
        borderRadius: '0.5rem',
        overflowX: 'auto',
        fontSize: '0.875rem',
        lineHeight: 1.7,
        margin: 0
      }}>
        <code className={className}>
          {children}
        </code>
      </pre>
    </div>
  )
}