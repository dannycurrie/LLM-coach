import { useEffect, useState, useRef } from "react"
import { useChat } from "../hooks/useChat"
import { SessionType } from "../constants/systemPrompts"

type ChatViewProps = {
  plan: string
  sessionType?: SessionType
  setSessionType: (sessionType: SessionType) => void
}

export default function ChatView({ plan = '', sessionType = 'refinement', setSessionType }: ChatViewProps) {
    const { messages, sendMessage, clearMessages, isLoading, error } = useChat({ plan, sessionType })
    const [messageInput, setMessageInput] = useState<string>('')
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    const [isEnabled, setIsEnabled] = useState<boolean>(plan.trim() !== '')
    useEffect(() => {
        setIsEnabled(plan.trim() !== '')
    }, [plan])

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages, isLoading])

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto'
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
        }
    }, [messageInput])

    const handleSendMessage = async () => {
        if (!messageInput.trim() || isLoading) return
        const message = messageInput.trim()
        setMessageInput('')
        await sendMessage(message)
    }

    const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSendMessage()
        }
    }

    const handleClearMessages = () => {
        clearMessages()
        setMessageInput('')
    }

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            width: '100%',
            backgroundColor: '#f5f5f5'
        }}>
            {/* Header */}
            <div className="chat-header" style={{
                borderBottom: '1px solid #e0e0e0',
                backgroundColor: '#ffffff',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    flexWrap: 'wrap'
                }}>
                    <h2 className="chat-title" style={{
                        margin: 0,
                        color: '#333'
                    }}>
                        Chat
                    </h2>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        flexWrap: 'wrap'
                    }}>
                        <label htmlFor="sessionType" style={{ fontSize: '0.875rem', whiteSpace: 'nowrap' }}>Session Type:</label>
                        <select
                            id="sessionType"
                            value={sessionType}
                            onChange={(e) => setSessionType(e.target.value as SessionType)}
                            style={{
                                padding: '0.5rem 1rem',
                                fontSize: '0.875rem',
                                color: '#666',
                                backgroundColor: 'transparent',
                                border: '1px solid #e0e0e0',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                        }}
                    >
                        <option value="brainstorm">Brainstorm</option>
                            <option value="refinement">Refinement</option>
                            <option value="project_planning">Project Planning</option>
                            <option value="action_planning">Action Planning</option>
                            <option value="creative">Creative</option>
                        </select>
                    </div>
                </div>
                {isEnabled && messages.length > 0 && (
                    <button
                        onClick={handleClearMessages}
                        style={{
                            padding: '0.5rem 1rem',
                            fontSize: '0.875rem',
                            color: '#666',
                            backgroundColor: 'transparent',
                            border: '1px solid #e0e0e0',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.backgroundColor = '#f5f5f5'
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent'
                        }}
                    >
                        Clear
                    </button>
                )}
            </div>

            {/* Messages Container */}
            <div className="chat-messages-container" style={{
                flex: 1,
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
            }}>
                {!isEnabled ? (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%',
                        color: '#999',
                        fontSize: '0.95rem'
                    }}>
                        <p>Please submit a plan to enable the chat</p>
                    </div>
                ) : messages.length === 0 ? (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%',
                        color: '#999',
                        fontSize: '0.95rem'
                    }}>
                        <p>Start a conversation...</p>
                    </div>
                ) : (
                    <>
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                style={{
                                    display: 'flex',
                                    justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
                                    width: '100%'
                                }}
                            >
                                <div className="chat-message-bubble" style={{
                                    padding: '0.75rem 1rem',
                                    borderRadius: '12px',
                                    backgroundColor: message.role === 'user' ? '#007bff' : '#ffffff',
                                    color: message.role === 'user' ? '#ffffff' : '#333',
                                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
                                    wordWrap: 'break-word',
                                    whiteSpace: 'pre-wrap',
                                    lineHeight: '1.5'
                                }}>
                                    {message.content}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div style={{
                                display: 'flex',
                                justifyContent: 'flex-start',
                                width: '100%'
                            }}>
                                <div style={{
                                    maxWidth: '75%',
                                    padding: '0.75rem 1rem',
                                    borderRadius: '12px',
                                    backgroundColor: '#ffffff',
                                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
                                    display: 'flex',
                                    gap: '0.5rem',
                                    alignItems: 'center'
                                }}>
                                    <div style={{
                                        width: '8px',
                                        height: '8px',
                                        borderRadius: '50%',
                                        backgroundColor: '#999',
                                        animation: 'pulse 1.4s ease-in-out infinite',
                                        animationDelay: '0s'
                                    }}></div>
                                    <div style={{
                                        width: '8px',
                                        height: '8px',
                                        borderRadius: '50%',
                                        backgroundColor: '#999',
                                        animation: 'pulse 1.4s ease-in-out infinite',
                                        animationDelay: '0.2s'
                                    }}></div>
                                    <div style={{
                                        width: '8px',
                                        height: '8px',
                                        borderRadius: '50%',
                                        backgroundColor: '#999',
                                        animation: 'pulse 1.4s ease-in-out infinite',
                                        animationDelay: '0.4s'
                                    }}></div>
                                </div>
                            </div>
                        )}
                        {error && (
                            <div style={{
                                padding: '0.75rem 1rem',
                                backgroundColor: '#fee',
                                color: '#c33',
                                borderRadius: '8px',
                                fontSize: '0.875rem',
                                border: '1px solid #fcc'
                            }}>
                                Error: {error}
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>

            {/* Input Area */}
            {isEnabled && (
                <div className="chat-input-container" style={{
                    borderTop: '1px solid #e0e0e0',
                    backgroundColor: '#ffffff'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'flex-end'
                    }}>
                        <textarea
                            ref={textareaRef}
                            value={messageInput}
                            onChange={(e) => setMessageInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Type your message... (Press Enter to send, Shift+Enter for new line)"
                            disabled={isLoading}
                            className="chat-input-textarea"
                            style={{
                                flex: 1,
                                border: '1px solid #e0e0e0',
                                borderRadius: '8px',
                                fontFamily: 'inherit',
                                resize: 'none',
                                maxHeight: '120px',
                                outline: 'none',
                                transition: 'border-color 0.2s'
                            }}
                            onFocus={(e) => {
                                e.currentTarget.style.borderColor = '#007bff'
                            }}
                            onBlur={(e) => {
                                e.currentTarget.style.borderColor = '#e0e0e0'
                            }}
                        />
                        <button
                            onClick={handleSendMessage}
                            disabled={!messageInput.trim() || isLoading}
                            className="chat-send-button"
                            style={{
                                backgroundColor: messageInput.trim() && !isLoading ? '#007bff' : '#ccc',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '8px',
                                fontWeight: 500,
                                cursor: messageInput.trim() && !isLoading ? 'pointer' : 'not-allowed',
                                transition: 'background-color 0.2s',
                                whiteSpace: 'nowrap'
                            }}
                            onMouseOver={(e) => {
                                if (messageInput.trim() && !isLoading) {
                                    e.currentTarget.style.backgroundColor = '#0056b3'
                                }
                            }}
                            onMouseOut={(e) => {
                                if (messageInput.trim() && !isLoading) {
                                    e.currentTarget.style.backgroundColor = '#007bff'
                                }
                            }}
                        >
                            Send
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}