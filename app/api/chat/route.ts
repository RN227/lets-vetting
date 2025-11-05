import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getPetById } from '@/lib/services/pets';
import { getConversationMessages } from '@/lib/services/conversations';

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

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
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'ANTHROPIC_API_KEY not configured' },
        { status: 500 }
      );
    }

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
  } catch (error) {
    console.error('Error in chat API route:', error);

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
