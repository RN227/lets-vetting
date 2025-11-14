'use client';

import { Suspense } from 'react';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useRequireAuth, AuthLoadingScreen } from '@/lib/hooks/useRequireAuth';
import { getPetById } from '@/lib/services/pets';
import { getConversationsForPet } from '@/lib/services/conversations';
import type { Pet, Conversation } from '@/types';
import {
  Button,
  CircularProgress,
  Box,
  Typography,
  Card,
  CardContent,
  IconButton,
  Tooltip,
} from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import DescriptionIcon from '@mui/icons-material/Description';

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
      <Box className="h-screen w-screen bg-[#073F6C] flex items-center justify-center overflow-hidden">
        <Box className="text-center">
          <CircularProgress size={32} sx={{ color: 'white', mb: 2 }} />
          <Typography variant="body2" sx={{ color: 'white' }}>
            Loading
          </Typography>
        </Box>
      </Box>
    );
  }

  if (error || !pet) {
    return (
      <Box className="h-screen w-screen bg-[#073F6C] flex items-center justify-center px-4 overflow-hidden">
        <Box className="max-w-md w-full bg-white rounded-xl p-4 shadow-md">
          <Box className="text-center">
            <Typography variant="h3" sx={{ color: '#073F6C', mb: 2, fontWeight: 700 }}>
              Error
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
              {error || 'Pet not found'}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={() => router.push('/onboarding')}
              sx={{
                borderRadius: 3,
                py: 1.5,
                textTransform: 'uppercase',
                fontWeight: 700,
                fontSize: '0.875rem',
              }}
            >
              Back to Onboarding
            </Button>
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <div className="h-screen w-screen bg-[#073F6C] overflow-hidden flex flex-col">
      {/* Header */}
      <header className="bg-[#073F6C] border-b border-white/10 px-4 sm:px-6 py-4 flex-shrink-0">
        <div className="max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto flex items-center justify-between">
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 2 }}>
            <Tooltip title="Back to chat">
              <IconButton
                onClick={handleBackToChat}
                sx={{
                  flexDirection: 'column',
                  gap: 0.5,
                  px: 1.5,
                  py: 1,
                  color: 'white',
                  '&:hover': { color: 'rgba(255, 255, 255, 0.8)' },
                }}
              >
                <ChatIcon fontSize="small" />
                <Typography variant="caption" sx={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', lineHeight: 1.2 }}>
                  Chat
                </Typography>
              </IconButton>
            </Tooltip>
          </Box>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">

        {/* Conversations List */}
        {conversations.length === 0 ? (
          /* Empty State */
          <Card sx={{ borderRadius: 3, p: 7, textAlign: 'center' }}>
            <CardContent>
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  bgcolor: 'action.hover',
                  border: '2px solid',
                  borderColor: 'divider',
                  borderRadius: 3,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 4,
                }}
              >
                <DescriptionIcon sx={{ fontSize: 28, color: 'text.secondary' }} />
              </Box>
              <Typography variant="h3" sx={{ color: '#073F6C', mb: 1.5, fontWeight: 700 }}>
                No conversations yet
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 4 }}>
                Start a conversation with {pet.name} to see history here.
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={handleBackToChat}
                sx={{
                  borderRadius: 3,
                  py: 1.5,
                  px: 3,
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                }}
              >
                Start New Conversation
              </Button>
            </CardContent>
          </Card>
        ) : (
          /* Conversations List */
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {conversations.map((conversation) => (
              <Card
                key={conversation.id}
                onClick={() => handleConversationClick(conversation.id)}
                sx={{
                  borderRadius: 3,
                  p: 2,
                  cursor: 'pointer',
                  '&:hover': {
                    boxShadow: 6,
                  },
                  transition: 'all 0.2s',
                }}
              >
                <CardContent sx={{ p: '0 !important' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        bgcolor: 'action.hover',
                        borderRadius: 3,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <ChatIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      {conversation.firstMessage && (
                        <Typography
                          variant="body2"
                          sx={{
                            color: '#073F6C',
                            mb: 0.5,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                          }}
                        >
                          {conversation.firstMessage}
                        </Typography>
                      )}
                      {!conversation.firstMessage && (
                        <Typography variant="caption" sx={{ color: 'text.disabled', fontStyle: 'italic', mb: 0.5, display: 'block' }}>
                          No messages yet
                        </Typography>
                      )}
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500, fontSize: '0.625rem' }}>
                        {formatDate(conversation.createdAt)}
                      </Typography>
                    </Box>
                    <ArrowForwardIcon sx={{ fontSize: 16, color: 'text.secondary', flexShrink: 0 }} />
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </div>
    </div>
  );
}

export default function HistoryPage() {
  return (
    <Suspense fallback={
      <Box className="h-screen w-screen bg-[#073F6C] flex items-center justify-center overflow-hidden">
        <Typography sx={{ color: 'white' }}>Loading...</Typography>
      </Box>
    }>
      <HistoryPageContent />
    </Suspense>
  );
}
