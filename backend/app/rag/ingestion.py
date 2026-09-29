import os
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from app.rag.chromadb_client import get_vector_store

def ingest_pdf(file_path: str) -> int:
    """Ingests a PDF file, preserves chunk metadata, and appends to ChromaDB."""
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"File not found at path: {file_path}")

    filename = os.path.basename(file_path)

    # 1. Load PDF
    loader = PyPDFLoader(file_path)
    documents = loader.load()

    if not documents:
        return 0

    # 2. Text Splitter with balanced chunk size
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=450,
        chunk_overlap=80,
        separators=["\n\n", "\n", "|", " ", ""]
    )
    chunks = text_splitter.split_documents(documents)

    # Attach filename to metadata
    for chunk in chunks:
        chunk.metadata["filename"] = filename

    # 3. Store in ChromaDB
    vector_store = get_vector_store()
    vector_store.add_documents(chunks)

    return len(chunks)