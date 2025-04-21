export type FileValidationResult = {
  valid: boolean
  error?: string
}

export type FileType = "fasta" | "vcf" | "unknown"

// Function to validate DNA sequence files
export const validateDnaFile = (file: File): FileValidationResult => {
  // Check file size (limit to 10MB for demo)
  const maxSize = 10 * 1024 * 1024 // 10MB
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size exceeds the maximum limit of 10MB. Your file is ${(file.size / (1024 * 1024)).toFixed(2)}MB.`,
    }
  }

  // Check file extension
  const fileType = getFileType(file.name)
  if (fileType === "unknown") {
    return {
      valid: false,
      error: "Invalid file format. Please upload a FASTA (.fasta, .fa) or VCF (.vcf) file.",
    }
  }

  // For a real application, you would also check the file content
  // to ensure it's a valid DNA sequence file

  return { valid: true }
}

// Function to determine file type from extension
export const getFileType = (fileName: string): FileType => {
  const extension = fileName.split(".").pop()?.toLowerCase() || ""

  if (extension === "fasta" || extension === "fa") {
    return "fasta"
  } else if (extension === "vcf") {
    return "vcf"
  } else {
    return "unknown"
  }
}

// Function to parse FASTA file content (simplified for demo)
export const parseFastaContent = async (file: File): Promise<string[]> => {
  const content = await file.text()
  const lines = content.split("\n")

  // Extract sequences (skip header lines that start with >)
  const sequences = lines.filter((line) => !line.startsWith(">") && line.trim().length > 0)

  return sequences
}

// Function to parse VCF file content (simplified for demo)
export const parseVcfContent = async (file: File): Promise<any[]> => {
  const content = await file.text()
  const lines = content.split("\n")

  // Skip header lines and parse data lines
  const dataLines = lines.filter((line) => !line.startsWith("#") && line.trim().length > 0)

  // Parse each data line into a structured object
  return dataLines.map((line) => {
    const [chrom, pos, id, ref, alt, qual, filter, info] = line.split("\t")
    return { chrom, pos, id, ref, alt, qual, filter, info }
  })
}
