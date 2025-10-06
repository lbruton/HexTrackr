-- Migration 006: User Preferences Table (HEX-138)
-- Created: 2025-10-06
-- Purpose: Migrate user preferences from browser localStorage to database-backed storage
-- Related: HEX-132 (research), HEX-138 (implementation)

-- User preferences table for cross-device settings persistence
CREATE TABLE IF NOT EXISTS user_preferences (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  preference_key TEXT NOT NULL,
  preference_value TEXT NOT NULL,  -- JSON for complex values (theme, settings, templates)
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, preference_key)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id
  ON user_preferences(user_id);

CREATE INDEX IF NOT EXISTS idx_user_preferences_key
  ON user_preferences(user_id, preference_key);

-- Update trigger to maintain updated_at timestamp
CREATE TRIGGER IF NOT EXISTS user_preferences_updated_at
  AFTER UPDATE ON user_preferences
  FOR EACH ROW
BEGIN
  UPDATE user_preferences
  SET updated_at = CURRENT_TIMESTAMP
  WHERE id = NEW.id;
END;

-- Migration complete
-- Next step: Create preferencesService.js and preferencesController.js
