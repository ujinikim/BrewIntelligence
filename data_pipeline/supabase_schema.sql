-- Enable the pgvector extension to work with embedding vectors
create extension if not exists vector;

-- Create the reviews table (Updated with detailed metrics)
create table reviews (
  id bigint primary key generated always as identity,
  title text not null,
  slug text, -- SEO friendly definition
  roaster text,
  roaster_location text,
  roast_level text,
  agtron text, 
  price text,
  origin text,
  review_date text,
  rating int,
  
  -- Detailed Scores
  aroma int,
  acidity int,
  body int,
  flavor int,
  aftertaste int,
  
  blind_assessment text,
  notes text,
  
  -- 384 dimensions matching all-MiniLM-L6-v2 model
  embedding vector(384),
  url text unique not null,
  created_at timestamptz default now()
);

-- Search function
create or replace function match_reviews (
  query_embedding vector(384),
  match_threshold float,
  match_count int
)
returns table (
  id bigint,
  title text,
  roaster text,
  rating int,
  blind_assessment text,
  similarity float
)
language sql stable
as $$
  select
    reviews.id,
    reviews.title,
    reviews.roaster,
    reviews.rating,
    reviews.blind_assessment,
    1 - (reviews.embedding <=> query_embedding) as similarity
  from reviews
  where 1 - (reviews.embedding <=> query_embedding) > match_threshold
  order by reviews.embedding <=> query_embedding
  limit match_count;
$$;
