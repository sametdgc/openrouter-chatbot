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
        {"id": "mistralai/mistral-7b-instruct:free", "name": "Mistral 7B (Free)"},
        {"id": "meta-llama/llama-3-8b-instruct:free", "name": "Llama 3 8B (Free)"},
        {"id": "microsoft/phi-3-mini-128k-instruct:free", "name": "Phi-3 Mini (Free)"},
    ]

def call_openrouter_api(messages: list, model: str):
    """
    Sends the chat history to OpenRouter and yields chunks of content.
    """
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:5173", 
        "X-Title": "Madlen Case Study"
    }

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