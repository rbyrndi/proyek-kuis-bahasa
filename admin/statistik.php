<?php
session_start();
if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    header('Location: index.html?error=user_not_found');
    exit();
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Statistics | Global Quiz Game</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="admin_style.css?v=1.1">
</head>
<body>
    <div class="admin-container">
        <header>
            <h1>Statistics Dashboard</h1>
            <nav>
                <a href="admin.php">Dashboard</a>
                <a href="statistik.php" class="active">Statistics</a>
                <a href="leaderboard.php" class="active">Leaderboard</a>
                <a href="../api/auth.php?logout=true" class="btn-logout">Logout</a>
            </nav>
        </header>
        <main>
            <div class="stats-grid">
                <!-- Kartu Statistik Utama -->
                <div class="stat-card">
                    <h3>Total Jawaban</h3>
                    <p class="stat-number" id="total-jawaban">-</p>
                </div>
                <div class="stat-card">
                    <h3>Jawaban Benar</h3>
                    <p class="stat-number" id="total-benar">-</p>
                </div>
                <div class="stat-card">
                    <h3>Jawaban Salah</h3>
                    <p class="stat-number" id="total-salah">-</p>
                </div>
                <div class="stat-card">
                    <h3>Tingkat Sukses</h3>
                    <p class="stat-number" id="tingkat-sukses">-</p>
                </div>
            </div>

            <!-- Detail Statistik -->
            <section class="detail-section">
                <div class="detail-card">
                    <h2>🔥 Soal Paling Sering Dijawab</h2>
                    <div id="soal-sering">
                        <p class="loading-text">Memuat data...</p>
                    </div>
                </div>
                <div class="detail-card">
                    <h2>🤯 Soal Paling Sulit</h2>
                    <div id="soal-sulit">
                        <p class="loading-text">Memuat data...</p>
                    </div>
                </div>
            </section>
        </main>
    </div>
    <script src="statistik.js"></script>
</body>
</html>