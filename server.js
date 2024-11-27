const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const stressTestUI = require('./stressTest'); // Mengimpor pengujian stres

// Inisialisasi Express.js
const app = express();
const port = process.env.PORT; // Port yang digunakan

// Set up view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware untuk parsing form
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Menampilkan halaman utama dengan form
app.get('/', (req, res) => {
    // Kirimkan 'result' dengan nilai kosong saat pertama kali load
    res.render('index', { result: '' });
});

// Menangani pengujian stres ketika tombol di-submit
app.post('/start-test', async (req, res) => {
    const url = req.body.url;
    const duration = parseInt(req.body.duration) || 10;
    const users = parseInt(req.body.users) || 1;
    const inputElement = req.body.inputElement; // Elemen kolom
    const inputValue = req.body.inputValue; // Value yang diinput
    const buttonElement = req.body.buttonElement; // Tombol yang digunakan

    if (!url) {
        return res.render('index', { result: { success: false, message: 'URL tidak valid.' } });
    }

    try {
        // Memulai pengujian stres dan menunggu hasil
        const result = await stressTestUI(url, duration, users, inputElement, inputValue, buttonElement);

        // Log hasil untuk debugging
        console.log('Hasil Pengujian:', result);

        // Pastikan mengirimkan hasil pengujian (result) ke halaman
        res.render('index', { result: result });
    } catch (error) {
        res.render('index', { result: { success: false, message: `Terjadi kesalahan: ${error.message}` } });
    }
});

// Mulai server
app.listen(port, () => {
    console.log(`Server berjalan di http://localhost:${port}`);
});
