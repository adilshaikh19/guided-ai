'use client';

import { Suspense } from 'react';
import ChatPage from './ChatPage';

export default function ChatRoute() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-screen">Loading...</div>}>
      <ChatPage />
    </Suspense>
  );
}
