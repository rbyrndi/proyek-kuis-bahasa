<?php
// Ganti 'admin123' dengan password yang Anda inginkan
$password = 'admin123';
$hash = password_hash($password, PASSWORD_DEFAULT);

echo "Password Anda: " . $password . "\n";
echo "Hash baru Anda (salin ini):\n";
echo "<textarea readonly style='width:100%;height:100px;'>" . $hash . "</textarea>";
?>