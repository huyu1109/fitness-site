<?php
$paymentsFile = __DIR__ . "/payments.json";

function loadPayments() {
    global $paymentsFile;
    if (!file_exists($paymentsFile)) return [];
    $data = file_get_contents($paymentsFile);
    return json_decode($data, true) ?: [];
}

function savePayments($payments) {
    global $paymentsFile;
    file_put_contents($paymentsFile, json_encode($payments, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}

function generateOrderId() {
    return "TG" . date("Ymd") . strtoupper(substr(uniqid(), -6));
}
