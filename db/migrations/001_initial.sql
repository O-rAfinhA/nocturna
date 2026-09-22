CREATE TABLE IF NOT EXISTS stories (
  slug TEXT PRIMARY KEY CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  status TEXT NOT NULL CHECK (status IN ('draft', 'review', 'published')),
  story JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS comments (
  id BIGSERIAL PRIMARY KEY,
  slug TEXT NOT NULL REFERENCES stories(slug) ON DELETE CASCADE,
  author TEXT NOT NULL CHECK (char_length(author) BETWEEN 2 AND 50),
  body TEXT NOT NULL CHECK (char_length(body) BETWEEN 3 AND 2000),
  lang TEXT NOT NULL CHECK (lang IN ('pt', 'en', 'es')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS comments_story_status_created_at_idx ON comments (slug, status, created_at DESC);
CREATE INDEX IF NOT EXISTS comments_status_created_at_idx ON comments (status, created_at DESC);

CREATE TABLE IF NOT EXISTS admin_sessions (
  token_hash TEXT PRIMARY KEY,
  csrf TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS admin_sessions_expires_at_idx ON admin_sessions (expires_at);

CREATE TABLE IF NOT EXISTS request_limits (
  key TEXT PRIMARY KEY,
  count INTEGER NOT NULL,
  reset_at TIMESTAMPTZ NOT NULL
);
