from pathlib import Path
from functools import lru_cache

import chromadb
from sentence_transformers import SentenceTransformer

BASE_DIR = Path(__file__).resolve().parent


@lru_cache
def get_embedding_model():
    return SentenceTransformer("all-MiniLM-L6-v2")


@lru_cache
def get_collection():
    client = chromadb.PersistentClient(
        path=str(BASE_DIR / "chroma_data")
    )

    return client.get_or_create_collection(
        name="interview_knowledge"
    )


def load_knowledge():
    path = BASE_DIR / "knowledge" / "interview_knowledge.txt"

    text = path.read_text(encoding="utf-8")

    chunks = [
        chunk.strip()
        for chunk in text.split("\n\n")
        if chunk.strip()
    ]

    embeddings = get_embedding_model().encode(
        chunks
    ).tolist()

    collection = get_collection()

    collection.upsert(
        ids=[f"chunk-{i}" for i in range(len(chunks))],
        documents=chunks,
        embeddings=embeddings
    )

    return len(chunks)


def search_knowledge(query: str):
    collection = get_collection()

    if collection.count() == 0:
        load_knowledge()

    embedding = get_embedding_model().encode(
        [query]
    ).tolist()

    results = collection.query(
        query_embeddings=embedding,
        n_results=min(3, collection.count())
    )

    return "\n\n".join(results["documents"][0])