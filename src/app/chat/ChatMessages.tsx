'use client';

import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Send } from 'lucide-react';
import { RefObject } from 'react';

// A basic user type, adjust if you have a more specific user model
type User = {
  name?: string | null;
};

// Represents a single message in the chat
type ChatMessage = {
  id: string;
  role: 'USER' | 'ASSISTANT';
  content: string;
  createdAt: string | Date;
};

// Basic type for a mutation object, e.g., from React Query
type MutationState = {
  isPending: boolean;
};

type ChatMessagesProps = {
  user: User;
  currentSessionId: string | null;
  displayMessages: ChatMessage[];
  isAiTyping: boolean;
  message: string;
  setMessage: (msg: string) => void;
  handleSend: () => void;
  sendMutation: MutationState;
  scrollAreaRef: RefObject<HTMLDivElement | null>;
  handleLogout: () => void;
};

export function ChatMessages({
  user,
  currentSessionId,
  displayMessages,
  isAiTyping,
  message,
  setMessage,
  handleSend,
  sendMutation,
  scrollAreaRef,
  handleLogout,
}: ChatMessagesProps) {
  return (
    <>
      {/* Header */}
      <div className="flex-shrink-0 bg-card/80 backdrop-blur-sm border-b border-border/50 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center">
              <span className="text-black text-sm font-semibold"></span>
            </div>
            <h1 className="text-xl font-bold">
              Guided.AI
            </h1>
          </div>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="hover:bg-destructive/10 hover:text-destructive"
          >
            Logout
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 min-h-0 relative">
        <ScrollArea className="h-full" ref={scrollAreaRef}>
          <div className="p-6 space-y-4">
            {currentSessionId ? (
              displayMessages.length > 0 ? (
                displayMessages.map((m, index) => (
                  <div
                    key={m.id}
                    className={cn(
                      'flex items-start gap-3 transition-all duration-300',
                      m.role === 'USER' ? 'justify-end' : 'justify-start',
                      'animate-in slide-in-from-bottom-2 fade-in-0 duration-300'
                    )}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {m.role !== 'USER' && (
                      <Avatar className="ring-2 ring-blue-500/20">
                        <AvatarFallback className="text-black">
                          AI
                        </AvatarFallback>
                      </Avatar>
                    )}

                    <div
                      className={cn(
                        'max-w-[70%] rounded-2xl px-4 py-3 shadow-sm transition-all duration-200 hover:shadow-md',
                        m.role === 'USER'
                          ? 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200 rounded-br-md'
                          : 'bg-white text-slate-900 dark:bg-slate-800 dark:text-slate-100 border border-border/50 rounded-bl-md'
                      )}
                    >
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">
                        {m.content}
                      </p>
                      <p
                        className={cn(
                          'text-xs mt-2 opacity-70',
                          m.role === 'USER'
                            ? 'text-slate-500 dark:text-slate-400'
                            : 'text-muted-foreground'
                        )}
                      >
                        {new Date(m.createdAt).toLocaleString()}
                      </p>
                    </div>

                    {m.role === 'USER' && (
                      <Avatar className="ring-2 ring-purple-500/20">
                        <AvatarFallback className="text-black">
                          {user.name?.substring(0, 2).toUpperCase() || 'ME'}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-600/10 flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full"></div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Start Your Career Journey
                    </h3>
                    <p className="text-muted-foreground">
                      Ask me anything about career advice, resume feedback, or
                      interview preparation!
                    </p>
                  </div>
                </div>
              )
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-center space-y-4">
                <div className="text-4xl">💼</div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Welcome to Guided
                  </h3>
                  <p className="text-muted-foreground">
                    Create or select a session to start your career consultation.
                  </p>
                </div>
              </div>
            )}

            {/* Typing Indicator */}
            {isAiTyping && (
              <div className="flex items-start gap-3 animate-in slide-in-from-bottom-2 fade-in-0">
                <Avatar className="ring-2 ring-blue-500/20">
                  <AvatarFallback className="text-black">
                    AI
                  </AvatarFallback>
                </Avatar>
                <div className="bg-card border border-border/50 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
                      style={{ animationDelay: '0.1s' }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-pink-500 rounded-full animate-bounce"
                      style={{ animationDelay: '0.2s' }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 bg-card/80 backdrop-blur-sm border-t border-border/50 p-4">
        <div className="flex gap-3 max-w-4xl mx-auto">
          <div className="flex-1 relative">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask for career advice, resume feedback, interview prep..."
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              className="pr-12 bg-background/50 border-border/50 focus:bg-background transition-colors"
              disabled={sendMutation.isPending}
            />
            <Button
              onClick={handleSend}
              disabled={!message.trim() || sendMutation.isPending}
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 text-white"
            >
              {sendMutation.isPending ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
