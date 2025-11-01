<?php
session_start();
require_once 'config.php';

// Proses Logout
if (isset($_GET['logout'])) {
    session_unset();
    session_destroy();
    header('Location: ../admin/index.html');
    exit();
}

// Proses Login
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = $_POST['username'];
    $password = $_POST['password'];

    $stmt = $pdo->prepare("SELECT * FROM admin WHERE username = ?");
    $stmt->execute([$username]);
    $user = $stmt->fetch();

    if (!$user) {
        // Jika username tidak ditemukan
        header('Location: ../admin/index.html?error=user_not_found');
        exit();
    }

    if (!password_verify($password, $user['password_hash'])) {
        // Jika username ditemukan tapi password salah
        header('Location: ../admin/index.html?error=password_incorrect');
        exit();
    }

    // Jika username dan password benar
    $_SESSION['admin_logged_in'] = true;
    $_SESSION['admin_id'] = $user['id'];
    header('Location: ../admin/admin.php');
} else {
    // Jika bukan POST, redirect ke login
    header('Location: ../admin/index.html');
}
?>