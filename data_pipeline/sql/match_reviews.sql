-- Enable pgvector
create extension if not exists vector;

-- Create the search function
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
  url text,
  similarity float,
  price text,
  roast_level text,
  origin text
)
language plpgsql
as $$
begin
  return query
  select
    reviews.id,
    reviews.title,
    reviews.roaster,
    reviews.rating,
    reviews.blind_assessment,
    reviews.url,
    1 - (reviews.embedding <=> query_embedding) as similarity,
    reviews.price,
    reviews.roast_level,
    reviews.origin
  from reviews
  where 1 - (reviews.embedding <=> query_embedding) > match_threshold
  order by reviews.embedding <=> query_embedding
  limit match_count;
end;
$$;
