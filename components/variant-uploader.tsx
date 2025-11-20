"use client"

import React, { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { UploadCloud, FileText, X, AlertCircle, CheckCircle2 } from "lucide-react"
import { parseVcf, parseFasta } from "@/lib/file-parsers"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { cn } from "@/lib/utils"

export function VariantUploader({
  onUpload,
  maxFileSizeMB = 5,
  serverUploadThresholdMB = 1
}: {
  onUpload: (variants: any[], sequence?: string) => void;
  maxFileSizeMB?: number;
  serverUploadThresholdMB?: number
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [progress, setProgress] = useState<number>(0)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const xhrRef = useRef<XMLHttpRequest | null>(null)
  const [currentFileName, setCurrentFileName] = useState<string | null>(null)
  const [currentFileSize, setCurrentFileSize] = useState<number | null>(null)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'complete' | 'error'>('idle')

  async function handleFile(file: File) {
    setError(null)
    setLoading(true)
    setUploadStatus('uploading')
    setProgress(0)

    try {
      const maxBytes = maxFileSizeMB * 1024 * 1024
      if (file.size > maxBytes) {
        throw new Error(`File too large. Max ${maxFileSizeMB} MB`)
      }

      setCurrentFileName(file.name)
      setCurrentFileSize(file.size)

      // Decide whether to parse client-side or stream to server
      const useServer = file.size > serverUploadThresholdMB * 1024 * 1024

      if (useServer) {
        await uploadToServer(file)
      } else {
        await processLocally(file)
      }

      setUploadStatus('complete')
      setProgress(100)
    } catch (err: any) {
      setError(String(err.message || err))
      setUploadStatus('error')
    } finally {
      setLoading(false)
      setDragActive(false)
    }
  }

  async function uploadToServer(file: File) {
    return new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhrRef.current = xhr

      xhr.open('POST', '/api/upload')
      const fd = new FormData()
      fd.append('file', file, file.name)

      xhr.upload.onprogress = (ev) => {
        if (ev.lengthComputable) {
          setProgress(Math.round((ev.loaded / ev.total) * 100))
        }
      }

      xhr.onload = () => {
        try {
          if (xhr.status >= 200 && xhr.status < 300) {
            const json = JSON.parse(xhr.responseText)
            if (json.variants) onUpload(json.variants)
            else if (json.sequence) onUpload([], json.sequence)
            else if (json.error) throw new Error(json.error)
            resolve()
          } else {
            throw new Error(`Upload failed with status ${xhr.status}`)
          }
        } catch (e) {
          reject(e)
        }
      }

      xhr.onerror = () => reject(new Error('Network error during upload'))
      xhr.onabort = () => reject(new Error('Upload canceled'))

      xhr.send(fd)
    })
  }

  async function processLocally(file: File) {
    // Simulate progress for local processing
    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + 10, 90))
    }, 100)

    try {
      const text = await readFileText(file)
      clearInterval(progressInterval)
      setProgress(100)

      if (file.name.toLowerCase().endsWith('.vcf')) {
        const variants = parseVcf(text)
        onUpload(variants)
      } else if (file.name.toLowerCase().endsWith('.fasta') || file.name.toLowerCase().endsWith('.fa')) {
        const { sequence } = parseFasta(text)
        onUpload([], sequence)
      } else {
        throw new Error('Unsupported file type. Please upload .vcf or .fasta')
      }
    } catch (e) {
      clearInterval(progressInterval)
      throw e
    }
  }

  async function readFileText(f: File): Promise<string> {
    if (typeof (f as any).text === 'function') {
      return await (f as any).text()
    }
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result ?? ''))
      reader.onerror = () => reject(reader.error)
      reader.readAsText(f)
    })
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (f) handleFile(f)
  }

  function cancelUpload() {
    if (xhrRef.current) {
      xhrRef.current.abort()
    }
    setUploadStatus('idle')
    setError(null)
    setProgress(0)
    setLoading(false)
    xhrRef.current = null
    setCurrentFileName(null)
    setCurrentFileSize(null)
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragActive(false)
    const f = e.dataTransfer.files?.[0]
    if (f) handleFile(f)
  }

  function onDragOver(e: React.DragEvent) {
    e.preventDefault()
    setDragActive(true)
  }

  function onDragLeave(e: React.DragEvent) {
    e.preventDefault()
    setDragActive(false)
  }

  return (
    <Card className="w-full border-2 border-dashed border-border shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <UploadCloud className="h-5 w-5 text-primary" />
          Upload Sequence Data
        </CardTitle>
        <CardDescription>
          Support for VCF (.vcf) and FASTA (.fasta, .fa) files up to {maxFileSizeMB}MB
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          className={cn(
            "relative flex flex-col items-center justify-center w-full h-48 rounded-lg transition-all duration-200 ease-in-out",
            dragActive ? "bg-primary/5 border-primary ring-2 ring-primary ring-opacity-50 scale-[0.99]" : "bg-muted/30 hover:bg-muted/50",
            uploadStatus === 'uploading' && "pointer-events-none opacity-50"
          )}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".vcf,.fasta,.fa"
            onChange={onInputChange}
            className="hidden"
            disabled={uploadStatus === 'uploading'}
            data-testid="file-input"
          />

          <div className="flex flex-col items-center justify-center gap-4 text-center p-6">
            <div className={cn("p-4 rounded-full bg-background shadow-sm", dragActive && "animate-bounce")}>
              <UploadCloud className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">
                Drag & drop your file here
              </p>
              <p className="text-xs text-muted-foreground">
                or <button onClick={() => inputRef.current?.click()} className="text-primary hover:underline font-medium">browse files</button>
              </p>
            </div>
          </div>
        </div>

        {/* Status Area */}
        <div className="mt-6 space-y-4">
          {error && (
            <Alert variant="destructive" className="animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Upload Failed</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
              <Button variant="outline" size="sm" onClick={() => setError(null)} className="absolute right-2 top-2 h-6 w-6 p-0">
                <X className="h-3 w-3" />
              </Button>
            </Alert>
          )}

          {uploadStatus === 'uploading' && (
            <div className="space-y-2 animate-in fade-in">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  <span className="font-medium truncate max-w-[200px]">{currentFileName}</span>
                </div>
                <span className="text-muted-foreground">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
              <div className="flex justify-end">
                <Button variant="ghost" size="sm" onClick={cancelUpload} className="text-xs h-7">
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {uploadStatus === 'complete' && !error && (
            <Alert className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-900">
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertTitle className="text-green-800 dark:text-green-300">Upload Complete</AlertTitle>
              <AlertDescription className="text-green-700 dark:text-green-400">
                File {currentFileName} successfully processed.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
