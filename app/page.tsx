'use client'
import { useState } from 'react'
import ChatView from './components/ChatView'
import PlanView from './components/PlanView'
import { SessionType } from './constants/systemPrompts'

export default function Home() {
  const [plan, setPlan] = useState<string>('')
  const [sessionType, setSessionType] = useState<SessionType>('refinement')

  return (
    <main style={{ 
      display: 'flex', 
      height: '100vh', 
      width: '100vw',
      overflow: 'hidden'
    }}>
      {/* Left side */}
      <div style={{
        flex: 1,
        borderRight: '1px solid #e0e0e0',
        padding: '1rem'
      }}>
        <ChatView 
          plan={plan} 
          sessionType={sessionType} 
          setSessionType={setSessionType} />
      </div>
      
      {/* Right side */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden'
      }}>
        <div data-color-mode="light" style={{ height: '100%', width: '100%' }}>
          <PlanView plan={plan} setPlan={setPlan} />
        </div>
      </div>
    </main>
  )
}

