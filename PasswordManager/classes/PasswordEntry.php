<?php
/**
 * Password Entry Model
 * Handles CRUD operations for encrypted password entries (per user)
 */

require_once __DIR__ . '/Database.php';
require_once __DIR__ . '/Encryption.php';

class PasswordEntry {
    private $db;
    private $encryption;
    private $userId;

    public function __construct(int $userId) {
        $this->db = Database::getInstance()->getConnection();
        $this->encryption = new Encryption();
        $this->userId = $userId;
    }

    /**
     * Create a new password entry
     * @param string $title Entry title
     * @param string $username Username/email
     * @param string $password Password to encrypt
     * @param string $url Website URL
     * @param string $notes Additional notes
     * @param string $category Category/folder
     * @return int|false The new entry ID or false on failure
     */
    public function create(
        string $title,
        string $username = '',
        string $password = '',
        string $url = '',
        string $notes = '',
        string $category = 'general'
    ): int|false {
        $encryptedPassword = $this->encryption->encrypt($password);
        $encryptedNotes = $notes ? $this->encryption->encrypt($notes) : '';

        $sql = "INSERT INTO password_entries (user_id, title, username, password, url, notes, category, created_at, updated_at) 
                VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())";
        
        $stmt = $this->db->prepare($sql);
        $success = $stmt->execute([
            $this->userId,
            $title,
            $username,
            $encryptedPassword,
            $url,
            $encryptedNotes,
            $category
        ]);

        return $success ? (int)$this->db->lastInsertId() : false;
    }

    /**
     * Get all password entries for current user (decrypted)
     * @param string|null $category Filter by category
     * @param string|null $search Search term
     * @return array
     */
    public function getAll(?string $category = null, ?string $search = null): array {
        $sql = "SELECT * FROM password_entries WHERE user_id = ?";
        $params = [$this->userId];

        if ($category && $category !== 'all') {
            $sql .= " AND category = ?";
            $params[] = $category;
        }

        if ($search) {
            $sql .= " AND (title LIKE ? OR username LIKE ? OR url LIKE ?)";
            $searchTerm = "%$search%";
            $params[] = $searchTerm;
            $params[] = $searchTerm;
            $params[] = $searchTerm;
        }

        $sql .= " ORDER BY updated_at DESC";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        $entries = $stmt->fetchAll();

        // Decrypt sensitive fields
        foreach ($entries as &$entry) {
            $entry['password'] = $entry['password'] ? $this->encryption->decrypt($entry['password']) : '';
            $entry['notes'] = $entry['notes'] ? $this->encryption->decrypt($entry['notes']) : '';
        }

        return $entries;
    }

    /**
     * Get a single password entry by ID (only if owned by current user)
     * @param int $id Entry ID
     * @return array|false
     */
    public function getById(int $id): array|false {
        $stmt = $this->db->prepare("SELECT * FROM password_entries WHERE id = ? AND user_id = ?");
        $stmt->execute([$id, $this->userId]);
        $entry = $stmt->fetch();

        if ($entry) {
            $entry['password'] = $entry['password'] ? $this->encryption->decrypt($entry['password']) : '';
            $entry['notes'] = $entry['notes'] ? $this->encryption->decrypt($entry['notes']) : '';
        }

        return $entry;
    }

    /**
     * Update a password entry (only if owned by current user)
     * @param int $id Entry ID
     * @param array $data Updated data
     * @return bool Success status
     */
    public function update(int $id, array $data): bool {
        // First verify ownership
        $stmt = $this->db->prepare("SELECT id FROM password_entries WHERE id = ? AND user_id = ?");
        $stmt->execute([$id, $this->userId]);
        if (!$stmt->fetch()) {
            return false;
        }

        $fields = [];
        $params = [];

        if (isset($data['title'])) {
            $fields[] = "title = ?";
            $params[] = $data['title'];
        }
        if (isset($data['username'])) {
            $fields[] = "username = ?";
            $params[] = $data['username'];
        }
        if (isset($data['password'])) {
            $fields[] = "password = ?";
            $params[] = $this->encryption->encrypt($data['password']);
        }
        if (isset($data['url'])) {
            $fields[] = "url = ?";
            $params[] = $data['url'];
        }
        if (isset($data['notes'])) {
            $fields[] = "notes = ?";
            $params[] = $data['notes'] ? $this->encryption->encrypt($data['notes']) : '';
        }
        if (isset($data['category'])) {
            $fields[] = "category = ?";
            $params[] = $data['category'];
        }

        if (empty($fields)) {
            return false;
        }

        $fields[] = "updated_at = NOW()";
        $params[] = $id;

        $sql = "UPDATE password_entries SET " . implode(", ", $fields) . " WHERE id = ? AND user_id = " . $this->userId;
        $stmt = $this->db->prepare($sql);
        return $stmt->execute($params);
    }

    /**
     * Delete a password entry (only if owned by current user)
     * @param int $id Entry ID
     * @return bool Success status
     */
    public function delete(int $id): bool {
        $stmt = $this->db->prepare("DELETE FROM password_entries WHERE id = ? AND user_id = ?");
        return $stmt->execute([$id, $this->userId]);
    }

    /**
     * Get all categories for current user
     * @return array
     */
    public function getCategories(): array {
        $stmt = $this->db->prepare("SELECT DISTINCT category FROM password_entries WHERE user_id = ? ORDER BY category");
        $stmt->execute([$this->userId]);
        return $stmt->fetchAll(PDO::FETCH_COLUMN);
    }

    /**
     * Get entry count by category for current user
     * @return array
     */
    public function getCountByCategory(): array {
        $stmt = $this->db->prepare("SELECT category, COUNT(*) as count FROM password_entries WHERE user_id = ? GROUP BY category");
        $stmt->execute([$this->userId]);
        return $stmt->fetchAll();
    }

    /**
     * Get total entry count for current user
     * @return int
     */
    public function getTotalCount(): int {
        $stmt = $this->db->prepare("SELECT COUNT(*) FROM password_entries WHERE user_id = ?");
        $stmt->execute([$this->userId]);
        return (int)$stmt->fetchColumn();
    }
}
