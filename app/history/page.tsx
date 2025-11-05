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
        setConversations(conversationsData);

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-2xl">
              {pet.species === 'dog' ? '🐕' : '🐈'}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Conversation History
              </h1>
              <p className="text-gray-600">
                {pet.name}&apos;s health conversations
              </p>
            </div>
          </div>
          <button
            onClick={handleBackToChat}
            className="btn-primary"
          >
            ← Back to Chat
          </button>
        </div>

        {/* Conversations List */}
        {conversations.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">📝</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              No conversations yet
            </h2>
            <p className="text-gray-600 mb-6">
              Start a conversation with {pet.name} to see history here.
            </p>
            <button
              onClick={handleBackToChat}
              className="btn-primary"
            >
              Start New Conversation
            </button>
          </div>
        ) : (
          /* Conversations List */
          <div className="space-y-4">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => handleConversationClick(conversation.id)}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200 cursor-pointer border border-gray-200 hover:border-blue-300"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">💬</span>
                    <span className="text-sm font-medium text-gray-500">
                      {formatDate(conversation.createdAt)}
                    </span>
                  </div>
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
                {conversation.firstMessage && (
                  <p className="text-gray-700 line-clamp-2">
                    {conversation.firstMessage}
                  </p>
                )}
                {!conversation.firstMessage && (
                  <p className="text-gray-400 italic">No messages yet</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
