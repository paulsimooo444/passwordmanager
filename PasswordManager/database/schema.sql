-- Maritime Password Manager Database Schema
-- Run this script to set up the database

CREATE DATABASE IF NOT EXISTS password_manager CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE password_manager;

-- Users table (multi-user support)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME DEFAULT NULL,
    last_login DATETIME DEFAULT NULL,
    INDEX idx_email (email),
    INDEX idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Password entries table (linked to users)
CREATE TABLE IF NOT EXISTS password_entries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    username VARCHAR(255) DEFAULT '',
    password TEXT NOT NULL COMMENT 'AES-256 encrypted',
    url VARCHAR(500) DEFAULT '',
    notes TEXT COMMENT 'AES-256 encrypted',
    category VARCHAR(100) DEFAULT 'general',
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    INDEX idx_user (user_id),
    INDEX idx_category (category),
    INDEX idx_title (title),
    INDEX idx_updated (updated_at DESC),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Optional: Insert some default categories as sample data
-- INSERT INTO password_entries (title, username, password, url, notes, category, created_at, updated_at)
-- VALUES ('Sample Entry', 'user@example.com', '', 'https://example.com', '', 'general', NOW(), NOW());
