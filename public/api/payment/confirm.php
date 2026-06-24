<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
require_once __DIR__ . "/config.php";

$orderId = $_POST["order_id"] ?? $_GET["order_id"] ?? "";
$secret = $_POST["secret"] ?? $_GET["secret"] ?? "";

if ($secret !== "tieguan888") {
    http_response_code(403);
    echo json_encode(["success" => false, "message" => "密钥错误"]);
    exit;
}
if (!$orderId) {
    echo json_encode(["success" => false, "message" => "缺少订单号"]);
    exit;
}

$payments = loadPayments();
$found = false;
foreach ($payments as &$p) {
    if ($p["order_id"] === $orderId && $p["status"] === "pending") {
        $p["status"] = "completed";
        $p["completed_at"] = date("Y-m-d H:i:s");
        $found = true;
        break;
    }
}

if ($found) {
    savePayments($payments);
    echo json_encode(["success" => true, "message" => "订单已确认支付"]);
} else {
    echo json_encode(["success" => false, "message" => "订单不存在或已处理"]);
}
