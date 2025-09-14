'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { trpc } from '@/utils/trpc';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { ChatMessages } from './ChatMessages';

export default function ChatPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: user, isLoading } = trpc.auth.getMe.useQuery(undefined, { retry: false });

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [isLoading, user, router]);

  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [newSessionName, setNewSessionName] = useState('Career Counseling Session');
  const [message, setMessage] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [optimisticMessage, setOptimisticMessage] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);

  // Load sessionId from URL on mount/user ready
  useEffect(() => {
    if (!user) return;
    const initial = searchParams.get('sessionId');
    if (initial) setCurrentSessionId(initial);
  }, [user, searchParams]);

  // Keep URL in sync with selected session
  useEffect(() => {
    if (!user) return;
    const sp = new URLSearchParams(searchParams.toString());
    if (currentSessionId) {
      sp.set('sessionId', currentSessionId);
    } else {
      sp.delete('sessionId');
    }
    router.replace(`${pathname}?${sp.toString()}`);
  }, [currentSessionId, user, pathname, router, searchParams]);

  useEffect(() => {
    if (isSidebarOpen) {
      setIsSidebarVisible(true);
    } else {
      const timer = setTimeout(() => setIsSidebarVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isSidebarOpen]);

  const sessionsQuery = trpc.chat.listSessions.useQuery({ page: 1, pageSize: 10 }, { enabled: !!user });
  const messagesQuery = trpc.chat.getMessages.useQuery(
    { sessionId: currentSessionId ?? '', page: 1, pageSize: 50 },
    { enabled: !!currentSessionId && !!user }
  );

  const createSessionMutation = trpc.chat.createSession.useMutation({
    onSuccess: (s) => {
      setCurrentSessionId(s.id);
      sessionsQuery.refetch();
    },
  });

  const sendMutation = trpc.chat.sendMessage.useMutation({
    onMutate: (variables) => {
      setOptimisticMessage(variables.message);
      setMessage('');
      setIsAiTyping(true);
    },
    onSuccess: () => {
      setOptimisticMessage(null);
      messagesQuery.refetch();
      sessionsQuery.refetch();
      setTimeout(() => setIsAiTyping(false), 1000);
    },
    onError: () => {
      setOptimisticMessage(null);
      setIsAiTyping(false);
    }
  });

  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const displayMessages = useMemo(() => {
    const messages = messagesQuery.data?.items || [];
    return optimisticMessage
      ? [...messages, { id: 'optimistic', content: optimisticMessage, role: 'USER' as const, createdAt: new Date(), sessionId: currentSessionId || '' }]
      : messages;
  }, [messagesQuery.data?.items, optimisticMessage, currentSessionId]);

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      router.push('/login');
    },
  });

  if (isLoading || !user) {
    return <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Sidebar extracted */}
      <Sidebar
        sessionsQuery={sessionsQuery}
        currentSessionId={currentSessionId}
        setCurrentSessionId={setCurrentSessionId}
        newSessionName={newSessionName}
        setNewSessionName={setNewSessionName}
        createSessionMutation={createSessionMutation}
        isSidebarOpen={isSidebarOpen}
        isSidebarVisible={isSidebarVisible}
        setIsSidebarOpen={setIsSidebarOpen}
      />

      {/* Main Chat */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {!isSidebarOpen && (
            <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)} className="absolute top-4 left-4 z-10">
                <Menu className="h-5 w-5" />
            </Button>
        )}

        {/* Loading overlay for messages */}
        {currentSessionId && messagesQuery.isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
          </div>
        )}

        <ChatMessages
          user={user}
          currentSessionId={currentSessionId}
          displayMessages={displayMessages}
          isAiTyping={isAiTyping}
          message={message}
          setMessage={setMessage}
          handleSend={() => {
            if (!message.trim()) return;
            sendMutation.mutate({
              message,
              sessionId: currentSessionId ?? undefined,
              name: currentSessionId ? undefined : newSessionName,
            });
          }}
          sendMutation={sendMutation}
          scrollAreaRef={scrollAreaRef}
          handleLogout={() => logoutMutation.mutate()}
        />
      </div>
    </div>
  );
}
