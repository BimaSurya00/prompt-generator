# Template Storyboard Variant B — Prose/Narrative Prompt Style

---

## STRUKTUR OUTPUT

Variant B ditulis sebagai **prose prompt panjang** — bukan form-fill. Seluruh prompt ditulis dalam satu blok naratif yang mengalir, seperti screenplay deskripsi atau film treatment. Tidak ada field terstruktur, tidak ada bullet points untuk metadata.

---

## FORMAT PENULISAN

### Opening Paragraph
- Tentukan: durasi, aspect ratio, visual style
- Sebutkan: setting (kapan, di mana, suasana)
- Sebutkan: karakter utama dan aktivitas mereka
- Tone: deskriptif, sinematik, seperti membaca naskah film

### Scene/Shot Breakdown
- Gunakan format: `SHOT [n] — [timestamp] — [judul singkat]`
- Setiap shot ditulis sebagai paragraf deskriptif
- Sertakan: aksi tangan/karakter, objek yang terlihat, perubahan sudut pandang
- Hard cuts ditulis sebagai: `HARD CUT.`
- Dialog ditulis dalam bahasa aslinya (Jepang, Indonesia, dll) dengan terjemahan jika perlu

### Critical Rules Section
- POV rules (jika POV)
- Camera dan viewpoint specifications
- Continuity lock rules — termasuk instruksi eksplisit first-frame/last-frame match antar shot (elemen apa dari frame terakhir shot sebelumnya yang harus identik di frame pertama shot berikutnya: posisi objek, pose karakter, arah pencahayaan, kondisi wardrobe), supaya AI video generator yang support continue-from-last-frame bisa nyambung mulus antar shot

### Audio Section
- Daftar semua suara yang terdengar
- Tidak ada musik, tidak ada narasi (kecuali dialog)
- Sound harus diegetik (berasal dari dalam adegan)

### Visual Style Section
- Deskripsi gaya visual keseluruhan
- Penekanan pada realism dan detail fotografi
- Lighting dari sumber praktis yang plausible

### Negative Prompt Section
- Daftar hal yang HARUS dihindari AI video generator, spesifik untuk konten iklan ini (bukan boilerplate generik)
- Contoh kategori: distorted anatomy/extra limbs, unwanted text/watermark/logo, morphing objects, unnatural motion artifacts — sesuaikan dengan gerakan dan objek yang benar-benar muncul di storyboard ini

---

## CONTOH FORMAT

```
[Durasi], [aspect ratio], [visual style description].

[Setting: kapan, di mana, suasana]. [Karakter utama] [aktivitas]. [Suasana dan tone].

The film consists of exactly [n] shots connected only by clean, sharp HARD CUTS. No transition effects, dissolves, fade-ins, or fade-outs.

CRITICAL POV RULE FOR EVERY SHOT (jika POV)
[Aturan POV jika konten adalah POV]

CAMERA AND VIEWPOINT FOR THE ENTIRE FILM
[Spesifikasi kamera dan sudut pandang]

CONTINUITY LOCK FOR EVERY SHOT
[Aturan kontinuitas objek, properti, karakter — termasuk first-frame match: elemen apa dari frame terakhir shot sebelumnya yang harus identik di frame pertama shot berikutnya]

SHOT 1 — [timestamp] — [judul]
[Deskripsi paragraf aksi]

HARD CUT.

SHOT 2 — [timestamp] — [judul]
[Deskripsi paragraf aksi, sertakan catatan continuity dari akhir shot 1 jika relevan]

[dst.]

AUDIO
[Daftar suara diegetik]

VISUAL STYLE
[Deskripsi gaya visual]

NEGATIVE PROMPT
[Daftar spesifik hal yang harus dihindari, relevan dengan gerakan/objek di storyboard ini]
```

---

## ATURAN PENULISAN

1. **Tulis SELURUH narasi & deskripsi shot dalam Bahasa Inggris** — format internasional untuk AI video generation, TERLEPAS dari bahasa kerja tool ini. Ini berlaku mutlak untuk Variant B (lihat aturan #5 untuk pengecualian dialog).
2. **Prose, bukan bullet** — setiap shot adalah paragraf deskriptif, bukan list
3. **Timestamp wajib** — setiap shot punya timestamp yang berurutan dan total sesuai durasi
4. **Hard cut eksplisit** — setiap transisi ditulis "HARD CUT."
5. **Dialog dalam bahasa asli** — jika karakter berbicara, tulis dalam bahasa asli dengan konteks (satu-satunya pengecualian dari aturan #1)
6. **Continuity detail** — sebutkan posisi objek, kondisi, dan perubahan antar shot, termasuk first-frame match eksplisit di CONTINUITY LOCK section
7. **Audio diegetik only** — tidak ada musik, tidak ada sound effect non-diegetik
8. **Visual prompt tidak perlu terpisah** — seluruh deskripsi visual sudah menyatu dalam prose
9. **Negative prompt spesifik** — sertakan section NEGATIVE PROMPT berisi hal yang harus dihindari, relevan dengan konten storyboard ini (bukan daftar generik yang sama di semua output)

---

## PERBEDAAN DENGAN VARIANT A

| Aspek | Variant A | Variant B |
|-------|-----------|-----------|
| Format | Form-fill (field terstruktur) | Prose/naratif bebas |
| Bahasa | Indonesia | Inggris |
| Struktur | Metadata → Adegan → Visual Prompt | Opening → Shots → Rules → Audio → Visual |
| Shot format | `=== ADEGAN n — judul ===` | `SHOT n — timestamp — judul` |
| Dialog |VOICE OVER / DIALOG field | Dialog dalam prose |
| Detail level | Ringkas per field | Deskriptif, sinematik |
| POV | Opsional | Bisa POV atau non-POV |

---

## CATATAN

1. **POV Detection**: Sebelum generate, tentukan apakah konten POV atau non-POV. Jika POV, sertakan CRITICAL POV RULE. Jika non-POV, skip section POV.
2. **Durasi fleksibel**: Bisa 30 detik, 60 detik, atau durasi lain — sesuaikan timestamp.
3. **Jumlah shot fleksibel**: Tidak dibatasi 5 atau 6 — sesuaikan dengan kebutuhan cerita.
4. **Gaya penulisan**: Sinematik, deskriptif, seperti membaca naskah film pendek.
