<?php
/**
 * Encryption Service Class
 * Handles AES-256 encryption/decryption for secure password storage
 */

require_once __DIR__ . '/../config/database.php';

class Encryption {
    private $method;
    private $key;

    public function __construct() {
        $this->method = ENCRYPTION_METHOD;
        $this->key = hash('sha256', ENCRYPTION_KEY, true);
    }

    /**
     * Encrypt data using AES-256-CBC
     * @param string $data The plaintext data to encrypt
     * @return string Base64 encoded encrypted data with IV
     */
    public function encrypt(string $data): string {
        $ivLength = openssl_cipher_iv_length($this->method);
        $iv = openssl_random_pseudo_bytes($ivLength);
        
        $encrypted = openssl_encrypt(
            $data,
            $this->method,
            $this->key,
            OPENSSL_RAW_DATA,
            $iv
        );

        // Combine IV and encrypted data, then base64 encode
        return base64_encode($iv . $encrypted);
    }

    /**
     * Decrypt data using AES-256-CBC
     * @param string $encryptedData Base64 encoded encrypted data with IV
     * @return string|false Decrypted plaintext or false on failure
     */
    public function decrypt(string $encryptedData): string|false {
        $data = base64_decode($encryptedData);
        $ivLength = openssl_cipher_iv_length($this->method);
        
        // Extract IV and encrypted data
        $iv = substr($data, 0, $ivLength);
        $encrypted = substr($data, $ivLength);

        return openssl_decrypt(
            $encrypted,
            $this->method,
            $this->key,
            OPENSSL_RAW_DATA,
            $iv
        );
    }

    /**
     * Hash master password using bcrypt
     * @param string $password The password to hash
     * @return string The hashed password
     */
    public function hashPassword(string $password): string {
        return password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);
    }

    /**
     * Verify password against hash
     * @param string $password The password to verify
     * @param string $hash The hash to verify against
     * @return bool True if password matches hash
     */
    public function verifyPassword(string $password, string $hash): bool {
        return password_verify($password, $hash);
    }
}
