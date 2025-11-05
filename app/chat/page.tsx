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
  const existingConversationId = searchParams.get('conversationId');
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

        // Check if we're loading an existing conversation
        if (existingConversationId) {
          // Load existing conversation
          setConversationId(existingConversationId);

          // Load existing messages
          const existingMessages = await getConversationMessages(existingConversationId);
          setMessages(existingMessages);
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
  }, [petId, existingConversationId, user?.uid]);

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
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          petId,
          conversationId: currentConversationId,
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
      <div className="min-h-screen bg-[var(--surface)] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-[var(--surface)] border border-[var(--border)] rounded-sm p-8 shadow-sm">
          <div className="text-center">
            <h1 className="text-lg font-medium text-[var(--text-primary)] mb-4">Error</h1>
            <p className="text-[var(--text-secondary)] text-sm mb-6">{error || 'Pet not found'}</p>
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
    <div className="flex flex-col h-screen bg-[var(--surface)]">
      {/* Header */}
      <header className="bg-[var(--surface)] border-b border-[var(--border)] px-4 sm:px-6 py-4 flex-shrink-0">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          {/* Pet Info */}
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 bg-[var(--accent)] rounded-sm flex items-center justify-center flex-shrink-0">
              {pet?.species === 'dog' ? (
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              )}
            </div>
            <div>
              <h1 className="text-base font-medium text-[var(--text-primary)] leading-tight">{pet?.name}</h1>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed mt-0.5">
                {pet?.species.charAt(0).toUpperCase()}
                {pet?.species.slice(1)} • {pet?.age}{' '}
                {pet?.age === 1 ? 'year' : 'years'} • {pet?.breed}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push(`/history?petId=${petId}`)}
              className="btn-ghost px-3 py-2 text-xs font-medium flex items-center gap-1.5"
              title="View history"
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
                  strokeWidth={1.5}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="hidden sm:inline">History</span>
            </button>
            <button
              onClick={handleSignOut}
              className="btn-ghost px-3 py-2 text-xs font-medium"
              title="Sign out"
            >
              <span className="hidden sm:inline">Sign Out</span>
              <svg
                className="w-4 h-4 sm:hidden"
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
            </button>
          </div>
        </div>
      </header>

      {/* Chat Messages Area */}
      <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-10">
        <div className="max-w-3xl mx-auto space-y-5">
          {messages.length === 0 ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center h-full text-center py-16">
              <div className="w-14 h-14 bg-[var(--surface-elevated)] border border-[var(--border)] rounded-sm flex items-center justify-center mb-8">
                <svg
                  className="w-7 h-7 text-[var(--text-secondary)]"
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
              <h2 className="text-xl font-light text-[var(--text-primary)] mb-3">
                Start a conversation
              </h2>
              <p className="text-sm text-[var(--text-secondary)] max-w-md leading-relaxed">
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
                    className={`max-w-[85%] sm:max-w-[70%] ${
                      msg.role === 'user'
                        ? 'chat-bubble-user'
                        : 'chat-bubble-assistant'
                    }`}
                  >
                    <p className="text-[15px] leading-relaxed whitespace-pre-wrap">
                      {msg.content}
                    </p>
                    <p
                      className={`text-xs mt-4 ${
                        msg.role === 'user' ? 'text-white/70' : 'text-[var(--text-tertiary)]'
                      }`}
                    >
                      {formatTime(msg.createdAt)}
                    </p>

                    {/* Feedback buttons for assistant messages */}
                    {msg.role === 'assistant' && (
                      <div className="flex items-center gap-2 mt-5 pt-4 border-t border-[var(--border)]">
                        <button
                          onClick={() => handleFeedback(msg.id, 'up')}
                          className={`p-1.5 rounded-sm transition-all duration-200 touch-target ${
                            msg.feedback === 'up'
                              ? 'bg-[var(--accent)] text-white'
                              : 'text-[var(--text-tertiary)] hover:bg-[var(--surface-hover)]'
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
                          className={`p-1.5 rounded-sm transition-all duration-200 touch-target ${
                            msg.feedback === 'down'
                              ? 'bg-[var(--accent)] text-white'
                              : 'text-[var(--text-tertiary)] hover:bg-[var(--surface-hover)]'
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
                  <div className="max-w-[70%] rounded-sm px-4 py-3 bg-[var(--surface-elevated)] shadow-sm border border-[var(--border)]">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 bg-[var(--text-tertiary)] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-1.5 h-1.5 bg-[var(--text-tertiary)] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-1.5 h-1.5 bg-[var(--text-tertiary)] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                      <span className="text-xs text-[var(--text-tertiary)]">Thinking</span>
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
      <footer className="bg-[var(--surface)] border-t border-[var(--border)] px-4 sm:px-6 py-5 flex-shrink-0 safe-area-bottom">
        <div className="max-w-3xl mx-auto">
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-[var(--surface-elevated)] border border-[var(--border)] rounded-sm fade-in">
              <div className="flex items-start gap-3">
                <svg
                  className="w-4 h-4 text-[var(--text-secondary)] flex-shrink-0 mt-0.5"
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
                <p className="text-[var(--text-secondary)] text-xs font-medium leading-relaxed">{error}</p>
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
              className="input-field flex-1 text-sm disabled:bg-[var(--surface-elevated)]"
              autoComplete="off"
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={!message.trim() || sending}
              className="btn-primary px-4 py-3 flex items-center justify-center gap-2"
            >
              {sending ? (
                <>
                  <div className="spinner w-4 h-4"></div>
                  <span className="hidden sm:inline text-sm">Sending</span>
                </>
              ) : (
                <>
                  <span className="hidden sm:inline text-sm">Send</span>
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
          <p className="text-xs text-[var(--text-tertiary)] mt-4 text-center leading-relaxed">
            AI guidance only • Always consult a veterinarian for serious concerns
          </p>
        </div>
      </footer>
    </div>
  );
}
