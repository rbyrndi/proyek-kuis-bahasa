<?php
header('Content-Type: application/json');
require_once 'config.php';

if (isset($_GET['id_bahasa']) && isset($_GET['id_kategori'])) {
    $idBahasa = (int)$_GET['id_bahasa'];
    $idKategori = (int)$_GET['id_kategori'];

    $sql = "
        SELECT 
            p.id_soal, p.gambar, p.teks_pertanyaan, p.penjelasan, p.poin, p.waktu,
            pj.id_pilihan, pj.teks_pilihan, pj.adalah_benar
        FROM pertanyaan p
        JOIN pilihan_jawaban pj ON p.id_soal = pj.id_soal
        WHERE p.id_bahasa = ? AND p.id_kategori = ?
        ORDER BY RAND()
        LIMIT 10
    ";

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

    $soalLengkap = array_filter($soal, function($s) {
        return count($s['pilihan']) === 4;
    });

    echo json_encode(array_values($soalLengkap));

} else {
    echo json_encode(['error' => 'Parameter id_bahasa dan id_kategori diperlukan.']);
}
?>