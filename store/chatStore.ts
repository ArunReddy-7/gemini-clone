import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Chatroom = {
  id: string;
  name: string;
};

type ChatStore = {
  chatrooms: Chatroom[];
  addChatroom: (name: string) => void;
  deleteChatroom: (id: string) => void;
};

export const useChatStore = create<ChatStore>()(
  persist(
    (set) => ({
      chatrooms: [],
      addChatroom: (name) =>
        set((state) => ({
          chatrooms: [
            ...state.chatrooms,
            { id: Date.now().toString(), name },
          ],
        })),
      deleteChatroom: (id) =>
        set((state) => ({
          chatrooms: state.chatrooms.filter((chat) => chat.id !== id),
        })),
    }),
    {
      name: 'chat-storage',
    }
  )
);
