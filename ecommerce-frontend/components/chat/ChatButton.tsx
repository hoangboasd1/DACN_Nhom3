'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { MessageCircle } from 'lucide-react';
import ChatPopup from './ChatPopup';

interface ChatButtonProps {
  currentUserId?: number;
  token?: string;
  isAdmin?: boolean;
}

const ChatButton: React.FC<ChatButtonProps> = ({ 
  currentUserId, 
  token, 
  isAdmin = false 
}) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [hasUnreadMessages] = useState(false);
  const pathname = usePathname();

  // Don't render if no user is logged in
  if (!currentUserId || !token) {
    return null;
  }

  // Don't render chat button on admin pages
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-4 right-4 z-40 bg-white border border-gray-300 hover:border-black text-black p-4 rounded-full shadow-lg transition-all duration-200"
        style={{ display: isChatOpen ? 'none' : 'flex' }}
      >
        <MessageCircle size={24} />
        {hasUnreadMessages && (
          <span className="absolute -top-2 -right-2 bg-black text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
            !
          </span>
        )}
      </button>

      {/* Chat Popup */}
      <ChatPopup
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        currentUserId={currentUserId}
        token={token}
        isAdmin={isAdmin}
      />
    </>
  );
};

export default ChatButton;
