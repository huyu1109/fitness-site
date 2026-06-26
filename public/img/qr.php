<?php
header("Content-Type: image/jpeg");
header("Cache-Control: public, max-age=86400");
$file = __DIR__ . "/wechat_qr.jpg";
if (file_exists($file)) {
    header("Content-Length: " . filesize($file));
    readfile($file);
} else {
    http_response_code(404);
    echo "Image not found";
}
