// This is a mock database service for the prototype
// In a real application, you would use a real database like PostgreSQL or MongoDB

interface User {
  id: string
  name: string
  email: string
}

interface Analysis {
  id: string
  userId: string
  fileName: string
  fileSize: number
  fileType: string
  uploadDate: Date
  status: "pending" | "processing" | "completed" | "failed"
  results?: AnalysisResults
}

interface AnalysisResults {
  variantsDetected: number
  abnormalitiesFound: number
  therapeuticSuggestions: number
  reportUrl?: string
}

// Mock database
const users: User[] = []
const analyses: Analysis[] = []

// Generate a random ID
const generateId = () => Math.random().toString(36).substring(2, 15)

// User methods
export const createUser = (name: string, email: string): User => {
  const user = { id: generateId(), name, email }
  users.push(user)
  return user
}

export const getUserByEmail = (email: string): User | undefined => {
  return users.find((user) => user.email === email)
}

// Analysis methods
export const createAnalysis = (userId: string, fileName: string, fileSize: number, fileType: string): Analysis => {
  const analysis: Analysis = {
    id: generateId(),
    userId,
    fileName,
    fileSize,
    fileType,
    uploadDate: new Date(),
    status: "pending",
  }
  analyses.push(analysis)
  return analysis
}

export const getAnalysesByUserId = (userId: string): Analysis[] => {
  return analyses.filter((analysis) => analysis.userId === userId)
}

export const getAnalysisById = (id: string): Analysis | undefined => {
  return analyses.find((analysis) => analysis.id === id)
}

export const updateAnalysisStatus = (
  id: string,
  status: Analysis["status"],
  results?: AnalysisResults,
): Analysis | undefined => {
  const analysis = analyses.find((a) => a.id === id)
  if (analysis) {
    analysis.status = status
    if (results) {
      analysis.results = results
    }
    return analysis
  }
  return undefined
}

// Mock function to simulate DNA analysis
export const processDnaAnalysis = async (analysisId: string): Promise<void> => {
  const analysis = getAnalysisById(analysisId)
  if (!analysis) return

  // Update status to processing
  updateAnalysisStatus(analysisId, "processing")

  // Simulate processing time
  await new Promise((resolve) => setTimeout(resolve, 5000))

  // Generate mock results
  const results: AnalysisResults = {
    variantsDetected: Math.floor(Math.random() * 10) + 1,
    abnormalitiesFound: Math.floor(Math.random() * 5),
    therapeuticSuggestions: Math.floor(Math.random() * 3) + 1,
  }

  // Update with completed status and results
  updateAnalysisStatus(analysisId, "completed", results)
}
