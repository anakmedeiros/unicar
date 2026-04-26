import {
  type ReactNode,
  type InputHTMLAttributes,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react'

// ─── Field wrapper ────────────────────────────────────────────────���───────────

interface FieldProps {
  label: string
  required?: boolean
  hint?: string
  error?: string
  children: ReactNode
}

export function Field({ label, required, hint, error, children }: FieldProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5, minWidth: 0 }}>
      <label
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: '#4A4A4A',
          letterSpacing: '0.01em',
          display: 'flex',
          alignItems: 'center',
          gap: 3,
          userSelect: 'none',
        }}
      >
        {label}
        {required && (
          <span aria-hidden="true" style={{ color: '#E31E2D' }}>
            *
          </span>
        )}
      </label>
      {children}
      {hint && !error && (
        <span style={{ fontSize: 10.5, color: '#8A8A8A' }}>{hint}</span>
      )}
      {error && (
        <span role="alert" style={{ fontSize: 10.5, color: '#E31E2D' }}>
          {error}
        </span>
      )}
    </div>
  )
}

// ─── Shared focus/blur handlers ───────────────────────────────────────────────

function onFocusInput(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
  e.currentTarget.style.borderColor = '#E31E2D'
  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(227,30,45,0.08)'
}

function onBlurInput(
  e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  hasError?: boolean
) {
  e.currentTarget.style.borderColor = hasError ? '#E31E2D' : '#CFCCC6'
  e.currentTarget.style.boxShadow = hasError ? '0 0 0 3px rgba(227,30,45,0.08)' : 'none'
}

const baseFieldStyle = (error?: boolean): React.CSSProperties => ({
  width: '100%',
  border: `1px solid ${error ? '#E31E2D' : '#CFCCC6'}`,
  borderRadius: 5,
  background: '#fff',
  padding: '8px 10px',
  fontSize: 12.5,
  color: '#1A1A1A',
  outline: 'none',
  fontFamily: 'inherit',
  lineHeight: 1.4,
  boxShadow: error ? '0 0 0 3px rgba(227,30,45,0.08)' : 'none',
})

// ─── Input ────────────────────────────────────────────────────────────────────

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
  mono?: boolean
}

export function Input({ error, mono, style, onFocus, onBlur, ...props }: InputProps) {
  return (
    <input
      style={{
        ...baseFieldStyle(error),
        fontFamily: mono ? "'JetBrains Mono', monospace" : 'inherit',
        ...style,
      }}
      onFocus={e => {
        onFocusInput(e)
        onFocus?.(e)
      }}
      onBlur={e => {
        onBlurInput(e, error)
        onBlur?.(e)
      }}
      {...props}
    />
  )
}

// ─── Select ───────────────────────────────────────────────────────────────────

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean
  placeholder?: string
}

export function Select({ error, placeholder, children, style, onFocus, onBlur, ...props }: SelectProps) {
  return (
    <select
      style={{ ...baseFieldStyle(error), ...style }}
      onFocus={e => {
        onFocusInput(e)
        onFocus?.(e)
      }}
      onBlur={e => {
        onBlurInput(e, error)
        onBlur?.(e)
      }}
      {...props}
    >
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {children}
    </select>
  )
}

// ─── Textarea ─────────────────────────────────────────────────────────────────

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean
}

export function Textarea({ error, style, onFocus, onBlur, ...props }: TextareaProps) {
  return (
    <textarea
      style={{
        ...baseFieldStyle(error),
        resize: 'vertical',
        minHeight: 70,
        lineHeight: 1.5,
        ...style,
      }}
      onFocus={e => {
        onFocusInput(e)
        onFocus?.(e)
      }}
      onBlur={e => {
        onBlurInput(e, error)
        onBlur?.(e)
      }}
      {...props}
    />
  )
}
