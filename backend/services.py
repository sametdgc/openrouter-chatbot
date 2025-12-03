import os
import requests
import json
from dotenv import load_dotenv

load_dotenv()

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"

def fetch_available_models():
    """
    Fetches free/available models from OpenRouter or returns a default list
    to ensure the UI always works.
    """
    # For speed and reliability in this case study, we will return a curated list 
    # of high-quality free models.
    return [
        {"id": "google/gemini-2.0-flash-exp:free", "name": "Google Gemini 2.0 Flash (Free)"},
        {"id": "google/gemma-3-27b-it:free", "name": "Google Gemma 3 27B (Free)"},
        {"id": "google/gemma-3-4b-it:free", "name": "Google Gemma 3 4B (Free)"},
        {"id": "x-ai/grok-4.1-fast:free", "name": "xAI Grok 4.1 Fast (Free)"},
        {"id": "mistralai/mistral-7b-instruct:free", "name": "Mistral 7B (Free)"},
        {"id": "meta-llama/llama-3-8b-instruct:free", "name": "Llama 3 8B (Free)"},
        {"id": "microsoft/phi-3-mini-128k-instruct:free", "name": "Phi-3 Mini (Free)"},
    ]

def call_openrouter_api(messages: list, model: str, image_base64: str = None):
    """
    Sends the chat history to OpenRouter and yields chunks of content.
    """
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:5173", 
        "X-Title": "Madlen Case Study"
    }

    # Handle Image Payload
    if image_base64:
        # Get the last user message (which is the current one)
        last_msg = messages[-1]
        if last_msg["role"] == "user":
            last_msg["content"] = [
                {"type": "text", "text": last_msg["content"]},
                {
                    "type": "image_url",
                    "image_url": {"url": f"data:image/jpeg;base64,{image_base64}"}
                }
            ]

    payload = {
        "model": model,
        "messages": messages,
        "stream": True
    }

    try:
        with requests.post(OPENROUTER_URL, headers=headers, json=payload, stream=True, timeout=30) as response:
            response.raise_for_status()
            
            for line in response.iter_lines():
                if line:
                    line = line.decode('utf-8')
                    if line.startswith('data: '):
                        data_str = line[6:]
                        if data_str == '[DONE]':
                            break
                        try:
                            data = json.loads(data_str)
                            if "choices" in data and len(data["choices"]) > 0:
                                content = data["choices"][0]["delta"].get("content", "")
                                if content:
                                    yield content
                        except json.JSONDecodeError:
                            pass
                            
    except requests.exceptions.RequestException as e:
        print(f"API Error: {e}")
        yield f"Error connecting to AI Provider: {str(e)}"