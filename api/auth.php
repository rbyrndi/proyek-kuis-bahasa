<?php
error_reporting(E_ALL);

session_start();
require_once 'config.php';

// Proses Logout
if (isset($_GET['logout'])) {
    session_unset();
    session_destroy();
    header('Location: ../admin/login.html');
    exit();
}

// Proses Login
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = $_POST['username'];
    $password = $_POST['password'];

    $stmt = $pdo->prepare("SELECT * FROM admin WHERE username = ?");
    $stmt->execute([$username]);
    $user = $stmt->fetch();

    if ($user && password_verify($password, $user['password_hash'])) {
        $_SESSION['admin_logged_in'] = true;
        $_SESSION['admin_id'] = $user['id'];
        header('Location: ../admin/admin.php');
    } else {
        // Redirect kembali ke login dengan pesan error (bisa pakai session flash)
        header('Location: ../admin/login.html?error=1');
    }
} else {
    // Jika bukan POST, redirect ke login
    header('Location: ../admin/login.html');
}
?>