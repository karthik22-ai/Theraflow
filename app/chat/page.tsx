'use client';

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'therapist';
  timestamp: string;
}

// Helper function to generate unique IDs
const generateUniqueId = () => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export default function ChatPage() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi there! How are you feeling today? I'm here to listen and help you navigate your thoughts and emotions.",
      sender: 'therapist',
      timestamp: '10:30 AM'
    },
    {
      id: '2',
      text: "I'm feeling a bit overwhelmed with work and personal life. It's hard to balance everything.",
      sender: 'user',
      timestamp: '10:31 AM'
    },
    {
      id: '3',
      text: "I understand. It's common to feel overwhelmed when juggling multiple responsibilities. Let's explore some strategies to help you manage your stress and find a better balance. Would you like to start by discussing your work or personal life first?",
      sender: 'therapist',
      timestamp: '10:32 AM'
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Generate unique IDs for user and session
  const [userId] = useState('user_local_test'); // For a real app, this would come from your auth system
  const [sessionId] = useState(generateUniqueId()); // A new session for each page load

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Check backend connection on component mount
  useEffect(() => {
    const checkConnection = async () => {
      console.log('Checking backend connection...');
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
        const response = await fetch(`${apiUrl}/health`);
        const result = { success: response.ok, message: response.ok ? 'Backend is accessible' : `Health endpoint returned ${response.status}` };
        console.log('Connection test result:', result);
        setIsConnected(result.success);
        
        if (!result.success) {
          console.error('Backend connection failed:', result.message);
        }
      } catch (error) {
        console.error('Backend connection failed:', error);
        setIsConnected(false);
      }
    };
    checkConnection();
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      const userMessage: Message = {
        id: Date.now().toString(),
        text: message.trim(),
        sender: 'user',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, userMessage]);
      setMessage('');
      setIsLoading(true);

      try {
        // Make streaming request to the chat-stream endpoint
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
        const requestBody = {
          message: userMessage.text,
          userId: userId,
          sessionId: sessionId
        };
        
        console.log('Sending request to backend:', {
          url: `${apiUrl}/chat-stream`,
          method: 'POST',
          body: requestBody
        });
        const response = await fetch(`${apiUrl}/chat-stream`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          // Try to get more details about the error
          let errorDetails = '';
          try {
            const errorText = await response.text();
            errorDetails = errorText ? ` - ${errorText}` : '';
          } catch (e) {
            // Ignore if we can't read the response
          }
          throw new Error(`HTTP error! status: ${response.status}${errorDetails}`);
        }

        if (!response.body) {
          throw new Error('No response body');
        }

        // Add a placeholder for the therapist's response
        const therapistMessageId = (Date.now() + 1).toString();
        const therapistMessage: Message = {
          id: therapistMessageId,
          text: '',
          sender: 'therapist',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, therapistMessage]);

        // Handle streaming response
        const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
        
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          // Parse the stream data
          const lines = value.split('\n');
          for (const line of lines) {
            if (line.startsWith('data:')) {
              const jsonStr = line.substring(5).trim();
              if (jsonStr) {
                try {
                  const data = JSON.parse(jsonStr);
                  if (data.content) {
                    // Append the new chunk to the therapist's message
                    setMessages(prev => {
                      const newMessages = [...prev];
                      const lastMessage = newMessages[newMessages.length - 1];
                      if (lastMessage && lastMessage.id === therapistMessageId) {
                        lastMessage.text += data.content;
                      }
                      return newMessages;
                    });
                  }
                } catch (parseError) {
                  console.error('Error parsing stream data:', parseError);
                }
              }
            }
          }
        }
      } catch (error) {
        console.error('Error sending message:', error);
        setIsConnected(false);
        
        // Provide specific responses based on error type
        let fallbackResponse = '';
        
        if (error instanceof Error) {
          if (error.message.includes('400')) {
            fallbackResponse = "I'm having trouble processing your message right now. Let me try a different approach - can you rephrase what you'd like to talk about?";
          } else if (error.message.includes('500')) {
            fallbackResponse = "I'm experiencing some internal difficulties, but I'm still here to support you. What's on your mind?";
          } else if (error.message.includes('Failed to fetch')) {
            fallbackResponse = "I'm having trouble connecting to my systems right now, but I want you to know that your message matters to me. What would you like to discuss?";
          } else {
            fallbackResponse = "I'm experiencing some technical difficulties, but I'm still here for you. What's been on your mind lately?";
          }
        } else {
          fallbackResponse = "I'm having some connection issues, but that doesn't mean I can't help. What's going on in your life that you'd like to discuss?";
        }
        
        const fallbackMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: fallbackResponse,
          sender: 'therapist',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, fallbackMessage]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="relative flex h-screen w-full flex-col bg-white" style={{fontFamily: 'Manrope, "Noto Sans", sans-serif'}}>
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 shadow-sm">
        <Link href="/">
          <button className="text-[var(--text-primary)]">
            <span className="material-symbols-outlined">
              arrow_back_ios_new
            </span>
          </button>
        </Link>
        <div className="text-center">
          <h1 className="text-lg font-bold text-[var(--text-primary)]">TheraFlow</h1>
          <p className={`text-xs font-medium ${isConnected ? 'text-green-500' : 'text-red-500'}`}>
            {isConnected ? 'Online' : 'Offline'}
          </p>
        </div>
        <button className="text-[var(--text-primary)]">
          <span className="material-symbols-outlined">
            more_horiz
          </span>
        </button>
      </header>
      
      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
            {msg.sender === 'therapist' && (
              <div 
                className="bg-center bg-no-repeat aspect-square bg-cover rounded-full w-10 shrink-0" 
                style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBdt0ZXlR2Qr67QIpznmAUuumjswu2sjIU5ExADzeQuxV3kyVYlGuSAlrbstYHtkaGwqLBkMtaclvi8BGJGDchLRU-sW6MQU_Z5ywbnnD-KM-Ntwed_cGf29Yca1lzxy2t7KP0MEdOxwmE3MfB46Rc0XZRyV_MEUUTzFyahsS6_ZLFvrTyj2aHBWYYHa5r95bnrS15NhQ2xC7jscnTbHvl6AByuTTcvlSsVVwT249f4WzrzmXo6F53hkQ_Ext5ll3ZWQyK8-qItVcwu")'}}
              ></div>
            )}
            
            <div className={`flex flex-1 flex-col gap-2 ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`rounded-2xl p-4 max-w-md ${
                msg.sender === 'user' 
                  ? 'bg-[var(--primary-color)] text-white rounded-tr-none' 
                  : 'bg-[var(--secondary-color)] text-[var(--text-primary)] rounded-tl-none'
              }`}>
                <p className="text-base font-normal leading-relaxed">
                  {msg.text}
                </p>
              </div>
              <p className="text-[var(--text-secondary)] text-xs font-normal">
                {msg.sender === 'user' ? 'You' : 'TheraFlow'} • {msg.timestamp}
              </p>
            </div>
            
            {msg.sender === 'user' && (
              <div 
                className="bg-center bg-no-repeat aspect-square bg-cover rounded-full w-10 shrink-0" 
                style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAm9nkU_5zXyJPsONKjA3tR8AtsfC1Nr290-LkkOwPaTTSNWhA6guNIiSpyQXXxyhOxt6agqY2WfQQ7tjcv6YhVPeX0AFL8fknPlZRSd_C-VWB_E6zDDr3TzVbyYfozhscyeCkSXUB_H-DnzDceHdHQb0A5B9iGFpRj1z2kYjeK8OB3kA7CotNYIMtu_r3zUmQcmUaSlNxK1kxixg__VIqJDnX1adeXYzMkbzvBhsq_DtWvpQ_PL8uZ8MWDHRiuhIcYuUFDw76wHKIz")'}}
              ></div>
            )}
          </div>
        ))}
        
        {isLoading && (
          <div className="flex items-start gap-3">
            <div 
              className="bg-center bg-no-repeat aspect-square bg-cover rounded-full w-10 shrink-0" 
              style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBdt0ZXlR2Qr67QIpznmAUuumjswu2sjIU5ExADzeQuxV3kyVYlGuSAlrbstYHtkaGwqLBkMtaclvi8BGJGDchLRU-sW6MQU_Z5ywbnnD-KM-Ntwed_cGf29Yca1lzxy2t7KP0MEdOxwmE3MfB46Rc0XZRyV_MEUUTzFyahsS6_ZLFvrTyj2aHBWYYHa5r95bnrS15NhQ2xC7jscnTbHvl6AByuTTcvlSsVVwT249f4WzrzmXo6F53hkQ_Ext5ll3ZWQyK8-qItVcwu")'}}
            ></div>
            <div className="flex flex-1 flex-col gap-2 items-start">
              <div className="bg-[var(--secondary-color)] rounded-2xl rounded-tl-none p-4 max-w-md">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
              <p className="text-[var(--text-secondary)] text-xs font-normal">TheraFlow is typing...</p>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </main>
      
      <footer className="sticky bottom-0 bg-white p-4 border-t border-gray-200">
        <form onSubmit={handleSendMessage} className="relative">
          <input 
            className="w-full rounded-full bg-[var(--secondary-color)] border-transparent focus:border-transparent focus:ring-0 py-3 pl-12 pr-28 text-base text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] disabled:opacity-50" 
            placeholder={isLoading ? "TheraFlow is typing..." : "Type your message..."} 
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={isLoading}
          />
          <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center">
            <button type="button" className="text-[var(--text-secondary)] hover:text-[var(--primary-color)] transition-colors">
              <span className="material-symbols-outlined">sentiment_satisfied</span>
            </button>
          </div>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-2">
            <button type="button" className="text-[var(--text-secondary)] hover:text-[var(--primary-color)] transition-colors">
              <span className="material-symbols-outlined">attach_file</span>
            </button>
            <button 
              type="submit"
              disabled={isLoading || !message.trim()}
              className="bg-[var(--primary-color)] text-white rounded-full p-2.5 shadow-md hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined">send</span>
            </button>
          </div>
        </form>
      </footer>
    </div>
  );
}
