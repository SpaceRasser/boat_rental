<?php
require_once '../config.php';

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

if (!in_array($_SERVER['REQUEST_METHOD'], ['PUT', 'POST', 'PATCH'])) {
    sendError('Method not allowed', 405);
}

$orderId = isset($_GET['id']) ? intval($_GET['id']) : 0;
if ($orderId <= 0) {
    sendError('Invalid order ID');
}

$json = file_get_contents('php://input');
$data = json_decode($json, true);

$conn = null;

try {
    $conn = getConnection();
    $conn->beginTransaction();

    $checkStmt = $conn->prepare("SELECT * FROM bookings WHERE id_booking = ?");
    $checkStmt->execute([$orderId]);
    $currentOrder = $checkStmt->fetch(PDO::FETCH_ASSOC);

    if (!$currentOrder) {
        $conn->rollBack();
        sendError('Order not found', 404);
    }

    $newUserId = isset($data['user_id']) ? intval($data['user_id']) : intval($currentOrder['user_id']);
    $newBoatId = isset($data['boat_id']) ? intval($data['boat_id']) : intval($currentOrder['boat_id']);
    $newStartTime = isset($data['start_time']) ? $data['start_time'] : $currentOrder['start_time'];
    $newEndTime = isset($data['end_time']) ? $data['end_time'] : $currentOrder['end_time'];
    $newBookingDate = isset($data['booking_date']) ? $data['booking_date'] : $currentOrder['booking_date'];
    $newStatus = isset($data['status']) ? $data['status'] : $currentOrder['status'];

    if (isset($data['user_id'])) {
        $userStmt = $conn->prepare("SELECT id_user FROM users WHERE id_user = ?");
        $userStmt->execute([$newUserId]);
        if (!$userStmt->fetch()) {
            $conn->rollBack();
            sendError('User not found', 404);
        }
    }

    $boatStmt = $conn->prepare("SELECT id_boat, price, price_discount FROM boats WHERE id_boat = ?");
    $boatStmt->execute([$newBoatId]);
    $boat = $boatStmt->fetch(PDO::FETCH_ASSOC);
    if (!$boat) {
        $conn->rollBack();
        sendError('Boat not found', 404);
    }

    $shouldCheckAvailability = !in_array($newStatus, ['отменена', 'завершена'], true);
    $timeChanged = ($newBoatId !== intval($currentOrder['boat_id']))
        || ($newBookingDate !== $currentOrder['booking_date'])
        || ($newStartTime !== $currentOrder['start_time'])
        || ($newEndTime !== $currentOrder['end_time']);

    if ($shouldCheckAvailability && $timeChanged) {
        $checkSql = "SELECT id_booking FROM bookings
                     WHERE boat_id = ?
                     AND booking_date = ?
                     AND id_booking <> ?
                     AND status NOT IN ('отменена', 'завершена')
                     AND (
                        (? BETWEEN start_time AND end_time) OR
                        (? BETWEEN start_time AND end_time) OR
                        (start_time BETWEEN ? AND ?)
                     )";

        $checkStmt = $conn->prepare($checkSql);
        $checkStmt->execute([$newBoatId, $newBookingDate, $orderId, $newStartTime, $newEndTime, $newStartTime, $newEndTime]);

        if ($checkStmt->fetch()) {
            $conn->rollBack();
            sendError('Это время уже занято');
        }
    }

    $itemsProvided = isset($data['items']) && is_array($data['items']);
    $preparedItems = [];
    $itemsTotal = 0;

    if ($itemsProvided) {
        foreach ($data['items'] as $item) {
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
    }

    $amount = isset($data['amount']) ? floatval($data['amount']) : floatval($currentOrder['amount']);
    if (!isset($data['amount']) && ($itemsProvided || $newBoatId !== intval($currentOrder['boat_id']))) {
        if (!$itemsProvided) {
            $existingItemsStmt = $conn->prepare("SELECT quantity, price, price_discount FROM booking_items WHERE booking_id = ?");
            $existingItemsStmt->execute([$orderId]);
            foreach ($existingItemsStmt->fetchAll(PDO::FETCH_ASSOC) as $item) {
                $itemPrice = $item['price_discount'] !== null ? floatval($item['price_discount']) : floatval($item['price']);
                $itemsTotal += $itemPrice * intval($item['quantity']);
            }
        }
        $baseAmount = $boat['price_discount'] !== null ? floatval($boat['price_discount']) : floatval($boat['price']);
        $amount = $baseAmount + $itemsTotal;
    }

    $updateParts = [];
    $params = [];
    $shouldUpdateAmount = isset($data['amount']) || $itemsProvided || isset($data['boat_id']);

    $fields = [
        'user_id' => $newUserId,
        'boat_id' => $newBoatId,
        'start_time' => $newStartTime,
        'end_time' => $newEndTime,
        'booking_date' => $newBookingDate,
        'status' => $newStatus,
        'amount' => $amount
    ];

    foreach ($fields as $field => $value) {
        if ($field === 'amount' && !$shouldUpdateAmount) {
            continue;
        }

        if (!array_key_exists($field, $data) && $field !== 'amount') {
            continue;
        }
        $updateParts[] = "$field = ?";
        $params[] = $value;
    }

    if (empty($updateParts)) {
        $conn->rollBack();
        sendError('No fields to update');
    }

    $params[] = $orderId;
    $sql = "UPDATE bookings SET " . implode(', ', $updateParts) . " WHERE id_booking = ?";
    $stmt = $conn->prepare($sql);

    if (!$stmt->execute($params)) {
        $conn->rollBack();
        sendError('Failed to update order');
    }

    if ($itemsProvided) {
        $deleteStmt = $conn->prepare("DELETE FROM booking_items WHERE booking_id = ?");
        $deleteStmt->execute([$orderId]);

        if (!empty($preparedItems)) {
            $itemStmt = $conn->prepare("INSERT INTO booking_items (booking_id, product_id, quantity, price, price_discount, created_at)
                                        VALUES (?, ?, ?, ?, ?, NOW())");
            foreach ($preparedItems as $item) {
                $itemStmt->execute([
                    $orderId,
                    $item['product_id'],
                    $item['quantity'],
                    $item['price'],
                    $item['price_discount']
                ]);
            }
        }
    }

    $conn->commit();

    $orderStmt = $conn->prepare("SELECT
            b.id_booking as id_order,
            b.id_booking,
            b.user_id,
            u.name as user_name,
            b.boat_id,
            bt.name as boat_name,
            TIME_FORMAT(b.start_time, '%H:%i') as start_time,
            TIME_FORMAT(b.end_time, '%H:%i') as end_time,
            DATE_FORMAT(b.booking_date, '%d.%m.%Y') as booking_date,
            b.status,
            b.amount,
            DATE_FORMAT(b.created_at, '%d.%m.%Y %H:%i') as created_at
        FROM bookings b
        LEFT JOIN boats bt ON b.boat_id = bt.id_boat
        LEFT JOIN users u ON b.user_id = u.id_user
        WHERE b.id_booking = ?");
    $orderStmt->execute([$orderId]);
    $order = $orderStmt->fetch(PDO::FETCH_ASSOC);

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
    $itemsStmt->execute([$orderId]);
    $order['items'] = $itemsStmt->fetchAll(PDO::FETCH_ASSOC);

    sendResponse($order);

} catch(PDOException $e) {
    if ($conn && $conn->inTransaction()) {
        $conn->rollBack();
    }
    sendError('Database error: ' . $e->getMessage(), 500);
}
?>
