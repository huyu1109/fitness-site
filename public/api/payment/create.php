<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
require_once __DIR__ . "/config.php";

$payments = loadPayments();
$orderId = generateOrderId();

$payment = [
    "id" => count($payments) + 1,
    "order_id" => $orderId,
    "amount" => 0.50,
    "status" => "pending",
    "created_at" => date("Y-m-d H:i:s"),
    "completed_at" => null
];

$payments[] = $payment;
savePayments($payments);

echo json_encode([
    "success" => true,
    "order_id" => $orderId,
    "amount" => 0.50,
    "expire_minutes" => 5,
    "qrcode" => [
        "wechat" => "/img/wechat_qr.jpg",
        "alipay" => "/img/alipay_qr.jpg"
    ]
], JSON_UNESCAPED_UNICODE);

