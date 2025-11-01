<?php
// Konfigurasi Database
$host = 'localhost';
 $db   = 'db_kuis_bahasa'; // Nama database
 $user = 'root'; // Username database MySQL (default XAMPP)
 $pass = ''; // Password database MySQL (default XAMPP)
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (\PDOException $e) {
    // Di lingkungan produksi, jangan tampilkan error detail
    throw new \PDOException($e->getMessage(), (int)$e->getCode());
}
?>