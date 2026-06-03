import { fetchApi } from './api';

export async function getAiResponse(prompt: string): Promise<string> {
  try {
    const response = await fetchApi('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ prompt }),
    });
    
    if (response && response.result) {
        return response.result;
    }
    
    return "Нет ответа от ИИ.";
  } catch (error: any) {
    console.error("AI Error:", error);
    if (error.message && error.message.includes("GIGACHAT_AUTH_DATA")) {
       return "API ключ GigaChat не найден. Добавьте переменную GIGACHAT_AUTH_DATA в настройки сервера.";
    }
    return "Ошибка при обращении к ИИ.";
  }
}
