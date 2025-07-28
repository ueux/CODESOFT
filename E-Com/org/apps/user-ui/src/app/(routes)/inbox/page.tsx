'use client';
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import useRequireAuth from 'apps/user-ui/src/hooks/useRequiredAuth';
import axiosInstance from 'apps/user-ui/src/utils/axiosInstance';
import { isProtected } from 'apps/user-ui/src/utils/protected';
import ChatInput from 'apps/user-ui/src/shared/components/chats/chatInput';
import { useWebSocket } from 'apps/user-ui/src/context/web-socket-context';
import { CheckCheck } from 'lucide-react';

interface Chat {
  conversationId: string;
  seller: {
    id: string;
    name: string;
    avatar?: string;
    isOnline: boolean;
  };
  lastMessage?: string;
  unreadCount?: number;
}

interface Message {
  content: string;
  senderType: 'user' | 'seller';
  seen: boolean;
  createdAt: string;
  text?: string;
  time?: string;
}

const Page = () => {
  const searchParams = useSearchParams();
  const { user, isLoading: userLoading } = useRequireAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  const messageContainerRef = useRef<HTMLDivElement>(null);
  const scrollAnchorRef = useRef<HTMLDivElement>(null);
  const { ws, unreadCounts } = useWebSocket();

  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [message, setMessage] = useState('');
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasFetchedOnce, setHasFetchedOnce] = useState(false);

  const conversationId = searchParams.get('conversationId');

  // Fetch conversations
  const { data: conversations, isLoading } = useQuery<Chat[]>({
    queryKey: ['conversations'],
    queryFn: async () => {
      try {
        const res = await axiosInstance.get(
          '/chatting/api/get-user-conversations',
          isProtected
        );
        return res.data.conversations;
      } catch (error) {
        console.error('Failed to fetch conversations:', error);
        throw error;
      }
    },
  });

  // Fetch messages for selected conversation
  const { data: messages = [] } = useQuery<Message[]>({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      if (!conversationId || hasFetchedOnce) return [];
      try {
        const res = await axiosInstance.get(
          `/chatting/api/get-messages/${conversationId}?page=1`,
          isProtected
        );
        setPage(1);
        setHasMore(res.data.hasMore);
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
    }
  }, [conversations]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Set selected chat when conversationId changes
  useEffect(() => {
    if (conversationId && chats.length > 0) {
      const chat = chats.find((c) => c.conversationId === conversationId);
      setSelectedChat(chat || null);
    }
  }, [conversationId, chats]);

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

  const loadMoreMessages = async () => {
    if (!conversationId) return;

    try {
      const nextPage = page + 1;
      const res = await axiosInstance.get(
        `/chatting/api/get-messages/${conversationId}?page=${nextPage}`,
        isProtected
      );

      queryClient.setQueryData(['messages', conversationId], (old: Message[] = []) => [
        ...res.data.messages.reverse(),
        ...old,
      ]);

      setPage(nextPage);
      setHasMore(res.data.hasMore);
    } catch (error) {
      console.error('Failed to load more messages:', error);
    }
  };

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      setTimeout(() => {
        scrollAnchorRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 0);
    });
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim() || !selectedChat || !user?.id) return;

    const payload = {
      fromUserId: user.id,
      toUserId: selectedChat.seller.id,
      conversationId: selectedChat.conversationId,
      messageBody: message,
      senderType: "user" as const
    };

    try {
      // Send via WebSocket
      ws?.send(JSON.stringify(payload));

      // Optimistically update UI
      const newMessage: Message = {
        content: payload.messageBody,
        senderType: "user",
        seen: false,
        createdAt: new Date().toISOString()
      };

      queryClient.setQueryData(["messages", selectedChat.conversationId],
        (old: Message[] = []) => [...old, newMessage]
      );

      setChats(prevChats =>
        prevChats.map(chat =>
          chat.conversationId === selectedChat.conversationId
            ? { ...chat, lastMessage: payload.messageBody }
            : chat
        )
      );

      setMessage("");
      scrollToBottom();
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleChatSelect = (chat: Chat) => {
    setHasFetchedOnce(false);

    // Mark as read in local state
    setChats(prev =>
      prev.map(c =>
        c.conversationId === chat.conversationId
          ? { ...c, unreadCount: 0 }
          : c
      )
    );

    // Update URL
    router.push(`?conversationId=${chat.conversationId}`);

    // Notify server that messages are seen
    ws?.send(JSON.stringify({
      type: "MARK_AS_SEEN",
      conversationId: chat.conversationId,
    }));
  };

  if (userLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto p-4 h-[calc(100vh-80px)]">
        <div className="flex h-full rounded-xl shadow-lg overflow-hidden border border-gray-200 bg-white">
          {/* Conversation List */}
          <div className="w-full md:w-80 flex-shrink-0 border-r border-gray-200 bg-white flex flex-col">
            <div className="p-4 border-b border-gray-200 bg-white">
              <h2 className="text-xl font-semibold text-gray-800">Messages</h2>
            </div>
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="p-4 flex flex-col space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse flex space-x-3">
                      <div className="rounded-full bg-gray-200 h-10 w-10"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : chats.length === 0 ? (
                <div className="p-4 flex flex-col items-center justify-center h-full text-gray-500">
                  <svg className="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                  </svg>
                  <p>No conversations yet</p>
                </div>
              ) : (
                chats.map((chat) => {
                  const isActive = selectedChat?.conversationId === chat.conversationId;
                  const unreadCount = unreadCounts[chat.conversationId] || chat.unreadCount || 0;

                  return (
                    <button
                      key={chat.conversationId}
                      className={`w-full text-left p-3 transition-colors duration-150 ${
                        isActive
                          ? 'bg-blue-50 border-l-4 border-blue-500'
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => handleChatSelect(chat)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Image
                            src={chat.seller?.avatar || '/default-avatar.png'}
                            alt={chat.seller.name}
                            width={40}
                            height={40}
                            className="rounded-full border-2 border-white shadow-sm w-10 h-10 object-cover"
                          />
                          {chat.seller.isOnline && (
                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className={`text-sm font-medium truncate ${
                              isActive ? 'text-blue-600' : 'text-gray-800'
                            }`}>
                              {chat.seller.name}
                            </span>
                            {chat.lastMessage && (
                              <span className="text-xs text-gray-400 whitespace-nowrap">
                                {new Date(chat.lastMessage).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <p className={`text-xs truncate max-w-[160px] ${
                              isActive ? 'text-blue-500' : 'text-gray-500'
                            }`}>
                              {chat.lastMessage || 'No messages yet'}
                            </p>
                            {unreadCount > 0 && (
                              <span className="ml-2 text-xs bg-red-500 text-white rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                                {unreadCount}
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
          <div className="flex-1 flex flex-col bg-gray-50">
            {selectedChat ? (
              <>
                <div className="p-4 border-b border-gray-200 bg-white flex items-center gap-3 sticky top-0 z-10">
                  <div className="relative">
                    <Image
                      src={selectedChat.seller?.avatar || '/default-avatar.png'}
                      alt={selectedChat.seller.name}
                      width={40}
                      height={40}
                      className="rounded-full border-2 border-white shadow-sm w-10 h-10 object-cover"
                    />
                    {selectedChat.seller.isOnline && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></span>
                    )}
                  </div>
                  <div>
                    <h2 className="text-gray-800 font-semibold text-base">
                      {selectedChat.seller.name}
                    </h2>
                    <p className="text-xs text-gray-500">
                      {selectedChat.seller.isOnline ? (
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-green-500"></span>
                          Online
                        </span>
                      ) : 'Offline'}
                    </p>
                  </div>
                </div>

                <div
                  ref={messageContainerRef}
                  className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-[url('/chat-bg-pattern-light.png')] bg-repeat bg-opacity-5"
                >
                  {hasMore && (
                    <div className="flex justify-center mb-2">
                      <button
                        onClick={loadMoreMessages}
                        className="text-xs px-3 py-1 bg-white border border-gray-200 hover:bg-gray-100 rounded-full shadow-sm text-gray-600"
                      >
                        Load previous messages
                      </button>
                    </div>
                  )}

                  <div className="w-full text-center my-4">
                    <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                      Conversation started
                    </span>
                  </div>

                  {messages?.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex ${msg.senderType === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[80%] flex flex-col ${msg.senderType === 'user' ? 'items-end' : 'items-start'}`}>
                        <div
                          className={`px-4 py-2 rounded-2xl ${
                            msg.senderType === 'user'
                              ? 'bg-blue-600 text-white rounded-tr-none'
                              : 'bg-white text-gray-800 rounded-tl-none shadow-sm'
                          }`}
                        >
                          {msg.text || msg.content}
                        </div>
                        <div className={`text-xs mt-1 flex items-center gap-1 ${
                          msg.senderType === 'user'
                            ? 'text-blue-500 justify-end'
                            : 'text-gray-500 justify-start'
                        }`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                          {msg.senderType === 'user' && (
                            <CheckCheck className={`w-3 h-3 ${
                              msg.seen ? 'text-blue-400' : 'text-gray-400'
                            }`} />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={scrollAnchorRef} />
                </div>

                <div className="p-4 border-t border-gray-200 bg-white sticky bottom-0">
                  <ChatInput
                    message={message}
                    setMessage={setMessage}
                    onSendMessage={handleSend}
                  />
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-6 bg-gray-50">
                <div className="w-20 h-20 bg-gray-100 rounded-full mb-5 flex items-center justify-center">
                  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                  </svg>
                </div>
                <h3 className="text-gray-700 text-lg font-medium mb-2">Select a conversation</h3>
                <p className="text-gray-500 text-center max-w-md">
                  Choose a chat from the sidebar to start messaging
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