<?php
/**
 * API Router
 * Handles all AJAX requests for the Password Manager (Multi-user)
 */

header('Content-Type: application/json');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');

require_once __DIR__ . '/../classes/Auth.php';
require_once __DIR__ . '/../classes/PasswordEntry.php';

// Get request method and action
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

// Parse JSON input
$input = json_decode(file_get_contents('php://input'), true) ?? [];

$auth = new Auth();
$response = ['success' => false, 'message' => 'Invalid request'];

try {
    switch ($action) {
        case 'check-auth':
            $user = $auth->getCurrentUser();
            $response = [
                'success' => true,
                'isAuthenticated' => $auth->isAuthenticated(),
                'user' => $user
            ];
            break;

        case 'register':
            if ($method === 'POST') {
                $username = $input['username'] ?? '';
                $email = $input['email'] ?? '';
                $password = $input['password'] ?? '';
                $confirmPassword = $input['confirmPassword'] ?? '';

                if ($password !== $confirmPassword) {
                    $response = ['success' => false, 'message' => 'Passwords do not match'];
                } else {
                    $response = $auth->register($username, $email, $password);
                    if ($response['success']) {
                        $response['user'] = $auth->getCurrentUser();
                    }
                }
            }
            break;

        case 'login':
            if ($method === 'POST') {
                $identifier = $input['identifier'] ?? $input['email'] ?? '';
                $password = $input['password'] ?? '';
                $response = $auth->login($identifier, $password);
                if ($response['success']) {
                    $response['user'] = $auth->getCurrentUser();
                }
            }
            break;

        case 'logout':
            $auth->logout();
            $response = ['success' => true, 'message' => 'Logged out successfully'];
            break;

        case 'change-password':
            if ($method === 'POST') {
                $currentPassword = $input['currentPassword'] ?? '';
                $newPassword = $input['newPassword'] ?? '';
                $response = $auth->changePassword($currentPassword, $newPassword);
            }
            break;

        case 'update-profile':
            if ($method === 'POST') {
                $username = $input['username'] ?? '';
                $email = $input['email'] ?? '';
                $response = $auth->updateProfile($username, $email);
                if ($response['success']) {
                    $response['user'] = $auth->getCurrentUser();
                }
            }
            break;

        // Password Entry Operations
        case 'entries':
            if (!$auth->isAuthenticated()) {
                $response = ['success' => false, 'message' => 'Not authenticated', 'requireAuth' => true];
                break;
            }

            $passwordEntry = new PasswordEntry($auth->getUserId());

            if ($method === 'GET') {
                $category = $_GET['category'] ?? null;
                $search = $_GET['search'] ?? null;
                $entries = $passwordEntry->getAll($category, $search);
                $response = ['success' => true, 'entries' => $entries];
            } elseif ($method === 'POST') {
                $id = $passwordEntry->create(
                    $input['title'] ?? '',
                    $input['username'] ?? '',
                    $input['password'] ?? '',
                    $input['url'] ?? '',
                    $input['notes'] ?? '',
                    $input['category'] ?? 'general'
                );
                if ($id) {
                    $response = ['success' => true, 'message' => 'Entry created', 'id' => $id];
                } else {
                    $response = ['success' => false, 'message' => 'Failed to create entry'];
                }
            }
            break;

        case 'entry':
            if (!$auth->isAuthenticated()) {
                $response = ['success' => false, 'message' => 'Not authenticated', 'requireAuth' => true];
                break;
            }

            $passwordEntry = new PasswordEntry($auth->getUserId());
            $id = (int)($_GET['id'] ?? $input['id'] ?? 0);

            if ($method === 'GET' && $id) {
                $entry = $passwordEntry->getById($id);
                if ($entry) {
                    $response = ['success' => true, 'entry' => $entry];
                } else {
                    $response = ['success' => false, 'message' => 'Entry not found'];
                }
            } elseif ($method === 'PUT' && $id) {
                if ($passwordEntry->update($id, $input)) {
                    $response = ['success' => true, 'message' => 'Entry updated'];
                } else {
                    $response = ['success' => false, 'message' => 'Failed to update entry'];
                }
            } elseif ($method === 'DELETE' && $id) {
                if ($passwordEntry->delete($id)) {
                    $response = ['success' => true, 'message' => 'Entry deleted'];
                } else {
                    $response = ['success' => false, 'message' => 'Failed to delete entry'];
                }
            }
            break;

        case 'categories':
            if (!$auth->isAuthenticated()) {
                $response = ['success' => false, 'message' => 'Not authenticated', 'requireAuth' => true];
                break;
            }

            $passwordEntry = new PasswordEntry($auth->getUserId());
            $categories = $passwordEntry->getCategories();
            $counts = $passwordEntry->getCountByCategory();
            $total = $passwordEntry->getTotalCount();

            $response = [
                'success' => true,
                'categories' => $categories,
                'counts' => $counts,
                'total' => $total
            ];
            break;

        case 'generate-password':
            $length = (int)($_GET['length'] ?? 16);
            $length = max(8, min(64, $length));
            
            $chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
            $password = '';
            for ($i = 0; $i < $length; $i++) {
                $password .= $chars[random_int(0, strlen($chars) - 1)];
            }
            $response = ['success' => true, 'password' => $password];
            break;

        default:
            $response = ['success' => false, 'message' => 'Unknown action'];
    }
} catch (Exception $e) {
    $response = ['success' => false, 'message' => 'Server error: ' . $e->getMessage()];
}

echo json_encode($response);
