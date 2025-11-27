'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Users, 
  MessageCircle, 
  Clock, 
  Trash2, 
  Search,
  MoreVertical,
  Phone,
  Video,
  Paperclip,
  Smile,
  CheckCheck,
  Check,
  User as UserIcon,
  Shield,
  Crown,
  MapPin,
  Mail,
  Calendar,
  X
  } from 'lucide-react';
  import { Message, Conversation, User } from '../../../types/chat';
  import chatService from '../../../services/chatService';
  import { fetchCustomerStats, fetchCustomerOrders } from '../../services/api';

const AdminChatPage = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUsers, setShowUsers] = useState(false);
  const [showCustomerInfo, setShowCustomerInfo] = useState(false);
  const [selectedCustomerInfo, setSelectedCustomerInfo] = useState<any>(null);
  const [showOrderHistory, setShowOrderHistory] = useState(false);
  const [customerOrders, setCustomerOrders] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const initializeChat = async (userToken: string) => {
    try {
      await chatService.startConnection(userToken);
      
      // Set up event listeners
      chatService.onReceiveMessage((message: Message) => {
        setMessages(prev => [...prev, message]);
        
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
        console.log('Message sent:', data);
      });

      // Load initial data
      await Promise.all([
        loadConversations(userToken),
        loadUsers(userToken)
      ]);
    } catch (error) {
      console.error('Chat initialization error:', error);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (storedToken && storedUser) {
        try {
          const user = JSON.parse(storedUser);
          setCurrentUserId(user.id);
          setToken(storedToken);
          
          if (user.role === 'Admin') {
            initializeChat(storedToken);
          }
        } catch (error) {
          console.error('Error parsing user data:', error);
        }
      }
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadConversations = async (userToken: string) => {
    try {
      const convs = await chatService.getConversations(userToken);
      setConversations(convs);
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  const loadUsers = async (userToken: string) => {
    try {
      const userList = await chatService.getUsersForAdmin(userToken);
      setUsers(userList);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadMessages = async (otherUserId: number) => {
    if (!token) return;
    
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
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !token) return;

    const messageToSend = newMessage.trim();
    setNewMessage(''); // Clear input immediately to prevent double send

    try {
      await chatService.sendMessageToUser(selectedConversation, messageToSend);
    } catch (error) {
      console.error('Error sending message:', error);
      setNewMessage(messageToSend); // Restore message if failed
    }
  };

  const selectConversation = async (userId: number) => {
    setSelectedConversation(userId);
    await loadMessages(userId);
  };

  const startNewConversation = async (userId: number) => {
    setSelectedConversation(userId);
    setMessages([]);
    
    // Check if conversation already exists
    const existingConv = conversations.find(conv => conv.otherUserId === userId);
    if (existingConv) {
      await loadMessages(userId);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const handleDeleteConversation = async (userId: number, userName: string) => {
    const confirmDelete = window.confirm(
      `Bạn có chắc muốn gửi yêu cầu xóa cuộc hội thoại với ${userName}?\n\nHệ thống sẽ gửi tin nhắn xác nhận tới người dùng.`
    );
    
    if (confirmDelete) {
      try {
        // Gửi tin nhắn xác nhận xóa tới user
        const confirmMessage = "Nếu không còn vấn đề gì nữa, bạn có thể đóng cuộc hội thoại này. Nhấn xác nhận để xóa hội thoại.";
        await chatService.sendMessageToUser(userId, confirmMessage);
        
        // Có thể thêm thông báo thành công
        alert(`Đã gửi yêu cầu xác nhận xóa cuộc hội thoại tới ${userName}`);
      } catch (error) {
        console.error('Error sending delete confirmation:', error);
        alert('Có lỗi xảy ra khi gửi yêu cầu xóa cuộc hội thoại');
      }
    }
  };

  const handleShowCustomerInfo = async (userId: number) => {
    try {
      // Lấy thông tin thống kê từ API
      const customerStats = await fetchCustomerStats(userId);
      
      if (customerStats) {
        setSelectedCustomerInfo(customerStats);
        setShowCustomerInfo(true);
      }
    } catch (error) {
      console.error('Error loading customer info:', error);
      alert('Không thể tải thông tin khách hàng');
    }
  };

  const handleShowOrderHistory = async (userId: number) => {
    try {
      const orders = await fetchCustomerOrders(userId);
      setCustomerOrders(orders);
      setShowOrderHistory(true);
    } catch (error) {
      console.error('Error loading order history:', error);
      alert('Không thể tải lịch sử mua hàng');
    }
  };

  const closeCustomerInfo = () => {
    setShowCustomerInfo(false);
    setSelectedCustomerInfo(null);
  };

  const closeOrderHistory = () => {
    setShowOrderHistory(false);
    setCustomerOrders([]);
  };

  const selectedUser: User | Conversation | undefined = users.find(user => user.id === selectedConversation) || 
                      conversations.find(conv => conv.otherUserId === selectedConversation);

  const filteredConversations = conversations.filter(conv => 
    conv.otherUserName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <div className="p-2 bg-blue-500 rounded-xl mr-4">
                  <MessageCircle className="text-white" size={28} />
                </div>
                Trung tâm Chat Admin
              </h1>
              <p className="text-gray-600 mt-2">Hỗ trợ khách hàng 24/7 với giao diện hiện đại</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center bg-white rounded-full px-4 py-2 shadow-md">
                <Shield className="text-blue-500 mr-2" size={20} />
                <span className="text-sm font-medium">Admin Mode</span>
              </div>
              <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                {conversations.length} cuộc hội thoại
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden" style={{ height: '75vh' }}>
          <div className="flex h-full">
            {/* Sidebar - Modern Design */}
            <div className="w-1/3 bg-white border-r border-gray-100 flex flex-col">
              {/* Search and Toggle */}
              <div className="p-6 border-b border-gray-100">
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm kiếm khách hàng..."
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl border-0 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  />
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowUsers(false)}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                      !showUsers 
                        ? 'bg-blue-500 text-white shadow-md' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <MessageCircle size={16} className="inline mr-2" />
                    Cuộc hội thoại
                  </button>
                  <button
                    onClick={() => setShowUsers(true)}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                      showUsers 
                        ? 'bg-blue-500 text-white shadow-md' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <Users size={16} className="inline mr-2" />
                    Khách hàng
                  </button>
                </div>
              </div>

              {/* Content Area */}
              <div className="flex-1 overflow-hidden">
                {!showUsers ? (
                  /* Conversations List */
                  <div className="h-full overflow-y-auto">
                    {filteredConversations.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-gray-500">
                        <MessageCircle size={48} className="mb-4 text-gray-300" />
                        <p className="text-lg font-medium">Chưa có cuộc hội thoại</p>
                        <p className="text-sm">Khách hàng sẽ xuất hiện ở đây khi họ liên hệ</p>
                      </div>
                    ) : (
                      filteredConversations.map((conv) => (
                        <div
                          key={conv.otherUserId}
                          className={`p-4 border-b border-gray-50 transition-all cursor-pointer group ${
                            selectedConversation === conv.otherUserId 
                              ? 'bg-blue-50 border-l-4 border-l-blue-500' 
                              : 'hover:bg-gray-50'
                          }`}
                          onClick={() => selectConversation(conv.otherUserId)}
                        >
                          <div className="flex items-start space-x-3">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                              conv.unreadCount > 0 
                                ? 'bg-blue-500' 
                                : 'bg-gray-200'
                            }`}>
                              <UserIcon className="text-white" size={20} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <h4 className="font-semibold text-gray-900 truncate">
                                  {conv.otherUserName}
                                </h4>
                                <div className="flex items-center space-x-2">
                                  {conv.unreadCount > 0 && (
                                    <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 font-medium">
                                      {conv.unreadCount}
                                    </span>
                                  )}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteConversation(conv.otherUserId, conv.otherUserName);
                                    }}
                                    className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-all"
                                    title="Xóa cuộc hội thoại"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </div>
                              <p className="text-sm text-gray-600 truncate mt-1">
                                {conv.lastMessage}
                              </p>
                              <div className="flex items-center text-xs text-gray-400 mt-2">
                                <Clock size={12} className="mr-1" />
                                {formatTime(conv.lastMessageTime)}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                ) : (
                  /* Users List */
                  <div className="h-full overflow-y-auto">
                    {filteredUsers.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-gray-500">
                        <Users size={48} className="mb-4 text-gray-300" />
                        <p className="text-lg font-medium">Chưa có khách hàng</p>
                        <p className="text-sm">Danh sách khách hàng sẽ hiển thị ở đây</p>
                      </div>
                    ) : (
                      filteredUsers.map((user) => (
                        <div
                          key={user.id}
                          onClick={() => startNewConversation(user.id)}
                          className="p-4 border-b border-gray-50 hover:bg-gray-50 transition-all cursor-pointer group"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                              <UserIcon className="text-white" size={18} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-900 truncate">{user.name}</h4>
                              <p className="text-sm text-gray-500 truncate">{user.email}</p>
                            </div>
                            <div className="opacity-0 group-hover:opacity-100">
                              <MessageCircle className="text-blue-500" size={16} />
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Chat Area - Modern Design */}
            <div className="w-2/3 flex flex-col bg-white">
              {selectedConversation ? (
                <>
                  {/* Chat Header */}
                  <div className="p-6 border-b border-gray-100 bg-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                          <UserIcon className="text-white" size={24} />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {selectedUser ? ('otherUserName' in selectedUser ? selectedUser.otherUserName : selectedUser.name) : 'Khách hàng'}
                          </h3>
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            <span className="text-sm text-gray-500">Đang hoạt động</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all">
                          <Phone size={18} />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all">
                          <Video size={18} />
                        </button>
                        <button 
                          onClick={() => handleShowCustomerInfo(selectedConversation)}
                          className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                          title="Xem thông tin khách hàng"
                        >
                          <MoreVertical size={18} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Messages Area */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
                    {isLoading ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                          <p className="text-gray-500">Đang tải tin nhắn...</p>
                        </div>
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <MessageCircle size={64} className="mx-auto mb-4 text-gray-300" />
                          <h3 className="text-xl font-medium text-gray-900 mb-2">Bắt đầu cuộc trò chuyện</h3>
                          <p className="text-gray-500">Gửi tin nhắn đầu tiên để hỗ trợ khách hàng</p>
                        </div>
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
                            className={`max-w-[70%] group ${
                              message.senderId === currentUserId ? 'flex flex-col items-end' : 'flex flex-col items-start'
                            }`}
                          >
                            {/* Sender Name */}
                            {message.senderId !== currentUserId && (
                              <div className="flex items-center space-x-2 mb-1">
                                <div className={`text-xs font-medium ${
                                  message.isFromAdmin ? 'text-blue-600' : 'text-gray-600'
                                }`}>
                                  {message.senderName || (message.isFromAdmin ? 'Admin' : 'Khách hàng')}
                                </div>
                                {message.isFromAdmin && (
                                  <Crown className="text-yellow-500" size={12} />
                                )}
                              </div>
                            )}
                            
                            {/* Message Bubble */}
                            <div
                              className={`relative p-4 rounded-2xl shadow-sm ${
                                message.senderId === currentUserId
                                  ? 'bg-blue-500 text-white'
                                  : 'bg-white text-gray-800 border border-gray-100'
                              }`}
                            >
                              <div className="text-sm leading-relaxed">{message.message}</div>
                              
                              {/* Message Time & Status */}
                              <div className={`flex items-center justify-end mt-2 space-x-1 ${
                                message.senderId === currentUserId ? 'text-blue-100' : 'text-gray-400'
                              }`}>
                                <span className="text-xs">{formatTime(message.createdAt)}</span>
                                {message.senderId === currentUserId && (
                                  <div className="flex items-center">
                                    {message.isRead ? (
                                      <CheckCheck size={14} className="text-blue-200" />
                                    ) : (
                                      <Check size={14} className="text-blue-200" />
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <div className="p-6 bg-white border-t border-gray-100">
                    <div className="flex items-end space-x-3">
                      <div className="flex-1 relative">
                        <div className="flex items-center bg-gray-50 rounded-2xl px-4 py-3 border-2 border-transparent focus-within:border-blue-500 focus-within:bg-white transition-all">
                          <button className="p-1 text-gray-400 hover:text-gray-600 mr-2">
                            <Paperclip size={18} />
                          </button>
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
                            className="flex-1 bg-transparent border-0 outline-none text-gray-900 placeholder-gray-500"
                          />
                          <button className="p-1 text-gray-400 hover:text-gray-600 ml-2">
                            <Smile size={18} />
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={sendMessage}
                        disabled={!newMessage.trim()}
                        className="bg-blue-500 text-white p-3 rounded-2xl hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                      >
                        <Send size={18} />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <MessageCircle size={48} className="text-blue-500" />
                    </div>
                    <h3 className="text-2xl font-semibold text-gray-900 mb-2">Chọn cuộc hội thoại</h3>
                    <p className="text-gray-500 max-w-md">
                      Chọn một cuộc hội thoại từ danh sách bên trái hoặc bắt đầu trò chuyện với khách hàng mới
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Customer Info Popup */}
      {showCustomerInfo && selectedCustomerInfo && (
        <div 
          className="fixed inset-0 bg-white bg-opacity-20 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300"
          onClick={closeCustomerInfo}
        >
          <div 
            className="bg-white bg-opacity-95 backdrop-blur-md rounded-3xl shadow-2xl border border-white border-opacity-20 max-w-md w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                  <UserIcon className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Thông tin khách hàng</h3>
                  <p className="text-sm text-gray-500">Chi tiết tài khoản</p>
                </div>
              </div>
              <button
                onClick={closeCustomerInfo}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="bg-blue-50 rounded-2xl p-4">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
                    <UserIcon className="text-white" size={32} />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900">{selectedCustomerInfo.name}</h4>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-sm text-gray-600">{selectedCustomerInfo.status}</span>
                    </div>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  <p className="flex items-center space-x-2">
                    <Phone size={14} />
                    <span>{selectedCustomerInfo.phone || 'Chưa cập nhật'}</span>
                  </p>
                </div>
              </div>


              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white border border-gray-100 rounded-2xl p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{selectedCustomerInfo.totalOrders}</div>
                  <div className="text-sm text-gray-500">Đơn hàng</div>
                </div>
                <div className="bg-white border border-gray-100 rounded-2xl p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{selectedCustomerInfo.totalSpent?.toLocaleString('vi-VN')}₫</div>
                  <div className="text-sm text-gray-500">Đã chi tiêu</div>
                </div>
              </div>

              {/* Additional Info */}
              <div className="space-y-3">
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <span className="text-sm text-gray-600 flex items-center">
                    <Calendar className="mr-2" size={16} />
                    Tham gia
                  </span>
                  <span className="text-sm font-medium text-gray-900">{selectedCustomerInfo.joinDate}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <span className="text-sm text-gray-600 flex items-center">
                    <Clock className="mr-2" size={16} />
                    Đơn hàng cuối
                  </span>
                  <span className="text-sm font-medium text-gray-900">{selectedCustomerInfo.lastOrderDate || 'Chưa có'}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4">
                <button 
                  onClick={() => handleShowOrderHistory(selectedCustomerInfo.userId)}
                  className="flex-1 bg-blue-500 text-white py-3 px-4 rounded-xl font-medium hover:bg-blue-600 transition-all"
                >
                  Lịch sử mua
                </button>
                <button className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-xl font-medium hover:bg-gray-200 transition-all">
                  Gửi email
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Order History Popup */}
      {showOrderHistory && (
        <div 
          className="fixed inset-0 bg-white bg-opacity-20 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300"
          onClick={closeOrderHistory}
        >
          <div 
            className="bg-white bg-opacity-95 backdrop-blur-md rounded-3xl shadow-2xl border border-white border-opacity-20 max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                  <Calendar className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Lịch sử mua hàng</h3>
                  <p className="text-sm text-gray-500">Danh sách đơn hàng của khách hàng</p>
                </div>
              </div>
              <button
                onClick={closeOrderHistory}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {customerOrders.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar size={64} className="mx-auto mb-4 text-gray-300" />
                  <h3 className="text-xl font-medium text-gray-900 mb-2">Chưa có đơn hàng</h3>
                  <p className="text-gray-500">Khách hàng chưa có đơn hàng nào</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {customerOrders.map((order) => (
                    <div key={order.orderId} className="bg-white border border-gray-100 rounded-2xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-sm">#{order.orderId}</span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">Đơn hàng #{order.orderId}</h4>
                            <p className="text-sm text-gray-500">{formatDate(order.orderDate)}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-600">{order.totalAmount?.toLocaleString('vi-VN')}₫</div>
                          <div className={`text-sm px-2 py-1 rounded-full ${
                            order.status === 'Completed' ? 'bg-green-100 text-green-800' :
                            order.status === 'Processing' ? 'bg-blue-100 text-blue-800' :
                            order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {order.status === 'Completed' ? 'Hoàn thành' :
                             order.status === 'Processing' ? 'Đang xử lý' :
                             order.status === 'Pending' ? 'Chờ xử lý' :
                             'Đã hủy'}
                          </div>
                        </div>
                      </div>
                      
                      {/* Order Details */}
                      {order.orderDetails && order.orderDetails.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <h5 className="text-sm font-medium text-gray-700 mb-2">Sản phẩm:</h5>
                          <div className="space-y-2">
                            {order.orderDetails.map((detail: any, index: number) => (
                              <div key={index} className="flex items-center justify-between text-sm">
                                <div className="flex items-center space-x-2">
                                  <span className="text-gray-600">{detail.product?.name || 'Sản phẩm không xác định'}</span>
                                  <span className="text-gray-400">x{detail.quantity}</span>
                                </div>
                                <span className="font-medium text-gray-900">
                                  {(detail.product?.price * detail.quantity)?.toLocaleString('vi-VN')}₫
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminChatPage;
