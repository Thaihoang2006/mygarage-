-- ============================================================================
-- Migration v3: Community, Profile Cover Banner, and Collection Votes
-- Preserves all existing tables and data.
-- ============================================================================

-- 1. Add cover_url to users if it doesn't already exist
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'users'
  AND COLUMN_NAME = 'cover_url';

SET @stmt = IF(@col_exists = 0, 'ALTER TABLE users ADD COLUMN cover_url VARCHAR(255) NULL AFTER avatar_url;', 'SELECT "Column cover_url already exists";');
PREPARE add_col FROM @stmt;
EXECUTE add_col;
DEALLOCATE PREPARE add_col;

-- 2. Create collection_votes table
CREATE TABLE IF NOT EXISTS collection_votes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    collection_id INT NOT NULL,
    user_id INT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_cv_collection FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE CASCADE,
    CONSTRAINT fk_cv_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT uq_col_user UNIQUE (collection_id, user_id),
    INDEX idx_cv_collection (collection_id),
    INDEX idx_cv_user (user_id),
    INDEX idx_cv_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
