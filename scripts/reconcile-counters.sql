-- Operator maintenance only: pause writes and apply after external restore/import.
-- Recomputes aggregates; never changes message or recovery content.
UPDATE storage_counters SET value=(SELECT COUNT(*) FROM profiles) WHERE name='profiles';
UPDATE storage_counters SET value=(SELECT COUNT(*) FROM messages) WHERE name='messages';
UPDATE storage_counters SET value=(SELECT COUNT(*) FROM rate_limit_buckets) WHERE name='buckets';
