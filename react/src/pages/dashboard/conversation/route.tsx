import { useChat } from '@/hooks/useSWR/useChat';
import { useMessages } from '@/hooks/useSWR/useMessages';
import { useCreateMessage } from '@/hooks/useSWRMutation/useCreateMessage';
import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';

export function Conversation(): JSX.Element {
  const { id } = useParams();
  const { chat } = useChat(id);
  const { messages, mutate } = useMessages(id);
  const { createMessage, isMutating } = useCreateMessage();
  const [inputValue, setInputValue] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleSubmitMessage = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    if (inputValue && id) {
      setInputValue('');
      mutate(
        (prev) => [
          ...(prev || []),
          {
            id: new Date().getTime().toString(),
            content: inputValue,
            status: 'Done',
            sender: 'Human',
            create_at: new Date(),
          },
          {
            id: new Date().getTime().toString() + '1',
            content: '',
            status: 'Done',
            sender: 'AI',
            create_at: new Date(),
          },
        ],
        {
          revalidate: false,
        },
      );

      const res = await createMessage({
        message: inputValue,
        chatId: id,
      });
      const reader = res.body?.getReader();
      const textDecoder = new TextDecoder();
      if (!reader) return;

      for (;;) {
        const { done, value } = await reader.read();
        if (done) return;

        const decodedChunk = textDecoder
          .decode(value, { stream: true })
          .split('\n\n')
          .map((line) => line.trim().split('\n')[1]?.slice(6))
          .join('');

        mutate(
          (prev) => {
            const newPrev = [...(prev || [])];
            return [
              ...newPrev.slice(0, -1),
              {
                ...newPrev.slice(-1)[0],
                content: newPrev.slice(-1)[0].content + decodedChunk,
              },
            ];
          },
          {
            revalidate: false,
          },
        );
      }
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-screen relative">
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-40 p-2 bg-white/30 backdrop-blur-sm z-10 rounded-bl-xl rounded-br-xl">
        <div className="text-center">
          <p className="font-bold">{chat?.chat_model}</p>
        </div>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        {messages?.map(
          (msg) =>
            msg.status === 'Done' && (
              <div key={msg.id} className="py-4">
                <div className="w-3/5 mx-auto">
                  <div className="font-bold">
                    {msg.sender === 'Human' ? 'user' : 'bot'}
                  </div>
                  <p className="antialiased">{msg.content}</p>
                </div>
              </div>
            ),
        )}
      </div>
      <form
        onSubmit={handleSubmitMessage}
        className="p-6 border-t border-slate-400 flex"
      >
        <input
          type="text"
          value={inputValue}
          placeholder="输入你的消息..."
          className="w-3/5 p-4 bg-slate-600 rounded-lg focus:outline outline-gray-400 mx-auto"
          onChange={(e) => setInputValue(e.target.value)}
          disabled={isMutating}
        />
      </form>
    </div>
  );
}
