<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
require_once __DIR__ . "/config.php";

// Admin: list all orders
$listAll = $_GET["list_all"] ?? "";
$secret = $_GET["secret"] ?? "";
if ($listAll && $secret === ADMIN_SECRET) {
    $payments = loadPayments();
    echo json_encode(["success" => true, "orders" => $payments], JSON_UNESCAPED_UNICODE);
    exit;
}

$orderId = $_GET["order_id"] ?? "";
if (!$orderId) {
    echo json_encode(["success" => false, "message" => "缺少订单号"]);
    exit;
}

$payments = loadPayments();
$found = null;
foreach ($payments as $p) {
    if ($p["order_id"] === $orderId) { $found = $p; break; }
}

if (!$found) {
    echo json_encode(["success" => false, "message" => "订单不存在"]);
    exit;
}

// Check expiry (5 min)
$created = strtotime($found["created_at"]);
if ($found["status"] === "pending" && (time() - $created) > 300) {
    echo json_encode(["success" => false, "status" => "expired", "message" => "订单已过期"]);
    exit;
}

echo json_encode([
    "success" => $found["status"] === "completed",
    "status" => $found["status"],
    "message" => $found["status"] === "completed" ? "支付成功" : "等待支付"
], JSON_UNESCAPED_UNICODE);
