// app/chatroom/[id]/page.tsx
'use client';

import { useParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';

type Message = {
  id: string;
  text?: string;
  image?: string;
  sender: 'user' | 'ai';
};

const MESSAGES_PER_PAGE = 20;

export default function ChatroomPage() {
  const { id } = useParams();
  const chatId = id as string;

  const [allMessages, setAllMessages] = useState<Message[]>([]);
  const [visibleMessages, setVisibleMessages] = useState<Message[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isTyping, setIsTyping] = useState(false);
  const [input, setInput] = useState('');
  const [isLoadingMore, setIsLoadingMore] = useState(true);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(false);

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const scrollAnchorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsLoadingMore(true);

    setTimeout(() => {
      const stored = localStorage.getItem(`chatroom_${chatId}`);
      const parsed: Message[] = stored ? JSON.parse(stored) : [];

      setAllMessages(parsed);

      const total = Math.ceil(parsed.length / MESSAGES_PER_PAGE);
      const startPage = Math.max(1, total);
      setTotalPages(total);
      setPage(startPage);

      const totalToShow = startPage * MESSAGES_PER_PAGE;
      setVisibleMessages(parsed.slice(-totalToShow));

      setIsLoadingMore(false);
    }, 600);
  }, [chatId]);

  const saveMessages = (msgs: Message[]) => {
    localStorage.setItem(`chatroom_${chatId}`, JSON.stringify(msgs));
  };

  const addMessage = (msg: Message, simulateAI = false) => {
    const updatedAll = [...allMessages, msg];
    setAllMessages(updatedAll);
    saveMessages(updatedAll);
    setVisibleMessages((prev) => [...prev, msg]);
    setShouldAutoScroll(true);

    if (simulateAI) {
      setIsTyping(true);
      setTimeout(() => {
        const aiMsg: Message = {
          id: Date.now().toString() + '_ai',
          text: msg.image ? 'Nice image!' : `You said: ${msg.text}`,
          sender: 'ai',
        };
        const finalAll = [...updatedAll, aiMsg];
        setAllMessages(finalAll);
        saveMessages(finalAll);
        setVisibleMessages((prev) => [...prev, aiMsg]);
        setIsTyping(false);
        setShouldAutoScroll(true);
      }, 1000);
    }
  };

  const handleScroll = () => {
    const el = messagesContainerRef.current;
    if (!el || isLoadingMore) return;

    if (el.scrollTop < 50 && page > 1) {
      setIsLoadingMore(true);
      const nextPage = page - 1;

      setTimeout(() => {
        const newVisibleCount = nextPage * MESSAGES_PER_PAGE;
        const newVisible = allMessages.slice(-newVisibleCount);
        setVisibleMessages(newVisible);
        setPage(nextPage);
        setIsLoadingMore(false);
        setShouldAutoScroll(false);
      }, 700);
    }
  };

  useEffect(() => {
    if (shouldAutoScroll) {
      scrollAnchorRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [visibleMessages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const msg: Message = {
      id: Date.now().toString(),
      text: input.trim(),
      sender: 'user',
    };
    addMessage(msg, true);
    setInput('');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      const imageMsg: Message = {
        id: Date.now().toString(),
        image: base64,
        sender: 'user',
      };
      addMessage(imageMsg, true);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen p-4 bg-gray-50 dark:bg-[#121212] flex flex-col">
      <h2 className="text-xl font-semibold mb-4 text-black dark:text-white">
        Chatroom: {chatId}
      </h2>

      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto space-y-2 mb-4 px-1"
      >
        {isLoadingMore && (
          <div className="space-y-2 px-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="max-w-xs p-3 rounded bg-gray-300 dark:bg-gray-700 animate-pulse"
              >
                <div className="h-4 bg-gray-400 dark:bg-gray-600 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-400 dark:bg-gray-600 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        )}

        {visibleMessages.map((msg) => (
          <div
            key={msg.id}
            className={`relative group max-w-xs p-3 rounded break-words cursor-pointer transition ${
              msg.sender === 'user'
                ? 'bg-blue-100 self-end ml-auto text-black'
                : 'bg-gray-200 self-start text-black'
            }`}
            onClick={() => {
              if (msg.text) {
                navigator.clipboard.writeText(msg.text);
                toast.success('Copied!');
              }
            }}
          >
            {msg.text && (
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition bg-black text-white text-xs px-2 py-1 rounded z-10 shadow-lg">
                Click to copy
              </div>
            )}
            {msg.image ? (
              <img src={msg.image} alt="Uploaded" className="rounded max-w-full" />
            ) : (
              <span>{msg.text}</span>
            )}
          </div>
        ))}

        {isTyping && <div className="text-sm text-gray-400">AI is typing...</div>}
        <div ref={scrollAnchorRef} />
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2 mt-2">
        <input
          className="border rounded px-3 py-2 flex-1 text-black"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Send
        </button>
        <label className="bg-gray-200 text-sm px-3 py-2 rounded cursor-pointer">
          📎
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </label>
      </form>
    </div>
  );
}