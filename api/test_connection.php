<?php
// Coba koneksi ke database
try {
    require_once 'config.php';
    echo "<h1 style='color:green;'>Koneksi ke Database BERHASIL!</h1>";
    echo "Terhubung ke database: <strong>db_kuis_bahasa</strong>";
} catch (PDOException $e) {
    // Jika gagal, tampilkan pesan error
    echo "<h1 style='color:red;'>Koneksi ke Database GAGAL!</h1>";
    echo "Pesan Error: " . $e->getMessage();
}
?>