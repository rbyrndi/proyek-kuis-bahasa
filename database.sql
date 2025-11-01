CREATE DATABASE IF NOT EXISTS db_kuis_bahasa;
USE db_kuis_bahasa;

-- Tabel Admin
CREATE TABLE `admin` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL
);

-- Tabel Bahasa
CREATE TABLE `bahasa` (
  `id_bahasa` INT AUTO_INCREMENT PRIMARY KEY,
  `kode_bahasa` VARCHAR(10) NOT NULL UNIQUE,
  `nama_bahasa` VARCHAR(50) NOT NULL UNIQUE
);

-- Tabel Kategori
CREATE TABLE `kategori` (
  `id_kategori` INT AUTO_INCREMENT PRIMARY KEY,
  `nama_kategori` VARCHAR(100) NOT NULL UNIQUE
);

-- Tabel Pertanyaan (Diperbarui)
CREATE TABLE `pertanyaan` (
  `id_soal` INT AUTO_INCREMENT PRIMARY KEY,
  `id_bahasa` INT NOT NULL,
  `id_kategori` INT NOT NULL,
  `gambar` VARCHAR(255) NULL,
  `teks_pertanyaan` TEXT NOT NULL,
  `penjelasan` TEXT NULL, -- BARU: Untuk penjelasan jawaban
  `poin` INT DEFAULT 10, -- BARU: Poin dasar untuk soal
  `waktu` INT DEFAULT 15, -- BARU: Waktu dalam detik
  FOREIGN KEY (`id_bahasa`) REFERENCES `bahasa`(`id_bahasa`) ON DELETE CASCADE,
  FOREIGN KEY (`id_kategori`) REFERENCES `kategori`(`id_kategori`) ON DELETE CASCADE
);

-- Tabel Pilihan Jawaban
CREATE TABLE `pilihan_jawaban` (
  `id_pilihan` INT AUTO_INCREMENT PRIMARY KEY,
  `id_soal` INT NOT NULL,
  `teks_pilihan` VARCHAR(255) NOT NULL,
  `adalah_benar` TINYINT(1) NOT NULL DEFAULT 0,
  FOREIGN KEY (`id_soal`) REFERENCES `pertanyaan`(`id_soal`) ON DELETE CASCADE
);

-- Tabel Skor (BARU: Untuk Leaderboard)
CREATE TABLE `skor` (
  `id_skor` INT AUTO_INCREMENT PRIMARY KEY,
  `nama_pemain` VARCHAR(100) NOT NULL,
  `skor_akhir` INT NOT NULL,
  `id_bahasa` INT,
  `id_kategori` INT,
  `tanggal_waktu` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Log Jawaban (BARU: Untuk Statistik)
CREATE TABLE `log_jawaban` (
  `id_log` INT AUTO_INCREMENT PRIMARY KEY,
  `id_soal` INT NOT NULL,
  `jawaban_benar` TINYINT(1) NOT NULL, -- 1 untuk benar, 0 untuk salah
  `tanggal_waktu` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`id_soal`) REFERENCES `pertanyaan`(`id_soal`) ON DELETE CASCADE
);

-- Insert Data Awal
INSERT INTO `admin` (`username`, `password_hash`) VALUES 
('admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi');

INSERT INTO `bahasa` (`id_bahasa`, `kode_bahasa`, `nama_bahasa`) VALUES
(1, 'en', 'English'),
(2, 'id', 'Bahasa Indonesia'),
(3, 'sd', 'Basa Sunda');

INSERT INTO `kategori` (`id_kategori`, `nama_kategori`) VALUES
(1, 'Animals'),
(2, 'Fruits'),
(3, 'Colors');

-- Contoh Soal Lengkap
INSERT INTO `pertanyaan` (`id_bahasa`, `id_kategori`, `teks_pertanyaan`, `penjelasan`, `poin`, `waktu`) VALUES
(1, 1, 'What sound does a cat make?', 'Cats are known for their "meow" sound, used to communicate with humans.', 10, 15),
(2, 1, 'Which fruit is known as the "king of fruits"?', 'Durian is famously called the "king of fruits" in Southeast Asia due to its distinctive smell and taste.', 15, 20),
(3, 1, 'What color do you get when you mix red and white?', 'Mixing red and white paint creates various shades of pink.', 10, 10);

INSERT INTO `pilihan_jawaban` (`id_soal`, `teks_pilihan`, `adalah_benar`) VALUES
(1, 'Woof', 0), (1, 'Meow', 1), (1, 'Moo', 0), (1, 'Quack', 0),
(2, 'Apple', 0), (2, 'Mango', 0), (2, 'Durian', 1), (2, 'Banana', 0),
(3, 'Blue', 0), (3, 'Green', 0), (3, 'Yellow', 0), (3, 'Pink', 1);