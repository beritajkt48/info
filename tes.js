const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const port = 3000;

// Variabel untuk menyimpan satu-satunya IP yang diperbolehkan
let activeIP = null;

// Middleware untuk membatasi akses ke 1 IP
app.use((req, res, next) => {
    const userIP = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

    // Jika belum ada IP yang terdaftar, simpan yang pertama masuk
    if (!activeIP) {
        activeIP = userIP;
        console.log(`IP ${userIP} sekarang memiliki akses.`);
    }

    // Jika IP berbeda, tolak akses
    if (userIP !== activeIP) {
        return res.send("<h1>Silahkan keluar dari perangkat lainnya.</h1>");
    }

    next();
});

// Halaman utama dengan video player
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// Streaming video (gunakan file video lokal)
app.get("/video", (req, res) => {
    const videoPath = path.join(__dirname, "video.mp4"); // Ganti dengan path video
    const stat = fs.statSync(videoPath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunksize = end - start + 1;
        const file = fs.createReadStream(videoPath, { start, end });

        res.writeHead(206, {
            "Content-Range": `bytes ${start}-${end}/${fileSize}`,
            "Accept-Ranges": "bytes",
            "Content-Length": chunksize,
            "Content-Type": "video/mp4",
        });

        file.pipe(res);
    } else {
        res.writeHead(200, {
            "Content-Length": fileSize,
            "Content-Type": "video/mp4",
        });
        fs.createReadStream(videoPath).pipe(res);
    }
});

// Jalankan server
app.listen(port, () => {
    console.log(`Server berjalan di http://localhost:${port}`);
});
