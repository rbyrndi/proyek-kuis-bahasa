<?php
header('Content-Type: application/json');
require_once 'config.php';

if (isset($_GET['id_bahasa']) && isset($_GET['id_kategori'])) {
    $idBahasa = (int)$_GET['id_bahasa'];
    $idKategori = (int)$_GET['id_kategori'];

    // --- PERBAIKAN SQL ---
    // Menggunakan JOIN dengan subquery untuk mengambil 10 soal acak
    // Ini lebih efisien dan kompatibel daripada 'LIMIT' di dalam 'IN'
    $sql = "
    SELECT 
    p.id_soal, p.gambar, p.teks_pertanyaan, p.penjelasan, p.poin, p.waktu,
    pj.id_pilihan, pj.teks_pilihan, pj.adalah_benar
        FROM pilihan_jawaban pj
        JOIN pertanyaan p ON pj.id_soal = p.id_soal
JOIN (
SELECT id_soal 
FROM pertanyaan
WHERE id_bahasa = ? AND id_kategori = ?
ORDER BY RAND()
LIMIT 10
) AS random_soal ON p.id_soal = random_soal.id_soal
";
    // --- AKHIR PERBAIKAN SQL ---

    $stmt = $pdo->prepare($sql);
    $stmt->execute([$idBahasa, $idKategori]);
    $results = $stmt->fetchAll();

    $soal = [];
    foreach ($results as $row) {
        if (!isset($soal[$row['id_soal']])) {
            $soal[$row['id_soal']] = [
                'id_soal' => $row['id_soal'],
                'gambar' => $row['gambar'],
                'teks_pertanyaan' => $row['teks_pertanyaan'],
                'penjelasan' => $row['penjelasan'],
                'poin' => $row['poin'],
                'waktu' => $row['waktu'],
                'pilihan' => []
            ];
        }
        $soal[$row['id_soal']]['pilihan'][] = [
            'id_pilihan' => $row['id_pilihan'],
            'teks_pilihan' => $row['teks_pilihan'],
            'adalah_benar' => (bool)$row['adalah_benar']
        ];
    }

    // Filter untuk memastikan hanya soal dengan 4 pilihan yang lolos
    $soalLengkap = array_filter($soal, function ($s) {
        return count($s['pilihan']) >= 4;
    });

    // Acak hasil akhir
    $finalSoalList = array_values($soalLengkap);
    shuffle($finalSoalList);

    echo json_encode($finalSoalList);
} else {
    // Kirim pesan error jika parameter tidak lengkap
    http_response_code(400); // Bad Request
    echo json_encode(['error' => 'Parameter id_bahasa dan id_kategori diperlukan.']);
}
