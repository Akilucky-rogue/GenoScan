import React from 'react'
import { render, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { VariantUploader } from '../components/variant-uploader'

describe('VariantUploader', () => {
  it('calls onUpload with parsed VCF variants', async () => {
    const onUpload = vi.fn()
    const { getByTestId } = render(<VariantUploader onUpload={onUpload} />)

    // create a fake vcf file
    const vcfContent = '#CHROM\tPOS\tID\tREF\tALT\tQUAL\tFILTER\tINFO\n1\t123\t.\tA\tG\t.\t.\tGENE=BRCA1'
    const file = new File([vcfContent], 'test.vcf', { type: 'text/vcf' })

    const input = getByTestId('file-input') as HTMLInputElement
    // simulate file selection
    Object.defineProperty(input, 'files', { value: [file] })
    fireEvent.change(input)

    await waitFor(() => expect(onUpload).toHaveBeenCalled())
    const args = onUpload.mock.calls[0][0]
    expect(Array.isArray(args)).toBe(true)
    expect(args[0]).toHaveProperty('chrom')
  })

  it('shows error for oversized files', async () => {
    const onUpload = vi.fn()
    // use 0 to force any non-empty file to be considered oversized in tests
    const { getByTestId, findByText } = render(<VariantUploader onUpload={onUpload} maxFileSizeMB={0} />)

    const content = 'A' // small content; maxFileSizeMB=0 will trigger size error
    const file = new File([content], 'big.vcf', { type: 'text/vcf' })
    const input = getByTestId('file-input') as HTMLInputElement
    Object.defineProperty(input, 'files', { value: [file] })
    fireEvent.change(input)

    const err = await findByText(/File too large/i)
    expect(err).toBeTruthy()
    expect(onUpload).not.toHaveBeenCalled()
  })
})
