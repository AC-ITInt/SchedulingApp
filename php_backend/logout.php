<?php

include './config/DB_CONN.php'; // Include database connection parameters
include './config/auth_utils.php'; // Include authentication utility functions

header('Content-Type: application/json');

try {
    // --- Token validation ---
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? '';

    if (!$authHeader || //check if the header is present
        !preg_match('/Bearer\s(\S+)/', $authHeader, $matches) || //check if the header matches the pattern
        !($user = validate_token($matches[1], $pdo)) //validate the token internally
    ) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
        exit;
    }

    if (!$user) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
        exit;
    } else {
        // Invalidate the token by setting it to NULL in the database
        $stmt = $pdo->prepare('UPDATE users SET token = NULL WHERE id = ?');
        $stmt->execute([$user['id']]);
        
        http_response_code(200); // OK
        echo json_encode(['success' => true]);
        exit;
    }
} catch (Exception $e) {
    http_response_code(400); // Bad Request
    echo json_encode(['error' => $e->getMessage()]);
}
?>
