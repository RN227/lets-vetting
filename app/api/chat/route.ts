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
    const { petId, conversationId, userMessage, pet: petData, messages: messagesData } = body;

    // Validate input
    if (!petId || !conversationId || !userMessage) {
      return NextResponse.json(
        { error: 'Missing required fields: petId, conversationId, userMessage' },
        { status: 400 }
      );
    }

    // Validate pet data (either passed from client or fetch from Firestore)
    let pet: { name: string; species: string; age: number; breed: string; weight: number; gender: string };
    if (petData) {
      // Use pet data passed from client (preferred to avoid server-side Firestore auth)
      pet = petData;
    } else {
      // Fallback: try to fetch from Firestore (requires auth context)
      const fetchedPet = await getPetById(petId);
      if (!fetchedPet) {
        return NextResponse.json(
          { error: 'Pet not found' },
          { status: 404 }
        );
      }
      pet = {
        name: fetchedPet.name,
        species: fetchedPet.species,
        age: fetchedPet.age,
        breed: fetchedPet.breed,
        weight: fetchedPet.weight,
        gender: fetchedPet.gender,
      };
    }

    // Validate API key
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'ANTHROPIC_API_KEY not configured' },
        { status: 500 }
      );
    }

    // Get conversation history (either passed from client or fetch from Firestore)
    let messages: Array<{ role: 'user' | 'assistant'; content: string }>;
    if (messagesData && Array.isArray(messagesData)) {
      // Use messages passed from client (preferred to avoid server-side Firestore auth)
      messages = messagesData;
    } else {
      // Fallback: try to fetch from Firestore (requires auth context)
      const fetchedMessages = await getConversationMessages(conversationId);
      messages = fetchedMessages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));
    }

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
- Gender: ${pet.gender}

GUIDELINES:
1. Be reassuring and calming - pet owners are often very worried about their pets. Start with reassurance when appropriate
2. Keep responses concise - aim for 2-4 sentences maximum. Get to the point quickly
3. Use a warm, supportive tone that acknowledges their concern while providing clear guidance
4. Ask only essential clarifying questions - keep it brief
5. Provide clear, actionable guidance appropriate for the symptom severity
6. Use simple language, avoiding excessive medical jargon
7. When appropriate, suggest home monitoring vs. immediate vet visit
8. Consider the pet's age, species, and breed in your responses
9. Prioritize being helpful and reassuring over being comprehensive

Remember: Your goal is to help pet owners make informed decisions about their pet's care, not to replace professional veterinary consultation. Keep responses short, reassuring, and actionable.`;

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
      max_tokens: 512, // Reduced to encourage more concise responses
      system: systemPrompt,
      messages: conversationMessages,
    });

    // Extract the assistant's response
    const assistantMessage = response.content[0];
    if (assistantMessage.type !== 'text') {
      throw new Error('Unexpected response type from Anthropic API');
    }

    // Generate contextual pills based on the assistant's response
    // Ask Claude to suggest up to 3 follow-up questions or actions
    const pillsPrompt = `Based on your previous response about ${pet.name}'s health, suggest up to 3 short, actionable follow-up questions or actions that would help the pet owner provide more information or take next steps. Each suggestion should be:
- Short (3-6 words max)
- Actionable and specific
- Relevant to the conversation context
- Written as a question or action phrase

Return ONLY a JSON array of strings, nothing else. Example: ["How long has this been happening?", "Is there any discharge?", "What is their appetite like?"]

Your response: ${assistantMessage.text}

Suggestions:`;

    let contextualPills: string[] = [];
    try {
      const pillsResponse = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 100,
        system: 'You are a helpful assistant that generates short, actionable follow-up questions for pet health conversations. Return only a JSON array of strings.',
        messages: [{
          role: 'user',
          content: pillsPrompt,
        }],
      });

      const pillsMessage = pillsResponse.content[0];
      if (pillsMessage.type === 'text') {
          try {
            // Try to parse JSON from the response
            const jsonMatch = pillsMessage.text.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
              contextualPills = JSON.parse(jsonMatch[0]);
              // Limit to 3 pills and ensure they're strings
              contextualPills = contextualPills
                .slice(0, 3)
                .filter((pill: any) => typeof pill === 'string' && pill.trim().length > 0)
                .map((pill: string) => pill.trim());
            }
          } catch (parseError) {
            // If parsing fails, use empty array
            contextualPills = [];
          }
      }
    } catch (pillsError) {
      // If pill generation fails, continue without pills
      contextualPills = [];
    }

    // Return the AI response and contextual pills
    return NextResponse.json({
      response: assistantMessage.text,
      contextualPills: contextualPills.slice(0, 3), // Ensure max 3 pills
    });
  } catch (error: any) {
    console.error('Error in chat API route:', error);

    // Handle Anthropic API authentication errors
    if (error?.status === 401 || error?.message?.includes('authentication_error') || error?.message?.includes('invalid x-api-key')) {
      console.error('Anthropic API authentication failed. Check your API key.');
      const isProduction = process.env.VERCEL_ENV === 'production' || process.env.NODE_ENV === 'production';
      const errorMessage = isProduction
        ? 'Invalid API key. Please check your ANTHROPIC_API_KEY environment variable in Vercel dashboard.'
        : 'Invalid API key. Please check your ANTHROPIC_API_KEY in .env.local';
      return NextResponse.json(
        { 
          error: errorMessage,
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
