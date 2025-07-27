'use client';
import React, { useRef, useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import useRequireAuth from 'apps/user-ui/src/hooks/useRequiredAuth';
import axiosInstance from 'apps/user-ui/src/utils/axiosInstance';
import { isProtected } from 'apps/user-ui/src/utils/protected';
import ChatInput from 'apps/user-ui/src/shared/components/chats/chatInput';

const Page = () => {
  const searchParams = useSearchParams();
  const { user, isLoading: userLoading } = useRequireAuth();
  const router = useRouter();

  const wsRef = useRef<WebSocket | null>(null);
  const messageContainerRef = useRef<HTMLDivElement | null>(null);
  const scrollAnchorRef = useRef<HTMLDivElement | null>(null);
  const queryClient = useQueryClient();

  const [chats, setChats] = useState<any[]>([]);
  const [selectedChat, setSelectedChat] = useState<any | null>(null);
  const [message, setMessage] = useState('');
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasFetchedOnce, setHasFetchedOnce] = useState(false);
  const conversationId = searchParams.get('conversationId');

  const { data: conversations, isLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const res = await axiosInstance.get(
        '/chatting/api/get-user-conversations',
        isProtected
      );
      return res.data.conversations;
    },
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      if (!conversationId || hasFetchedOnce) return [];
      const res = await axiosInstance.get(
        `/chatting/api/get-messages/${conversationId}?page=1`,
        isProtected
      );
      setPage(1);
      setHasMore(res.data.hasMore);
      setHasFetchedOnce(true);
      return res.data.messages.reverse();
    },
    enabled: !!conversationId,
    staleTime: 2 * 60 * 1000,
  });
  useEffect(() => {
    if (conversations) setChats(conversations);
  }, [conversations]);

  useEffect(() => {
    if (conversationId && chats.length > 0) {
      const chat = chats.find((c) => c.conversationId === conversationId);
      setSelectedChat(chat || null);
    }
  }, [conversationId, chats]);

  const loadMoreMessages = async () => {
    const nextPage = page + 1;
    const res = await axiosInstance.get(
      `/chatting/api/get-messages/${conversationId}?page=${nextPage}`,
      isProtected
    );
    queryClient.setQueryData(['messages', conversationId], (old: any = []) => [
      ...res.data.messages.reverse(),
      ...old,
    ]);
    setPage(nextPage);
    setHasMore(res.data.hasMore);
  };

  const handleSend = async (e: any) => {
    e.preventDefault();
    // Implement send message logic
  };

  const getLastMessage = (chat: any) => chat?.lastMessage || '';
  const handleChatSelect = (chat: any) => {
    setHasFetchedOnce(false);
    setChats((prev) => prev.map((c) => c.conversationId === chat.conversationId ?
  {...c,unreadCount:0}:c))
  }
  return (
    <div className="w-full">
      <div className="md:w-[80%] mx-auto pt-5">
        <div className="flex h-[80vh] shadow-sm overflow-hidden">
          <div className="w-[320px] border-r border-r-gray-200 bg-gray-50">
            <div className="p-4 border-b border-b-gray-200 text-lg font-semibold">
              Messages
            </div>
            <div className="divide-y divide-gray-200">
              {isLoading ? (
                <div className="p-4 text-sm text-gray-500">Loading...</div>
              ) : chats.length === 0 ? (
                <div className="p-4 text-sm text-gray-500">No Conversation</div>
              ) : (
                chats.map((chat) => {
                  const isActive =
                    selectedChat?.conversationId === chat.conversationId;

                  return (
                    <button
                      key={chat.conversationId}
                      className={`w-full text-left px-4 py-3 transition ${
                        isActive ? 'bg-blue-100' : ''
                      } hover:bg-blue-50`}
                      onClick={() => handleChatSelect}
                    >
                      <div className="flex items-center gap-3">
                        <Image
                          src={
                            chat.seller?.avatar ||
                            'https://ik.imagekit.io/shahriarbecodemy/avatar/6_t8b5y8t3U.png'
                          }
                          alt={chat.seller?.name}
                          width={36}
                          height={36}
                          className="rounded-full border w-[40px] h-[40px] object-cover"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-800 font-semibold">
                              {chat.seller?.name}
                            </span>
                            {chat.seller?.isOnline && (
                              <span className="w-2 h-2 rounded-full bg-green-500" />
                            )}
                          </div>
                          <p className="text-xs text-gray-500 truncate max-w-[170px]">
                            {getLastMessage(chat)}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          <div className="flex-1 flex flex-col bg-gray-100">
            {selectedChat ? (
              <>
                <div className="p-4 border-b border-b-gray-200 bg-white flex items-center gap-3">
                  <Image
                    src={
                      selectedChat.seller?.avatar ||
                      'https://ik.imagekit.io/shahriarbecodemy/avatar/6_t8b5y8t3U.png'
                    }
                    alt={selectedChat?.seller?.name}
                    width={40}
                    height={40}
                    className="rounded-full border w-[40px] h-[40px] object-cover"
                  />
                  <div>
                    <h2 className="text-gray-800 font-semibold text-base">
                      {selectedChat.seller?.name}
                    </h2>
                    <p className="text-xs text-gray-500">
                      {selectedChat.seller?.isOnline ? 'Online' : 'Offline'}
                    </p>
                  </div>
                </div>

                <div
                  ref={messageContainerRef}
                  className="flex-1 overflow-y-auto px-6 py-6 space-y-4 text-sm"
                >
                  {hasMore && (
                    <div className="flex justify-center mb-2">
                      <button
                        onClick={loadMoreMessages}
                        className="text-xs px-4 py-1 bg-gray-200 hover:bg-gray-300 rounded"
                      >
                        Load previous messages
                      </button>
                    </div>
                  )}

                  {messages?.map((msg: any, index: number) => (
                    <div
                      key={index}
                      className={`flex flex-col ${
                        msg.senderType === 'user'
                          ? 'items-end ml-auto'
                          : 'items-start'
                      } max-w-[80%]`}
                    >
                      <div
                        className={`${
                          msg.senderType === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-gray-800'
                        } px-4 py-2 rounded-lg shadow-sm w-fit`}
                      >
                        {msg.text || msg.content}
                      </div>
                      <div
                        className={`text-xs text-gray-400 mt-1 flex items-center ${
                          msg.senderType === 'user'
                            ? 'mr-1 justify-end'
                            : 'ml-1'
                        }`}
                      >
                        {msg.time ||
                          new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                      </div>
                    </div>
                  ))}
                  <div ref={scrollAnchorRef} />
                </div>

                <ChatInput message={message} setMessage={setMessage} onSendMessage={handleSend}/>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-gray-500">Select a conversation to start chatting</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;