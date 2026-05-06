import os
from google import genai
from dotenv import load_dotenv

load_dotenv()

def list_available_models():
    print("🔍 ASKING GOOGLE FOR AVAILABLE MODELS...")

    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("❌ No API Key found.")
        return

    try:
        client = genai.Client(api_key=api_key)
    except Exception as e:
        print(f"❌ Error initializing client: {e}")
        return

    # 2. List Models
    try:
        print("\n📋 Your API Key supports these models:")
        print("-" * 40)
        found_any = False

        for m in client.models.list():
            # New SDK uses supported_actions; fall back gracefully if neither exists
            methods = (
                getattr(m, 'supported_actions', None)
                or getattr(m, 'supported_generation_methods', None)
                or []
            )
            if 'generateContent' in methods:
                print(f"✅ {m.name}")
                found_any = True

        if not found_any:
            print("⚠️ No chat models found. Your key might be restricted.")

        print("-" * 40)
        print("Use one of the names above EXACTLY in your code.")

    except Exception as e:
        print(f"❌ Failed to list models: {e}")

if __name__ == "__main__":
    list_available_models()
