import {UIMessage} from 'ai';

export async function loadChat(id: string | undefined): Promise<UIMessage[]> {
    if (!id) return [];
    return JSON.parse('[]');
}

export async function saveChat(chatId: string, messages: UIMessage[]): Promise<void> {
  const content = JSON.stringify(messages, null, 2);
  console.log(
    `Saving chat: ${chatId}  - content: ${content}`,
  )
}
