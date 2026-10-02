-- Aggregate operational counts only; no identifying metadata.
-- statement-breakpoint
CREATE TABLE storage_counters (name TEXT PRIMARY KEY NOT NULL, value INTEGER NOT NULL CHECK(value>=0)) STRICT;
-- statement-breakpoint
INSERT INTO storage_counters SELECT 'messages', COUNT(*) FROM messages;
-- statement-breakpoint
INSERT INTO storage_counters SELECT 'profiles', COUNT(*) FROM profiles;
-- statement-breakpoint
INSERT INTO storage_counters SELECT 'buckets', COUNT(*) FROM rate_limit_buckets;
-- statement-breakpoint
CREATE TRIGGER messages_count_insert AFTER INSERT ON messages BEGIN
  UPDATE storage_counters SET value=value+1 WHERE name='messages';
END;
-- statement-breakpoint
CREATE TRIGGER messages_count_delete AFTER DELETE ON messages BEGIN
  UPDATE storage_counters SET value=value-1 WHERE name='messages';
END;
-- statement-breakpoint
CREATE TRIGGER profiles_count_insert AFTER INSERT ON profiles BEGIN
  UPDATE storage_counters SET value=value+1 WHERE name='profiles';
END;
-- statement-breakpoint
CREATE TRIGGER profiles_count_delete AFTER DELETE ON profiles BEGIN
  UPDATE storage_counters SET value=value-1 WHERE name='profiles';
END;
-- statement-breakpoint
CREATE TRIGGER buckets_count_insert AFTER INSERT ON rate_limit_buckets BEGIN
  UPDATE storage_counters SET value=value+1 WHERE name='buckets';
END;
-- statement-breakpoint
CREATE TRIGGER buckets_count_delete AFTER DELETE ON rate_limit_buckets BEGIN
  UPDATE storage_counters SET value=value-1 WHERE name='buckets';
END;
