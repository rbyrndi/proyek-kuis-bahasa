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
    <title>Leaderboard | Global Quiz Game</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="admin_style.css?v=1.1">
</head>
<body>
    <div class="admin-container">
        <header>
            <h1>Leaderboard Management</h1>
            <nav>
                <a href="admin.php">Dashboard</a>
                <a href="statistik.php">Statistics</a>
                <a href="leaderboard.php" class="active">Leaderboard</a>
                <a href="../api/auth.php?logout=true" class="btn-logout">Logout</a>
            </nav>
        </header>
        <main>
            <section class="table-section">
                <h2>Top 50 High Scores</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Rank</th>
                            <th>Player Name</th>
                            <th>Score</th>
                            <th>Language</th>
                            <th>Category</th>
                            <th>Date</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody id="tbody-leaderboard">
                        <tr>
                            <td colspan="7" class="loading-text">Loading data...</td>
                        </tr>
                    </tbody>
                </table>
            </section>
        </main>
    </div>
    <script src="leaderboard.js"></script>
</body>
</html>