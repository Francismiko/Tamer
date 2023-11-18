import useSWRMutation from 'swr/mutation';

export function useCreateChatModel(): {
  trigger: (arg: CreateChatModelArg) => Promise<ChatModel>;
  isMutating: boolean;
} {
  const { trigger, isMutating } = useSWRMutation(
    '/chat-model',
    async (url: string, { arg }: { arg: CreateChatModelArg }) => {
      return fetch(import.meta.env.VITE_BACKEND_URL + url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: arg.model,
          owner: arg.owner,
          chatId: arg.chatId,
        }),
      }).then((res) => res.json());
    },
  );

  return {
    trigger,
    isMutating,
  };
}
