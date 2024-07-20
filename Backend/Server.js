const express = require('express');
const cors = require('cors');
const { connectToDatabase } = require('./DB');
const sql = require('mssql');

const app = express();
app.use(express.json());
app.use(cors());

// Kayıt Endpointi
app.post('/api/register', async (req, res) => {
    const { KullaniciAd, Email, Sifre } = req.body;
    try {
        const pool = await connectToDatabase();
        await pool.request()
            .input('KullaniciAd', sql.NVarChar, KullaniciAd)
            .input('Email', sql.NVarChar, Email)
            .input('Sifre', sql.NVarChar, Sifre)
            .query('INSERT INTO Kullanicilar (KullaniciAd, Email, Sifre) VALUES (@KullaniciAd, @Email, @Sifre)');
        res.status(201).send('Kullanıcı başarıyla kaydedildi');
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Giriş Endpointi
app.post('/api/login', async (req, res) => {
    const { KullaniciAd, Sifre } = req.body;
    try {
        const pool = await connectToDatabase();
        const result = await pool.request()
            .input('KullaniciAd', sql.NVarChar, KullaniciAd)
            .input('Sifre', sql.NVarChar, Sifre)
            .query('SELECT * FROM Kullanicilar WHERE KullaniciAd = @KullaniciAd AND Sifre = @Sifre');

        if (result.recordset.length > 0) {
            res.status(200).json({ message: 'Giriş başarılı', kullanici: result.recordset[0] });
        } else {
            res.status(401).json({ message: 'Kullanıcı adı veya şifre yanlış' });
        }
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Yazı Endpointi
app.post('/api/posts', async (req, res) => {
    const { KullaniciId, KonuId, Baslik, Icerik, TarihPost } = req.body;

    if (!KullaniciId || !KonuId || !Baslik || !Icerik || !TarihPost) {
        return res.status(400).json({ message: 'Eksik alanlar. Lütfen tüm alanları doldurun.' });
    }

    try {
        const pool = await connectToDatabase();

        await pool.request()
            .input('KullaniciId', sql.Int, KullaniciId)
            .input('KonuId', sql.Int, KonuId)
            .input('Baslik', sql.NVarChar, Baslik)
            .input('Icerik', sql.NText, Icerik)
            .input('TarihPost', sql.DateTime, TarihPost)
            .query('INSERT INTO Yazilar (KullaniciId, KonuId, Baslik, Icerik, TarihPost) VALUES (@KullaniciId, @KonuId, @Baslik, @Icerik, @TarihPost)');

        res.status(201).json({ message: 'Gönderi başarıyla eklendi.' });
    } catch (err) {
        res.status(500).json({ message: 'Sunucu hatası: ' + err.message });
    }
});

// Tüm Yazılar
app.get('/api/posts', async (req, res) => {
    try {
        const pool = await connectToDatabase();

        const result = await pool.request()
            .query('SELECT * FROM Yazilar');

        if (result.recordset.length > 0) {
            res.status(200).json(result.recordset);
        } else {
            res.status(404).json({ message: 'Gönderi bulunamadı.' });
        }
    } catch (err) {
        res.status(500).json({ message: 'Sunucu hatası: ' + err.message });
    }
});

// Yazı Güncelle
app.put('/api/posts/:id', async (req, res) => {
    const { id } = req.params;
    const { KullaniciId, KonuId, Baslik, Icerik, TarihPost } = req.body;

    if (!id || !KullaniciId || !KonuId || !Baslik || !Icerik || !TarihPost) {
        return res.status(400).json({ message: 'Eksik alanlar. Lütfen tüm alanları doldurun.' });
    }

    try {
        const pool = await connectToDatabase();

        const result = await pool.request()
            .input('Id', sql.Int, id)
            .input('KullaniciId', sql.Int, KullaniciId)
            .input('KonuId', sql.Int, KonuId)
            .input('Baslik', sql.NVarChar, Baslik)
            .input('Icerik', sql.NText, Icerik)
            .input('TarihPost', sql.DateTime, TarihPost)
            .query(`
                UPDATE Yazilar
                SET KullaniciId = @KullaniciId,
                    KonuId = @KonuId,
                    Baslik = @Baslik,
                    Icerik = @Icerik,
                    TarihPost = @TarihPost
                WHERE YaziId = @Id
            `);

        if (result.rowsAffected[0] > 0) {
            res.status(200).json({ message: 'Gönderi başarıyla güncellendi.' });
        } else {
            res.status(404).json({ message: 'Gönderi bulunamadı.' });
        }
    } catch (err) {
        res.status(500).json({ message: 'Sunucu hatası: ' + err.message });
    }
});

// Yazı Sil
app.delete('/api/posts/:id', async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ message: 'ID alanı gereklidir.' });
    }

    try {
        const pool = await connectToDatabase();

        const result = await pool.request()
            .input('Id', sql.Int, id)
            .query('DELETE FROM Yazilar WHERE YaziId = @Id');

        if (result.rowsAffected[0] > 0) {
            res.status(200).json({ message: 'Gönderi başarıyla silindi.' });
        } else {
            res.status(404).json({ message: 'Gönderi bulunamadı.' });
        }
    } catch (err) {
        res.status(500).json({ message: 'Sunucu hatası: ' + err.message });
    }
});

// Yorum Ekle
app.post('/api/yorumlar', async (req, res) => {
    const { KullaniciId, YaziId, Yorum } = req.body;
    try {
        const pool = await connectToDatabase();
        await pool.request()
            .input('KullaniciId', sql.Int, KullaniciId)
            .input('YaziId', sql.Int, YaziId)
            .input('Yorum', sql.NVarChar, Yorum)
            .query('INSERT INTO Yorum (KullaniciId, YaziId, Yorum) VALUES (@KullaniciId, @YaziId, @Yorum)');
        res.status(201).send('Yorum başarıyla eklendi');
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Yorumları Getir
app.get('/api/yorumlar/yazi/:YaziId', async (req, res) => {
    const { YaziId } = req.params;
    try {
        const pool = await connectToDatabase();
        const result = await pool.request()
            .input('YaziId', sql.Int, YaziId)
            .query('SELECT * FROM Yorum WHERE YaziId = @YaziId');
        res.status(200).json(result.recordset);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Yorum Sil
app.delete('/api/yorumlar/:YorumId', async (req, res) => {
    const { YorumId } = req.params;
    try {
        const pool = await connectToDatabase();
        const result = await pool.request()
            .input('YorumId', sql.Int, YorumId)
            .query('DELETE FROM Yorum WHERE YorumId = @YorumId');
        if (result.rowsAffected[0] > 0) {
            res.status(200).send('Yorum başarıyla silindi');
        } else {
            res.status(404).send('Yorum bulunamadı');
        }
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Sunucuyu Başlat
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Sunucu ${port} portunda çalışıyor...`);
});
