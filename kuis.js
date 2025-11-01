document.addEventListener('DOMContentLoaded', () => {
    // Elemen DOM
    const views = document.querySelectorAll('.view');
    const btnMulai = document.getElementById('btn-mulai');
    const btnPilihBahasa = document.querySelectorAll('.btn-card[data-bahasa]');
    const daftarKategoriContainer = document.getElementById('daftar-kategori');
    const loadingSpinner = document.getElementById('loading-spinner');
    
    // Elemen Kuis
    const judulKuis = document.getElementById('judul-kuis');
    const indikatorSoal = document.getElementById('indikator-soal');
    const teksSoal = document.getElementById('teks-soal');
    const penjelasanEl = document.getElementById('penjelasan');
    const pilihanJawabanContainer = document.getElementById('pilihan-jawaban');
    const gambarSoalEl = document.getElementById('gambar-soal');
    const timerEl = document.getElementById('timer');
    const timerBarInner = document.getElementById('timer-bar-inner');
    
    // Elemen Skor
    const btnUlangi = document.getElementById('btn-ulangi');
    const btnKeBeranda = document.getElementById('btn-ke-beranda');
    const nilaiSkorEl = document.getElementById('nilai-skor');
    const feedbackTextEl = document.getElementById('feedback-text');
    const namaPemainEl = document.getElementById('nama-pemain');
    const btnSimpanSkor = document.getElementById('btn-simpan-skor');

    // State Game
    let soalAktif = [];
    let indexSoal = 0;
    let skor = 0;
    let bahasaSekarang = '';
    let kategoriSekarang = '';
    let idKategoriSekarang = '';
    let timerInterval;
    let waktuTersisa;

    // --- MANAJER SUARA ---
    class SoundManager {
        constructor() {
            this.sounds = {
                click: new Audio('./assets/sounds/click.mp3'),
                correct: new Audio('./assets/sounds/correct.mp3'),
                incorrect: new Audio('./assets/sounds/incorrect.mp3'),
                timer: new Audio('./assets/sounds/timer.mp3'),
                start: new Audio('./assets/sounds/start.mp3'),
            };
            Object.values(this.sounds).forEach(sound => sound.volume = 0.3);
        }
        play(soundName) {
            if (this.sounds[soundName]) {
                this.sounds[soundName].currentTime = 0;
                this.sounds[soundName].play().catch(e => console.log("Audio play failed:", e));
            }
        }
    }
    const soundManager = new SoundManager();

    // --- FUNGSI UTAMA ---
    const tampilkanView = (viewId) => {
        views.forEach(view => view.classList.remove('active'));
        const targetView = document.getElementById(`view-${viewId}`);
        if (targetView) {
            targetView.classList.add('active');
        } else {
            console.error(`View dengan ID 'view-${viewId}' tidak ditemukan!`);
        }
    };

    const muatDaftarKategori = async () => {
        document.querySelector('.view.active').classList.remove('active');
        loadingSpinner.classList.remove('hidden');
        try {
            const response = await fetch('./api/crud_api.php?aksi=get_kategori');
            const kategori = await response.json();
            renderKategori(kategori);
            loadingSpinner.classList.add('hidden');
            tampilkanView('pemilihan-kategori');
        } catch (error) {
            console.error(error);
            alert('Failed to load categories.');
            loadingSpinner.classList.add('hidden');
            tampilkanView('beranda');
        }
    };

    const renderKategori = (data) => {
        daftarKategoriContainer.innerHTML = '';
        if (data.length === 0) { daftarKategoriContainer.innerHTML = '<p>No categories available.</p>'; return; }
        data.forEach(item => {
            const button = document.createElement('button');
            button.className = 'btn-card';
            button.textContent = item.nama_kategori;
            button.dataset.idKategori = item.id_kategori;
            button.addEventListener('click', () => {
                if (button.disabled) return;
                button.disabled = true;
                const originalText = button.textContent;
                button.textContent = 'Loading...';

                kategoriSekarang = item.nama_kategori;
                idKategoriSekarang = item.id_kategori;
                soundManager.play('click');
                
                tampilkanCountdown(() => {
                    button.disabled = false;
                    button.textContent = originalText;
                    mulaiKuis(bahasaSekarang, idKategoriSekarang);
                });
            });
            daftarKategoriContainer.appendChild(button);
        });
    };

    // FUNGSI YANG DIPERBAIKI SECARA FINAL
    const tampilkanCountdown = (callback) => {
        const countdownEl = document.querySelector('.countdown-number');
        const countdownView = document.getElementById('view-countdown');

        // PERBAIKAN FINAL: Langkah 1 - Pastikan elemen dalam keadaan "bersih" dan tersembunyi
        console.log("Countdown Step 1: Resetting element state.");
        countdownView.style.opacity = '1';     // Reset opacity
        countdownView.style.transition = 'opacity 0.5s ease-out'; // Reset transisi
        countdownEl.textContent = '3';         // Reset teks

        // PERBAIKAN FINAL: Langkah 2 - Tampilkan view setelah elemen siap
        console.log("Countdown Step 2: Showing view.");
        tampilkanView('countdown');

        // PERBAIKAN FINAL: Langkah 3 - Mulai logika countdown
        console.log("Countdown Step 3: Starting countdown logic.");
        let count = 3;
        const interval = setInterval(() => {
            count--;
            if (count > 0) {
                countdownEl.textContent = count;
            } else {
                clearInterval(interval);
                countdownEl.textContent = 'GO!';
                countdownView.style.opacity = '0';
                
                setTimeout(() => {
                    // Hapus style inline setelah semuanya selesai
                    countdownView.removeAttribute('style');
                    callback();
                }, 500);
            }
        }, 1000);
    };

    const mulaiKuis = async (bahasaKode, idKategori) => {
        soundManager.play('start');
        const bahasaMap = { 'en': 1, 'id': 2, 'sd': 3 };
        const idBahasa = bahasaMap[bahasaKode];

        document.querySelector('.view.active').classList.remove('active');
        loadingSpinner.classList.remove('hidden');

        try {
            const response = await fetch(`./api/kuis_api.php?id_bahasa=${idBahasa}&id_kategori=${idKategori}`);
            if (!response.ok) throw new Error('Gagal mengambil soal');
            
            soalAktif = await response.json();
            if (soalAktif.length === 0) {
                alert('No questions available for this category yet.');
                loadingSpinner.classList.add('hidden');
                tampilkanView('pemilihan-kategori');
                return;
            }

            indexSoal = 0; skor = 0;
            judulKuis.textContent = `${kategoriSekarang} Quiz`;
            loadingSpinner.classList.add('hidden');
            tampilkanSoal();
            tampilkanView('kuis');
        } catch (error) {
            console.error(error);
            alert('An error occurred. Please try again.');
            loadingSpinner.classList.add('hidden');
            tampilkanView('beranda');
        }
    };

    const mulaiTimer = (waktu) => {
        waktuTersisa = waktu;
        timerEl.textContent = waktuTersisa;
        timerBarInner.style.width = '100%';
        
        clearInterval(timerInterval);
        timerInterval = setInterval(() => {
            waktuTersisa--;
            timerEl.textContent = waktuTersisa;
            timerBarInner.style.width = `${(waktuTersisa / waktu) * 100}%`;
            
            if (waktuTersisa <= 5) soundManager.play('timer');
            
            if (waktuTersisa <= 0) {
                clearInterval(timerInterval);
                cekJawaban(null);
            }
        }, 1000);
    };

    const tampilkanSoal = () => {
        if (indexSoal >= soalAktif.length) { tampilkanSkorAkhir(); return; }
        const soal = soalAktif[indexSoal];
        if (!soal) { console.error("Data soal tidak ditemukan!"); return; }

        indikatorSoal.textContent = `Question ${indexSoal + 1}/${soalAktif.length}`;
        teksSoal.textContent = soal.teks_pertanyaan;
        penjelasanEl.textContent = soal.penjelasan;
        penjelasanEl.style.display = 'none';

        if (soal.gambar) { gambarSoalEl.src = `./${soal.gambar}`; gambarSoalEl.style.display = 'block'; }
        else { gambarSoalEl.style.display = 'none'; }

        pilihanJawabanContainer.innerHTML = '';
        soal.pilihan.forEach(pilihan => {
            const button = document.createElement('button');
            button.textContent = pilihan.teks_pilihan;
            button.addEventListener('click', () => cekJawaban(pilihan, button));
            pilihanJawabanContainer.appendChild(button);
        });
        
        mulaiTimer(soal.waktu);
    };

    const cekJawaban = (pilihanDipilih, buttonElement) => {
        clearInterval(timerInterval);
        const semuaTombol = pilihanJawabanContainer.querySelectorAll('button');
        semuaTombol.forEach(btn => btn.classList.add('disabled'));

        let isCorrect = false;
        if (pilihanDipilih) {
            if (pilihanDipilih.adalah_benar) {
                buttonElement.classList.add('correct');
                soundManager.play('correct');
                isCorrect = true;
                const bonusWaktu = Math.floor(waktuTersisa / soalAktif[indexSoal].waktu) * 5;
                skor += soalAktif[indexSoal].poin + bonusWaktu;
            } else {
                buttonElement.classList.add('incorrect');
                soundManager.play('incorrect');
                semuaTombol.forEach(btn => {
                    if (btn.textContent === soalAktif[indexSoal].pilihan.find(p => p.adalah_benar).teks_pilihan) {
                        btn.classList.add('correct');
                    }
                });
            }
        } else {
            soundManager.play('incorrect');
            semuaTombol.forEach(btn => {
                if (btn.textContent === soalAktif[indexSoal].pilihan.find(p => p.adalah_benar).teks_pilihan) {
                    btn.classList.add('correct');
                }
            });
        }
        
        logJawaban(soalAktif[indexSoal].id_soal, isCorrect);

        penjelasanEl.style.display = 'block';
        indexSoal++;
        setTimeout(tampilkanSoal, 3000);
    };

    const tampilkanSkorAkhir = () => {
        nilaiSkorEl.textContent = skor;
        let feedback = '';
        if (skor >= soalAktif.length * soalAktif[0].poin * 0.8) feedback = "Outstanding!";
        else if (skor >= soalAktif.length * soalAktif[0].poin * 0.6) feedback = "Great job!";
        else if (skor >= soalAktif.length * soalAktif[0].poin * 0.4) feedback = "Good effort!";
        else feedback = "Keep practicing!";
        feedbackTextEl.textContent = feedback;
        tampilkanView('skor');
    };

    const logJawaban = async (idSoal, isCorrect) => {
    try {
        // PERBAIKAN: Gunakan path absolut /proyek-kuis-bahasa/api/...
        await fetch('/proyek-kuis-bahasa/api/crud_api.php?aksi=log_jawaban', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `id_soal=${idSoal}&jawaban_benar=${isCorrect ? 1 : 0}`
        });
    } catch (e) { 
        console.error("Gagal log jawaban:", e); 
    }
};

    // --- EVENT LISTENERS ---
    btnMulai.addEventListener('click', () => { soundManager.play('click'); tampilkanView('pemilihan-bahasa'); });
    
    btnPilihBahasa.forEach(btn => {
        btn.addEventListener('click', () => {
            bahasaSekarang = btn.dataset.bahasa;
            soundManager.play('click');
            muatDaftarKategori();
        });
    });

    btnUlangi.addEventListener('click', () => mulaiKuis(bahasaSekarang, idKategoriSekarang));
    btnKeBeranda.addEventListener('click', () => tampilkanView('beranda'));

    btnSimpanSkor.addEventListener('click', async () => {
        const nama = namaPemainEl.value.trim();
        if (!nama) { alert('Please enter your name.'); return; }
        
        const bahasaMap = { 'en': 1, 'id': 2, 'sd': 3 };
        const idBahasa = bahasaMap[bahasaSekarang];

        try {
            const response = await fetch('../api/crud_api.php?aksi=simpan_skor', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: `nama_pemain=${encodeURIComponent(nama)}&skor_akhir=${skor}&id_bahasa=${idBahasa}&id_kategori=${idKategoriSekarang}`
            });
            const result = await response.json();
            if (result.success) {
                alert('Score saved!');
                btnSimpanSkor.disabled = true;
                btnSimpanSkor.textContent = 'Saved';
            }
        } catch (error) { console.error('Gagal menyimpan skor:', error); alert('Failed to save score.'); }
    });
});