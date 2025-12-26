import { useState, useCallback } from 'react'

export type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

type UseChatOptions = {
  sessionType?: 'brainstorm' | 'refinement' | 'project_planning' | 'action_planning' | 'creative'
  plan?: string
}

type UseChatReturn = {
  messages: ChatMessage[]
  isLoading: boolean
  error: string | null
  sendMessage: (content: string) => Promise<void>
  clearMessages: () => void
}

/**
 * Custom hook for managing chat messages and LLM interactions
 */
export function useChat(options: UseChatOptions = {
  sessionType: 'refinement',
  plan: '',
}): UseChatReturn {

  const sessionType = options.sessionType
  const plan = options.plan
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUserMessage, setLastUserMessage] = useState<string | null>(null)

  /**
   * Add a message to the chat
   */
  const addMessage = useCallback((role: 'user' | 'assistant', content: string) => {
    const newMessage: ChatMessage = {
      id: `${Date.now()}-${Math.random()}`,
      role,
      content,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, newMessage])
  }, [])

  /**
   * Clear all messages
   */
  const clearMessages = useCallback(() => {
    setMessages([])
    setError(null)
    setLastUserMessage(null)
  }, [])


  /**
   * Send a message to the LLM and get a response
   */
  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim()) {
        setError('Message cannot be empty')
        return
      }

      setIsLoading(true)
      setError(null)

      // Add user message immediately
      const userMessage: ChatMessage = {
        id: `${Date.now()}-${Math.random()}`,
        role: 'user',
        content,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, userMessage])
      setLastUserMessage(content)

      try {
        // Prepare all messages for the API (convert ChatMessage to API format)
        const apiMessages = [...messages, userMessage].map(msg => ({
          role: msg.role,
          content: msg.content,
        }))
        
        // Call LLM with retry logic
        const response = await fetch(
          '/api/llm-chat',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ messages: apiMessages, sessionType, plan }),
          }
        ).then(res => res.json())

        // Add assistant response
        const assistantMessage: ChatMessage = {
          id: `${Date.now()}-${Math.random()}`,
          role: 'assistant',
          content: response.message,
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, assistantMessage])
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to get response from LLM'
        setError(errorMessage)

        // Optionally, you could add an error message to the chat
        // addMessage('assistant', `Error: ${errorMessage}`)
      } finally {
        setIsLoading(false)
      }
    },
    [sessionType, plan, messages]
  )

  /**
   * Retry the last user message
   */
  const retryLastMessage = useCallback(async () => {
    if (lastUserMessage) {
      // Remove the last assistant message if it exists (in case of error)
      setMessages((prev) => {
        const newMessages = [...prev]
        if (newMessages[newMessages.length - 1]?.role === 'assistant') {
          newMessages.pop()
        }
        return newMessages
      })
      await sendMessage(lastUserMessage)
    }
  }, [lastUserMessage, sendMessage])

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
  }
}

