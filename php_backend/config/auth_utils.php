<?php
//Validate login token
function validate_token($token, $pdo) {
    $stmt = $pdo->prepare('SELECT id FROM users WHERE token = ?');
    $stmt->execute([$token]);
    return $stmt->fetch(PDO::FETCH_ASSOC);
}
?>