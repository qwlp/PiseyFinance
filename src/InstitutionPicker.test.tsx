// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { institutions } from './data'
import { InstitutionPicker } from './InstitutionPicker'

const props = {
  institutions,
  value: '',
  label: 'First institution',
  placeholder: 'Choose an institution…',
  searchPlaceholder: 'Search institutions…',
  emptyMessage: 'No institutions found',
}

afterEach(cleanup)

describe('InstitutionPicker', () => {
  it('filters institutions and selects a result', () => {
    const onChange = vi.fn()
    render(<InstitutionPicker {...props} onChange={onChange}/>)

    fireEvent.click(screen.getByRole('button', { name: /choose an institution/i }))
    fireEvent.change(screen.getByRole('textbox', { name: /search institutions/i }), { target: { value: 'ACLEDA' } })

    const option = screen.getByRole('option', { name: /ACLEDA Bank Plc/i })
    expect(option.querySelector('img')).toBeInTheDocument()
    fireEvent.click(option)
    expect(onChange).toHaveBeenCalledWith('acleda-bank-plc')
  })

  it('excludes the institution selected in the other picker', () => {
    render(<InstitutionPicker {...props} disabledId="acleda-bank-plc" onChange={vi.fn()}/>)
    fireEvent.click(screen.getByRole('button', { name: /choose an institution/i }))
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'ACLEDA' } })
    expect(screen.getByText('No institutions found')).toBeInTheDocument()
  })
})
