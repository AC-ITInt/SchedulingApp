<?php

include './config/DB_CONN.php'; // Include database connection parameters
include './config/auth_utils.php'; // Include authentication utility functions

header('Content-Type: application/json');

try {
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

    echo json_encode(['success' => true]);
} catch (Exception $e) {
    http_response_code(401);
    echo json_encode(['error' => $e->getMessage()]);
}
?>
