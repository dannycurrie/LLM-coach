import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import Anthropic from '@anthropic-ai/sdk'
import { getSystemPrompt } from '@/app/constants/systemPrompts'

const MODEL = 'claude-3-5-haiku-20241022'
const USE_MOCK_LLM = process.env.USE_MOCK_LLM === 'true'
if (USE_MOCK_LLM) {
  console.log('Using mock LLM')
}

async function mockLLMCall(messages: Array<{ role: string; content: string }>, systemPrompt: string, plan: string = ''): Promise<string> {
  
  console.log('Mock LLM call')
  console.log(messages)
  console.log(systemPrompt)
  console.log(plan)
  console.log('--------------------------------')
  
    // Simulate network delay (500ms - 2s)
  const delay = Math.random() * 1500 + 500
  await new Promise((resolve) => setTimeout(resolve, delay))

  // Simulate occasional failures (10% failure rate for testing retry logic)
//   if (Math.random() < 0.1) {
//     throw new Error('Mock API error: Failed to generate response')
//   }
  return `Mock response to: "${messages.map((m) => m.content).join('\n')}". This is a placeholder response from the LLM.`
}

// Schema for a chat message (without id and timestamp, as those are client-side)
const chatMessageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string().min(1, 'Message content cannot be empty'),
})

// Schema for the request body
const llmChatRequestSchema = z.object({
  messages: z.array(chatMessageSchema).min(1, 'At least one message is required'),
  sessionType: z.enum(['brainstorm', 'refinement', 'project_planning', 'action_planning', 'creative']),
  plan: z.string().optional(),
})

const callAnthropicAPI = async (messages: Array<{ role: string; content: string }>, systemPrompt: string): Promise<string> => {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    throw new Error('LLM provider error: ANTHROPIC_API_KEY environment variable is not set')
  }
  const anthropic = new Anthropic({
    apiKey: apiKey,
  })
  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 4096,
    system: systemPrompt,
    messages: messages as Array<{ role: 'user' | 'assistant'; content: string }>,
  })
  return response.content.filter((block: { type: string }) => block.type === 'text').map((block: { type: string; text?: string }) => (block.type === 'text' && block.text ? block.text : '')).join('')
}

/**
 * LLM Provider - calls Anthropic API
 * This function is provider-agnostic - the rest of the code doesn't need to know which provider is used
 */
async function callLLMProvider(messages: Array<{ role: string; content: string }>, systemPrompt: string): Promise<string> {

  if (USE_MOCK_LLM) {
    return mockLLMCall(messages, systemPrompt)
  }

  const response = await callAnthropicAPI(messages, systemPrompt)
  if (!response) {
    throw new Error('LLM provider error: Empty response from API')
  }
  return response
}


/**
 * POST handler for LLM chat API
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate the request body using Zod
    const validatedData = llmChatRequestSchema.parse(body)

    const sessionType = validatedData.sessionType
    const plan = validatedData.plan ?? ''
    const systemPrompt = getSystemPrompt(sessionType, plan) 

    // Call the LLM provider
    const response = await callLLMProvider(validatedData.messages, systemPrompt)

    return NextResponse.json(
      {
        success: true,
        message: response,
        metadata: {
          messageCount: validatedData.messages.length,
          timestamp: new Date().toISOString(),
        },
      },
      { status: 200 }
    )
  } catch (error) {
    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request data',
          details: error.errors.map((err) => ({
            path: err.path.join('.'),
            message: err.message,
          })),
        },
        { status: 400 }
      )
    }

    // Handle LLM provider errors
    if (error instanceof Error && error.message.includes('LLM provider')) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 503 } // Service Unavailable
      )
    }

    // Handle unexpected errors
    console.error('LLM Chat API Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    )
  }
}

/**
 * GET handler - returns API documentation
 */
export async function GET() {
  return NextResponse.json(
    {
      endpoint: '/api/llm-chat',
      method: 'POST',
      description: 'Send messages to the LLM provider and receive a response',
      requestBody: {
        messages: [
          {
            role: 'user | assistant | system',
            content: 'string (required)',
          },
        ],
      },
      response: {
        success: 'boolean',
        message: 'string (LLM response)',
        metadata: {
          messageCount: 'number',
          timestamp: 'string (ISO date)',
        },
      },
    },
    { status: 200 }
  )
}

