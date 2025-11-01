document.addEventListener('DOMContentLoaded', () => {
    const tbodyLeaderboard = document.getElementById('tbody-leaderboard');

    const muatLeaderboard = async () => {
        try {
            const response = await fetch('../api/crud_api.php?aksi=get_leaderboard');
            const scores = await response.json();
            renderTabel(scores);
        } catch (error) {
            console.error('Gagal memuat leaderboard:', error);
            tbodyLeaderboard.innerHTML = '<tr><td colspan="7" class="error-text">Gagal memuat data.</td></tr>';
        }
    };

    const renderTabel = (data) => {
        tbodyLeaderboard.innerHTML = '';
        if (data.length === 0) {
            tbodyLeaderboard.innerHTML = '<tr><td colspan="7">Belum ada data skor.</td></tr>';
            return;
        }

        data.forEach((item, index) => {
            const tr = document.createElement('tr');
            
            // Tambahkan styling khusus untuk top 3
            let rankClass = '';
            if (index === 0) rankClass = 'rank-gold';
            else if (index === 1) rankClass = 'rank-silver';
            else if (index === 2) rankClass = 'rank-bronze';

            tr.innerHTML = `
                <td class="rank ${rankClass}">${index + 1}</td>
                <td>${item.nama_pemain}</td>
                <td>${item.skor_akhir}</td>
                <td>${item.nama_bahasa || 'All'}</td>
                <td>${item.nama_kategori || 'All'}</td>
                <td>${new Date(item.tanggal_waktu).toLocaleDateString()}</td>
                <td>
                    <button class="btn-hapus" data-id="${item.id_skor}">Delete</button>
                </td>
            `;
            tbodyLeaderboard.appendChild(tr);
        });
    };

    // Event listener untuk tombol hapus
    tbodyLeaderboard.addEventListener('click', async (e) => {
        if (e.target.classList.contains('btn-hapus')) {
            const idSkor = e.target.dataset.id;
            if (confirm('Are you sure you want to delete this score?')) {
                const formData = new FormData();
                formData.append('id_skor', idSkor);
                try {
                    const response = await fetch('../api/crud_api.php?aksi=hapus_skor', {
                        method: 'POST',
                        body: formData
                    });
                    const result = await response.json();
                    if (result.success) {
                        alert('Score deleted successfully!');
                        muatLeaderboard(); // Refresh tabel
                    } else {
                        alert('Failed to delete score.');
                    }
                } catch (error) {
                    console.error('Error:', error);
                    alert('An error occurred while deleting the score.');
                }
            }
        }
    });

    muatLeaderboard();
});