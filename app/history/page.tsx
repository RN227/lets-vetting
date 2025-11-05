'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useRequireAuth, AuthLoadingScreen } from '@/lib/hooks/useRequireAuth';
import { getPetById } from '@/lib/services/pets';
import { getConversationsForPet } from '@/lib/services/conversations';
import type { Pet, Conversation } from '@/types';

export default function HistoryPage() {
  // ALL HOOKS MUST BE CALLED FIRST
  const router = useRouter();
  const searchParams = useSearchParams();
  const auth = useRequireAuth();

  const [pet, setPet] = useState<Pet | null>(null);
  const [conversations, setConversations] = useState<Array<Conversation & { firstMessage?: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const petId = searchParams.get('petId');
  const user = auth?.user;

  // Fetch pet and conversations
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

        // Fetch conversations
        const conversationsData = await getConversationsForPet(petId);

        // Filter out conversations with no messages
        const conversationsWithMessages = conversationsData.filter(
          (conv) => conv.firstMessage && conv.firstMessage.trim().length > 0
        );
        setConversations(conversationsWithMessages);

        setLoading(false);
      } catch (err) {
        console.error('Error loading history:', err);
        setError('Failed to load conversation history');
        setLoading(false);
      }
    }

    initialize();
  }, [petId, user?.uid]);

  const handleConversationClick = (conversationId: string) => {
    router.push(`/chat?petId=${petId}&conversationId=${conversationId}`);
  };

  const handleBackToChat = () => {
    router.push(`/chat?petId=${petId}`);
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  };

  // Show loading screen while checking auth
  if (!auth) {
    return <AuthLoadingScreen />;
  }

  if (loading) {
    return <AuthLoadingScreen />;
  }

  if (error || !pet) {
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
    <div className="min-h-screen bg-[var(--surface)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3.5 mb-8">
            <div className="w-10 h-10 bg-[var(--accent)] rounded-sm flex items-center justify-center">
              {pet.species === 'dog' ? (
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
              <h1 className="text-2xl font-light text-[var(--text-primary)] leading-tight">
                Conversation History
              </h1>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed mt-1">
                {pet.name}&apos;s health conversations
              </p>
            </div>
          </div>
          <button
            onClick={handleBackToChat}
            className="btn-secondary text-sm"
          >
            Back to Chat
          </button>
        </div>

        {/* Conversations List */}
        {conversations.length === 0 ? (
          /* Empty State */
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-sm p-14 text-center shadow-sm">
            <div className="w-14 h-14 bg-[var(--surface-elevated)] border border-[var(--border)] rounded-sm flex items-center justify-center mx-auto mb-8">
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
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-light text-[var(--text-primary)] mb-3">
              No conversations yet
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mb-8 leading-relaxed">
              Start a conversation with {pet.name} to see history here.
            </p>
            <button
              onClick={handleBackToChat}
              className="btn-primary text-sm"
            >
              Start New Conversation
            </button>
          </div>
        ) : (
          /* Conversations List */
          <div className="space-y-3">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => handleConversationClick(conversation.id)}
                className="bg-[var(--surface)] border border-[var(--border)] rounded-sm p-6 hover:bg-[var(--surface-hover)] hover:shadow-md transition-all duration-200 cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[var(--surface-elevated)] border border-[var(--border)] rounded-sm flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-[var(--text-secondary)]"
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
                    <span className="text-xs font-medium text-[var(--text-secondary)]">
                      {formatDate(conversation.createdAt)}
                    </span>
                  </div>
                  <svg
                    className="w-4 h-4 text-[var(--text-tertiary)] group-hover:text-[var(--text-primary)] transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
                {conversation.firstMessage && (
                  <p className="text-sm text-[var(--text-primary)] line-clamp-2 leading-relaxed">
                    {conversation.firstMessage}
                  </p>
                )}
                {!conversation.firstMessage && (
                  <p className="text-xs text-[var(--text-tertiary)] italic leading-relaxed">No messages yet</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
