<?php
require_once '../config.php';

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError('Method not allowed', 405);
}

$json = file_get_contents('php://input');
$data = json_decode($json, true);

$required = ['user_id', 'boat_id', 'start_time', 'end_time', 'booking_date'];
foreach ($required as $field) {
    if (empty($data[$field])) {
        sendError("Missing required field: $field");
    }
}

$conn = null;

try {
    $conn = getConnection();
    $conn->beginTransaction();

    $user_id = intval($data['user_id']);
    $boat_id = intval($data['boat_id']);
    $start_time = $data['start_time'];
    $end_time = $data['end_time'];
    $booking_date = $data['booking_date'];
    $status = isset($data['status']) ? $data['status'] : 'бронь';

    $userStmt = $conn->prepare("SELECT id_user FROM users WHERE id_user = ?");
    $userStmt->execute([$user_id]);
    if (!$userStmt->fetch()) {
        $conn->rollBack();
        sendError('User not found', 404);
    }

    $boatStmt = $conn->prepare("SELECT id_boat, owner_id, price, price_discount FROM boats WHERE id_boat = ?");
    $boatStmt->execute([$boat_id]);
    $boat = $boatStmt->fetch(PDO::FETCH_ASSOC);
    if (!$boat) {
        $conn->rollBack();
        sendError('Boat not found', 404);
    }

    $checkSql = "SELECT id_booking FROM bookings
                 WHERE boat_id = ?
                 AND booking_date = ?
                 AND status NOT IN ('отменена', 'завершена')
                 AND (
                    (? BETWEEN start_time AND end_time) OR
                    (? BETWEEN start_time AND end_time) OR
                    (start_time BETWEEN ? AND ?)
                 )";

    $checkStmt = $conn->prepare($checkSql);
    $checkStmt->execute([$boat_id, $booking_date, $start_time, $end_time, $start_time, $end_time]);

    if ($checkStmt->fetch()) {
        $conn->rollBack();
        sendError('Это время уже занято');
    }

    $items = isset($data['items']) && is_array($data['items']) ? $data['items'] : [];
    $itemsTotal = 0;
    $preparedItems = [];

    foreach ($items as $item) {
        if (empty($item['product_id'])) {
            $conn->rollBack();
            sendError('Каждый товар должен содержать product_id');
        }

        $productId = intval($item['product_id']);
        $quantity = isset($item['quantity']) ? max(1, intval($item['quantity'])) : 1;

        $productStmt = $conn->prepare("SELECT id_product, price, price_discount FROM products WHERE id_product = ?");
        $productStmt->execute([$productId]);
        $product = $productStmt->fetch(PDO::FETCH_ASSOC);
        if (!$product) {
            $conn->rollBack();
            sendError('Product not found', 404);
        }

        $price = isset($item['price']) ? floatval($item['price']) : floatval($product['price']);
        $priceDiscount = array_key_exists('price_discount', $item)
            ? ($item['price_discount'] !== null ? floatval($item['price_discount']) : null)
            : ($product['price_discount'] !== null ? floatval($product['price_discount']) : null);

        $finalPrice = $priceDiscount !== null ? $priceDiscount : $price;
        $itemsTotal += $finalPrice * $quantity;

        $preparedItems[] = [
            'product_id' => $productId,
            'quantity' => $quantity,
            'price' => $price,
            'price_discount' => $priceDiscount
        ];
    }

    $baseAmount = $boat['price_discount'] !== null ? floatval($boat['price_discount']) : floatval($boat['price']);
    $amount = isset($data['amount']) ? floatval($data['amount']) : ($baseAmount + $itemsTotal);

    $sql = "INSERT INTO bookings
            (user_id, boat_id, start_time, end_time, booking_date, status, amount, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, NOW())";

    $stmt = $conn->prepare($sql);
    $success = $stmt->execute([$user_id, $boat_id, $start_time, $end_time, $booking_date, $status, $amount]);

    if (!$success) {
        $conn->rollBack();
        $errorInfo = $stmt->errorInfo();
        sendError('Failed to create booking. Error: ' . $errorInfo[2]);
    }

    $bookingId = $conn->lastInsertId();

    if (!empty($preparedItems)) {
        $itemStmt = $conn->prepare("INSERT INTO booking_items (booking_id, product_id, quantity, price, price_discount, created_at)
                                    VALUES (?, ?, ?, ?, ?, NOW())");
        foreach ($preparedItems as $item) {
            $itemStmt->execute([
                $bookingId,
                $item['product_id'],
                $item['quantity'],
                $item['price'],
                $item['price_discount']
            ]);
        }
    }

    $conn->commit();

    $selectSql = "SELECT
                    b.id_booking,
                    b.user_id,
                    u.name as user_name,
                    u.email as user_email,
                    b.boat_id,
                    bt.name as boat_name,
                    bt.owner_id,
                    o.name as owner_name,
                    o.email as owner_email,
                    TIME_FORMAT(b.start_time, '%H:%i') as start_time,
                    TIME_FORMAT(b.end_time, '%H:%i') as end_time,
                    DATE_FORMAT(b.booking_date, '%d.%m.%Y') as booking_date,
                    b.status,
                    b.amount,
                    DATE_FORMAT(b.created_at, '%d.%m.%Y %H:%i') as created_at
                FROM bookings b
                LEFT JOIN users u ON b.user_id = u.id_user
                LEFT JOIN boats bt ON b.boat_id = bt.id_boat
                LEFT JOIN owners o ON bt.owner_id = o.id_owner
                WHERE b.id_booking = ?";

    $selectStmt = $conn->prepare($selectSql);
    $selectStmt->execute([$bookingId]);
    $booking = $selectStmt->fetch(PDO::FETCH_ASSOC);

    $itemsStmt = $conn->prepare("SELECT
                                    bi.id_booking_item,
                                    bi.product_id,
                                    p.name as product_name,
                                    bi.quantity,
                                    bi.price,
                                    bi.price_discount
                                FROM booking_items bi
                                LEFT JOIN products p ON bi.product_id = p.id_product
                                WHERE bi.booking_id = ?");
    $itemsStmt->execute([$bookingId]);
    $booking['items'] = $itemsStmt->fetchAll(PDO::FETCH_ASSOC);

    sendResponse($booking, 201);

} catch (PDOException $e) {
    if ($conn && $conn->inTransaction()) {
        $conn->rollBack();
    }
    sendError('Database error: ' . $e->getMessage(), 500);
}
?>
