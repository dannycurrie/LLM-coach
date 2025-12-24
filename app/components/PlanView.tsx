import { useState, useEffect } from "react"

type PlanViewProps = {
  plan: string
  setPlan: (plan: string) => void
}

export default function PlanView({ plan, setPlan }: PlanViewProps) {
  const [value, setValue] = useState<string>(plan)

  // Sync local state with plan prop when it changes externally
  useEffect(() => {
    setValue(plan)
  }, [plan])

  const handleSubmitPlan = (planText: string) => {
    setPlan(planText)
    console.log('Plan submitted:', planText)
  }

  return (
    <div style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column' }}>
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Paste your plan here..."
        style={{
          width: '100%',
          height: '100%',
          padding: '1rem',
          border: 'none',
          outline: 'none',
          resize: 'none',
          fontFamily: 'monospace',
          fontSize: '14px',
          lineHeight: '1.5'
        }}
      />
      <button onClick={() => handleSubmitPlan(value)}>Submit Plan</button>
    </div>
  )
}