'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Send, Plus, LogOut, MessageSquare, Share2, CheckCircle, XCircle, Clock, Gamepad2, Trash2, TrendingUp } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import ActivitiesView from './components/ActivitiesView'
import TrackingView from './components/tracking/TrackingView'

interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  createdAt: string
}

interface Chat {
  id: string
  title: string
  createdAt: string
  updatedAt: string
  messages: Message[]
  consents?: Array<{
    id: string
    status: 'PENDING' | 'APPROVED' | 'REJECTED'
    requestedAt: string
  }>
}

export default function PatientDashboard() {
  const router = useRouter()
  const [chats, setChats] = useState<Chat[]>([])
  const [currentChat, setCurrentChat] = useState<Chat | null>(null)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [showConsentDialog, setShowConsentDialog] = useState(false)
  const [activeView, setActiveView] = useState<'chat' | 'activities' | 'health'>('chat')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchChats()
  }, [])

  useEffect(() => {
    if (currentChat?.id && currentChat.id !== 'temp-chat') {
      fetchChatDetails(currentChat.id)
    }
  }, [currentChat?.id])

  useEffect(() => {
    scrollToBottom()
  }, [currentChat?.messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchChats = async () => {
    try {
      const response = await fetch('/api/chat')
      if (response.status === 401) {
        router.push('/patient/login')
        return
      }
      const data = await response.json()
      setChats(data.chats || [])
    } catch (error) {
      console.error('Failed to fetch chats:', error)
    }
  }

  const fetchChatDetails = async (chatId: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/chat/${chatId}`)
      if (response.ok) {
        const data = await response.json()
        setCurrentChat(data.chat)
        return true
      } else {
        // If fetch fails, don't throw - just log it
        console.warn('Failed to fetch chat details, but message was sent')
        return false
      }
    } catch (error) {
      // Don't throw error here - message was already sent successfully
      console.warn('Error fetching chat details:', error)
      return false
    }
  }

  const handleNewChat = () => {
    setCurrentChat(null)
    setMessage('')
  }

  const handleDeleteChat = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent chat selection
    
    if (!confirm('Are you sure you want to delete this chat? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/chat/${chatId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        // If the deleted chat was currently selected, clear it
        if (currentChat?.id === chatId) {
          setCurrentChat(null)
          setMessage('')
        }
        // Refresh chat list
        await fetchChats()
      } else {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete chat')
      }
    } catch (error: any) {
      console.error('Failed to delete chat:', error)
      alert(error.message || 'Failed to delete chat. Please try again.')
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || loading) return

    const userMessage = message
    setMessage('')
    setLoading(true)

    // Optimistically add user message
    const tempUserMessage: Message = {
      id: 'temp-' + Date.now(),
      content: userMessage,
      role: 'user',
      createdAt: new Date().toISOString(),
    }

    if (!currentChat) {
      const newChat: Chat = {
        id: 'temp-chat',
        title: userMessage.substring(0, 50),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: [tempUserMessage],
      }
      setCurrentChat(newChat)
    } else {
      setCurrentChat({
        ...currentChat,
        messages: [...currentChat.messages, tempUserMessage],
      })
    }

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          chatId: currentChat?.id,
        }),
      })

      if (response.status === 401) {
        router.push('/patient/login')
        return
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || 'Failed to send message')
      }

      const data = await response.json()

      // Message was sent successfully, update UI immediately
      if (data.chat) {
        // API returned the full chat object - use it directly
        setCurrentChat(data.chat)
        fetchChats().catch(err => console.warn('Failed to refresh chat list:', err))
      } else if (currentChat?.id === 'temp-chat') {
        // New chat was created - fetch the real chat data
        fetchChats().catch(err => console.warn('Failed to refresh chat list:', err))
        await fetchChatDetails(data.chatId)
      } else if (currentChat?.id) {
        // Existing chat - refresh to get AI response
        await fetchChatDetails(currentChat.id)
      }
    } catch (error: any) {
      console.error('Failed to send message:', error)
      // Only show alert if the actual message send failed
      alert(error.message || 'Failed to send message. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleRequestConsent = () => {
    if (!currentChat) return
    setShowConsentDialog(true)
  }

  const handleConsentDecision = async (status: 'APPROVED' | 'REJECTED') => {
    if (!currentChat?.id) return

    const chatId = currentChat.id

    try {
      // First create consent request if it doesn't exist
      const requestResponse = await fetch('/api/consent/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId }),
      })

      if (!requestResponse.ok && requestResponse.status !== 400) {
        throw new Error('Failed to create consent request')
      }

      // Then update the status
      const response = await fetch('/api/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId,
          status,
        }),
      })

      if (response.ok) {
        setShowConsentDialog(false)
        await fetchChatDetails(chatId)
        await fetchChats() // Refresh chat list to update consent status
      } else {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update consent')
      }
    } catch (error: any) {
      console.error('Failed to update consent:', error)
      alert(error.message || 'Failed to update consent. Please try again.')
    }
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/patient/login')
  }

  const getConsentStatus = (chat: Chat) => {
    if (!chat.consents || chat.consents.length === 0) return null
    const latestConsent = chat.consents[0]
    return latestConsent.status
  }

  const hasPendingConsent = currentChat?.consents?.some(c => c.status === 'PENDING')

  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex overflow-hidden">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Mental Health Companion</h1>
          
          {/* Navigation Tabs */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setActiveView('chat')}
              className={`flex-1 px-3 py-2 rounded-lg transition-colors text-sm ${
                activeView === 'chat'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <MessageSquare className="w-4 h-4 inline mr-1" />
              Chat
            </button>
            <button
              onClick={() => setActiveView('health')}
              className={`flex-1 px-3 py-2 rounded-lg transition-colors text-sm ${
                activeView === 'health'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <TrendingUp className="w-4 h-4 inline mr-1" />
              My Health
            </button>
            <button
              onClick={() => setActiveView('activities')}
              className={`flex-1 px-3 py-2 rounded-lg transition-colors text-sm ${
                activeView === 'activities'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Gamepad2 className="w-4 h-4 inline mr-1" />
              Activities
            </button>
          </div>

          {activeView === 'chat' && (
            <>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-gray-700">My Chats</span>
                <button
                  onClick={handleNewChat}
                  className="p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </>
          )}

          
          <button
            onClick={handleLogout}
            className="text-sm text-gray-600 hover:text-gray-900 w-full text-left"
          >
            <LogOut className="w-4 h-4 inline mr-1" />
            Logout
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {chats.length === 0 ? (
            <div className="text-center text-gray-500 mt-8">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>No chats yet. Start a new conversation!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {chats.map((chat) => {
                const consentStatus = getConsentStatus(chat)
                return (
                  <div
                    key={chat.id}
                    className={`relative group rounded-lg border transition-colors ${
                      currentChat?.id === chat.id
                        ? 'bg-primary-50 border-primary-300'
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <button
                      onClick={() => setCurrentChat(chat)}
                      className="w-full text-left p-4 pr-10"
                    >
                      <div className="font-medium text-gray-900 mb-1 truncate">
                        {chat.title}
                      </div>
                      <div className="text-xs text-gray-500 mb-2">
                        {new Date(chat.updatedAt).toLocaleDateString()}
                      </div>
                      {consentStatus && (
                        <div className="flex items-center text-xs">
                          {consentStatus === 'APPROVED' && (
                            <CheckCircle className="w-3 h-3 text-green-600 mr-1" />
                          )}
                          {consentStatus === 'REJECTED' && (
                            <XCircle className="w-3 h-3 text-red-600 mr-1" />
                          )}
                          {consentStatus === 'PENDING' && (
                            <Clock className="w-3 h-3 text-yellow-600 mr-1" />
                          )}
                          <span className={`${
                            consentStatus === 'APPROVED' ? 'text-green-600' :
                            consentStatus === 'REJECTED' ? 'text-red-600' :
                            'text-yellow-600'
                          }`}>
                            {consentStatus}
                          </span>
                        </div>
                      )}
                    </button>
                    <button
                      onClick={(e) => handleDeleteChat(chat.id, e)}
                      className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors opacity-0 group-hover:opacity-100"
                      title="Delete chat"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      {activeView === 'chat' && (
        <div className="flex-1 flex flex-col min-h-0">
          {currentChat ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between flex-shrink-0">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{currentChat.title}</h2>
                <p className="text-sm text-gray-500">
                  {new Date(currentChat.createdAt).toLocaleDateString()}
                </p>
              </div>
              {!hasPendingConsent && getConsentStatus(currentChat) !== 'APPROVED' && (
                <button
                  onClick={handleRequestConsent}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  Share with Therapist
                </button>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 min-h-0">
              {currentChat.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-3xl rounded-2xl p-4 ${
                      msg.role === 'user'
                        ? 'bg-primary-600 text-white'
                        : 'bg-white border border-gray-200 text-gray-900'
                    }`}
                  >
                    <ReactMarkdown className="prose prose-sm max-w-none">
                      {msg.content}
                    </ReactMarkdown>
                    <div className={`text-xs mt-2 ${
                      msg.role === 'user' ? 'text-primary-100' : 'text-gray-500'
                    }`}>
                      {new Date(msg.createdAt).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 rounded-2xl p-4">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="bg-white border-t border-gray-200 p-4 flex-shrink-0">
              <div className="flex gap-4">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading || !message.trim()}
                  className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  Send
                </button>
              </div>
            </form>
          </>
        ) : (
          <>
            {/* Empty State with Message Input */}
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex-1 flex items-center justify-center min-h-0">
                <div className="text-center max-w-md">
                  <MessageSquare className="w-24 h-24 mx-auto mb-6 text-gray-400" />
                  <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                    Start a New Conversation
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Type your message below to begin chatting with your AI companion
                  </p>
                </div>
              </div>

      {/* Message Input - Always visible */}
      <form onSubmit={handleSendMessage} className="bg-white border-t border-gray-200 p-4 flex-shrink-0">
                <div className="flex gap-4">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message to start a new chat..."
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    disabled={loading}
                    autoFocus
                  />
                  <button
                    type="submit"
                    disabled={loading || !message.trim()}
                    className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Send className="w-5 h-5" />
                    Send
                  </button>
                </div>
              </form>
            </div>
          </>
          )}
        </div>
      )}

      {activeView === 'health' && (
        <div className="flex-1 flex flex-col min-h-0 bg-white">
          <TrackingView onClose={() => setActiveView('chat')} />
        </div>
      )}

      {activeView === 'activities' && (
        <div className="flex-1 flex flex-col min-h-0 bg-white">
          <ActivitiesView />
        </div>
      )}

      {/* Consent Dialog */}
      {showConsentDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Share Chat with Therapist?
            </h3>
            <p className="text-gray-600 mb-6">
              Your therapist will be able to see this conversation history, AI analysis, and predictions to provide better guidance. You can revoke this consent at any time.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => handleConsentDecision('APPROVED')}
                className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Approve
              </button>
              <button
                onClick={() => handleConsentDecision('REJECTED')}
                className="flex-1 px-4 py-3 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Decline
              </button>
              <button
                onClick={() => setShowConsentDialog(false)}
                className="px-4 py-3 text-gray-600 hover:text-gray-900"
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
