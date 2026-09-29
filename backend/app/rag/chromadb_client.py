import os
import chromadb
from langchain_chroma import Chroma
from langchain_community.embeddings.fastembed import FastEmbedEmbeddings
from app.core.config import settings

# Initialize persistent Chroma client & embeddings
embedding_function = FastEmbedEmbeddings(model_name="BAAI/bge-small-en-v1.5")

def get_chroma_client():
    os.makedirs(settings.CHROMA_PERSIST_DIR, exist_ok=True)
    return chromadb.PersistentClient(path=settings.CHROMA_PERSIST_DIR)

def get_vector_store() -> Chroma:
    """Returns the persistent Chroma vector store instance."""
    client = get_chroma_client()
    return Chroma(
        client=client,
        collection_name=settings.COLLECTION_NAME,
        embedding_function=embedding_function,
    )

def get_retriever(k: int = 5):
    vector_store = get_vector_store()
    return vector_store.as_retriever(search_kwargs={"k": k})