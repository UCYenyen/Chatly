-- Add an HNSW index for fast approximate nearest-neighbour search on document chunk embeddings.
-- The retrieval query uses cosine distance (the `<=>` operator), so the index uses vector_cosine_ops.
CREATE INDEX IF NOT EXISTS "document_chunk_embedding_hnsw_idx"
ON "document_chunk"
USING hnsw ("embedding" vector_cosine_ops);
