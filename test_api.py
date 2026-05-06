import os
from dotenv import load_dotenv
from google import genai

# Load env
load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

print("API KEY FOUND:", bool(api_key))

if not api_key:
    raise ValueError("API key not found")

# Create client
client = genai.Client(api_key=api_key)

try:
    response = client.models.generate_content(
        model="gemini-3.1-flash-lite-preview",
        contents="Say hello in one short sentence."
    )

    print("\n--- RESPONSE ---")
    print(response.text)

except Exception as e:
    print("\n--- ERROR ---")
    print(type(e).__name__, ":", str(e))