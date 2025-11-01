<?php
$passwordToHash = 'admin123'; // Password yang Anda inginkan
$newHash = password_hash($passwordToHash, PASSWORD_DEFAULT);

echo "Password: " . $passwordToHash . "<br>";
echo "Hash Baru (salin teks di bawah ini):<br>";
echo "<textarea readonly style='width:100%;height:100px;'>" . $newHash . "</textarea>";
?>