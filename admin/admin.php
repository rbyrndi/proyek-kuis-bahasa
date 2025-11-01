<?php
session_start();
if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    header('Location: index.html');
    exit();
} ?>
<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard Admin | Global Quiz Game</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="admin_style.css?v=1.1">
</head>

<body>
    <div class="admin-container">

        <header>
            <h1>Dashboard Admin</h1>
            <nav>
                <a href="admin.php" class="active">Dashboard</a>
                <a href="statistik.php">Statistics</a>
                <a href="leaderboard.php" class="active">Leaderboard</a>
                <a href="../api/auth.php?logout=true" class="btn-logout">Logout</a>
            </nav>
        </header>
        <main>
            <section class="form-section">
                <h2>Tambah / Edit Soal</h2>
                <form id="form-soal" enctype="multipart/form-data">
                    <input type="hidden" id="id-soal" name="id_soal">
                    <input type="hidden" id="gambar-lama" name="gambar_lama">
                    <div class="form-group">
                        <label for="bahasa">Language</label>
                        <select id="bahasa" name="id_bahasa" required></select>
                    </div>
                    <div class="form-group">
                        <label for="kategori">Category</label>
                        <select id="kategori" name="id_kategori" required></select>
                    </div>
                    <div class="form-group">
                        <label for="gambar">Image (Optional)</label>
                        <input type="file" id="gambar" name="gambar" accept="image/*">
                        <img id="preview-gambar-lama" src="" alt="Current Image" style="max-width: 150px; margin-top: 10px; display: none;">
                    </div>
                    <div class="form-group">
                        <label for="pertanyaan">Question</label>
                        <textarea id="pertanyaan" name="teks_pertanyaan" rows="3" required></textarea>
                    </div>
                    <div class="form-group">
                        <label for="penjelasan">Explanation</label>
                        <textarea id="penjelasan" name="penjelasan" rows="2"></textarea>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="poin">Points</label>
                            <input type="number" id="poin" name="poin" value="10" min="5" max="100" required>
                        </div>
                        <div class="form-group">
                            <label for="waktu">Time (seconds)</label>
                            <input type="number" id="waktu" name="waktu" value="15" min="5" max="60" required>
                        </div>
                    </div>
                    <div class="pilihan-jawaban-form">
                        <h4>Answer Options</h4>
                        <?php for ($i = 1; $i <= 4; $i++): ?>
                            <div class="pilihan-item">
                                <input type="radio" name="adalah_benar" id="benar_<?php echo $i; ?>" value="<?php echo $i; ?>" required>
                                <input type="text" name="pilihan[]" placeholder="Option <?php echo chr(64 + $i); ?>" required>
                            </div>
                        <?php endfor; ?>
                    </div>
                    <div class="form-actions">
                        <button type="button" id="btn-preview" class="btn-secondary">Preview</button>
                        <button type="submit" class="btn-submit">Save Question</button>
                        <button type="button" id="btn-batal" class="btn-cancel">Cancel</button>
                    </div>
                </form>
            </section>
            <section class="table-section">
                
                <div class="filter-controls">
                    <div class="form-group">
                        <label for="filter-bahasa">Filter by Language:</label>
                        <select id="filter-bahasa"></select>
                    </div>
                    <div class="form-group">
                        <label for="filter-kategori">Filter by Category:</label>
                        <select id="filter-kategori"></select>
                    </div>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>No</th>
                            <th>Language</th>
                            <th>Category</th>
                            <th>Question</th>
                            <th>Points</th>
                            <th>Image</th>
                            <th>Action</th>
                            </tr>
                        </thead>
                        <tbody id="tbody-soal"></tbody>
                    </table>
                </section>
            </main>
        </div>
    <!-- Modal untuk Preview -->
    <div id="preview-modal" class="modal">
        <div class="modal-content">
            <span class="close-btn">&times;</span>
            <h3>Question Preview</h3>
            <p id="preview-question"></p>
            <div id="preview-options"></div>
        </div>
    </div>
    <script src="admin.js"></script>
</body>

</html>