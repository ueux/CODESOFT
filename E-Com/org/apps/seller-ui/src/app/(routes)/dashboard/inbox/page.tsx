'use client';
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import ChatInput from 'apps/seller-ui/src/shared/components/chats/chatInput';
import useSeller from 'apps/seller-ui/src/hooks/useSeller';
import { useWebSocket } from 'apps/seller-ui/src/context/web-socket-context';
import axiosInstance from 'apps/seller-ui/src/utils/axiosInstance';
import { CheckCheck } from 'lucide-react';

const Page = () => {
  const searchParams = useSearchParams();
  const { seller } = useSeller();
  const router = useRouter();
  const queryClient = useQueryClient();

  const messageContainerRef = useRef<HTMLDivElement>(null);
  const scrollAnchorRef = useRef<HTMLDivElement>(null);
  const { ws } = useWebSocket();

  const [chats, setChats] = useState<any[]>([]);
  const [selectedChat, setSelectedChat] = useState<any | null>(null);
  const [message, setMessage] = useState('');
  const [hasFetchedOnce, setHasFetchedOnce] = useState(false);

  const conversationId = searchParams.get('conversationId');

  // Fetch conversations
  const { data: conversations, isLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      try {
        const res = await axiosInstance.get(
          '/chatting/api/get-seller-conversations',
        );
        return res.data.conversations;
      } catch (error) {
        console.error('Failed to fetch conversations:', error);
        throw error;
      }
    },
  });

  // Fetch messages for selected conversation
  const { data: messages = [] } = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      if (!conversationId || hasFetchedOnce) return [];
      try {
        const res = await axiosInstance.get(
          `/chatting/api/get-seller-messages/${conversationId}?page=1`,
        );
        setHasFetchedOnce(true);
        return res.data.messages.reverse();
      } catch (error) {
        console.error('Failed to fetch messages:', error);
        throw error;
      }
    },
    enabled: !!conversationId,
    staleTime: 2 * 60 * 1000,
  });

  // Update chats when conversations are loaded
  useEffect(() => {
    if (conversations) {
      setChats(conversations);
      if (conversations.length > 0 && !selectedChat && conversationId) {
        const chat = conversations.find((c:any) => c.conversationId === conversationId);
        if (chat) setSelectedChat(chat);
      }
    }
  }, [conversations, conversationId, selectedChat]);

  // Set selected chat when conversationId changes
  useEffect(() => {
    if (conversationId && chats.length > 0) {
      const chat = chats.find(c => c.conversationId === conversationId);
      if (chat) setSelectedChat(chat);
    }
  }, [conversationId, chats]);

  useEffect(() => {
    const timeout = setTimeout(scrollToBottom, 100)
    return () => clearTimeout(timeout)
  }, [conversationId, messages.length]);

  useEffect(() => {
    if (!ws) return;

    const handleMessage = (event: any) => {
      const data = JSON.parse(event.data);
      if (data.type === "NEW_MESSAGE") {
        const newMsg = data?.payload;
        if (newMsg.conversationId === conversationId) {
          const newMessage = {
            content: newMsg.messageBody || newMsg.content || "",
            senderType: newMsg.senderType,
            seen: false,
            createdAt: newMsg.createdAt || new Date().toISOString()
          };
          queryClient.setQueryData(["messages", conversationId],
            (old: any[] = []) => [...old, newMessage]
          );
          scrollToBottom();
        }
        setChats(prevChats =>
          prevChats.map((chat) =>
            chat.conversationId === newMsg.conversationId
              ? { ...chat, lastMessage: newMsg.content }
              : chat
          )
        );
      }
      if (data.type === "UNSEEN_COUNT_UPDATA") {
        const { conversationId, count } = data.payload;
        setChats(prevChats =>
          prevChats.map((chat) =>
            chat.conversationId === conversationId
              ? { ...chat, unreadCount: count }
              : chat
          )
        );
      }
    };

    ws.addEventListener('message', handleMessage);
    return () => {
      ws.removeEventListener('message', handleMessage);
    };
  }, [ws, conversationId, queryClient]);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      setTimeout(() => {
        scrollAnchorRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 0);
    });
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim() || !selectedChat || !ws || ws.readyState !== WebSocket.OPEN) return;

    const payload = {
      fromUserId: seller.id,
      toUserId: selectedChat.user.id,
      conversationId: selectedChat.conversationId,
      messageBody: message,
      senderType: "seller"
    };

    try {
      ws.send(JSON.stringify(payload));
      const newMessage = {
        content: message,
        senderType: "seller",
        seen: false,
        createdAt: new Date().toISOString()
      };

      queryClient.setQueryData(["messages", conversationId],
        (old:any[] = []) => [...old, newMessage]
      );
      setMessage("");
      scrollToBottom();
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleChatSelect = (chat: any) => {
    setSelectedChat(chat);
    setHasFetchedOnce(false);

    setChats(prev =>
      prev.map(c =>
        c.conversationId === chat.conversationId
          ? { ...c, unreadCount: 0 }
          : c
      )
    );

    router.push(`?conversationId=${chat.conversationId}`);

    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: "MARK_AS_SEEN",
        conversationId: chat.conversationId,
      }));
    }
  };

  return (
    <div className="w-full bg-gray-900 min-h-screen">
      <div className="md:w-full mx-auto h-screen">
        <div className="flex h-full bg-gray-800 border-gray-700 shadow-xl">
          {/* Conversation List */}
          <div className="w-[320px] border-r border-r-gray-700 bg-gray-800 flex flex-col">
            <div className="p-4 border-b border-b-gray-700 text-lg font-semibold bg-gray-800 text-gray-100 sticky top-0 z-10">
              Messages
            </div>
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="p-4 text-sm text-gray-400">Loading conversations...</div>
              ) : chats.length === 0 ? (
                <div className="p-4 text-sm text-gray-400">No conversations found</div>
              ) : (
                chats.map((chat) => {
                  const isActive = selectedChat?.conversationId === chat.conversationId;

                  return (
                    <button
                      key={chat.conversationId}
                      className={`w-full text-left p-3 transition-colors duration-200 ${isActive ? 'bg-gray-700' : 'hover:bg-gray-700/50'}`}
                      onClick={() => handleChatSelect(chat)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Image
                            src={chat.user?.avatar || '/default-avatar.png'}
                            alt={chat.user.name}
                            width={40}
                            height={40}
                            className="rounded-full border-2 border-gray-600 w-10 h-10 object-cover"
                          />
                          {chat.user?.isOnline && (
                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-800"></span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-100 truncate">
                              {chat.user.name}
                            </span>
                            {chat.lastMessageTime && (
                              <span className="text-xs text-gray-400 whitespace-nowrap">
                                {new Date(chat.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <p className="text-xs text-gray-400 truncate max-w-[170px]">
                              {chat.lastMessage || 'No messages yet'}
                            </p>
                            {chat?.unreadCount > 0 && (
                              <span className="ml-2 text-xs bg-blue-500 text-white rounded-full px-2 py-0.5 min-w-[20px] text-center">
                                {chat?.unreadCount}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col bg-gray-800/95">
            {selectedChat ? (
              <>
                <div className="p-4 border-b border-b-gray-700 bg-gray-800/90 flex items-center gap-3 sticky top-0 z-10">
                  <div className="relative">
                    <Image
                      src={selectedChat.user?.avatar || '/default-avatar.png'}
                      alt={selectedChat.user.name}
                      width={40}
                      height={40}
                      className="rounded-full border-2 border-gray-600 w-10 h-10 object-cover"
                    />
                    {selectedChat.user?.isOnline && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-gray-800"></span>
                    )}
                  </div>
                  <div>
                    <h2 className="text-gray-100 font-semibold text-base">
                      {selectedChat.user.name}
                    </h2>
                    <p className="text-xs text-gray-400">
                      {selectedChat.user.isOnline ? 'Online' : 'Offline'}
                    </p>
                  </div>
                </div>

                <div
                  ref={messageContainerRef}
                  className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gray-800/90 bg-[url('/chat-bg-pattern.png')] bg-repeat bg-opacity-5"
                >
                  <div className="w-full text-center my-4">
                    <span className="text-xs text-gray-500 bg-gray-700 px-2 py-1 rounded-full">
                      Conversation started
                    </span>
                  </div>
                  {messages?.map((msg: any, index: number) => (
                    <div
                      key={index}
                      className={`flex ${msg.senderType === 'seller' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[80%] flex flex-col ${msg.senderType === 'seller' ? 'items-end' : 'items-start'}`}>
                        <div
                          className={`px-4 py-2 rounded-2xl ${msg.senderType === 'seller'
                            ? 'bg-blue-600 text-white rounded-tr-none'
                            : 'bg-gray-700 text-white rounded-tl-none'
                            }`}
                        >
                          {msg.content}
                        </div>
                        <div className={`text-xs text-gray-400 mt-1 flex items-center gap-1 ${
                          msg.senderType === "seller" ? "justify-end" : "justify-start"}`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                          {msg.senderType === 'seller' && (
                            <CheckCheck className={`w-3 h-3 ${msg.seen ? 'text-blue-400' : 'text-gray-500'}`} />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={scrollAnchorRef} />
                </div>

                <div className="border-t border-gray-700 bg-gray-800/90 p-4 sticky bottom-0">
                  <ChatInput
                    message={message}
                    setMessage={setMessage}
                    onSendMessage={handleSend}
                    darkMode={true}
                  />
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center bg-gray-800/90 p-6">
                <div className="w-20 h-20 bg-gray-700 rounded-full mb-5 flex items-center justify-center">
                  <svg className="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                  </svg>
                </div>
                <h3 className="text-gray-300 text-xl font-medium mb-2">Select a conversation</h3>
                <p className="text-gray-500 text-center max-w-md">
                  Choose a chat from the sidebar to start messaging or start a new conversation
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;