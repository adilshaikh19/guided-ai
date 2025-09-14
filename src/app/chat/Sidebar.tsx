'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Menu, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { trpc } from '@/utils/trpc';
import { useState } from 'react';

// This type represents the session data as it exists on the client,
// after being serialized from the server (Dates become strings).
type ClientChatSession = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  userId: string | null;
};

// Define types for the component props to avoid using 'any'
type SessionsQuery = {
  data: { items: ClientChatSession[] } | undefined;
  // Add other properties from the query result if needed, e.g., isLoading, error
  refetch?: () => Promise<unknown>;
};

type CreateSessionMutation = {
  mutate: (variables: { name: string }) => void;
  isPending: boolean;
};

type SidebarProps = {
  sessionsQuery: SessionsQuery;
  currentSessionId: string | null;
  setCurrentSessionId: (id: string | null) => void;
  newSessionName: string;
  setNewSessionName: (name: string) => void;
  createSessionMutation: CreateSessionMutation;
  isSidebarOpen: boolean;
  isSidebarVisible: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
};

export function Sidebar({ 
  sessionsQuery, 
  currentSessionId, 
  setCurrentSessionId, 
  newSessionName, 
  setNewSessionName, 
  createSessionMutation, 
  isSidebarOpen, 
  isSidebarVisible, 
  setIsSidebarOpen 
}: SidebarProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const deleteMutation = trpc.chat.deleteSession.useMutation({
    onSettled: () => setDeletingId(null),
  });

  const handleDelete = async (id: string) => {
    if (deletingId) return;
    const confirmed = confirm('Delete this chat? This cannot be undone.');
    if (!confirmed) return;
    setDeletingId(id);
    deleteMutation.mutate(
      { sessionId: id },
      {
        onSuccess: async () => {
          if (currentSessionId === id) {
            setCurrentSessionId(null);
          }
          await sessionsQuery.refetch?.();
        },
      }
    );
  };

  return (
    <div className={cn("flex-shrink-0 transition-all duration-300 ease-in-out border-r border-border/50", isSidebarOpen ? "w-80" : "w-0")}>
      {isSidebarVisible && (
        <div className="h-full w-80 bg-card/50 backdrop-blur-sm border-r border-border/50">
          <div className="p-4 border-b border-border/50">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Chat Sessions</h2>
              <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                <Menu className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex gap-2">
              <Input value={newSessionName} onChange={(e) => setNewSessionName(e.target.value)} placeholder="New session name" className="flex-1" />
              <Button onClick={() => createSessionMutation.mutate({ name: newSessionName })} disabled={createSessionMutation.isPending}>
                {createSessionMutation.isPending ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : 'New'}
              </Button>
            </div>
          </div>

          <ScrollArea className="h-[calc(100vh-140px)]">
            <div className="p-2 space-y-1">
              {sessionsQuery.data?.items?.map((s: ClientChatSession) => (
                <div key={s.id} className="flex items-center gap-2">
                  <Button
                    variant={currentSessionId === s.id ? 'secondary' : 'ghost'}
                    onClick={() => setCurrentSessionId(s.id)}
                    className="flex-1 justify-start h-auto p-3"
                  >
                    <div className="flex flex-col items-start text-left">
                      <span className="font-medium text-sm truncate w-full">{s.name}</span>
                      <span className="text-xs text-muted-foreground">{new Date(s.updatedAt).toLocaleString()}</span>
                    </div>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(s.id)}
                    disabled={deletingId === s.id || deleteMutation.isPending}
                    className="text-red-500 hover:text-red-600"
                    title="Delete chat"
                  >
                    {deletingId === s.id ? (
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              ))}
              {!sessionsQuery.data?.items?.length && (
                <div className="text-sm text-muted-foreground p-4 text-center">
                  No sessions yet. Create your first session!
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}