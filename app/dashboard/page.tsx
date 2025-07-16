'use client';

import { useChatStore } from '@/store/chatStore';
import { useThemeStore } from '@/store/theme';
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const router = useRouter();
  const [input, setInput] = useState('');
  const [search, setSearch] = useState('');

  const dark = useThemeStore((s) => s.dark);
  const toggle = useThemeStore((s) => s.toggle);

  const chatrooms = useChatStore((s) => s.chatrooms);
  const addChatroom = useChatStore((s) => s.addChatroom);
  const deleteChatroom = useChatStore((s) => s.deleteChatroom);

  const filtered = useMemo(() => {
    return chatrooms.filter((chat) =>
      chat.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [chatrooms, search]);

  const handleAdd = () => {
    if (!input.trim()) return;
    addChatroom(input.trim());
    toast.success('Chatroom added!');
    setInput('');
  };

  const handleDelete = (id: string) => {
    deleteChatroom(id);
    toast.success('Chatroom deleted!');
  };

  return (
    <div className="min-h-screen p-6 space-y-4 bg-gray-100 text-black dark:bg-gray-900 dark:text-white">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Chatrooms</h1>
        <button
          onClick={toggle}
          className="px-3 py-1 rounded bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:text-white"
        >
          {dark ? '☀️ Light Mode' : '🌙 Dark Mode'}
        </button>
      </div>

      {/* Add Chatroom */}
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter chatroom name"
          className="border rounded px-3 py-2 flex-1 text-black dark:text-white dark:bg-gray-800"
        />
        <button
          onClick={handleAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add
        </button>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search chatrooms"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border rounded px-3 py-2 w-full text-black dark:text-white dark:bg-gray-800"
      />

      {/* Chatroom List */}
      <ul className="space-y-2">
        {filtered.map((chat) => (
          <li
            key={chat.id}
            className="flex justify-between items-center p-4 rounded shadow bg-white dark:bg-gray-800"
          >
            <span
              className="cursor-pointer text-blue-600 hover:underline"
              onClick={() => router.push(`/chatroom/${chat.id}`)}
            >
              {chat.name}
            </span>
            <button
              onClick={() => handleDelete(chat.id)}
              className="text-red-500 hover:underline"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
