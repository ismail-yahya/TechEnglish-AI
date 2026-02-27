-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- USERS TABLE
create table public.users (
  id uuid references auth.users on delete cascade not null primary key,
  email text unique not null,
  name text,
  password_hash text, -- Optional: kept for backward compatibility if needed, but Supabase Auth handles passwords
  current_level text default 'A0',
  chosen_domains text[], -- Array of strings
  total_learned_words integer default 0,
  preferred_tts text default 'webspeech' check (preferred_tts in ('webspeech', 'gemini')),
  speech_engine_preference text default 'web' check (speech_engine_preference in ('web', 'assemblyai')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for users
alter table public.users enable row level security;

create policy "Users can view their own profile"
  on public.users for select
  using ( auth.uid() = id );

create policy "Users can update their own profile"
  on public.users for update
  using ( auth.uid() = id );

create policy "Users can insert their own profile"
  on public.users for insert
  with check ( auth.uid() = id );

-- STORIES TABLE
create table public.stories (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  title text not null,
  summary text,
  level text not null,
  domain text not null,
  sentences jsonb not null default '[]'::jsonb, -- Array of {text}
  quiz jsonb not null default '[]'::jsonb, -- Array of {question, options, correctAnswer, explanation}
  is_completed boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for stories
alter table public.stories enable row level security;

create policy "Users can view their own stories"
  on public.stories for select
  using ( auth.uid() = user_id );

create policy "Users can insert their own stories"
  on public.stories for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own stories"
  on public.stories for update
  using ( auth.uid() = user_id );

-- PLANNED STORIES TABLE
create table public.planned_stories (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  level text not null,
  domain text not null,
  story_order integer not null,
  title text not null,
  concept text not null,
  is_completed boolean default false,
  story_id uuid references public.stories(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for planned_stories
alter table public.planned_stories enable row level security;

create policy "Users can view their own planned stories"
  on public.planned_stories for select
  using ( auth.uid() = user_id );

create policy "Users can insert their own planned stories"
  on public.planned_stories for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own planned stories"
  on public.planned_stories for update
  using ( auth.uid() = user_id );

-- CHAT MESSAGES TABLE
create table public.chat_messages (
  id uuid default uuid_generate_v4() primary key,
  story_id uuid references public.stories(id) on delete cascade not null,
  user_id uuid references public.users(id) on delete cascade not null,
  sender text not null check (sender in ('user', 'ai')),
  message text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for chat_messages
alter table public.chat_messages enable row level security;

create policy "Users can view their own chat messages"
  on public.chat_messages for select
  using ( auth.uid() = user_id );

create policy "Users can insert their own chat messages"
  on public.chat_messages for insert
  with check ( auth.uid() = user_id );

-- VOCABULARY LEARNING TABLE
create table public.vocabulary_learning (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  word text not null,
  translation text not null,
  
  -- Mastery & Skills
  mastery_level integer default 0 check (mastery_level between 0 and 100),
  
  skill_listening integer default 0 check (skill_listening between 0 and 3),
  skill_reading integer default 0 check (skill_reading between 0 and 3),
  skill_writing integer default 0 check (skill_writing between 0 and 3),
  skill_speaking integer default 0 check (skill_speaking between 0 and 3),
  skill_grammar integer default 0 check (skill_grammar between 0 and 3),
  skill_vocabulary integer default 0 check (skill_vocabulary between 0 and 3),
  
  -- Completion Flags
  listening_completed boolean default false,
  reading_completed boolean default false,
  writing_completed boolean default false,
  speaking_completed boolean default false,
  grammar_completed boolean default false,
  vocabulary_completed boolean default false,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  unique(user_id, word)
);

-- Enable RLS for vocabulary_learning
alter table public.vocabulary_learning enable row level security;

create policy "Users can view their own learning words"
  on public.vocabulary_learning for select
  using ( auth.uid() = user_id );

create policy "Users can insert their own learning words"
  on public.vocabulary_learning for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own learning words"
  on public.vocabulary_learning for update
  using ( auth.uid() = user_id );

create policy "Users can delete their own learning words"
  on public.vocabulary_learning for delete
  using ( auth.uid() = user_id );

-- VOCABULARY KNOWN TABLE
create table public.vocabulary_known (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  word text not null,
  translation text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  unique(user_id, word)
);

-- Enable RLS for vocabulary_known
alter table public.vocabulary_known enable row level security;

create policy "Users can view their own known words"
  on public.vocabulary_known for select
  using ( auth.uid() = user_id );

create policy "Users can insert their own known words"
  on public.vocabulary_known for insert
  with check ( auth.uid() = user_id );

create policy "Users can delete their own known words"
  on public.vocabulary_known for delete
  using ( auth.uid() = user_id );

-- QUIZ ANSWERS TABLE
create table public.quiz_answers (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  story_id uuid references public.stories(id) on delete cascade not null,
  question_index integer not null,
  is_correct boolean not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  unique(user_id, story_id, question_index)
);

-- Enable RLS for quiz_answers
alter table public.quiz_answers enable row level security;

create policy "Users can view their own quiz answers"
  on public.quiz_answers for select
  using ( auth.uid() = user_id );

create policy "Users can insert their own quiz answers"
  on public.quiz_answers for insert
  with check ( auth.uid() = user_id );

-- FUNCTIONS & TRIGGERS

-- Auto-update updated_at timestamp
create or replace function update_modified_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new; 
end;
$$ language 'plpgsql';

create trigger update_users_modtime
    before update on public.users
    for each row
    execute procedure update_modified_column();

-- Function to handle new user signup (Supabase specific)
-- This automatically creates a row in public.users when a user signs up via Supabase Auth
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.users (id, email, name)
  values (new.id, new.email, new.raw_user_meta_data->>'name');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger the function every time a user is created
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Trigger for vocabulary completion check and transfer
create or replace function public.check_vocabulary_completion()
returns trigger as $$
begin
  -- Check if the 4 active skills have reached the mastery level of 3
  if new.skill_listening >= 3 and
     new.skill_reading >= 3 and
     new.skill_writing >= 3 and
     new.skill_speaking >= 3 then
     
     -- Insert into vocabulary_known
     insert into public.vocabulary_known (user_id, word, translation)
     values (new.user_id, new.word, new.translation)
     on conflict (user_id, word) do nothing;
     
     -- Delete from vocabulary_learning
     delete from public.vocabulary_learning where id = new.id;
     
     return null; -- Stop the update since the row is transferred
  end if;
  
  return new;
end;
$$ language plpgsql;

create trigger on_vocabulary_mastery_completed
  before update on public.vocabulary_learning
  for each row execute procedure public.check_vocabulary_completion();
