document.addEventListener('DOMContentLoaded', () => {
    const totalJawabanEl = document.getElementById('total-jawaban');
    const totalBenarEl = document.getElementById('total-benar');
    const totalSalahEl = document.getElementById('total-salah');
    const tingkatSuksesEl = document.getElementById('tingkat-sukses');
    const soalSeringEl = document.getElementById('soal-sering');
    const soalSulitEl = document.getElementById('soal-sulit');

    const muatStatistik = async () => {
        try {
            const response = await fetch('../api/crud_api.php?aksi=get_statistik');
            const data = await response.json();

            // Update kartu utama
            totalJawabanEl.textContent = data.totalJawaban;
            totalBenarEl.textContent = data.totalBenar;
            totalSalahEl.textContent = data.totalSalah;
            tingkatSuksesEl.textContent = `${data.tingkatSukses}%`;

            // Update soal paling sering
            if (data.soalPalingSering) {
                soalSeringEl.innerHTML = `
                    <p><strong>Soal:</strong> ${data.soalPalingSering.teks_pertanyaan}</p>
                    <p><strong>Dijawab:</strong> ${data.soalPalingSering.jumlah_dijawab} kali</p>
                    <p><strong>Kategori:</strong> ${data.soalPalingSering.nama_kategori} (${data.soalPalingSering.nama_bahasa})</p>
                `;
            } else {
                soalSeringEl.innerHTML = '<p>Belum ada data yang cukup.</p>';
            }

            // Update soal paling sulit
            if (data.soalPalingSulit) {
                soalSulitEl.innerHTML = `
                    <p><strong>Soal:</strong> ${data.soalPalingSulit.teks_pertanyaan}</p>
                    <p><strong>Tingkat Sukses:</strong> ${data.soalPalingSulit.tingkat_sukses}%</p>
                    <p><strong>Kategori:</strong> ${data.soalPalingSulit.nama_kategori} (${data.soalPalingSulit.nama_bahasa})</p>
                `;
            } else {
                soalSulitEl.innerHTML = '<p>Belum ada data yang cukup.</p>';
            }

        } catch (error) {
            console.error('Gagal memuat statistik:', error);
            // Tampilkan pesan error di semua elemen
            document.querySelectorAll('.loading-text').forEach(el => {
                el.textContent = 'Gagal memuat data.';
            });
        }
    };

    muatStatistik();
});