document.addEventListener('DOMContentLoaded', () => {
    // Elemen DOM
    const formSoal = document.getElementById('form-soal');
    const tbodySoal = document.getElementById('tbody-soal');
    const btnBatal = document.getElementById('btn-batal');
    const btnPreview = document.getElementById('btn-preview');
    const idSoalInput = document.getElementById('id-soal');

    // Dropdown Formulir
    const bahasaSelect = document.getElementById('bahasa');
    const kategoriSelect = document.getElementById('kategori');

    // BARU: Dropdown Filter
    const filterBahasa = document.getElementById('filter-bahasa');
    const filterKategori = document.getElementById('filter-kategori');

    // Gambar
    const gambarInput = document.getElementById('gambar');
    const previewGambarLama = document.getElementById('preview-gambar-lama');
    const gambarLamaInput = document.getElementById('gambar-lama');

    // Elemen Modal Preview
    const previewModal = document.getElementById('preview-modal');
    const closeBtn = document.querySelector('.close-btn');

    // --- FUNGSI UTAMA ---

    // MODIFIKASI: Fungsi ini sekarang mengisi dropdown formulir DAN filter
    const muatDropdown = async () => {
        try {
            // --- Muat Bahasa ---
            const resBahasa = await fetch('../api/crud_api.php?aksi=get_bahasa');
            const bahasa = await resBahasa.json();
            
            // Kosongkan kedua select
            bahasaSelect.innerHTML = '<option value="">Select a language</option>';
            filterBahasa.innerHTML = '<option value="">Show All Languages</option>'; // BARU

            bahasa.forEach(item => {
                // Opsi untuk Form
                const optionForm = document.createElement('option');
                optionForm.value = item.id_bahasa;
                optionForm.textContent = item.nama_bahasa;
                bahasaSelect.appendChild(optionForm);

                // BARU: Opsi untuk Filter
                const optionFilter = document.createElement('option');
                optionFilter.value = item.id_bahasa;
                optionFilter.textContent = item.nama_bahasa;
                filterBahasa.appendChild(optionFilter);
            });

            // --- Muat Kategori ---
            const resKategori = await fetch('../api/crud_api.php?aksi=get_kategori');
            const kategori = await resKategori.json();

            // Kosongkan kedua select
            kategoriSelect.innerHTML = '<option value="">Select a category</option>';
            filterKategori.innerHTML = '<option value="">Show All Categories</option>'; // BARU

            kategori.forEach(item => {
                // Opsi untuk Form
                const optionForm = document.createElement('option');
                optionForm.value = item.id_kategori;
                optionForm.textContent = item.nama_kategori;
                kategoriSelect.appendChild(optionForm);

                // BARU: Opsi untuk Filter
                const optionFilter = document.createElement('option');
                optionFilter.value = item.id_kategori;
                optionFilter.textContent = item.nama_kategori;
                filterKategori.appendChild(optionFilter);
            });
        } catch (error) {
            console.error('Error loading dropdown data:', error);
        }
    };

    // MODIFIKASI: Fungsi ini sekarang membaca nilai filter sebelum memuat
    async function muatDaftarSoal() {
        const id_bahasa = filterBahasa.value || '';
        const id_kategori = filterKategori.value || '';

        try {
            // MODIFIKASI: Kirim parameter filter ke API
            const response = await fetch(`../api/crud_api.php?aksi=baca_semua&id_bahasa=${id_bahasa}&id_kategori=${id_kategori}`);
            const soal = await response.json();
            renderTabel(soal);
        } catch (error) {
            console.error('Error loading questions:', error);
            tbodySoal.innerHTML = '<tr><td colspan="7">Gagal memuat data.</td></tr>';
        }
    }

    // (Fungsi renderTabel, editSoal, hapusSoal tetap sama... tidak perlu diubah)
    // Fungsi untuk merender tabel soal
    function renderTabel(data) {
        tbodySoal.innerHTML = '';
        if (data.length === 0) {
            // Update colspan menjadi 7
            tbodySoal.innerHTML = '<tr><td colspan="7">Belum ada soal.</td></tr>';
            return;
        }
        // MODIFIKASI: Tambahkan 'index' di sini
        data.forEach((item, index) => {
            const tr = document.createElement('tr');

            const gambarCell = item.gambar
                ? `<img src="../${item.gambar}" alt="Image" style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px;">`
                : 'No Image';

            // PERBAIKAN TOTAL PADA BLOK INI
            tr.innerHTML = `
                <td>${index + 1}</td>
                <td>${item.bahasa}</td>
                <td>${item.kategori}</td>
                <td title="${item.teks_pertanyaan}">${item.teks_pertanyaan}</td>
                <td>${item.poin}</td>
                <td>${gambarCell}</td>
                <td>
                    <button class="btn-edit" data-id="${item.id_soal}">Edit</button>
                    <button class="btn-hapus" data-id="${item.id_soal}">Delete</button>
                </td>
            `;
            tbodySoal.appendChild(tr);
        });
    }
    async function editSoal(id) {
        try {
            const response = await fetch(`../api/crud_api.php?aksi=baca_satu&id_soal=${id}`);
            const soalDiedit = await response.json();
            if (soalDiedit) {
                idSoalInput.value = soalDiedit.id_soal;
                bahasaSelect.value = soalDiedit.id_bahasa;
                kategoriSelect.value = soalDiedit.id_kategori;
                document.getElementById('pertanyaan').value = soalDiedit.teks_pertanyaan;
                document.getElementById('penjelasan').value = soalDiedit.penjelasan || '';
                document.getElementById('poin').value = soalDiedit.poin || 10;
                document.getElementById('waktu').value = soalDiedit.waktu || 15;
                if (soalDiedit.gambar) {
                    previewGambarLama.src = '../' + soalDiedit.gambar;
                    previewGambarLama.style.display = 'block';
                    gambarLamaInput.value = soalDiedit.gambar;
                } else {
                    previewGambarLama.style.display = 'none';
                    gambarLamaInput.value = '';
                }
                const pilihanInputs = formSoal.querySelectorAll('input[name="pilihan[]"]');
                soalDiedit.pilihan.forEach((p, index) => {
                    if (pilihanInputs[index]) {
                        pilihanInputs[index].value = p.teks_pilihan;
                        if (p.adalah_benar) {
                            document.getElementById(`benar_${index + 1}`).checked = true;
                        }
                    }
                });
                window.scrollTo(0, 0);
            }
        } catch (error) {
            console.error('Error fetching question for edit:', error);
        }
    }
    async function hapusSoal(id) {
        if (confirm('Are you sure you want to delete this question? This action cannot be undone.')) {
            const formData = new FormData();
            formData.append('id_soal', id);
            try {
                const response = await fetch('../api/crud_api.php?aksi=hapus', {
                    method: 'POST',
                    body: formData
                });
                const result = await response.json();
                if (result.success) {
                    alert('Question deleted successfully!');
                    muatDaftarSoal();
                } else {
                    alert('Failed to delete question: ' + result.message);
                }
            } catch (error) {
                console.error('Error:', error);
                alert('An error occurred while deleting the question.');
            }
        }
    }

    // --- EVENT LISTENERS ---

    // Event listener untuk submit form
    formSoal.addEventListener('submit', async (e) => {
        e.preventDefault();
        // ... (Validasi form tetap sama)
        const pilihanInputs = formSoal.querySelectorAll('input[name="pilihan[]"]');
        let semuaPilihanTerisi = true;
        pilihanInputs.forEach(input => {
            if (input.value.trim() === '') {
                semuaPilihanTerisi = false;
            }
        });
        if (!semuaPilihanTerisi) {
            alert('All answer options must be filled!');
            return;
        }
        const formData = new FormData(formSoal);
        const aksi = idSoalInput.value ? 'update' : 'tambah';
        try {
            const response = await fetch(`../api/crud_api.php?aksi=${aksi}`, {
                method: 'POST',
                body: formData
            });
            const result = await response.json();
            if (result.success) {
                alert('Question saved successfully!');
                formSoal.reset();
                resetForm();
                muatDaftarSoal();
            } else {
                alert('Failed to save question: ' + result.message);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while saving the question.');
        }
    });

    // Event listener untuk tombol batal
    btnBatal.addEventListener('click', () => {
        resetForm();
    });

    // Event listener untuk tombol edit dan hapus
    tbodySoal.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-edit')) {
            editSoal(e.target.dataset.id);
        } else if (e.target.classList.contains('btn-hapus')) {
            hapusSoal(e.target.dataset.id);
        }
    });

    // BARU: Event listener untuk filter dropdown
    filterBahasa.addEventListener('change', muatDaftarSoal);
    filterKategori.addEventListener('change', muatDaftarSoal);


    // --- FUNGSI BANTUAN ---
    function resetForm() {
        formSoal.reset();
        idSoalInput.value = '';
        previewGambarLama.style.display = 'none';
        previewGambarLama.src = '';
        gambarLamaInput.value = '';
    }

    // --- EVENT LISTENER UNTUK PREVIEW (BARU) ---
    btnPreview.addEventListener('click', () => {
        const formData = new FormData(formSoal);
        const question = formData.get('teks_pertanyaan');
        const options = formData.getAll('pilihan[]');
        const correctAnswer = formData.get('adalah_benar');

        if (!question || options.some(opt => opt.trim() === '')) {
            alert('Please fill in the question and all options to preview.');
            return;
        }

        document.getElementById('preview-question').textContent = question;
        const previewOptionsContainer = document.getElementById('preview-options');
        previewOptionsContainer.innerHTML = '';
        options.forEach((opt, index) => {
            const div = document.createElement('div');
            div.style.padding = '5px 0';
            div.textContent = `${String.fromCharCode(65 + index)}. ${opt}`;
            if (index + 1 == correctAnswer) {
                div.style.fontWeight = 'bold';
                div.style.color = 'var(--success-color)';
            }
            previewOptionsContainer.appendChild(div);
        });

        previewModal.style.display = 'block';
    });

    // Event listener untuk menutup modal
    closeBtn.addEventListener('click', () => {
        previewModal.style.display = 'none';
    });

    // Event listener untuk menutup modal saat klik di luar
    window.addEventListener('click', (event) => {
        if (event.target == previewModal) {
            previewModal.style.display = 'none';
        }
    });


    // --- INISIALISASI ---
    muatDropdown().then(() => {
        // muatDaftarSoal() akan dipanggil setelah dropdown selesai dimuat
        // dan akan otomatis menggunakan nilai filter default ("Show All")
        muatDaftarSoal();
    });
});