'use client'
import { useState } from 'react'
import ChatView from './components/ChatView'
import PlanView from './components/PlanView'
import Login from './components/Login'
import { useAuth } from './hooks/useAuth'
import { SessionType } from './constants/systemPrompts'

type TabType = 'chat' | 'plan'

export default function Home() {
  const { isAuthenticated, login } = useAuth()
  const [plan, setPlan] = useState<string>('')
  const [sessionType, setSessionType] = useState<SessionType>('refinement')
  const [activeTab, setActiveTab] = useState<TabType>('chat')

  // Show login screen if not authenticated
  if (isAuthenticated === null) {
    return null // Loading state
  }

  if (!isAuthenticated) {
    return <Login onLogin={login} />
  }

  return (
    <main className="main-container">
      {/* Mobile Tabs */}
      <div className="mobile-tabs">
        <button
          className={`mobile-tab ${activeTab === 'chat' ? 'active' : ''}`}
          onClick={() => setActiveTab('chat')}
        >
          Chat
        </button>
        <button
          className={`mobile-tab ${activeTab === 'plan' ? 'active' : ''}`}
          onClick={() => setActiveTab('plan')}
        >
          Plan
        </button>
      </div>

      {/* Chat side */}
      <div className={`chat-container ${activeTab === 'chat' ? 'active' : ''}`}>
        <ChatView 
          plan={plan} 
          sessionType={sessionType} 
          setSessionType={setSessionType} />
      </div>
      
      {/* Plan side */}
      <div className={`plan-container ${activeTab === 'plan' ? 'active' : ''}`}>
        <div data-color-mode="light" style={{ height: '100%', width: '100%', minHeight: 0 }}>
          <PlanView plan={plan} setPlan={setPlan} />
        </div>
      </div>
    </main>
  )
}

