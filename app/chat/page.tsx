'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useRequireAuth, AuthLoadingScreen } from '@/lib/hooks/useRequireAuth';
import { getPetById } from '@/lib/services/pets';
import {
  createConversation,
  addMessage,
  getConversationMessages,
  updateMessageFeedback
} from '@/lib/services/conversations';
import { useAuth } from '@/lib/auth-context';
import type { Pet, Message } from '@/types';

export default function ChatPage() {
  // ALL HOOKS MUST BE CALLED FIRST - before any conditional returns
  const router = useRouter();
  const searchParams = useSearchParams();
  const auth = useRequireAuth();
  const { signOut } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [pet, setPet] = useState<Pet | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const petId = searchParams.get('petId');
  const user = auth?.user;

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize: Fetch pet and create/load conversation
  useEffect(() => {
    async function initialize() {
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
        if (user && petData.userId !== user.uid) {
          setError('You do not have access to this pet');
          setLoading(false);
          return;
        }

        setPet(petData);

        // Create a new conversation for this session
        const newConversationId = await createConversation(petId);
        setConversationId(newConversationId);

        // Note: For now, each page load creates a new conversation
        // In a production app, you might want to load the most recent conversation
        // or allow users to browse conversation history

        setLoading(false);
      } catch (err) {
        console.error('Error initializing chat:', err);
        setError('Failed to load chat');
        setLoading(false);
      }
    }

    initialize();
  }, [petId, user?.uid]);

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
    if (!message.trim() || !petId || !conversationId || !pet) return;

    const userMessage = message.trim();
    setMessage('');
    setSending(true);
    setError(null);

    try {
      // 1. Add user message to UI immediately
      const tempUserMessage: Message = {
        id: `temp-${Date.now()}`,
        conversationId,
        role: 'user',
        content: userMessage,
        feedback: null,
        createdAt: new Date(),
      };
      setMessages((prev) => [...prev, tempUserMessage]);

      // 2. Save user message to Firestore
      const userMessageId = await addMessage(conversationId, 'user', userMessage);

      // Update the temp message with real id
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempUserMessage.id ? { ...msg, id: userMessageId } : msg
        )
      );

      // 3. Call the API to get AI response
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          petId,
          conversationId,
          userMessage,
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
        conversationId,
        role: 'assistant',
        content: assistantResponse,
        feedback: null,
        createdAt: new Date(),
      };
      setMessages((prev) => [...prev, tempAssistantMessage]);

      // 5. Save AI response to Firestore
      const assistantMessageId = await addMessage(
        conversationId,
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
    try {
      // Update UI immediately (optimistic update)
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, feedback } : msg
        )
      );

      // Update in Firestore
      await updateMessageFeedback(messageId, feedback);
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

  // Show loading screen while checking auth or redirecting
  if (!auth) {
    return <AuthLoadingScreen />;
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
    return <AuthLoadingScreen />;
  }

  if (error && !pet) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
            <p className="text-gray-700 mb-6">{error || 'Pet not found'}</p>
            <button
              onClick={() => router.push('/onboarding')}
              className="btn-primary"
            >
              Back to Onboarding
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-4 shadow-sm flex-shrink-0">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          {/* Pet Info */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-2xl">
              {pet?.species === 'dog' ? '🐕' : '🐈'}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{pet?.name}</h1>
              <p className="text-sm text-gray-600">
                {pet?.species.charAt(0).toUpperCase()}
                {pet?.species.slice(1)} • {pet?.age}{' '}
                {pet?.age === 1 ? 'year' : 'years'} • {pet?.breed}
              </p>
            </div>
          </div>

          {/* Sign Out Button */}
          <button
            onClick={handleSignOut}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Chat Messages Area */}
      <main className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.length === 0 ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-4xl">💬</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Start a conversation about {pet?.name}
              </h2>
              <p className="text-gray-600 max-w-md">
                Describe any symptoms or health concerns you have about {pet?.name},
                and I&apos;ll help provide guidance on the best course of action.
              </p>
            </div>
          ) : (
            /* Messages */
            <>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                      msg.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-900 shadow-md border border-gray-200'
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {msg.content}
                    </p>
                    <p
                      className={`text-xs mt-2 ${
                        msg.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                      }`}
                    >
                      {formatTime(msg.createdAt)}
                    </p>

                    {/* Feedback buttons for assistant messages */}
                    {msg.role === 'assistant' && (
                      <div className="flex items-center gap-2 mt-3 pt-2 border-t border-gray-200">
                        <button
                          onClick={() => handleFeedback(msg.id, 'up')}
                          className={`text-lg transition-all duration-200 hover:scale-110 ${
                            msg.feedback === 'up'
                              ? 'opacity-100 scale-110'
                              : 'opacity-40 hover:opacity-70'
                          }`}
                          title="Helpful"
                        >
                          👍
                        </button>
                        <button
                          onClick={() => handleFeedback(msg.id, 'down')}
                          className={`text-lg transition-all duration-200 hover:scale-110 ${
                            msg.feedback === 'down'
                              ? 'opacity-100 scale-110'
                              : 'opacity-40 hover:opacity-70'
                          }`}
                          title="Not helpful"
                        >
                          👎
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Loading indicator */}
              {sending && (
                <div className="flex justify-start">
                  <div className="max-w-[70%] rounded-2xl px-4 py-3 bg-white shadow-md border border-gray-200">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                      <span className="text-sm text-gray-500">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </>
          )}
        </div>
      </main>

      {/* Fixed Bottom Input Area */}
      <footer className="bg-white border-t border-gray-200 px-4 py-4 shadow-lg flex-shrink-0">
        <div className="max-w-3xl mx-auto">
          {/* Error Message */}
          {error && (
            <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSendMessage} className="flex gap-3">
            {/* Text Input */}
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe your pet's symptoms..."
              disabled={sending}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={!message.trim() || sending}
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <span>{sending ? 'Sending...' : 'Send'}</span>
              {!sending && (
                <svg
                  className="w-5 h-5"
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
              )}
            </button>
          </form>

          {/* Helper text */}
          <p className="text-xs text-gray-500 mt-2 text-center">
            This AI assistant provides general guidance. Always consult a veterinarian for
            serious concerns.
          </p>
        </div>
      </footer>
    </div>
  );
}
