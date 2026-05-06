import time
import json
import re
import concurrent.futures
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
                return {}
        return {}


def generate_response(prompt: str, state: dict, temperature: float = 0.2, parse_json: bool = False):
    """
    Central LLM wrapper using NEW Gemini SDK
    """
    api_key = state.get("api_key")
    model = state.get("model", "gemini-2.0-flash")

    if not api_key:
        raise ValueError("Missing API Key in state")

    client = genai.Client(api_key=api_key)

    retries = 2

    for attempt in range(retries + 1):
        executor = concurrent.futures.ThreadPoolExecutor(max_workers=1)
        try:
            def _call():
                return client.models.generate_content(
                    model=model,
                    contents=prompt,
                    config={"temperature": temperature},
                )

            future = executor.submit(_call)
            try:
                response = future.result(timeout=30)
            except concurrent.futures.TimeoutError:
                # shutdown(wait=False) avoids blocking on a hung thread
                executor.shutdown(wait=False)
                raise TimeoutError("[LLM TIMEOUT] timed out after 30s")
            finally:
                executor.shutdown(wait=False)

            raw_text = response.text

            if parse_json:
                return extract_json(raw_text)
            return raw_text

        except Exception as e:
            if attempt < retries:
                time.sleep(1)
            else:
                raise e


if __name__ == "__main__":
    import os
    state = {"api_key": os.environ.get("GEMINI_API_KEY", "TEST_KEY_FROM_ENV"), "model": "gemini-2.0-flash"}
    result = generate_response("say hello in one word", state)
    print("LLM RESULT:", result)
