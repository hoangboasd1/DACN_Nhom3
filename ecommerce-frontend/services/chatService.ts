import * as signalR from '@microsoft/signalr';
import axios from 'axios';
import { Message, Conversation, User } from '../types/chat';

class ChatService {
  private connection: signalR.HubConnection | null = null;
  private baseURL = 'http://localhost:5091'; // Backend URL

  async startConnection(token: string): Promise<void> {
    if (this.connection) {
      return;
    }

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(`${this.baseURL}/chathub`, {
        accessTokenFactory: () => token,
        transport: signalR.HttpTransportType.ServerSentEvents | signalR.HttpTransportType.LongPolling,
        skipNegotiation: false,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .withAutomaticReconnect([0, 2000, 10000, 30000])
      .configureLogging(signalR.LogLevel.Information)
      .build();

    try {
      await this.connection.start();
      console.log('SignalR Connected successfully');
    } catch (error) {
      console.error('SignalR Connection Error:', error);
      
      // Try fallback connection without WebSockets
      if (this.connection) {
        await this.connection.stop();
        this.connection = null;
      }
      
      this.connection = new signalR.HubConnectionBuilder()
        .withUrl(`${this.baseURL}/chathub?access_token=${encodeURIComponent(token)}`)
        .withAutomaticReconnect([0, 2000, 10000, 30000])
        .configureLogging(signalR.LogLevel.Information)
        .build();
        
      try {
        await this.connection.start();
        console.log('SignalR Connected with fallback method');
      } catch (fallbackError) {
        console.error('SignalR Fallback Connection Error:', fallbackError);
        throw fallbackError;
      }
    }
  }

  async stopConnection(): Promise<void> {
    if (this.connection) {
      // Clear all event listeners
      this.connection.off('ReceiveMessage');
      this.connection.off('MessageSent');
      this.connection.off('MessagesRead');
      
      await this.connection.stop();
      this.connection = null;
    }
  }

  getConnectionState(): string {
    if (!this.connection) return 'Disconnected';
    return this.connection.state;
  }

  isConnected(): boolean {
    return this.connection?.state === 'Connected';
  }

  onReceiveMessage(callback: (message: Message) => void): void {
    if (this.connection) {
      // Remove existing listeners to prevent duplicates
      this.connection.off('ReceiveMessage');
      this.connection.on('ReceiveMessage', callback);
    }
  }

  onMessageSent(callback: (data: any) => void): void {
    if (this.connection) {
      // Remove existing listeners to prevent duplicates
      this.connection.off('MessageSent');
      this.connection.on('MessageSent', callback);
    }
  }

  onMessagesRead(callback: (userId: number) => void): void {
    if (this.connection) {
      // Remove existing listeners to prevent duplicates
      this.connection.off('MessagesRead');
      this.connection.on('MessagesRead', callback);
    }
  }

  async sendMessageToUser(receiverId: number, message: string): Promise<void> {
    if (this.connection) {
      await this.connection.invoke('SendMessageToUser', receiverId, message);
    }
  }

  async sendMessageToAdmin(message: string): Promise<void> {
    if (this.connection) {
      await this.connection.invoke('SendMessageToAdmin', message);
    }
  }

  async markMessagesAsRead(otherUserId: number): Promise<void> {
    if (this.connection) {
      await this.connection.invoke('MarkMessagesAsRead', otherUserId);
    }
  }

  // HTTP API calls
  async getMessages(otherUserId: number, token: string): Promise<Message[]> {
    try {
      const response = await axios.get(`${this.baseURL}/api/chat/messages/${otherUserId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  }

  async getConversations(token: string): Promise<Conversation[]> {
    try {
      const response = await axios.get(`${this.baseURL}/api/chat/conversations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching conversations:', error);
      throw error;
    }
  }

  async markMessagesAsReadAPI(otherUserId: number, token: string): Promise<void> {
    try {
      await axios.post(`${this.baseURL}/api/chat/mark-read/${otherUserId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      console.error('Error marking messages as read:', error);
      throw error;
    }
  }

  async getUsersForAdmin(token: string): Promise<User[]> {
    try {
      const response = await axios.get(`${this.baseURL}/api/chat/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching users for admin:', error);
      throw error;
    }
  }

  async deleteConversation(otherUserId: number, token: string): Promise<void> {
    try {
      await axios.delete(`${this.baseURL}/api/chat/conversation/${otherUserId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      console.error('Error deleting conversation:', error);
      throw error;
    }
  }
}

export default new ChatService();
