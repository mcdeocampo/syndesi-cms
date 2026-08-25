-- 0026: optional role icon per faculty member. Null falls back to a default
-- icon (fas fa-user-tie) in the card's role line, so existing members are
-- unchanged until an admin sets one. The faculty readers select '*', so this
-- column is picked up automatically once it exists.

alter table public.faculty add column if not exists icon text;
