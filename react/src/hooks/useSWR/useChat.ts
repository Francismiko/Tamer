import useSWR from 'swr';

export function useChat(id: string | undefined): {
  chat: Chat | undefined;
  isLoading: boolean;
  isError: boolean;
} {
  const { data, error, isLoading } = useSWR<Chat>(`/chat/${id}`);

  return {
    chat: data,
    isLoading,
    isError: error,
  };
}
