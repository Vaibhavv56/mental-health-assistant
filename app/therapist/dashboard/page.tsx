'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, User, MessageSquare, FileText, Brain, TrendingUp, AlertTriangle, CheckCircle, Edit, Save, Download } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

interface Patient {
  id: string
  name: string
  email: string
  chats?: Array<{
    id: string
    title: string
    updatedAt: string
    _count?: { messages: number }
    consents?: Array<{ status: string }>
  }>
  _count?: { chats: number }
}

interface Chat {
  id: string
  title: string
  therapistGuidance?: string | null
  messages: Array<{
    id: string
    content: string
    role: string
    createdAt: string
  }>
  aiAnalyses?: Array<{
    id: string
    analysis: string
    predictions: string | null
    sentiment: string | null
    riskLevel: string | null
    therapistCorrections: string | null
    correctedAt: string | null
  }>
}

interface AIAnalysis {
  id: string
  analysis: string
  predictions: string | null
  sentiment: string | null
  riskLevel: string | null
  therapistCorrections: string | null
}

interface Report {
  id: string
  title: string
  content: string
  createdAt: string
  patient?: {
    id: string
    name: string
    email: string
  }
}

export default function TherapistDashboard() {
  const router = useRouter()
  const [patients, setPatients] = useState<Patient[]>([])
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null)
  const [patientChats, setPatientChats] = useState<Chat[]>([])
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null)
  const [showAnalysis, setShowAnalysis] = useState(false)
  const [corrections, setCorrections] = useState('')
  const [isEditingCorrections, setIsEditingCorrections] = useState(false)
  const [loading, setLoading] = useState(false)
  const [reportTitle, setReportTitle] = useState('')
  const [showReportDialog, setShowReportDialog] = useState(false)
  const [guidance, setGuidance] = useState('')
  const [showGuidanceDialog, setShowGuidanceDialog] = useState(false)
  const [reports, setReports] = useState<Report[]>([])
  const [showReports, setShowReports] = useState(false)

  useEffect(() => {
    fetchPatients()
  }, [])

  useEffect(() => {
    if (selectedPatient) {
      fetchPatientChats(selectedPatient.id)
      fetchReports(selectedPatient.id)
    }
  }, [selectedPatient])

  useEffect(() => {
    if (selectedChat?.id) {
      fetchAnalysis()
    }
  }, [selectedChat?.id])

  const fetchPatients = async () => {
    try {
      const response = await fetch('/api/therapist/patients')
      if (response.status === 401) {
        router.push('/therapist/login')
        return
      }
      const data = await response.json()
      setPatients(data.patients || [])
    } catch (error) {
      console.error('Failed to fetch patients:', error)
    }
  }

  const fetchPatientChats = async (patientId: string) => {
    try {
      const response = await fetch(`/api/therapist/patient/${patientId}/chats`)
      if (response.ok) {
        const data = await response.json()
        if (data.chats && data.chats.length > 0) {
          setPatientChats(data.chats)
          setSelectedChat(data.chats[0])
          setShowAnalysis(false)
          // Check if analysis exists in the first chat
          if (data.chats[0].aiAnalyses && data.chats[0].aiAnalyses.length > 0) {
            const existingAnalysis = data.chats[0].aiAnalyses[0]
            setAnalysis(existingAnalysis)
            setCorrections(existingAnalysis.therapistCorrections || '')
          } else {
            setAnalysis(null)
            setCorrections('')
          }
          // Set guidance from first chat
          setGuidance(data.chats[0].therapistGuidance || '')
        } else {
          setPatientChats([])
          setSelectedChat(null)
          setAnalysis(null)
          setCorrections('')
        }
      }
    } catch (error) {
      console.error('Failed to fetch chats:', error)
      setPatientChats([])
    }
  }

  const fetchAnalysis = async () => {
    if (!selectedChat?.id) return

    try {
      const response = await fetch(`/api/therapist/analysis?chatId=${selectedChat.id}`)
      if (response.ok) {
        const data = await response.json()
        if (data.analysis) {
          setAnalysis(data.analysis)
          setCorrections(data.analysis.therapistCorrections || '')
        } else {
          setAnalysis(null)
          setCorrections('')
        }
      } else {
        setAnalysis(null)
        setCorrections('')
      }
    } catch (error) {
      console.error('Failed to fetch analysis:', error)
      setAnalysis(null)
      setCorrections('')
    }
  }

  const fetchGuidance = async (chatId: string) => {
    try {
      const response = await fetch(`/api/therapist/chat/${chatId}/guidance`)
      if (response.ok) {
        const data = await response.json()
        setGuidance(data.guidance || '')
      }
    } catch (error) {
      console.error('Failed to fetch guidance:', error)
    }
  }

  const updateGuidance = async () => {
    if (!selectedChat?.id) return

    setLoading(true)
    try {
      const response = await fetch(`/api/therapist/chat/${selectedChat.id}/guidance`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guidance: guidance.trim() || null }),
      })

      if (response.ok) {
        const data = await response.json()
        // Update the selected chat with new guidance
        setSelectedChat({ ...selectedChat, therapistGuidance: data.chat.therapistGuidance })
        setShowGuidanceDialog(false)
        alert('Chat direction updated successfully!')
      } else {
        throw new Error('Failed to update guidance')
      }
    } catch (error) {
      console.error('Failed to update guidance:', error)
      alert('Failed to update chat direction. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const generateAnalysis = async () => {
    if (!selectedChat) return

    setLoading(true)
    try {
      const response = await fetch('/api/therapist/analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId: selectedChat.id }),
      })

      if (response.ok) {
        const data = await response.json()
        setAnalysis(data.analysis)
        setCorrections(data.analysis.therapistCorrections || '')
        setShowAnalysis(true)
      }
    } catch (error) {
      console.error('Failed to generate analysis:', error)
      alert('Failed to generate analysis. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const saveCorrections = async () => {
    if (!analysis) return

    setLoading(true)
    try {
      const response = await fetch('/api/therapist/analysis/correct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          analysisId: analysis.id,
          corrections: corrections,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setAnalysis(data.analysis)
        setIsEditingCorrections(false)
        alert('Corrections saved successfully!')
      }
    } catch (error) {
      console.error('Failed to save corrections:', error)
      alert('Failed to save corrections. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const fetchReports = async (patientId: string) => {
    try {
      const response = await fetch(`/api/therapist/reports?patientId=${patientId}`)
      if (response.ok) {
        const data = await response.json()
        setReports(data.reports || [])
      }
    } catch (error) {
      console.error('Failed to fetch reports:', error)
    }
  }

  const generateReport = async () => {
    if (!selectedPatient || !reportTitle.trim()) return

    setLoading(true)
    try {
      const response = await fetch('/api/therapist/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: selectedPatient.id,
          title: reportTitle,
          analysisId: analysis?.id,
        }),
      })

      if (response.ok) {
        alert('Report generated successfully!')
        setShowReportDialog(false)
        setReportTitle('')
        // Refresh reports list
        await fetchReports(selectedPatient.id)
      }
    } catch (error) {
      console.error('Failed to generate report:', error)
      alert('Failed to generate report. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const downloadReport = (report: Report) => {
    // Create a text file with the report content
    const content = `
REPORT: ${report.title}
Patient: ${report.patient?.name || 'N/A'} (${report.patient?.email || 'N/A'})
Generated: ${new Date(report.createdAt).toLocaleString()}

${'='.repeat(60)}

${report.content}

${'='.repeat(60)}
Generated on ${new Date().toLocaleString()}
`

    // Create blob and download
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${report.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${new Date(report.createdAt).toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/therapist/login')
  }

  const getRiskColor = (riskLevel: string | null) => {
    if (!riskLevel) return 'gray'
    switch (riskLevel.toLowerCase()) {
      case 'high': return 'red'
      case 'medium': return 'yellow'
      case 'low': return 'green'
      default: return 'gray'
    }
  }

  const getSentimentColor = (sentiment: string | null) => {
    if (!sentiment) return 'gray'
    switch (sentiment.toLowerCase()) {
      case 'positive': return 'green'
      case 'negative': case 'concerning': return 'red'
      case 'neutral': return 'gray'
      default: return 'gray'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              <LogOut className="w-4 h-4 inline mr-1" />
              Logout
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {patients.length === 0 ? (
            <div className="text-center text-gray-500 mt-8">
              <User className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>No patients assigned yet.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {patients.map((patient) => (
                <button
                  key={patient.id}
                  onClick={() => {
                    setSelectedPatient(patient)
                    setSelectedChat(null)
                    setPatientChats([])
                    setAnalysis(null)
                    setShowAnalysis(false)
                    setShowReports(false)
                    fetchPatientChats(patient.id)
                  }}
                  className={`w-full text-left p-4 rounded-lg border transition-colors ${
                    selectedPatient?.id === patient.id
                      ? 'bg-green-50 border-green-300'
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <div className="font-medium text-gray-900 mb-1">
                    {patient.name}
                  </div>
                  <div className="text-xs text-gray-500 mb-2">
                    {patient.email}
                  </div>
                  <div className="text-xs text-gray-600">
                    {patient._count?.chats || 0} chat{(patient._count?.chats || 0) !== 1 ? 's' : ''}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {selectedPatient ? (
          <>
            {/* Patient Header */}
            <div className="bg-white border-b border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{selectedPatient.name}</h2>
                  <p className="text-sm text-gray-500">{selectedPatient.email}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setShowReports(!showReports)
                      setShowAnalysis(false)
                    }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      showReports
                        ? 'bg-green-700 text-white'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    {showReports ? 'View Chats' : 'View Reports'}
                  </button>
                  <button
                    onClick={() => setShowReportDialog(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <FileText className="w-4 h-4" />
                    Generate Report
                  </button>
                  {selectedChat && (
                    <>
                      <button
                        onClick={() => {
                          setGuidance(selectedChat.therapistGuidance || '')
                          setShowGuidanceDialog(true)
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                        Set Chat Direction
                      </button>
                      <button
                        onClick={generateAnalysis}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                      >
                        <Brain className="w-4 h-4" />
                        {analysis ? 'Refresh Analysis' : 'Generate Analysis'}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
              {/* Chat List */}
              <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto p-4">
                <h3 className="font-semibold text-gray-900 mb-4">Chats</h3>
                {patientChats.length === 0 ? (
                  <div className="text-center text-gray-500 mt-8">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p>No approved chats available.</p>
                    <p className="text-sm mt-2">Patient needs to approve chat sharing.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {patientChats.map((chat) => (
                      <button
                        key={chat.id}
                        onClick={() => {
                          setSelectedChat(chat)
                          setShowAnalysis(false)
                          // Check if analysis exists in the chat object
                          if (chat.aiAnalyses && chat.aiAnalyses.length > 0) {
                            const existingAnalysis = chat.aiAnalyses[0]
                            setAnalysis(existingAnalysis)
                            setCorrections(existingAnalysis.therapistCorrections || '')
                          } else {
                            setAnalysis(null)
                            setCorrections('')
                          }
                        }}
                        className={`w-full text-left p-3 rounded-lg border transition-colors ${
                          selectedChat?.id === chat.id
                            ? 'bg-blue-50 border-blue-300'
                            : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        <div className="font-medium text-gray-900 text-sm mb-1 truncate">
                          {chat.title}
                        </div>
                        <div className="text-xs text-gray-500">
                          {chat.messages?.length || 0} messages
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Chat View / Analysis View / Reports View */}
              <div className="flex-1 flex flex-col">
                {showReports ? (
                  <div className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-4xl mx-auto">
                      <h3 className="text-2xl font-bold text-gray-900 mb-6">Reports for {selectedPatient.name}</h3>
                      {reports.length === 0 ? (
                        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                          <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                          <p className="text-gray-600 mb-2">No reports generated yet.</p>
                          <p className="text-sm text-gray-500">Generate a report to view it here.</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {reports.map((report) => (
                            <div
                              key={report.id}
                              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
                            >
                              <div className="flex items-start justify-between mb-4">
                                <div>
                                  <h4 className="text-lg font-semibold text-gray-900 mb-1">{report.title}</h4>
                                  <p className="text-sm text-gray-500">
                                    Generated on {new Date(report.createdAt).toLocaleString()}
                                  </p>
                                </div>
                                <button
                                  onClick={() => downloadReport(report)}
                                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                >
                                  <Download className="w-4 h-4" />
                                  Download
                                </button>
                              </div>
                              <div className="prose prose-sm max-w-none">
                                <div className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg border border-gray-200 max-h-64 overflow-y-auto">
                                  {report.content}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : selectedChat ? (
                  <div className="flex-1 flex">
                    {/* Chat Messages */}
                    <div className={`flex-1 ${showAnalysis ? 'w-1/2 border-r border-gray-200' : 'w-full'} overflow-y-auto p-6`}>
                      <div className="space-y-4">
                        {selectedChat.messages.map((msg) => (
                          <div
                            key={msg.id}
                            className={`flex ${
                              msg.role === 'user' ? 'justify-end' : 'justify-start'
                            }`}
                          >
                            <div
                              className={`max-w-3xl rounded-2xl p-4 ${
                                msg.role === 'user'
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-gray-100 text-gray-900'
                              }`}
                            >
                              <ReactMarkdown className="prose prose-sm max-w-none">
                                {msg.content}
                              </ReactMarkdown>
                              <div className={`text-xs mt-2 ${
                                msg.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                              }`}>
                                {new Date(msg.createdAt).toLocaleString()}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* AI Analysis Panel */}
                    {showAnalysis && analysis && (
                      <div className="w-1/2 overflow-y-auto p-6 bg-gray-50">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                            <Brain className="w-6 h-6 text-blue-600" />
                            AI Analysis
                          </h3>
                          <button
                            onClick={() => setShowAnalysis(false)}
                            className="text-gray-500 hover:text-gray-900"
                          >
                            ×
                          </button>
                        </div>

                        {/* Risk & Sentiment Indicators */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                          <div className="bg-white rounded-lg p-4 border border-gray-200">
                            <div className="text-sm text-gray-600 mb-1">Risk Level</div>
                            <div className={`text-xl font-bold ${
                              analysis.riskLevel?.toLowerCase() === 'high' ? 'text-red-600' :
                              analysis.riskLevel?.toLowerCase() === 'medium' ? 'text-yellow-600' :
                              analysis.riskLevel?.toLowerCase() === 'low' ? 'text-green-600' :
                              'text-gray-600'
                            }`}>
                              {analysis.riskLevel?.toUpperCase() || 'N/A'}
                            </div>
                          </div>
                          <div className="bg-white rounded-lg p-4 border border-gray-200">
                            <div className="text-sm text-gray-600 mb-1">Sentiment</div>
                            <div className={`text-xl font-bold ${
                              analysis.sentiment?.toLowerCase() === 'positive' ? 'text-green-600' :
                              analysis.sentiment?.toLowerCase() === 'negative' || analysis.sentiment?.toLowerCase() === 'concerning' ? 'text-red-600' :
                              analysis.sentiment?.toLowerCase() === 'neutral' ? 'text-gray-600' :
                              'text-gray-600'
                            }`}>
                              {analysis.sentiment?.toUpperCase() || 'N/A'}
                            </div>
                          </div>
                        </div>

                        {/* Analysis */}
                        <div className="bg-white rounded-lg p-4 border border-gray-200 mb-4">
                          <h4 className="font-semibold text-gray-900 mb-2">Analysis</h4>
                          <div className="prose prose-sm max-w-none">
                            <ReactMarkdown>{analysis.analysis}</ReactMarkdown>
                          </div>
                        </div>

                        {/* Predictions */}
                        {analysis.predictions && (
                          <div className="bg-white rounded-lg p-4 border border-gray-200 mb-4">
                            <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                              <TrendingUp className="w-4 h-4" />
                              Predictions
                            </h4>
                            <div className="prose prose-sm max-w-none">
                              <ReactMarkdown>{analysis.predictions}</ReactMarkdown>
                            </div>
                          </div>
                        )}

                        {/* Corrections */}
                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                              <Edit className="w-4 h-4" />
                              Your Corrections
                            </h4>
                            {!isEditingCorrections ? (
                              <button
                                onClick={() => setIsEditingCorrections(true)}
                                className="text-sm text-blue-600 hover:text-blue-700"
                              >
                                Edit
                              </button>
                            ) : (
                              <button
                                onClick={saveCorrections}
                                disabled={loading}
                                className="flex items-center gap-1 text-sm text-green-600 hover:text-green-700 disabled:opacity-50"
                              >
                                <Save className="w-3 h-3" />
                                Save
                              </button>
                            )}
                          </div>
                          {isEditingCorrections ? (
                            <textarea
                              value={corrections}
                              onChange={(e) => setCorrections(e.target.value)}
                              className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Add your corrections or notes about the AI analysis..."
                            />
                          ) : (
                            <div className="prose prose-sm max-w-none">
                              {corrections ? (
                                <ReactMarkdown>{corrections}</ReactMarkdown>
                              ) : (
                                <p className="text-gray-400 italic">No corrections added yet.</p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {analysis && !showAnalysis && (
                      <div className="fixed bottom-4 right-4 z-10">
                        <button
                          onClick={() => setShowAnalysis(true)}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                        >
                          <Brain className="w-4 h-4" />
                          View Analysis
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <MessageSquare className="w-24 h-24 mx-auto mb-6 text-gray-400" />
                      <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                        Select a Chat
                      </h2>
                      <p className="text-gray-600">
                        Choose a chat from the list to view conversation and AI analysis
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <User className="w-24 h-24 mx-auto mb-6 text-gray-400" />
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Select a Patient
              </h2>
              <p className="text-gray-600">
                Choose a patient from the sidebar to view their chats and analytics
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Chat Direction/Guidance Dialog */}
      {showGuidanceDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Set Chat Direction
            </h3>
            <p className="text-gray-600 mb-4">
              Provide guidance to influence how the AI chatbot responds to the patient. This will help steer the conversation in a specific direction or focus on particular areas.
            </p>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Guidance / Instructions
              </label>
              <textarea
                value={guidance}
                onChange={(e) => setGuidance(e.target.value)}
                placeholder="e.g., Focus on helping the patient challenge negative thoughts about exams. Emphasize self-compassion and realistic expectations. Guide them to explore alternative perspectives..."
                className="w-full h-48 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-2">
                This guidance will be incorporated into the AI's responses to help direct the conversation flow.
              </p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={updateGuidance}
                disabled={loading}
                className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Guidance'}
              </button>
              <button
                onClick={() => {
                  setShowGuidanceDialog(false)
                  fetchGuidance(selectedChat?.id || '')
                }}
                className="px-4 py-3 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Generation Dialog */}
      {showReportDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Generate Report
            </h3>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Report Title
              </label>
              <input
                type="text"
                value={reportTitle}
                onChange={(e) => setReportTitle(e.target.value)}
                placeholder="e.g., Monthly Progress Report - January 2024"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-4">
              <button
                onClick={generateReport}
                disabled={loading || !reportTitle.trim()}
                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Generating...' : 'Generate'}
              </button>
              <button
                onClick={() => {
                  setShowReportDialog(false)
                  setReportTitle('')
                }}
                className="px-4 py-3 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
