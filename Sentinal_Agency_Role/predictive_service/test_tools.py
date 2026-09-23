import os
from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain_core.tools import tool

load_dotenv("../.env")

@tool
def add(a: int, b: int) -> int:
    '''Add two integers.'''
    return a + b

models = [
    "groq/compound-mini",
    "qwen/qwen3.8-27b",
    "allam-2-7b",
    "qwen/qwen3.6-27b",
    "groq/compound",
    "openai/gpt-oss-safeguard-20b",
    "canopylabs/orpheus-v1-english",
    "openai/gpt-oss-20b",
    "openai/gpt-oss-120b"
]

for m in models:
    print(f"Testing {m}...")
    try:
        llm = ChatGroq(model=m, temperature=0).bind_tools([add])
        res = llm.invoke("What is 5 + 3?")
        print(f"  SUCCESS! {m} supports tool calling.")
        break # stop once we find one!
    except Exception as e:
        print(f"  FAILED: {str(e)[:100]}")
