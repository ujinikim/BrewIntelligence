-- 1. The Central Taxonomy
create table if not exists tags (
  id bigint primary key generated always as identity,
  name text unique not null,
  category text not null, -- 'Flavor', 'Vibe', 'Origin', 'Brew Method'
  created_at timestamptz default now()
);

-- 2. The Association (Many-to-Many) with Transparency
create table if not exists review_tags (
  review_id bigint references reviews(id) on delete cascade,
  tag_id bigint references tags(id) on delete cascade,
  confidence float check (confidence >= 0 and confidence <= 1.0),
  is_inferred boolean default false,
  source_snippet text, -- The exact text that triggered this tag ("distinct blueberry notes")
  created_at timestamptz default now(),
  primary key (review_id, tag_id)
);

-- 3. Indexes for Performance
create index if not exists idx_tags_category on tags(category);
create index if not exists idx_review_tags_tag_id on review_tags(tag_id);
create index if not exists idx_review_tags_review_id on review_tags(review_id);

-- 4. Enable RLS (Public Read, Service Write)
alter table tags enable row level security;
alter table review_tags enable row level security;

create policy "Public tags are viewable by everyone" on tags
  for select using (true);
  
create policy "Public review_tags are viewable by everyone" on review_tags
  for select using (true);

-- 5. Helper View for easier querying (JSON aggregation)
create or replace view review_details_with_tags as
select 
  r.id,
  r.title,
  r.roaster,
  r.rating,
  jsonb_agg(
    jsonb_build_object(
      'tag', t.name,
      'category', t.category,
      'confidence', rt.confidence,
      'is_inferred', rt.is_inferred,
      'source', rt.source_snippet
    ) order by rt.confidence desc
  ) as tags
from reviews r
left join review_tags rt on r.id = rt.review_id
left join tags t on rt.tag_id = t.id
group by r.id;
