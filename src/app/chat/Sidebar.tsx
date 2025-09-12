'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Menu } from 'lucide-react';
import { ChatSession } from '@prisma/client';
import { cn } from '@/lib/utils';

export function Sidebar({ sessionsQuery, currentSessionId, setCurrentSessionId, newSessionName, setNewSessionName, createSessionMutation, isSidebarOpen, isSidebarVisible, setIsSidebarOpen }: any) {

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
              {sessionsQuery.data?.items?.map((s: ChatSession) => (
                <Button
                  key={s.id}
                  variant={currentSessionId === s.id ? 'secondary' : 'ghost'}
                  onClick={() => setCurrentSessionId(s.id)}
                  className="w-full justify-start h-auto p-3"
                >
                  <div className="flex flex-col items-start text-left">
                    <span className="font-medium text-sm truncate w-full">{s.name}</span>
                    <span className="text-xs text-muted-foreground">{new Date(s.updatedAt).toLocaleString()}</span>
                  </div>
                </Button>
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