'use client';

import { Suspense } from 'react';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import { getPetById } from '@/lib/services/pets';
import {
  createConversation,
  addMessage,
  getConversationMessages,
  updateMessageFeedback
} from '@/lib/services/conversations';
import { useAuth } from '@/lib/auth-context';
import type { Pet, Message } from '@/types';

function ChatPageContent() {
  // ALL HOOKS MUST BE CALLED FIRST - before any conditional returns
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading, signOut, isAnonymous } = useAuth();

  const [pet, setPet] = useState<Pet | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tickerIndex, setTickerIndex] = useState(0);

  const petId = searchParams.get('petId');
  const existingConversationId = searchParams.get('conversationId');
  const isAnon = isAnonymous();

  // Ticker words for loading state
  const tickerWords = ['Thinking', 'Analyzing', 'Responding', 'Preparing'];

  // Animate ticker when sending
  useEffect(() => {
    if (!sending) {
      setTickerIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % tickerWords.length);
    }, 1500); // Change word every 1.5 seconds

    return () => clearInterval(interval);
  }, [sending, tickerWords.length]);

  // Initialize: Fetch pet and create/load conversation
  useEffect(() => {
    async function initialize() {
      // Wait for auth to finish loading
      if (authLoading) {
        return;
      }

      // User must be authenticated (can be anonymous)
      if (!user) {
        setError('Authentication required');
        setLoading(false);
        return;
      }

      if (!petId) {
        setError('No pet ID provided');
        setLoading(false);
        return;
      }

      try {
        // Fetch pet details
        const petData = await getPetById(petId);

        if (!petData) {
          setError('Pet not found');
          setLoading(false);
          return;
        }

        // Verify pet belongs to current user
        if (petData.userId !== user.uid) {
          setError('You do not have access to this pet');
          setLoading(false);
          return;
        }

        setPet(petData);

        // Check if we're loading an existing conversation
        if (existingConversationId) {
          try {
            // Load existing conversation
            setConversationId(existingConversationId);

            // Load existing messages
            const existingMessages = await getConversationMessages(existingConversationId);
            setMessages(existingMessages);
          } catch (convErr) {
            console.error('Error loading conversation:', convErr);
            // If conversation doesn't exist or can't be loaded, just continue without it
            // User can start a new conversation
            setConversationId(null);
            setMessages([]);
          }
        }
        // Note: If no conversationId, we don't create one yet.
        // Conversation will be created when user sends first message.

        setLoading(false);
      } catch (err) {
        console.error('Error initializing chat:', err);
        setError('Failed to load chat');
        setLoading(false);
      }
    }

    initialize();
  }, [petId, existingConversationId, authLoading, user]);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/login');
    } catch (err) {
      console.error('Error signing out:', err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !petId || !pet) return;

    const userMessage = message.trim();
    setMessage('');
    setSending(true);
    setError(null);

    try {
      // Create conversation if it doesn't exist yet (first message)
      let currentConversationId = conversationId;
      if (!currentConversationId) {
        currentConversationId = await createConversation(petId);
        setConversationId(currentConversationId);
      }

      // 1. Add user message to UI immediately
      const tempUserMessage: Message = {
        id: `temp-${Date.now()}`,
        conversationId: currentConversationId,
        role: 'user',
        content: userMessage,
        feedback: null,
        createdAt: new Date(),
      };
      setMessages((prev) => [...prev, tempUserMessage]);

      // 2. Save user message to Firestore
      const userMessageId = await addMessage(currentConversationId, 'user', userMessage);

      // Update the temp message with real id
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempUserMessage.id ? { ...msg, id: userMessageId } : msg
        )
      );

      // 3. Call the API to get AI response
      // Pass pet data and messages to avoid server-side Firestore auth issues
      // Format messages for API (only include role and content)
      // Exclude the temp message we just added (it hasn't been saved to Firestore yet)
      const conversationHistory = messages
        .filter((msg) => msg.id !== tempUserMessage.id) // Exclude the temp message
        .map((msg) => ({
          role: msg.role,
          content: msg.content,
        }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          petId,
          conversationId: currentConversationId,
          userMessage,
          pet: {
            name: pet.name,
            species: pet.species,
            age: pet.age,
            breed: pet.breed,
            weight: pet.weight,
            gender: pet.gender,
          },
          messages: conversationHistory,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get response');
      }

      const data = await response.json();
      const assistantResponse = data.response;

      // 4. Add AI response to UI
      const tempAssistantMessage: Message = {
        id: `temp-${Date.now()}`,
        conversationId: currentConversationId,
        role: 'assistant',
        content: assistantResponse,
        feedback: null,
        createdAt: new Date(),
      };
      setMessages((prev) => [...prev, tempAssistantMessage]);

      // 5. Save AI response to Firestore
      const assistantMessageId = await addMessage(
        currentConversationId,
        'assistant',
        assistantResponse
      );

      // Update the temp message with real id
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempAssistantMessage.id ? { ...msg, id: assistantMessageId } : msg
        )
      );

      setSending(false);
    } catch (err) {
      console.error('Error sending message:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to send message. Please try again.'
      );
      setSending(false);
    }
  };

  const handleFeedback = async (messageId: string, feedback: 'up' | 'down') => {
    if (!conversationId) {
      console.error('No conversation ID available for feedback');
      return;
    }
    
    try {
      // Update UI immediately (optimistic update)
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, feedback } : msg
        )
      );

      // Update in Firestore (now requires conversationId)
      await updateMessageFeedback(conversationId, messageId, feedback);
    } catch (err) {
      console.error('Error updating feedback:', err);
      // Revert on error
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, feedback: null } : msg
        )
      );
    }
  };

  // Show loading screen while checking auth
  if (authLoading || !user) {
    return (
      <div className="h-screen w-screen bg-[#073F6C] flex items-center justify-center overflow-hidden">
        <div className="text-center">
          <div className="w-8 h-8 mx-auto mb-4">
            <div className="spinner w-full h-full border-2 border-white border-t-transparent"></div>
          </div>
          <p className="text-white text-sm">Loading</p>
        </div>
      </div>
    );
  }

  // Format timestamp for display
  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  };

  if (loading) {
    return (
      <div className="h-screen w-screen bg-[#073F6C] flex items-center justify-center overflow-hidden">
        <div className="text-center">
          <div className="w-8 h-8 mx-auto mb-4">
            <div className="spinner w-full h-full border-2 border-white border-t-transparent"></div>
          </div>
          <p className="text-white text-sm">Loading</p>
        </div>
      </div>
    );
  }

  if (error && !pet) {
    return (
      <div className="h-screen w-screen bg-[#073F6C] flex items-center justify-center px-4 overflow-hidden">
        <div className="max-w-md w-full bg-white rounded-xl p-8 shadow-md">
          <div className="text-center">
            <h1 className="text-lg font-bold text-[#073F6C] mb-4">Error</h1>
            <p className="text-sm text-gray-600 mb-6">{error || 'Pet not found'}</p>
            <button
              onClick={() => router.push('/onboarding')}
              className="w-full px-6 py-3 bg-[#073F6C] text-white rounded-xl hover:bg-[#073F6C]/90 active:scale-[0.98] transition-all duration-200 font-bold text-sm uppercase shadow-md"
            >
              Back to Onboarding
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-screen bg-[#073F6C] overflow-hidden safe-area-top">
      {/* Sign In Banner - Show for anonymous users */}
      {isAnon && (
        <div className="bg-yellow-500 border-b border-yellow-600 px-4 sm:px-6 py-3 flex-shrink-0">
          <div className="max-w-5xl lg:max-w-6xl xl:max-w-7xl mx-auto flex items-center justify-between gap-4">
            <p className="text-white text-sm font-medium flex-1">
              Sign in to save your pet details and conversations
            </p>
            <button
              onClick={() => {
                // Preserve current conversationId in URL when redirecting to login
                const currentUrl = new URL(window.location.href);
                const conversationId = currentUrl.searchParams.get('conversationId');
                const petId = currentUrl.searchParams.get('petId');
                const loginUrl = conversationId && petId 
                  ? `/login?petId=${petId}&conversationId=${conversationId}`
                  : '/login';
                router.push(loginUrl);
              }}
              className="px-4 py-2 bg-white text-[#073F6C] rounded-lg hover:bg-gray-50 active:scale-[0.98] transition-all duration-200 font-bold text-xs uppercase whitespace-nowrap"
            >
              Sign In
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-[#073F6C] border-b border-white/10 px-4 sm:px-6 py-4 flex-shrink-0">
        <div className="max-w-5xl lg:max-w-6xl xl:max-w-7xl mx-auto flex items-center justify-between">
          {/* Pet Info */}
          <div className="flex items-center gap-3.5">
            <img
              src="/logo_notext.png"
              alt="LetsVet Logo"
              className="w-10 h-10 flex-shrink-0"
            />
            <div>
              <h1 className="text-base font-bold text-white leading-tight">{pet?.name}</h1>
              <p className="text-xs text-white/80 leading-relaxed mt-0.5">
                {pet?.species.charAt(0).toUpperCase()}
                {pet?.species.slice(1)} • {pet?.age}{' '}
                {pet?.age === 1 ? 'year' : 'years'} • {pet?.breed}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1 ml-4">
            {!isAnon && (
              <button
                onClick={() => router.push(`/history?petId=${petId}`)}
                className="flex flex-col items-center gap-1 px-3 py-2 text-white hover:text-white/80 transition-colors"
                title="View history"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-[10px] font-bold uppercase leading-tight">History</span>
              </button>
            )}
            {!isAnon && (
              <button
                onClick={handleSignOut}
                className="flex flex-col items-center gap-1 px-3 py-2 text-white hover:text-white/80 transition-colors"
                title="Sign out"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                <span className="text-[10px] font-bold uppercase leading-tight">Sign Out</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Chat Messages Area */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden px-4 sm:px-6 py-8 pb-32">
        <div className="max-w-3xl lg:max-w-4xl xl:max-w-5xl mx-auto space-y-5 pb-4">
          {messages.length === 0 ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center h-full text-center py-16">
              <div className="w-14 h-14 bg-white/10 border-2 border-white/20 rounded-xl flex items-center justify-center mb-8">
                <svg
                  className="w-7 h-7 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-white mb-3">
                Start a conversation
              </h2>
              <p className="text-sm text-white/80 max-w-md leading-relaxed">
                Describe any symptoms or health concerns about {pet?.name}, and I&apos;ll provide guidance on the best course of action.
              </p>
            </div>
          ) : (
            /* Messages */
            <>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} fade-in`}
                >
                  <div
                    className={`max-w-[85%] sm:max-w-[70%] lg:max-w-[60%] xl:max-w-[50%] rounded-xl px-5 py-4 shadow-md break-words ${
                      msg.role === 'user'
                        ? 'bg-white border-2 border-[#073F6C] text-[#073F6C]'
                        : 'bg-white text-[#073F6C]'
                    }`}
                  >
                    <div className="text-[15px] leading-relaxed prose prose-sm max-w-none break-words" style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                      <ReactMarkdown
                        components={{
                          p: ({ children }) => <p className="mb-2 last:mb-0 break-words">{children}</p>,
                          strong: ({ children }) => <strong className="font-bold break-words">{children}</strong>,
                          em: ({ children }) => <em className="italic break-words">{children}</em>,
                          ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1 break-words">{children}</ul>,
                          ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1 break-words">{children}</ol>,
                          li: ({ children }) => <li className="ml-2 break-words">{children}</li>,
                          code: ({ children }) => <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono break-words">{children}</code>,
                          pre: ({ children }) => <pre className="bg-gray-100 p-2 rounded overflow-x-auto mb-2 break-words">{children}</pre>,
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                    <p
                      className={`text-xs mt-4 ${
                        msg.role === 'user' ? 'text-gray-500' : 'text-gray-500'
                      }`}
                    >
                      {formatTime(msg.createdAt)}
                    </p>

                    {/* Feedback buttons for assistant messages */}
                    {msg.role === 'assistant' && (
                      <div className="flex items-center gap-2 mt-5 pt-4 border-t border-gray-200">
                        <button
                          onClick={() => handleFeedback(msg.id, 'up')}
                          className={`px-3 py-2 rounded-xl transition-all duration-200 touch-target flex items-center justify-center ${
                            msg.feedback === 'up'
                              ? 'bg-[#073F6C] text-white'
                              : 'text-gray-500 hover:bg-gray-100'
                          }`}
                          title="Helpful"
                          aria-label="Mark as helpful"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleFeedback(msg.id, 'down')}
                          className={`px-3 py-2 rounded-xl transition-all duration-200 touch-target flex items-center justify-center ${
                            msg.feedback === 'down'
                              ? 'bg-[#073F6C] text-white'
                              : 'text-gray-500 hover:bg-gray-100'
                          }`}
                          title="Not helpful"
                          aria-label="Mark as not helpful"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5"
                            />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Loading indicator */}
              {sending && (
                <div className="flex justify-start">
                  <div className="max-w-[70%] rounded-xl px-5 py-4 bg-white shadow-md">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 bg-[#073F6C] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-1.5 h-1.5 bg-[#073F6C] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-1.5 h-1.5 bg-[#073F6C] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                      <span className="text-xs text-gray-500 min-w-[100px]">
                        {tickerWords[tickerIndex]}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Fixed Bottom Input Area */}
      <footer className="fixed bottom-0 left-0 right-0 bg-[#073F6C] border-t border-white/10 px-4 sm:px-6 py-5 safe-area-bottom z-10">
        <div className="max-w-3xl lg:max-w-4xl xl:max-w-5xl mx-auto">
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-white/10 border border-white/20 rounded-xl fade-in">
              <div className="flex items-start gap-3">
                <svg
                  className="w-4 h-4 text-white flex-shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-white text-xs font-medium leading-relaxed">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSendMessage} className="flex gap-3">
            {/* Text Input */}
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe symptoms..."
              disabled={sending}
              className="flex-1 px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:border-[#073F6C] focus:ring-2 focus:ring-[#073F6C]/20 transition-all duration-200 text-sm placeholder:text-gray-400 disabled:bg-gray-50 disabled:cursor-not-allowed break-words"
              autoComplete="off"
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={!message.trim() || sending}
              className="px-6 py-3 bg-white text-[#073F6C] rounded-xl hover:bg-gray-50 active:scale-[0.98] transition-all duration-200 font-bold text-sm uppercase shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
            >
              {sending ? (
                <>
                  <div className="spinner w-4 h-4 border-2 border-[#073F6C] border-t-transparent"></div>
                  <span className="hidden sm:inline">Sending</span>
                </>
              ) : (
                <>
                  <span className="hidden sm:inline">Send</span>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Helper text */}
          <p className="text-[10px] text-white/70 mt-4 text-center whitespace-nowrap">
            AI guidance only • Always consult a veterinarian for serious concerns
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={
      <div className="h-screen w-screen bg-[#073F6C] flex items-center justify-center overflow-hidden">
        <div className="text-white">Loading...</div>
      </div>
    }>
      <ChatPageContent />
    </Suspense>
  );
}
