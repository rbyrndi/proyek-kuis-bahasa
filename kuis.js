document.addEventListener('DOMContentLoaded', () => {
    // Elemen DOM
    const views = document.querySelectorAll('.view');
    const btnMulai = document.getElementById('btn-mulai');
    const btnPilihBahasa = document.querySelectorAll('.btn-card[data-bahasa]');
    const daftarKategoriContainer = document.getElementById('daftar-kategori');
    const loadingSpinner = document.getElementById('loading-spinner');
    // const judulPilihKategori = document.getElementById('judul-pilih-kategori'); // DIHAPUS

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
    // const judulSkor = document.querySelector('#view-skor h1'); // DIHAPUS
    // const labelSkorAnda = document.querySelector('#view-skor .skor-akhir p'); // DIHAPUS

    // Elemen Navigasi Baru
    const btnQuizHome = document.getElementById('btn-quiz-home');
    const btnQuizRestart = document.getElementById('btn-quiz-restart');

    // State Game
    let soalAktif = [];
    let indexSoal = 0;
    let skor = 0;
    let bahasaSekarang = '';
    let kategoriSekarang = '';
    let idKategoriSekarang = '';
    let timerInterval;
    let waktuTersisa;

    // const terjemahan = { ... }; // BLOK TERJEMAHAN DIHAPUS

    // const aturBahasa = (lang) => { ... }; // FUNGSI aturBahasa DIHAPUS

    class SoundManager {
        constructor() {
            this.sounds = {
                click: new Audio('./assets/sounds/click.mp3'),
                correct: new Audio('./assets/sounds/correct.mp3'),
                incorrect: new Audio('./assets/sounds/incorrect.mp3'),
                timer: new Audio('./assets/sounds/timer.mp3'),
                start: new Audio('./assets/sounds/start.mp3'),
                backgroundMusic: new Audio('./assets/sounds/background.mp3')
            };
            Object.values(this.sounds).forEach(sound => sound.volume = 0.3);

            // PERBAIKAN: Menggunakan this.sounds.backgroundMusic
            this.sounds.backgroundMusic.volume = 0.1;
            this.sounds.backgroundMusic.loop = true;
            this.currentLoop = null;
        }
        play(soundName) {
            if (this.sounds[soundName]) {
                this.sounds[soundName].currentTime = 0;
                this.sounds[soundName].play().catch(e => console.log("Audio play failed:", e));
            }
        }
        startLoop(soundName) {
            this.stopLoop();
            this.currentLoop = this.sounds[soundName];
            this.currentLoop.loop = true;
            this.currentLoop.play().catch(e => console.log("Audio loop failed:", e));
        }
        stopLoop() {
            if (this.currentLoop) {
                this.currentLoop.loop = false;
                this.currentLoop.pause();
                this.currentLoop.currentTime = 0;
            }
        }
        // Metode baru untuk mengatur volume background music
        setBackgroundMusicVolume(volume) {
            // PERBAIKAN: Menggunakan this.sounds.backgroundMusic
            this.sounds.backgroundMusic.volume = volume;
        }
        // Metode baru untuk memulai background music
        playBackgroundMusic() {
            // PERBAIKAN: Menggunakan this.sounds.backgroundMusic
            this.sounds.backgroundMusic.play().catch(e => console.log("Background music play failed:", e));
        }
        // Metode baru untuk menghentikan background music
        stopBackgroundMusic() {
            // PERBAIKAN: Menggunakan this.sounds.backgroundMusic
            this.sounds.backgroundMusic.pause();
            this.sounds.backgroundMusic.currentTime = 0;
        }
    }
    const soundManager = new SoundManager();

    // --- MANAJER TOAST NOTIFICATION ---
    class ToastManager {
        constructor() {
            this.container = document.createElement('div');
            this.container.className = 'toast-container';
            document.body.appendChild(this.container);
        }
        show(message, type = 'info', duration = 3000) {
            const toast = document.createElement('div');
            toast.className = `toast ${type}`;
            toast.textContent = message;
            this.container.appendChild(toast);
            toast.offsetHeight; // Trigger reflow
            toast.classList.add('show');
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => {
                    this.container.removeChild(toast);
                }, 300);
            }, duration);
        }
    }
    const toastManager = new ToastManager();

    // --- MANAJER CONFETTI ---
    class ConfettiManager {
        constructor() {
            this.canvas = document.createElement('canvas');
            this.canvas.id = 'confetti-canvas';
            document.body.appendChild(this.canvas);
            this.ctx = this.canvas.getContext('2d');
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            this.particles = [];
            this.animationId = null;
        }
        createParticles() {
            const colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722'];
            for (let i = 0; i < 150; i++) {
                this.particles.push({
                    x: Math.random() * this.canvas.width,
                    y: Math.random() * this.canvas.height - this.canvas.height,
                    w: Math.random() * 10 + 5,
                    h: Math.random() * 5 + 3,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    speed: Math.random() * 3 + 2,
                    opacity: Math.random() + 0.5,
                    angle: Math.random() * 360 * Math.PI / 180
                });
            }
        }
        update() {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.particles.forEach((p, index) => {
                p.y += p.speed;
                p.x += Math.cos(p.angle) * 2;
                p.opacity -= 0.005;
                this.ctx.save();
                this.ctx.globalAlpha = p.opacity;
                this.ctx.fillStyle = p.color;
                this.ctx.fillRect(p.x, p.y, p.w, p.h);
                this.ctx.restore();
                if (p.opacity <= 0) {
                    this.particles.splice(index, 1);
                }
            });
            if (this.particles.length > 0) {
                this.animationId = requestAnimationFrame(() => this.update());
            } else {
                this.stop();
            }
        }
        start() {
            this.stop();
            this.createParticles();
            this.update();
        }
        stop() {
            if (this.animationId) {
                cancelAnimationFrame(this.animationId);
                this.animationId = null;
            }
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }
    const confettiManager = new ConfettiManager();

    // --- FUNGSI UTAMA ---
    const tampilkanView = (viewId) => {
        // PERBAIKAN: Hentikan loop HANYA JIKA BUKAN pindah ke view kuis
        // Karena view 'kuis' punya loop 'start' sendiri
        if (viewId !== 'kuis') {
            soundManager.stopLoop();
        }

        views.forEach(view => view.classList.remove('active'));
        const targetView = document.getElementById(`view-${viewId}`);
        if (targetView) {
            targetView.classList.add('active');

            // Atur musik berdasarkan view yang aktif
            if (viewId === 'beranda' || viewId === 'pemilihan-bahasa' || viewId === 'pemilihan-kategori') {
                soundManager.playBackgroundMusic();
            } else {
                soundManager.stopBackgroundMusic();
            }
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
            toastManager.show('Failed to load categories.', 'error');
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

    const tampilkanCountdown = (callback) => {
        const countdownEl = document.querySelector('.countdown-number');
        const countdownView = document.getElementById('view-countdown');

        countdownView.style.opacity = '1';
        countdownView.style.transition = 'opacity 0.5s ease-out';
        countdownEl.textContent = '3';
        countdownView.offsetHeight; // Reflow trick

        tampilkanView('countdown');

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
                    countdownView.removeAttribute('style');
                    callback();
                }, 500);
            }
        }, 1000);
    };

    const mulaiKuis = async (bahasaKode, idKategori) => {
        soundManager.startLoop('start');
        const bahasaMap = { 'en': 1, 'id': 2, 'sd': 3 };
        const idBahasa = bahasaMap[bahasaKode];

        document.querySelector('.view.active').classList.remove('active');
        loadingSpinner.classList.remove('hidden');

        try {
            const response = await fetch(`/proyek-kuis-bahasa/api/kuis_api.php?id_bahasa=${idBahasa}&id_kategori=${idKategori}`);
            if (!response.ok) throw new Error('Gagal mengambil soal');

            soalAktif = await response.json();
            if (soalAktif.length === 0) {
                toastManager.show('No questions available for this category yet.', 'error');
                loadingSpinner.classList.add('hidden');
                tampilkanView('pemilihan-kategori');
                return;
            }

            indexSoal = 0; skor = 0;
            // DIKEMBALIKAN KE HARDCODED (Bahasa Inggris)
            judulKuis.textContent = `${kategoriSekarang} Quiz`;
            loadingSpinner.classList.add('hidden');
            tampilkanSoal();
            tampilkanView('kuis');
        } catch (error) {
            console.error(error);
            toastManager.show('An error occurred. Please try again.', 'error');
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

        // DIKEMBALIKAN KE HARDCODED (Bahasa Inggris)
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
        soundManager.stopLoop();
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
        soundManager.stopLoop(); // HENTIKAN LOOP SAAT SELESAI
        nilaiSkorEl.textContent = skor;

        // Reset tombol simpan skor
        // DIKEMBALIKAN KE HARDCODED (Bahasa Inggris)
        btnSimpanSkor.disabled = false;
        btnSimpanSkor.textContent = 'Save Score';

        let feedback = '';
        const maxPossibleScore = soalAktif.length * soalAktif[0].poin * 1.5;

        // DIKEMBALIKAN KE HARDCODED (Bahasa Inggris)
        if (skor >= maxPossibleScore * 0.9) feedback = "Outstanding! Perfect Score!";
        else if (skor >= maxPossibleScore * 0.7) feedback = "Excellent!";
        else if (skor >= maxPossibleScore * 0.5) feedback = "Great job!";
        else feedback = "Keep practicing!";

        feedbackTextEl.textContent = feedback;
        tampilkanView('skor');

        if (skor >= maxPossibleScore * 0.8) {
            confettiManager.start();
        }
    };

    const logJawaban = async (idSoal, isCorrect) => {
        try {
            await fetch('/proyek-kuis-bahasa/api/crud_api.php?aksi=log_jawaban', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: `id_soal=${idSoal}&jawaban_benar=${isCorrect ? 1 : 0}`
            });
        } catch (e) { console.error("Gagal log jawaban:", e); }
    };

    // --- EVENT LISTENERS ---
    btnMulai.addEventListener('click', () => { soundManager.play('click'); tampilkanView('pemilihan-bahasa'); });

    btnPilihBahasa.forEach(btn => {
        btn.addEventListener('click', () => {
            bahasaSekarang = btn.dataset.bahasa;
            soundManager.play('click');
            // aturBahasa(bahasaSekarang); // DIHAPUS

            muatDaftarKategori();
        });
    });

    // EVENT LISTENER UNTUK NAVIGASI BARU
    btnQuizHome.addEventListener('click', () => {
        soundManager.stopLoop();
        clearInterval(timerInterval); // PERBAIKAN: Hentikan timer kuis!
        tampilkanView('beranda');
    });

    btnQuizRestart.addEventListener('click', () => {
        soundManager.stopLoop();
        mulaiKuis(bahasaSekarang, idKategoriSekarang);
    });

    btnUlangi.addEventListener('click', () => mulaiKuis(bahasaSekarang, idKategoriSekarang));
    btnKeBeranda.addEventListener('click', () => tampilkanView('beranda'));

    btnSimpanSkor.addEventListener('click', async () => {
        const nama = namaPemainEl.value.trim();
        if (!nama) { toastManager.show('Please enter your name.', 'error'); return; }

        const bahasaMap = { 'en': 1, 'id': 2, 'sd': 3 };
        const idBahasa = bahasaMap[bahasaSekarang];

        try {
            const response = await fetch('/proyek-kuis-bahasa/api/crud_api.php?aksi=simpan_skor', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: `nama_pemain=${encodeURIComponent(nama)}&skor_akhir=${skor}&id_bahasa=${idBahasa}&id_kategori=${idKategoriSekarang}`
            });
            const result = await response.json();
            if (result.success) {
                toastManager.show('Score saved successfully!', 'success');
                btnSimpanSkor.disabled = true;
                // DIKEMBALIKAN KE HARDCODED (Bahasa Inggris)
                btnSimpanSkor.textContent = 'Saved';
            }
        } catch (error) { console.error('Gagal menyimpan skor:', error); toastManager.show('Failed to save score.', 'error'); }});
});