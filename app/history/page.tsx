'use client';

import { Suspense } from 'react';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useRequireAuth, AuthLoadingScreen } from '@/lib/hooks/useRequireAuth';
import { getPetById } from '@/lib/services/pets';
import { getConversationsForPet } from '@/lib/services/conversations';
import type { Pet, Conversation } from '@/types';

function HistoryPageContent() {
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
    return (
      <div className="min-h-screen bg-[#073F6C] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 mx-auto mb-4">
            <div className="spinner w-full h-full border-2 border-white border-t-transparent"></div>
          </div>
          <p className="text-white text-sm">Loading</p>
        </div>
      </div>
    );
  }

  if (error || !pet) {
    return (
      <div className="min-h-screen bg-[#073F6C] flex items-center justify-center px-4">
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
    <div className="min-h-screen bg-[#073F6C]">
      {/* Header */}
      <header className="bg-[#073F6C] border-b border-white/10 px-4 sm:px-6 py-4 flex-shrink-0">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          {/* Pet Info */}
          <div className="flex items-center gap-3.5">
            <img
              src="/logo_notext.png"
              alt="LetsVet Logo"
              className="w-10 h-10 flex-shrink-0"
            />
            <h1 className="text-base font-bold text-white leading-tight">
              {pet.name}&apos;s History
            </h1>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1 ml-4">
            <button
              onClick={handleBackToChat}
              className="flex flex-col items-center gap-1 px-3 py-2 text-white hover:text-white/80 transition-colors"
              title="Back to chat"
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
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <span className="text-[10px] font-bold uppercase leading-tight">Chat</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14">

        {/* Conversations List */}
        {conversations.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-xl p-14 text-center shadow-md">
            <div className="w-14 h-14 bg-white/10 border-2 border-gray-200 rounded-xl flex items-center justify-center mx-auto mb-8">
              <svg
                className="w-7 h-7 text-gray-400"
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
            <h2 className="text-xl font-bold text-[#073F6C] mb-3">
              No conversations yet
            </h2>
            <p className="text-sm text-gray-600 mb-8 leading-relaxed">
              Start a conversation with {pet.name} to see history here.
            </p>
            <button
              onClick={handleBackToChat}
              className="px-6 py-3 bg-[#073F6C] text-white rounded-xl hover:bg-[#073F6C]/90 active:scale-[0.98] transition-all duration-200 font-bold text-sm uppercase shadow-md"
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
                className="bg-white rounded-xl p-4 hover:shadow-lg transition-all duration-200 cursor-pointer group"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-4 h-4 text-gray-500"
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
                  <div className="flex-1">
                    {conversation.firstMessage && (
                      <p className="text-sm text-[#073F6C] line-clamp-2 leading-relaxed mb-1">
                        {conversation.firstMessage}
                      </p>
                    )}
                    {!conversation.firstMessage && (
                      <p className="text-xs text-gray-400 italic leading-relaxed mb-1">No messages yet</p>
                    )}
                    <span className="text-[10px] font-medium text-gray-500">
                      {formatDate(conversation.createdAt)}
                    </span>
                  </div>
                  <svg
                    className="w-4 h-4 text-gray-400 group-hover:text-[#073F6C] transition-colors flex-shrink-0"
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
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function HistoryPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#073F6C] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    }>
      <HistoryPageContent />
    </Suspense>
  );
}
