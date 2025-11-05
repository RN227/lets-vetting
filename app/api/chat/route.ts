import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

// Force dynamic rendering - prevents Firebase from initializing during build
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { getPetById } from '@/lib/services/pets';
import { getConversationMessages } from '@/lib/services/conversations';

// Initialize Anthropic client
// Note: We'll initialize it per-request to ensure fresh env vars
function getAnthropicClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY not configured');
  }
  return new Anthropic({
    apiKey: apiKey.trim(), // Remove any whitespace
  });
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { petId, conversationId, userMessage } = body;

    // Validate input
    if (!petId || !conversationId || !userMessage) {
      return NextResponse.json(
        { error: 'Missing required fields: petId, conversationId, userMessage' },
        { status: 400 }
      );
    }

    // Validate API key
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      console.error('ANTHROPIC_API_KEY not found in environment variables');
      return NextResponse.json(
        { error: 'ANTHROPIC_API_KEY not configured' },
        { status: 500 }
      );
    }

    // Log API key info (without exposing the full key)
    console.log('Anthropic API Key check:', {
      exists: !!apiKey,
      length: apiKey.length,
      startsWith: apiKey.substring(0, 10),
    });

    // Fetch pet details
    const pet = await getPetById(petId);
    if (!pet) {
      return NextResponse.json(
        { error: 'Pet not found' },
        { status: 404 }
      );
    }

    // Fetch conversation history
    const messages = await getConversationMessages(conversationId);

    // Build system prompt with pet details and disclaimer
    const systemPrompt = `You are a helpful veterinary information assistant for LetsVet, a pet health triage application. Your role is to provide educational information and guidance about pet health concerns.

IMPORTANT DISCLAIMERS:
- You provide educational information only, NOT medical diagnoses
- Always remind users to consult a licensed veterinarian for serious concerns
- You cannot prescribe medications or provide definitive diagnoses
- When symptoms suggest urgency, clearly recommend immediate veterinary care

CURRENT PET INFORMATION:
- Name: ${pet.name}
- Species: ${pet.species.charAt(0).toUpperCase() + pet.species.slice(1)}
- Age: ${pet.age} ${pet.age === 1 ? 'year' : 'years'} old
- Breed: ${pet.breed}
- Weight: ${pet.weight} kg

GUIDELINES:
1. Be empathetic and supportive - pet owners are often worried
2. Ask clarifying questions when needed to better understand the situation
3. Provide clear, actionable guidance appropriate for the symptom severity
4. Use simple language, avoiding excessive medical jargon
5. When appropriate, suggest home monitoring vs. immediate vet visit
6. Consider the pet's age, species, and breed in your responses
7. Be concise but thorough - aim for helpful, not overwhelming

Remember: Your goal is to help pet owners make informed decisions about their pet's care, not to replace professional veterinary consultation.`;

    // Format conversation history for Anthropic API
    const conversationMessages: Anthropic.MessageParam[] = messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    // Add the new user message
    conversationMessages.push({
      role: 'user',
      content: userMessage,
    });

    // Call Anthropic API
    const anthropic = getAnthropicClient();
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemPrompt,
      messages: conversationMessages,
    });

    // Extract the assistant's response
    const assistantMessage = response.content[0];
    if (assistantMessage.type !== 'text') {
      throw new Error('Unexpected response type from Anthropic API');
    }

    // Return the AI response
    return NextResponse.json({
      response: assistantMessage.text,
    });
  } catch (error: any) {
    console.error('Error in chat API route:', error);

    // Handle Anthropic API authentication errors
    if (error?.status === 401 || error?.message?.includes('authentication_error') || error?.message?.includes('invalid x-api-key')) {
      console.error('Anthropic API authentication failed. Check your API key.');
      return NextResponse.json(
        { 
          error: 'Invalid API key. Please check your ANTHROPIC_API_KEY in .env.local',
          details: 'The API key may be invalid, expired, or incorrectly formatted.'
        },
        { status: 401 }
      );
    }

    // Handle specific error types
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
