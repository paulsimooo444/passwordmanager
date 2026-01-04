<?php
/**
 * Authentication Class
 * Handles multi-user registration, login, and session management
 */

require_once __DIR__ . '/Database.php';
require_once __DIR__ . '/Encryption.php';

class Auth {
    private $db;
    private $encryption;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
        $this->encryption = new Encryption();
    }

    /**
     * Register a new user
     * @param string $username Username
     * @param string $email Email address
     * @param string $password Password
     * @return array Result with success status and message
     */
    public function register(string $username, string $email, string $password): array {
        // Validate username
        $username = trim($username);
        if (strlen($username) < 3 || strlen($username) > 50) {
            return ['success' => false, 'message' => 'Username must be 3-50 characters'];
        }
        if (!preg_match('/^[a-zA-Z0-9_]+$/', $username)) {
            return ['success' => false, 'message' => 'Username can only contain letters, numbers, and underscores'];
        }

        // Validate email
        $email = strtolower(trim($email));
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return ['success' => false, 'message' => 'Invalid email address'];
        }

        // Validate password
        if (strlen($password) < 8) {
            return ['success' => false, 'message' => 'Password must be at least 8 characters'];
        }

        // Check if username exists
        $stmt = $this->db->prepare("SELECT id FROM users WHERE username = ?");
        $stmt->execute([$username]);
        if ($stmt->fetch()) {
            return ['success' => false, 'message' => 'Username already taken'];
        }

        // Check if email exists
        $stmt = $this->db->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->execute([$email]);
        if ($stmt->fetch()) {
            return ['success' => false, 'message' => 'Email already registered'];
        }

        // Create user
        $hashedPassword = $this->encryption->hashPassword($password);
        $stmt = $this->db->prepare("INSERT INTO users (username, email, password_hash, created_at) VALUES (?, ?, ?, NOW())");
        
        if ($stmt->execute([$username, $email, $hashedPassword])) {
            $userId = (int)$this->db->lastInsertId();
            $this->createSession($userId, $username, $email);
            return ['success' => true, 'message' => 'Account created successfully'];
        }

        return ['success' => false, 'message' => 'Registration failed. Please try again.'];
    }

    /**
     * Login with email or username
     * @param string $identifier Email or username
     * @param string $password Password
     * @return array Result with success status and message
     */
    public function login(string $identifier, string $password): array {
        $identifier = trim($identifier);
        
        // Check if identifier is email or username
        $isEmail = filter_var($identifier, FILTER_VALIDATE_EMAIL);
        
        if ($isEmail) {
            $stmt = $this->db->prepare("SELECT id, username, email, password_hash FROM users WHERE email = ?");
            $stmt->execute([strtolower($identifier)]);
        } else {
            $stmt = $this->db->prepare("SELECT id, username, email, password_hash FROM users WHERE username = ?");
            $stmt->execute([$identifier]);
        }
        
        $user = $stmt->fetch();

        if ($user && $this->encryption->verifyPassword($password, $user['password_hash'])) {
            // Update last login
            $updateStmt = $this->db->prepare("UPDATE users SET last_login = NOW() WHERE id = ?");
            $updateStmt->execute([$user['id']]);

            $this->createSession($user['id'], $user['username'], $user['email']);
            return ['success' => true, 'message' => 'Login successful'];
        }

        return ['success' => false, 'message' => 'Invalid credentials'];
    }

    /**
     * Create user session
     */
    private function createSession(int $userId, string $username, string $email): void {
        $this->startSession();
        $_SESSION['user_id'] = $userId;
        $_SESSION['username'] = $username;
        $_SESSION['email'] = $email;
        $_SESSION['authenticated'] = true;
        $_SESSION['last_activity'] = time();
    }

    /**
     * Check if user is authenticated
     * @return bool
     */
    public function isAuthenticated(): bool {
        $this->startSession();
        
        // Check session timeout (30 minutes)
        if (isset($_SESSION['last_activity']) && (time() - $_SESSION['last_activity'] > 1800)) {
            $this->logout();
            return false;
        }

        if (isset($_SESSION['authenticated']) && $_SESSION['authenticated'] === true) {
            $_SESSION['last_activity'] = time();
            return true;
        }
        return false;
    }

    /**
     * Get current user ID
     * @return int|null
     */
    public function getUserId(): ?int {
        $this->startSession();
        return $_SESSION['user_id'] ?? null;
    }

    /**
     * Get current user info
     * @return array|null
     */
    public function getCurrentUser(): ?array {
        $this->startSession();
        if (!$this->isAuthenticated()) {
            return null;
        }
        return [
            'id' => $_SESSION['user_id'],
            'username' => $_SESSION['username'],
            'email' => $_SESSION['email']
        ];
    }

    /**
     * Logout and destroy session
     */
    public function logout(): void {
        $this->startSession();
        $_SESSION = [];
        if (ini_get("session.use_cookies")) {
            $params = session_get_cookie_params();
            setcookie(session_name(), '', time() - 42000,
                $params["path"], $params["domain"],
                $params["secure"], $params["httponly"]
            );
        }
        session_destroy();
    }

    /**
     * Change password
     * @param string $currentPassword Current password
     * @param string $newPassword New password
     * @return array Result with success status and message
     */
    public function changePassword(string $currentPassword, string $newPassword): array {
        if (!$this->isAuthenticated()) {
            return ['success' => false, 'message' => 'Not authenticated'];
        }

        if (strlen($newPassword) < 8) {
            return ['success' => false, 'message' => 'New password must be at least 8 characters'];
        }

        $userId = $this->getUserId();
        $stmt = $this->db->prepare("SELECT password_hash FROM users WHERE id = ?");
        $stmt->execute([$userId]);
        $user = $stmt->fetch();

        if ($user && $this->encryption->verifyPassword($currentPassword, $user['password_hash'])) {
            $newHash = $this->encryption->hashPassword($newPassword);
            $updateStmt = $this->db->prepare("UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ?");
            if ($updateStmt->execute([$newHash, $userId])) {
                return ['success' => true, 'message' => 'Password changed successfully'];
            }
        }

        return ['success' => false, 'message' => 'Current password is incorrect'];
    }

    /**
     * Update profile
     * @param string $username New username
     * @param string $email New email
     * @return array Result with success status and message
     */
    public function updateProfile(string $username, string $email): array {
        if (!$this->isAuthenticated()) {
            return ['success' => false, 'message' => 'Not authenticated'];
        }

        $userId = $this->getUserId();
        $username = trim($username);
        $email = strtolower(trim($email));

        // Validate username
        if (strlen($username) < 3 || strlen($username) > 50) {
            return ['success' => false, 'message' => 'Username must be 3-50 characters'];
        }
        if (!preg_match('/^[a-zA-Z0-9_]+$/', $username)) {
            return ['success' => false, 'message' => 'Username can only contain letters, numbers, and underscores'];
        }

        // Validate email
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return ['success' => false, 'message' => 'Invalid email address'];
        }

        // Check if username is taken by another user
        $stmt = $this->db->prepare("SELECT id FROM users WHERE username = ? AND id != ?");
        $stmt->execute([$username, $userId]);
        if ($stmt->fetch()) {
            return ['success' => false, 'message' => 'Username already taken'];
        }

        // Check if email is taken by another user
        $stmt = $this->db->prepare("SELECT id FROM users WHERE email = ? AND id != ?");
        $stmt->execute([$email, $userId]);
        if ($stmt->fetch()) {
            return ['success' => false, 'message' => 'Email already in use'];
        }

        // Update profile
        $stmt = $this->db->prepare("UPDATE users SET username = ?, email = ?, updated_at = NOW() WHERE id = ?");
        if ($stmt->execute([$username, $email, $userId])) {
            $_SESSION['username'] = $username;
            $_SESSION['email'] = $email;
            return ['success' => true, 'message' => 'Profile updated successfully'];
        }

        return ['success' => false, 'message' => 'Failed to update profile'];
    }

    /**
     * Start session if not already started
     */
    private function startSession(): void {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
    }
}
