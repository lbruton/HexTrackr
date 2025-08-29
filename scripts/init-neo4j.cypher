// Create composite entities for Memento memory graph
CREATE DATABASE memento IF NOT EXISTS;

// Switch is manual in browser; most drivers use session database param
// Create constraints
CREATE CONSTRAINT mem_node_id IF NOT EXISTS
FOR (n:Memory) REQUIRE n.id IS UNIQUE;

CREATE CONSTRAINT mem_tag_name IF NOT EXISTS
FOR (t:Tag) REQUIRE t.name IS UNIQUE;

// Create vector index if APOC/Graph Data Science is present
// Vector index name and dims come from env; defaults used here for convenience
// Note: For Neo4j 5.x native vector index
CALL db.index.vector.createIfNotExists(
  'memory_embedding_index',
  'Memory',
  'embedding',
  1536,
  'cosine'
);
