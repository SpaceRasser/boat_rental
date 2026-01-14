<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

echo json_encode([
    'success' => true,
    'message' => 'API работает!',
    'data' => [
        'timestamp' => date('Y-m-d H:i:s'),
        'method' => $_SERVER['REQUEST_METHOD'],
        'headers' => getallheaders()
    ]
]);
?>