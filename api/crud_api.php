<?php
header('Content-Type: application/json');
require_once 'config.php';

session_start(); // session_start() tetap diperlukan di atas
$aksi = $_REQUEST['aksi'] ?? ''; // Ambil $aksi dulu

// --- PERBAIKAN KEAMANAN ---
// Tentukan aksi apa saja yang boleh diakses publik (tanpa login admin)
$aksi_publik = ['get_kategori', 'simpan_skor', 'log_jawaban'];

// Jika aksi yang diminta BUKAN aksi publik, maka cek login admin
if (!in_array($aksi, $aksi_publik)) {
    // Ini adalah aksi khusus Admin, periksa sesi
    if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Akses ditolak.']);
        exit();
    }
}

$aksi = $_REQUEST['aksi'] ?? '';

try {
    switch ($aksi) {
        case 'baca_semua':
            // --- MODIFIKASI: Baca parameter filter ---
            $id_bahasa_filter = $_GET['id_bahasa'] ?? null;
            $id_kategori_filter = $_GET['id_kategori'] ?? null;

            // --- MODIFIKASI: Bangun kueri SQL secara dinamis ---
            $sql = "
SELECT p.id_soal, p.teks_pertanyaan, p.gambar, p.poin, p.waktu, b.nama_bahasa, k.nama_kategori,
GROUP_CONCAT(pj.id_pilihan, ':', pj.teks_pilihan, ':', pj.adalah_benar SEPARATOR '|') as pilihan_data
FROM pertanyaan p
JOIN bahasa b ON p.id_bahasa = b.id_bahasa
JOIN kategori k ON p.id_kategori = k.id_kategori
LEFT JOIN pilihan_jawaban pj ON p.id_soal = pj.id_soal
";

            $whereClauses = [];
            $params = [];

            if (!empty($id_bahasa_filter)) {
                $whereClauses[] = "p.id_bahasa = ?";
                $params[] = $id_bahasa_filter;
            }
            if (!empty($id_kategori_filter)) {
                $whereClauses[] = "p.id_kategori = ?";
                $params[] = $id_kategori_filter;
            }

            if (count($whereClauses) > 0) {
                $sql .= " WHERE " . implode(" AND ", $whereClauses);
            }

$sql .= " GROUP BY p.id_soal ORDER BY p.id_soal DESC";
            // --- AKHIR MODIFIKASI KUEri ---

$stmt = $pdo->prepare($sql);
            $stmt->execute($params); // Jalankan dengan parameter
$results = $stmt->fetchAll();

$soalList = [];
            // Sisa dari 'case' ini (looping foreach, dll) tetap sama
foreach ($results as $row) {
$pilihanArray = [];
if (!empty($row['pilihan_data'])) {
$pilihanItems = explode('|', $row['pilihan_data']);
foreach ($pilihanItems as $item) {
                        $parts = explode(':', $item);
                        if (count($parts) >= 3) {
                            list($id, $text, $isCorrect) = $parts;
                            $pilihanArray[] = ['id_pilihan' => $id, 'teks_pilihan' => $text, 'adalah_benar' => (bool)$isCorrect];
                        }
}
}
$soalList[] = [
'id_soal' => $row['id_soal'],
'bahasa' => $row['nama_bahasa'],
'kategori' => $row['nama_kategori'],
'gambar' => $row['gambar'],
'teks_pertanyaan' => $row['teks_pertanyaan'],
'poin' => $row['poin'],
'waktu' => $row['waktu'],
'pilihan' => $pilihanArray
];
}
echo json_encode($soalList);
break;

        case 'tambah':
            $pdo->beginTransaction();
            $gambarPath = null;
            if (isset($_FILES['gambar']) && $_FILES['gambar']['error'] === UPLOAD_ERR_OK) {
                $uploadDir = '../uploads/images/';
                if (!is_dir($uploadDir)) {
                    mkdir($uploadDir, 0777, true);
                }
                $fileName = uniqid() . '-' . basename($_FILES['gambar']['name']);
                $targetPath = $uploadDir . $fileName;
                if (move_uploaded_file($_FILES['gambar']['tmp_name'], $targetPath)) {
                    $gambarPath = 'uploads/images/' . $fileName;
                }
            }
            $stmt = $pdo->prepare("INSERT INTO pertanyaan (id_bahasa, id_kategori, gambar, teks_pertanyaan, penjelasan, poin, waktu) VALUES (?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([$_POST['id_bahasa'], $_POST['id_kategori'], $gambarPath, $_POST['teks_pertanyaan'], $_POST['penjelasan'], $_POST['poin'], $_POST['waktu']]);
            $idSoalBaru = $pdo->lastInsertId();

            $pilihanList = $_POST['pilihan'];
            $adalahBenarIndex = (int)$_POST['adalah_benar'] - 1;
            $stmt = $pdo->prepare("INSERT INTO pilihan_jawaban (id_soal, teks_pilihan, adalah_benar) VALUES (?, ?, ?)");
            foreach ($pilihanList as $index => $teks) {
                $isCorrect = ($index === $adalahBenarIndex) ? 1 : 0;
                $stmt->execute([$idSoalBaru, $teks, $isCorrect]);
            }
            $pdo->commit();
            echo json_encode(['success' => true]);
            break;

        case 'update':
            $pdo->beginTransaction();
            $idSoal = $_POST['id_soal'];

            // Handle update gambar jika ada
            $gambarPath = $_POST['gambar_lama']; // Pertahankan gambar lama
            if (isset($_FILES['gambar']) && $_FILES['gambar']['error'] === UPLOAD_ERR_OK) {
                // Hapus gambar lama jika ada
                if ($gambarPath && file_exists('../' . $gambarPath)) {
                    unlink('../' . $gambarPath);
                }
                // Upload gambar baru
                $uploadDir = '../uploads/images/';
                if (!is_dir($uploadDir)) {
                    mkdir($uploadDir, 0777, true);
                }
                $fileName = uniqid() . '-' . basename($_FILES['gambar']['name']);
                $targetPath = $uploadDir . $fileName;
                if (move_uploaded_file($_FILES['gambar']['tmp_name'], $targetPath)) {
                    $gambarPath = 'uploads/images/' . $fileName;
                }
            }

            // Update data pertanyaan
            $stmt = $pdo->prepare("UPDATE pertanyaan SET id_bahasa = ?, id_kategori = ?, gambar = ?, teks_pertanyaan = ?, penjelasan = ?, poin = ?, waktu = ? WHERE id_soal = ?");
            $stmt->execute([$_POST['id_bahasa'], $_POST['id_kategori'], $gambarPath, $_POST['teks_pertanyaan'], $_POST['penjelasan'], $_POST['poin'], $_POST['waktu'], $idSoal]);

            // Hapus semua pilihan lama dan ganti dengan yang baru (cara termudah)
            $stmt = $pdo->prepare("DELETE FROM pilihan_jawaban WHERE id_soal = ?");
            $stmt->execute([$idSoal]);

            // Tambah pilihan baru
            $pilihanList = $_POST['pilihan'];
            $adalahBenarIndex = (int)$_POST['adalah_benar'] - 1;
            $stmt = $pdo->prepare("INSERT INTO pilihan_jawaban (id_soal, teks_pilihan, adalah_benar) VALUES (?, ?, ?)");
            foreach ($pilihanList as $index => $teks) {
                $isCorrect = ($index === $adalahBenarIndex) ? 1 : 0;
                $stmt->execute([$idSoal, $teks, $isCorrect]);
            }
            $pdo->commit();
            echo json_encode(['success' => true]);
            break;

        case 'hapus':
            $pdo->beginTransaction();
            $idSoal = $_POST['id_soal'];
            $stmtGambar = $pdo->prepare("SELECT gambar FROM pertanyaan WHERE id_soal = ?");
            $stmtGambar->execute([$idSoal]);
            $soal = $stmtGambar->fetch();
            if ($soal && $soal['gambar'] && file_exists('../' . $soal['gambar'])) {
                unlink('../' . $soal['gambar']);
            }
            $stmt = $pdo->prepare("DELETE FROM pilihan_jawaban WHERE id_soal = ?");
            $stmt->execute([$idSoal]);
            $stmt = $pdo->prepare("DELETE FROM pertanyaan WHERE id_soal = ?");
            $stmt->execute([$idSoal]);
            $pdo->commit();
            echo json_encode(['success' => true]);
            break;

        case 'get_kategori':
            $stmt = $pdo->query("SELECT id_kategori, nama_kategori FROM kategori ORDER BY nama_kategori");
            echo json_encode($stmt->fetchAll());
            break;

        case 'get_bahasa':
            $stmt = $pdo->query("SELECT id_bahasa, nama_bahasa FROM bahasa ORDER BY nama_bahasa");
            echo json_encode($stmt->fetchAll());
            break;

        case 'simpan_skor':
            $stmt = $pdo->prepare("INSERT INTO skor (nama_pemain, skor_akhir, id_bahasa, id_kategori) VALUES (?, ?, ?, ?)");
            $stmt->execute([$_POST['nama_pemain'], $_POST['skor_akhir'], $_POST['id_bahasa'], $_POST['id_kategori']]);
            echo json_encode(['success' => true]);
            break;

        case 'log_jawaban':
            $stmt = $pdo->prepare("INSERT INTO log_jawaban (id_soal, jawaban_benar) VALUES (?, ?)");
            $stmt->execute([$_POST['id_soal'], $_POST['jawaban_benar']]);
            echo json_encode(['success' => true]);
            break;

        case 'baca_satu':
            if (isset($_GET['id_soal'])) {
                $stmt = $pdo->prepare("
            SELECT p.*, b.nama_bahasa, k.nama_kategori,
            GROUP_CONCAT(pj.id_pilihan, ':', pj.teks_pilihan, ':', pj.adalah_benar SEPARATOR '|') as pilihan_data
            FROM pertanyaan p
            JOIN bahasa b ON p.id_bahasa = b.id_bahasa
            JOIN kategori k ON p.id_kategori = k.id_kategori
            LEFT JOIN pilihan_jawaban pj ON p.id_soal = pj.id_soal
            WHERE p.id_soal = ?
            GROUP BY p.id_soal
        ");
                $stmt->execute([$_GET['id_soal']]);
                $soal = $stmt->fetch();

                if ($soal) {
                    $pilihanArray = [];
                    if (!empty($soal['pilihan_data'])) {
                        $pilihanItems = explode('|', $soal['pilihan_data']);
                        foreach ($pilihanItems as $item) {
                            list($id, $text, $isCorrect) = explode(':', $item);
                            $pilihanArray[] = ['id_pilihan' => $id, 'teks_pilihan' => $text, 'adalah_benar' => (bool)$isCorrect];
                        }
                    }
                    $soal['pilihan'] = $pilihanArray;
                }
                echo json_encode($soal);
            }
            break;
        case 'get_statistik':
            // 1. Total Jawaban
            $stmtTotal = $pdo->query("SELECT COUNT(*) as total FROM log_jawaban");
            $totalJawaban = $stmtTotal->fetch()['total'];

            // 2. Jawaban Benar & Salah
            $stmtBenar = $pdo->query("SELECT COUNT(*) as benar FROM log_jawaban WHERE jawaban_benar = 1");
            $totalBenar = $stmtBenar->fetch()['benar'];
            $totalSalah = $totalJawaban - $totalBenar;
            $tingkatSukses = $totalJawaban > 0 ? round(($totalBenar / $totalJawaban) * 100, 2) : 0;

            // 3. Soal Paling Sering Dijawab
            $stmtSering = $pdo->query("
        SELECT COUNT(l.id_soal) as jumlah_dijawab, p.teks_pertanyaan, b.nama_bahasa, k.nama_kategori
        FROM log_jawaban l
        JOIN pertanyaan p ON l.id_soal = p.id_soal
        JOIN bahasa b ON p.id_bahasa = b.id_bahasa
        JOIN kategori k ON p.id_kategori = k.id_kategori
        GROUP BY l.id_soal
        ORDER BY jumlah_dijawab DESC
        LIMIT 1
    ");
            $soalPalingSering = $stmtSering->fetch();

            // 4. Soal Paling Sulit (Tingkat Kesuksesan Terendah)
            $stmtSulit = $pdo->query("
        SELECT 
            l.id_soal,
            p.teks_pertanyaan,
            b.nama_bahasa,
            k.nama_kategori,
            COUNT(l.id_soal) as total_dijawab,
            SUM(l.jawaban_benar) as total_benar
        FROM log_jawaban l
        JOIN pertanyaan p ON l.id_soal = p.id_soal
        JOIN bahasa b ON p.id_bahasa = b.id_bahasa
        JOIN kategori k ON p.id_kategori = k.id_kategori
        GROUP BY l.id_soal
        HAVING total_dijawab > 5 -- Hanya hitung soal yang sudah dijawab > 5 kali
        ORDER BY (total_benar / total_dijawab) ASC
        LIMIT 1
    ");
            $soalPalingSulit = $stmtSulit->fetch();
            if ($soalPalingSulit) {
                $soalPalingSulit['tingkat_sukses'] = round(($soalPalingSulit['total_benar'] / $soalPalingSulit['total_dijawab']) * 100, 2);
            }

            echo json_encode([
                'totalJawaban' => $totalJawaban,
                'totalBenar' => $totalBenar,
                'totalSalah' => $totalSalah,
                'tingkatSukses' => $tingkatSukses,
                'soalPalingSering' => $soalPalingSering,
                'soalPalingSulit' => $soalPalingSulit
            ]);
            break;
        case 'get_leaderboard':
            $stmt = $pdo->query("
        SELECT 
            s.id_skor, s.nama_pemain, s.skor_akhir, s.tanggal_waktu,
            b.nama_bahasa, k.nama_kategori
        FROM skor s
        LEFT JOIN bahasa b ON s.id_bahasa = b.id_bahasa
        LEFT JOIN kategori k ON s.id_kategori = k.id_kategori
        ORDER BY s.skor_akhir DESC
        LIMIT 50
    ");
            $leaderboard = $stmt->fetchAll();
            echo json_encode($leaderboard);
            break;

        case 'hapus_skor':
            $pdo->beginTransaction();
            $idSkor = $_POST['id_skor'];

            $stmt = $pdo->prepare("DELETE FROM skor WHERE id_skor = ?");
            $stmt->execute([$idSkor]);

            $pdo->commit();
            echo json_encode(['success' => true]);
            break;

        default:
            echo json_encode(['success' => false, 'message' => 'Aksi tidak dikenali.']);
            break;
    }
} catch (Exception $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Terjadi kesalahan: ' . $e->getMessage()]);
}
