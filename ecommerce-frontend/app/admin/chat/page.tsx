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
  CheckCheck,
  Check,
  User as UserIcon,
  Shield,
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
  
        const confirmMessage = "Nếu không còn vấn đề gì nữa, bạn có thể đóng cuộc hội thoại này. Nhấn xác nhận để xóa hội thoại.";
        await chatService.sendMessageToUser(userId, confirmMessage);
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
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="mx-auto max-w-6xl space-y-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500 text-white rounded-lg">
              <MessageCircle size={20} />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Trung tâm Chat Admin</h1>
              <p className="text-sm text-gray-500">Theo dõi và hỗ trợ khách hàng nhanh chóng</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm">
           
            <span className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-full font-medium">
              {conversations.length} cuộc hội thoại
            </span>
          </div>
        </div>

        <div className="flex flex-row gap-4 h-[75vh] overflow-hidden">
          {/* Sidebar */}
          <section className="bg-white border border-gray-200 rounded-xl flex flex-col">
            <div className="border-b border-gray-200 p-4 space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm khách hàng hoặc cuộc chat"
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm text-gray-700 focus:border-blue-500 focus:bg-white focus:outline-none"
                />
              </div>
              <div className="flex gap-2 text-sm">
                <button
                  type="button"
                  onClick={() => setShowUsers(false)}
                  className={`flex-1 rounded-lg border px-3 py-2 transition ${
                    !showUsers ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-gray-200 text-gray-600'
                  }`}
                >
                  Cuộc hội thoại
                </button>
                <button
                  type="button"
                  onClick={() => setShowUsers(true)}
                  className={`flex-1 rounded-lg border px-3 py-2 transition ${
                    showUsers ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-gray-200 text-gray-600'
                  }`}
                >
                  Khách hàng
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {!showUsers ? (
                filteredConversations.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center text-sm text-gray-500">
                    <MessageCircle className="mb-2 text-gray-300" size={36} />
                    <p>Chưa có cuộc trò chuyện</p>
                  </div>
                ) : (
                  filteredConversations.map((conv) => (
                    <button
                      type="button"
                      key={conv.otherUserId}
                      onClick={() => selectConversation(conv.otherUserId)}
                      className={`w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition ${
                        selectedConversation === conv.otherUserId ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`h-10 w-10 rounded-full flex items-center justify-center text-white ${
                            conv.unreadCount ? 'bg-blue-500' : 'bg-gray-300'
                          }`}
                        >
                          <UserIcon size={18} />
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-sm text-gray-900 truncate">{conv.otherUserName}</p>
                            <span className="text-xs text-gray-400">{formatTime(conv.lastMessageTime)}</span>
                          </div>
                          <p className="text-xs text-gray-500 truncate">{conv.lastMessage}</p>
                          {conv.unreadCount > 0 && (
                            <span className="inline-block rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-600">
                              {conv.unreadCount} tin mới
                            </span>
                          )}
                        </div>
                        <div
                          role="button"
                          tabIndex={0}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteConversation(conv.otherUserId, conv.otherUserName);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              handleDeleteConversation(conv.otherUserId, conv.otherUserName);
                            }
                          }}
                          className="text-gray-400 hover:text-red-500"
                          title="Đề nghị xóa cuộc hội thoại"
                        >
                          <Trash2 size={14} />
                        </div>
                      </div>
                    </button>
                  ))
                )
              ) : filteredUsers.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-sm text-gray-500">
                  <Users className="mb-2 text-gray-300" size={36} />
                  <p>Chưa có khách hàng</p>
                </div>
              ) : (
                filteredUsers.map((user) => (
                  <button
                    type="button"
                    key={user.id}
                    onClick={() => startNewConversation(user.id)}
                    className="w-full px-4 py-3 border-b border-gray-100 text-left hover:bg-gray-50 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-blue-500 text-white flex items-center justify-center">
                        <UserIcon size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </section>

          {/* Chat Area */}
          <section className="flex-1 bg-white border border-gray-200 rounded-xl flex flex-col">
            {selectedConversation ? (
              <>
                <div className="border-b border-gray-200 p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-blue-500 text-white flex items-center justify-center">
                      <UserIcon size={22} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {selectedUser ? ('otherUserName' in selectedUser ? selectedUser.otherUserName : selectedUser.name) : 'Khách hàng'}
                      </p>
                      <span className="text-xs text-gray-500">Đang hoạt động</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500">
                    <button className="rounded-lg border border-gray-200 p-2 hover:border-blue-400 hover:text-blue-500">
                      <Phone size={16} />
                    </button>
                    <button className="rounded-lg border border-gray-200 p-2 hover:border-blue-400 hover:text-blue-500">
                      <Video size={16} />
                    </button>
                    <button
                      onClick={() => handleShowCustomerInfo(selectedConversation)}
                      className="rounded-lg border border-gray-200 p-2 hover:border-blue-400 hover:text-blue-500"
                      title="Xem thông tin khách hàng"
                    >
                      <MoreVertical size={16} />
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                  {isLoading ? (
                    <div className="flex h-full items-center justify-center text-sm text-gray-500">
                      Đang tải tin nhắn...
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex h-full items-center justify-center text-center text-sm text-gray-500">
                      Gửi tin đầu tiên để bắt đầu trao đổi.
                    </div>
                  ) : (
                    messages.map((message, index) => (
                      <div
                        key={index}
                        className={`flex ${message.senderId === currentUserId ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className="max-w-[70%] space-y-1">
                          {message.senderId !== currentUserId && (
                            <p className="text-xs text-gray-500">
                              {message.senderName || (message.isFromAdmin ? 'Admin' : 'Khách hàng')}
                            </p>
                          )}
                          <div
                            className={`rounded-lg px-3 py-2 text-sm ${
                              message.senderId === currentUserId
                                ? 'bg-blue-500 text-white'
                                : 'bg-white border border-gray-200 text-gray-800'
                            }`}
                          >
                            <p>{message.message}</p>
                            <div
                              className={`mt-1 flex items-center justify-end gap-1 text-xs ${
                                message.senderId === currentUserId ? 'text-blue-100' : 'text-gray-400'
                              }`}
                            >
                              <span>{formatTime(message.createdAt)}</span>
                              {message.senderId === currentUserId && (
                                message.isRead ? <CheckCheck size={12} /> : <Check size={12} />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <div className="border-t border-gray-200 p-4">
                  <div className="flex gap-3">
                    <div className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 focus-within:bg-white focus-within:border-blue-400">
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
                        className="w-full bg-transparent text-sm text-gray-700 focus:outline-none"
                      />
                    </div>
                    <button
                      onClick={sendMessage}
                      disabled={!newMessage.trim()}
                      className="flex items-center justify-center rounded-lg bg-blue-500 px-4 py-2 text-white text-sm hover:bg-blue-600 disabled:opacity-50"
                    >
                      <Send size={16} />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center text-center text-gray-500">
                <MessageCircle className="mb-2 text-gray-300" size={48} />
                <p className="text-sm">Chọn một cuộc hội thoại ở danh sách bên trái</p>
              </div>
            )}
          </section>
        </div>
      </div>

      {showCustomerInfo && selectedCustomerInfo && (
        <div
          className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4"
          onClick={closeCustomerInfo}
        >
          <div
            className="w-full max-w-md rounded-xl bg-white p-5 shadow-lg space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Thông tin khách hàng</p>
                <p className="text-lg font-semibold text-gray-900">{selectedCustomerInfo.name}</p>
              </div>
              <button className="text-gray-400 hover:text-gray-600" onClick={closeCustomerInfo}>
                <X size={18} />
              </button>
            </div>
            <div className="space-y-2 text-sm text-gray-600">
              <p>Số điện thoại: {selectedCustomerInfo.phone || 'Chưa cập nhật'}</p>
              <p>Trạng thái: {selectedCustomerInfo.status || 'Không rõ'}</p>
              <p>Tham gia: {selectedCustomerInfo.joinDate}</p>
              <p>Đơn gần nhất: {selectedCustomerInfo.lastOrderDate || 'Chưa có'}</p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="rounded-lg border border-gray-200 p-3">
                <p className="text-xs text-gray-500">Đơn hàng</p>
                <p className="text-lg font-semibold text-gray-900">{selectedCustomerInfo.totalOrders}</p>
              </div>
              <div className="rounded-lg border border-gray-200 p-3">
                <p className="text-xs text-gray-500">Đã chi tiêu</p>
                <p className="text-lg font-semibold text-gray-900">
                  {selectedCustomerInfo.totalSpent?.toLocaleString('vi-VN')}₫
                </p>
              </div>
            </div>
            <button
              onClick={() => handleShowOrderHistory(selectedCustomerInfo.userId)}
              className="w-full rounded-lg bg-blue-500 py-2 text-white text-sm hover:bg-blue-600"
            >
              Xem lịch sử mua hàng
            </button>
          </div>
        </div>
      )}

      {showOrderHistory && (
        <div
          className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4"
          onClick={closeOrderHistory}
        >
          <div
            className="w-full max-w-3xl rounded-xl bg-white p-5 shadow-lg space-y-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <p className="text-lg font-semibold text-gray-900">Lịch sử mua hàng</p>
              <button className="text-gray-400 hover:text-gray-600" onClick={closeOrderHistory}>
                <X size={18} />
              </button>
            </div>
            {customerOrders.length === 0 ? (
              <p className="text-sm text-gray-500">Khách hàng chưa có đơn hàng nào.</p>
            ) : (
              <div className="space-y-3">
                {customerOrders.map((order) => (
                  <div key={order.orderId} className="rounded-lg border border-gray-200 p-4 space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-gray-900">Đơn #{order.orderId}</p>
                      <span className="text-gray-500">{formatDate(order.orderDate)}</span>
                    </div>
                    <p className="text-gray-600">
                      Tổng tiền:{' '}
                      <span className="font-medium text-gray-900">{order.totalAmount?.toLocaleString('vi-VN')}₫</span>
                    </p>
                    <p className="text-gray-600">
                      Trạng thái: <span className="font-medium text-gray-900">{order.status}</span>
                    </p>
                    {order.orderDetails && order.orderDetails.length > 0 && (
                      <div className="rounded bg-gray-50 p-3 space-y-1">
                        {order.orderDetails.map((detail: any, index: number) => (
                          <div key={index} className="flex justify-between text-xs text-gray-600">
                            <span>
                              {detail.product?.name || 'Sản phẩm không xác định'} x{detail.quantity}
                            </span>
                            <span>
                              {(detail.product?.price * detail.quantity)?.toLocaleString('vi-VN')}₫
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminChatPage;
