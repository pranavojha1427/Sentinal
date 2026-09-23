import os
from pymongo import MongoClient

uri = os.environ.get("MONGODB_URI")
if not uri:
    from dotenv import load_dotenv
    load_dotenv(dotenv_path=".env")
    uri = os.environ.get("MONGODB_URI")

client = MongoClient(uri)
db = client[os.environ.get("MONGODB_DB_NAME", "pragatipulse")]

print("Projects collection count:", db["projects"].count_documents({}))
print("Project Overrides collection count:", db["project_overrides"].count_documents({}))
print("Proposals collection count:", db["proposals"].count_documents({}))
