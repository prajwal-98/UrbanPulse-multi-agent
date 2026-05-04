import time
import json
import re
from google import genai


def extract_json(text: str):
    try:
        return json.loads(text)
    except:
        match = re.search(r"\{.*\}", text, re.DOTALL)
        if match:
            try:
                return json.loads(match.group())
            except:
                print(f"[extract_json] regex match found but failed to parse: {repr(match.group()[:200])}", flush=True)
                return {}
        print(f"[extract_json] no JSON found in text: {repr(text[:200])}", flush=True)
        return {}


def generate_response(prompt: str, state: dict, temperature: float = 0.2, parse_json: bool = False):
    api_key = state.get("api_key")
    print("API KEY", api_key[:8])
    model = state.get("model", "gemini-1.5-flash")

    if not api_key:
        raise ValueError("Missing API Key in state")

    client = genai.Client(api_key=api_key)
    retries = 2

    for attempt in range(retries + 1):
        try:
            response = client.models.generate_content(
                model=model,
                contents=prompt,
                config={"temperature": temperature},
            )

            raw_text = response.text
            print(f"[LLM] attempt={attempt} model={model} parse_json={parse_json}", flush=True)
            print(f"[LLM RAW] {repr(raw_text[:500])}", flush=True)

            if parse_json:
                result = extract_json(raw_text)
                print(f"[LLM PARSED] type={type(result)} keys={list(result.keys()) if isinstance(result, dict) else 'N/A'}", flush=True)
                return result
            return raw_text

        except Exception as e:
            print(f"[LLM ERROR] attempt={attempt} error={repr(e)}", flush=True)
            if attempt < retries:
                time.sleep(1)
            else:
                raise e