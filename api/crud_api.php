<?php
header('Content-Type: application/json');
require_once 'config.php';

session_start();
if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Akses ditolak.']);
    exit();
}

 $aksi = $_REQUEST['aksi'] ?? '';

try {
    switch ($aksi) {
        case 'baca_semua':
            $stmt = $pdo->query("
                SELECT p.id_soal, p.teks_pertanyaan, p.gambar, p.poin, p.waktu, b.nama_bahasa, k.nama_kategori,
                       GROUP_CONCAT(pj.id_pilihan, ':', pj.teks_pilihan, ':', pj.adalah_benar SEPARATOR '|') as pilihan_data
                FROM pertanyaan p
                JOIN bahasa b ON p.id_bahasa = b.id_bahasa
                JOIN kategori k ON p.id_kategori = k.id_kategori
                LEFT JOIN pilihan_jawaban pj ON p.id_soal = pj.id_soal
                GROUP BY p.id_soal
                ORDER BY p.id_soal DESC
            ");
            $results = $stmt->fetchAll();
            
            $soalList = [];
            foreach($results as $row) {
                $pilihanArray = [];
                if (!empty($row['pilihan_data'])) {
                    $pilihanItems = explode('|', $row['pilihan_data']);
                    foreach($pilihanItems as $item) {
                        list($id, $text, $isCorrect) = explode(':', $item);
                        $pilihanArray[] = ['id_pilihan' => $id, 'teks_pilihan' => $text, 'adalah_benar' => (bool)$isCorrect];
                    }
                }
                $soalList[] = [
                    'id_soal' => $row['id_soal'], 'bahasa' => $row['nama_bahasa'], 'kategori' => $row['nama_kategori'], 
                    'gambar' => $row['gambar'], 'teks_pertanyaan' => $row['teks_pertanyaan'], 'poin' => $row['poin'], 'waktu' => $row['waktu'],
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
                if (!is_dir($uploadDir)) { mkdir($uploadDir, 0777, true); }
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
            // Logika update mirip dengan tambah, tapi menggunakan UPDATE
            // ... (implementasikan jika diperlukan) ...
            echo json_encode(['success' => true, 'message' => 'Fitur update akan diimplementasikan.']);
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
            
        default:
            echo json_encode(['success' => false, 'message' => 'Aksi tidak dikenali.']);
            break;
    }
} catch (Exception $e) {
    if (isset($pdo) && $pdo->inTransaction()) { $pdo->rollBack(); }
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Terjadi kesalahan: ' . $e->getMessage()]);
}
?>