import { useEffect, useMemo, useRef, useState } from 'react'
import { Check, ChevronDown, Search, X } from 'lucide-react'
import type { Institution } from './types'

type Props = { institutions: Institution[]; value: string; disabledId?: string; label: string; placeholder: string; searchPlaceholder: string; emptyMessage: string; onChange: (id: string) => void }

function PickerLogo({ institution }: { institution: Institution }) {
  return <span className="picker-logo" style={{ background: institution.logo ? '#fff' : institution.color }}>
    {institution.logo ? <img src={institution.logo} alt="" /> : institution.short}
  </span>
}

export function InstitutionPicker({ institutions, value, disabledId, label, placeholder, searchPlaceholder, emptyMessage, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const rootRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const selected = institutions.find(institution => institution.id === value)
  const results = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase()
    return institutions.filter(institution => institution.id !== disabledId && (!needle || `${institution.nameEn} ${institution.nameKm} ${institution.short}`.toLocaleLowerCase().includes(needle)))
  }, [disabledId, institutions, query])

  useEffect(() => {
    if (!open) return
    const close = (event: MouseEvent) => { if (!rootRef.current?.contains(event.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', close)
    requestAnimationFrame(() => inputRef.current?.focus())
    return () => document.removeEventListener('mousedown', close)
  }, [open])
  useEffect(() => setActiveIndex(0), [query, disabledId])

  const choose = (institution: Institution) => { onChange(institution.id); setQuery(''); setOpen(false) }
  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') { event.preventDefault(); setActiveIndex(index => Math.min(index + 1, results.length - 1)) }
    else if (event.key === 'ArrowUp') { event.preventDefault(); setActiveIndex(index => Math.max(index - 1, 0)) }
    else if (event.key === 'Enter' && results[activeIndex]) { event.preventDefault(); choose(results[activeIndex]) }
    else if (event.key === 'Escape') setOpen(false)
  }

  return <div className="compare-field">
    <span className="compare-field-label">{label}</span>
    <div className={`institution-picker${open ? ' open' : ''}`} ref={rootRef}>
      <button type="button" className="picker-trigger" aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen(current => !current)}>
        {selected && <PickerLogo institution={selected} />}<span className={selected ? '' : 'placeholder'}>{selected?.nameEn ?? placeholder}</span><ChevronDown className="picker-chevron" />
      </button>
      {open && <div className="picker-popover">
        <div className="picker-search"><Search/><input ref={inputRef} value={query} onChange={event => setQuery(event.target.value)} onKeyDown={onKeyDown} placeholder={searchPlaceholder} aria-label={searchPlaceholder}/>{query && <button type="button" onClick={() => setQuery('')} aria-label="Clear search"><X/></button>}</div>
        <div className="picker-options" role="listbox" aria-label={label}>
          {results.map((institution, index) => <button type="button" role="option" aria-selected={institution.id === value} className={index === activeIndex ? 'active' : ''} key={institution.id} onMouseEnter={() => setActiveIndex(index)} onClick={() => choose(institution)}><PickerLogo institution={institution}/><span><b>{institution.nameEn}</b><small>{institution.typeEn}</small></span>{institution.id === value && <Check className="picker-check"/>}</button>)}
          {!results.length && <div className="picker-empty"><Search/><span>{emptyMessage}</span></div>}
        </div>
      </div>}
    </div>
  </div>
}
