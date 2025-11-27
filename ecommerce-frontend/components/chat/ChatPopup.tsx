'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Send, MessageCircle, Minimize2, Maximize2 } from 'lucide-react';
import { Message, Conversation } from '../../types/chat';
import chatService from '../../services/chatService';

interface ChatPopupProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserId: number;
  token: string;
  isAdmin: boolean;
}

const ChatPopup: React.FC<ChatPopupProps> = ({ 
  isOpen, 
  onClose, 
  currentUserId, 
  token, 
  isAdmin 
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<string>('Disconnected');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteAdminId, setDeleteAdminId] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end',
        inline: 'nearest'
      });
    }
  }, []);

  const loadMessages = useCallback(async (otherUserId: number) => {
    try {
      setIsLoading(true);
      const msgs = await chatService.getMessages(otherUserId, token);
      setMessages(msgs);
      
      // Mark messages as read
      await chatService.markMessagesAsReadAPI(otherUserId, token);
      
      // Update conversation unread count
      setConversations(prev => 
        prev.map(conv => 
          conv.otherUserId === otherUserId
            ? { ...conv, unreadCount: 0 }
            : conv
        )
      );
      
      // Scroll to bottom after loading messages
      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setIsLoading(false);
    }
  }, [token, scrollToBottom]);

  const loadConversations = useCallback(async () => {
    try {
      const convs = await chatService.getConversations(token);
      setConversations(convs);
      
      // Auto-select first conversation for users, or none for admin
      if (!isAdmin && convs.length > 0) {
        setSelectedConversation(convs[0].otherUserId);
        await loadMessages(convs[0].otherUserId);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  }, [token, isAdmin, loadMessages]);

  const initializeChat = useCallback(async (): Promise<void> => {
    try {
      setConnectionStatus('Connecting...');
      await chatService.startConnection(token);
      setConnectionStatus('Connected');
      
      // Set up event listeners
      chatService.onReceiveMessage((message: Message) => {
        // Check if this is a delete confirmation message
        if (message.isFromAdmin && message.message.includes("Nếu không còn vấn đề gì nữa, bạn có thể đóng cuộc hội thoại này")) {
          setDeleteAdminId(message.senderId);
          setShowDeleteConfirm(true);
        }
        
        setMessages(prev => {
          // Check if message already exists to prevent duplicates
          const messageExists = prev.some(msg => 
            msg.id === message.id || 
            (msg.senderId === message.senderId && 
             msg.message === message.message && 
             Math.abs(new Date(msg.createdAt).getTime() - new Date(message.createdAt).getTime()) < 1000)
          );
          
          if (messageExists) {
            return prev;
          }
          
          return [...prev, message];
        });
        
        // Update conversations
        setConversations(prev => 
          prev.map(conv => 
            conv.otherUserId === message.senderId
              ? { ...conv, lastMessage: message.message, lastMessageTime: message.createdAt, unreadCount: conv.unreadCount + 1 }
              : conv
          )
        );
      });

      chatService.onMessageSent((data: unknown) => {
        // Message sent confirmation
        console.log('Message sent:', data);
      });

      chatService.onMessagesRead(() => {
        // Update message read status
        setMessages(prev => 
          prev.map(msg => 
            msg.senderId === currentUserId && msg.id ? { ...msg, isRead: true } : msg
          )
        );
      });

      // Load conversations
      await loadConversations();
    } catch (error) {
      console.error('Chat initialization error:', error);
      setConnectionStatus('Connection Failed');
    }
  }, [token, currentUserId, loadConversations]);

  useEffect(() => {
    if (isOpen && token) {
      initializeChat();
    }
    
    // Cleanup function
    return () => {
      if (!isOpen) {
        chatService.stopConnection();
      }
    };
  }, [isOpen, token, initializeChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Scroll to bottom when chat popup is opened
  useEffect(() => {
    if (isOpen && messages.length > 0) {
      setTimeout(scrollToBottom, 200);
    }
  }, [isOpen, scrollToBottom]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const messageToSend = newMessage.trim();
    setNewMessage(''); // Clear input immediately to prevent double send

    try {
      if (isAdmin) {
        await chatService.sendMessageToUser(selectedConversation, messageToSend);
      } else {
        await chatService.sendMessageToAdmin(messageToSend);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setNewMessage(messageToSend); // Restore message if failed
    }
  };

  const selectConversation = async (userId: number) => {
    setSelectedConversation(userId);
    await loadMessages(userId);
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteAdminId) return;
    
    try {
      await chatService.deleteConversation(deleteAdminId, token);
      
      // Clear messages and conversation
      setMessages([]);
      setConversations(prev => prev.filter(conv => conv.otherUserId !== deleteAdminId));
      setSelectedConversation(null);
      
      // Close modal
      setShowDeleteConfirm(false);
      setDeleteAdminId(null);
      
      alert('Cuộc hội thoại đã được xóa thành công');
    } catch (error) {
      console.error('Error deleting conversation:', error);
      alert('Có lỗi xảy ra khi xóa cuộc hội thoại');
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setDeleteAdminId(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className={`bg-white rounded-lg shadow-2xl border transition-all duration-300 ${
        isMinimized ? 'w-80 h-12' : 'w-96 h-[32rem]'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-3 bg-black text-white rounded-t-lg">
          <div className="flex items-center space-x-2">
            <MessageCircle size={20} />
            <div className="flex flex-col">
              <span className="font-medium text-sm">
                {isAdmin ? 'Admin Chat' : (
                  selectedConversation && conversations.length > 0 
                    ? conversations.find(c => c.otherUserId === selectedConversation)?.otherUserName || 'Hỗ trợ khách hàng'
                    : 'Hỗ trợ khách hàng'
                )}
              </span>
              <span className={`text-xs ${
                connectionStatus === 'Connected' ? 'text-green-300' : 
                connectionStatus === 'Connecting...' ? 'text-yellow-300' : 'text-red-300'
              }`}>
                {connectionStatus}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="hover:bg-gray-800 p-1 rounded transition-colors"
            >
              {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
            </button>
            <button
              onClick={onClose}
              className="hover:bg-gray-800 p-1 rounded transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <div className="flex h-[28rem]">
            {/* Conversations Sidebar (for admin) */}
            {isAdmin && (
              <div className="w-1/3 border-r bg-gray-50">
                <div className="p-2 border-b bg-gray-100">
                  <h3 className="font-semibold text-sm">Cuộc hội thoại</h3>
                </div>
                <div className="overflow-y-auto h-full">
                  {conversations.map((conv) => (
                    <div
                      key={conv.otherUserId}
                      onClick={() => selectConversation(conv.otherUserId)}
                      className={`p-3 cursor-pointer hover:bg-gray-100 border-b ${
                        selectedConversation === conv.otherUserId ? 'bg-gray-200' : ''
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="font-semibold text-sm">{conv.otherUserName}</div>
                          <div className="text-xs text-gray-500 truncate">
                            {conv.lastMessage}
                          </div>
                        </div>
                        {conv.unreadCount > 0 && (
                          <span className="bg-black text-white text-xs rounded-full px-2 py-1">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {formatTime(conv.lastMessageTime)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Chat Messages */}
            <div className={`flex flex-col ${isAdmin ? 'w-2/3' : 'w-full'}`}>
              {selectedConversation || !isAdmin ? (
                <>
                  {/* Messages Area */}
                  <div className="flex-1 overflow-y-auto p-3 space-y-3">
                    {isLoading ? (
                      <div className="text-center text-gray-500">Đang tải...</div>
                    ) : messages.length === 0 ? (
                      <div className="text-center text-gray-500">
                        Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!
                      </div>
                    ) : (
                      messages.map((message, index) => (
                        <div
                          key={index}
                          className={`flex ${
                            message.senderId === currentUserId ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          <div
                            className={`max-w-[80%] p-3 rounded-lg ${
                              message.senderId === currentUserId
                                ? 'bg-black text-white'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {/* Hiển thị tên Admin cho tất cả tin nhắn từ Admin */}
                            {message.isFromAdmin && (
                              <div className={`text-xs font-semibold mb-1 ${
                                message.senderId === currentUserId ? 'text-gray-300' : 'text-black'
                              }`}>
                                {message.senderName || 'Admin'}
                                <span className="ml-1">📞</span>
                              </div>
                            )}
                            {/* Hiển thị tên user nếu không phải Admin và không phải tin nhắn của mình */}
                            {!message.isFromAdmin && message.senderId !== currentUserId && (
                              <div className="text-xs font-semibold mb-1 text-gray-600">
                                {message.senderName || 'User'}
                              </div>
                            )}
                            <div className="text-sm">{message.message}</div>
                            <div
                              className={`text-xs mt-1 ${
                                message.senderId === currentUserId
                                  ? 'text-blue-100'
                                  : 'text-gray-500'
                              }`}
                            >
                              {formatTime(message.createdAt)}
                              {message.senderId === currentUserId && message.isRead && (
                                <span className="ml-1">✓✓</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                    
                    {/* Delete Confirmation Card - Ở cuối tin nhắn */}
                    {showDeleteConfirm && (
                      <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl p-4 mx-2 mt-4 shadow-lg">
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                              </svg>
                            </div>
                          </div>
                          <div className="flex-1">
                            <h4 className="text-sm font-semibold text-red-800 mb-2">
                              🗑️ Yêu cầu xóa cuộc hội thoại
                            </h4>
                            <p className="text-sm text-red-700 mb-4">
                              Admin đã yêu cầu xóa cuộc hội thoại này. Bạn có đồng ý xóa toàn bộ lịch sử tin nhắn không?
                            </p>
                            <div className="flex space-x-3">
                              <button
                                onClick={handleCancelDelete}
                                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm"
                              >
                                ❌ Từ chối
                              </button>
                              <button
                                onClick={handleConfirmDelete}
                                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-500 border border-red-500 rounded-lg hover:bg-red-600 hover:border-red-600 transition-all duration-200 shadow-sm"
                              >
                                ✅ Xác nhận xóa
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <div className="border-t p-3">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            sendMessage();
                          }
                        }}
                        placeholder="Nhập tin nhắn..."
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-black"
                      />
                      <button
                        onClick={sendMessage}
                        disabled={!newMessage.trim()}
                        className="bg-black text-white p-2 rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <Send size={16} />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  Chọn một cuộc hội thoại để bắt đầu
                </div>
              )}
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default ChatPopup;
