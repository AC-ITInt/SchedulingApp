<?php

include './config/DB_CONN.php'; // Include database connection parameters
include './config/auth_utils.php'; // Include authentication utility functions

$env = parse_ini_file('./config/.env'); // Load environment variables from .env file
$apiKey = $env['GITHUB_KEY'] ?? null; // Get the API key from the environment variables

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

    // Retrieve POST variables from the request body
    $requestBody = file_get_contents('php://input');
    $requestData = json_decode($requestBody, true);

    $userPrompt = $requestData['userPrompt'] ?? null;
    $timelineEvents = $requestData['timelineEvents'] ?? null;

    if (!$userPrompt || !$timelineEvents) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid input. Ensure "userPrompt" and "timelineEvents" are provided.']);
        exit;
    }

    $url = 'https://models.github.ai/inference/chat/completions';

    // Request payload
    $data = [
        'messages' => [
            ['role' => 'system', 'content' => '
                You are an executive assistant specializing in scheduling tasks. Your role is to generate task schedules as JSON objects. Always include the keys "title," "summary," "start," and "end." Follow these guidelines:

                1. Use current or future dates only; avoid any dates from prior years or start times before the current time. The current date is ' . date('Y-m-d h:i:s A') . '.
                2. Base the timeline on upcoming events provided below: 
                    
                    ' . $timelineEvents . ' 
                    
                3. Ensure no new events conflict with the "start" and "end" of existing events.
                4. Create multiple new tasks if needed to fulfill the request while maintaining clarity and precision.
                5. Clearly define all times in the ISO 8601 format (YYYY-MM-DD HH:MM:SS).
                6. Maintain accurate and logical timeframes for the duration of all scheduled items.

                Output the JSON schedule directly, ensuring clarity and proper formatting.
            '],
            ['role' => 'user', 'content' => $userPrompt]
        ],
        'temperature' => 1.0,
        'top_p' => 1.0,
        'model' => 'openai/gpt-4.1'
    ];

    // Initialize cURL
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

    // Set cURL options
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Authorization: Bearer ' . $apiKey
    ]);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));

    // Execute the request
    $response = curl_exec($ch);

    // Check for errors
    if (curl_errno($ch)) {
        echo 'Error: ' . curl_error($ch);
    } else {
        // Decode and display the response
        $responseData = json_decode($response, true);
        if (isset($responseData['choices'][0]['message']['content'])) {
            echo $responseData['choices'][0]['message']['content'];
        } else {
            echo json_encode($responseData);
        }
    }

    // Close cURL
    curl_close($ch);
} catch (Exception $e) {
    http_response_code(401);
    echo json_encode(['error' => $e->getMessage()]);
}
?>