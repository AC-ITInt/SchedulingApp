<?php

include './config/DB_CONN.php'; // Include database connection parameters

header('Content-Type: application/json');

try {
    // Read JSON input
    $input = json_decode(file_get_contents('php://input'), true);

    if (
        !$input ||
        !isset($input['email']) ||
        !isset($input['password']) ||
        !is_string($input['email']) ||
        !is_string($input['password']) ||
        trim($input['email']) === '' ||
        trim($input['password']) === ''
    ) {
        throw new Exception('Email and password are required');
    }

    // Sanitize and validate email
    $email = filter_var(trim($input['email']), FILTER_SANITIZE_EMAIL);
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        throw new Exception('Invalid email or password');
    }

    $password = trim($input['password']);

    // Password length check
    if (strlen($password) < 6) {
        throw new Exception('Password must be at least 6 characters');
    }

    // Check if email already exists
    $stmt = $pdo->prepare('SELECT id FROM users WHERE email = ?');
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        throw new Exception('Email already registered');
    } else {
        // Hash the password
        $passwordHash = password_hash($password, PASSWORD_DEFAULT);

        // Create token
        $token = bin2hex(random_bytes(32)); // 64 character random token

        // Insert the new user with token
        $stmt = $pdo->prepare('INSERT INTO users (email, password_hash, token) VALUES (?, ?, ?)');
        $stmt->execute([$email, $passwordHash, $token]);

        echo json_encode(['success' => true, 'token' => $token]);
        exit;
    }
    http_response_code(400); // Bad request
    echo json_encode(['error' => $e->getMessage()]);
} catch (Exception $e) {
    http_response_code(400); // Bad request
    echo json_encode(['error' => $e->getMessage()]);
}
?>
