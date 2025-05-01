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

    // Look up the user
    $stmt = $pdo->prepare('SELECT id, password_hash FROM users WHERE email = ?');
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        throw new Exception('Invalid email or password');
    }

    // Verify password
    if (!password_verify($password, $user['password_hash'])) {
        throw new Exception('Invalid email or password');
    } else {
        // Create a token
        $token = bin2hex(random_bytes(32));
        $stmt = $pdo->prepare('UPDATE users SET token = ? WHERE id = ?');
        $stmt->execute([$token, $user['id']]);
        
        http_response_code(200); // OK
        echo json_encode(['token' => $token]);
        exit;
    }
    http_response_code(400); // Bad Request
    echo json_encode(['error' => $e->getMessage()]);
} catch (Exception $e) {
    http_response_code(400); // Bad Request
    echo json_encode(['error' => $e->getMessage()]);
}
?>
