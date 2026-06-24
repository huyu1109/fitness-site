@echo off
chcp 65001 >nul
echo 🏋️ 正在启动健身网站服务器...
cd /d "D:\健身网站"
"D:\HU\Node\node.exe" server.js
pause
