# STORY.md — Cerita di balik E-Systems Design System v3

> Ditulis oleh **Raihan Allaam** — UI/UX Designer, ITS Elabram
>
> Ini bukan dokumentasi teknis, cuma catatan gimana design system ini sampai ke
> bentuknya sekarang. Yang teknis ada di `README.md`, `SETUP.md`,
> `TUTORIAL.id.md` / `TUTORIAL.en.md`, dan peta lengkapnya di
> `docs/ARCHITECTURE.md`.

---

## 1. Kenapa dibikin

Awalnya dari hal kecil yang numpuk. Tiap ada fitur baru, UI-nya suka beda sedikit-sedikit:
radius tombol di satu halaman nggak sama dengan halaman lain, "biru brand" ternyata ada
beberapa versi yang mirip tapi nggak identik. Nggak ada yang salah besar, tapi tiap
review jadi ngulang diskusi yang sama.

Jadi aku coba rapiin di satu tempat:

- **185 design token** — warna, spacing, tipografi, radius, shadow, stroke
- **76 spec komponen** — 64 komponen (dari button sampai panel dan composite) plus 12 blueprint halaman
- Asset: ilustrasi, option menu, ikon custom
- Semuanya ditulis sebagai **JSON**, bukan dokumen desain

Pilihan JSON itu awalnya cuma karena gampang divalidasi. Belakangan baru kelihatan
untungnya: format yang bisa dibaca mesin ternyata bisa dibaca AI juga.

---

## 2. V1: bentuknya belum sesuai

V1 aku kirim lengkap — komponen Vue plus installer otomatis. Di repo `portal-nuxt`
akhirnya nggak dipakai, dan setelah ngobrol sama tim frontend, alasannya masuk akal:

- Komponen Vue-ku **ngedobel** apa yang sudah ada. Portal itu punya 500+ komponen
  sendiri yang sudah lama dipakai dan sudah terbukti jalan.
- Installer-ku nulis file ke repo mereka tanpa nunjukkin dulu apa yang berubah. Dari
  sisi mereka, itu susah dipercaya — dan wajar.
- Adopsinya cuma "semua atau nggak sama sekali". Nggak ada cara buat coba dikit dulu.

Yang aku ambil dari situ: **design system yang paling lengkap belum tentu yang paling
kepakai.** Yang menentukan itu seberapa gampang diadopsi tanpa bikin orang khawatir.

---

## 3. V3: tiga lapis

Filosofinya aku ganti. V3 bukan library komponen kedua. V3 nyimpan kebenaran desain,
dan kodenya tetap 100% milik tim frontend.

| Lapis | Isinya |
|---|---|
| **Truth** | spec JSON + token. Satu-satunya tempat keputusan desain dibuat. |
| **Reference** | 27 file HTML+CSS polos yang bisa dibuka di browser — buat mata manusia, dan buat AI "lihat" hasil yang benar. |
| **Binding** | `.ds/bindings.md` di repo kalian: kamus kecil yang memetakan spec ke komponen yang sudah ada (`GlobalsUiButton` dan kawan-kawan). |

Nggak ada komponen baru yang dikirim. Itu intinya.

---

## 4. Yang aku pegang

- **Adoption ladder.** Level 0 read-only, build kalian nggak disentuh sama sekali.
  Level 1 nambah dua baris config, dan itu keputusan sadar, bukan default.
- **Plan dulu.** Tiap aksi nunjukkin rencananya lengkap — perintahnya, isi filenya,
  dan daftar apa yang **tidak** disentuh — baru jalan setelah dikonfirmasi.
- **Semua bisa dibalik.** Ada struk pemasangan, dan tiap file yang diganti disimpan
  dulu salinannya. Uninstall baca struk itu, bukan nebak.
- **Doctor read-only.** Cuma lapor, nggak pernah ngubah.
- **AI-first.** `CLAUDE.md` chain bikin AI coding agent otomatis ngikut design system
  tanpa perlu diingetin tiap sesi.

---

## 5. Panelnya

Keluhan berikutnya juga valid: setup-nya masih buka terminal, clone, edit config.

Jadi dibikin **panel satu file** — `ds-setup.cjs`, tanpa dependency. Copy ke repo,
jalanin `node ds-setup.cjs`, browser kebuka:

- Status repo, versi, level adopsi, dan angka-angka design system yang dibaca **langsung
  dari folder terpasang**, jadi nggak bisa basi
- Deteksi kalau ada file yang diedit manual, plus tawaran ngirim perubahannya ke aku
  supaya bisa masuk rilis berikutnya
- Galeri komponen, dokumen, dan pustaka prompt AI
- Tur singkat buat yang baru pertama buka, bisa diputar ulang kapan aja dari menu **⋯**

Dari installer yang dulu nulis diam-diam, jadi panel yang nggak gerak tanpa izin.

---

## 6. Diaudit ulang

Setelah v3.2 aku minta satu AI ngaudit ulang seluruh repo — bukan sekadar "cek bener
nggak", tapi reproduksi tiap klaim yang aku tulis. Ketemu beberapa hal yang sudah lama
jalan tanpa ada gejala:

- Pemasangan bisa lapor berhasil padahal nggak ada satu commit pun yang kejadian.
  `git add` batal total kalau ada satu path yang nggak ada, dan hasil "nothing to
  commit"-nya kebaca sebagai sukses.
- Uninstall menghapus seluruh folder `.ds/`, termasuk file yang mungkin ditaruh dev
  sendiri di situ.
- Katalog AI kehilangan 24 dari 76 spec gara-gara satu regex nggak bisa match tanda
  hubung — dan 24 itu nyampur ke file yang dibaca tiap agent sebagai kamus token.
- Reference CSS-nya nyebut Fustat tapi nggak pernah benar-benar memuat font-nya, jadi
  browser diam-diam pakai font sistem. Artinya penilaian visual yang aku kasih ke
  gallery selama ini dibuat di font yang salah.

Empat-empatnya punya kesamaan: **nggak ada yang error.** Yang gagal berisik itu
gampang ketemu; yang gagal diam-diam itu yang lama nyangkutnya.

Makanya sekarang tiap pelajaran diubah jadi **gate** di pipeline rilis, bukan catatan di
markdown:

| Pelajaran | Yang jagain sekarang |
|---|---|
| Nggak boleh ada token dihapus tanpa MAJOR + alias | `contract-check.js` |
| Font yang disebut harus benar-benar dimuat | `lint-reference.js` |
| Ikon harus dari sprite Tabler, bukan gambar tangan | `lint-reference.js` |
| Panel harus lolos siklus hidupnya sendiri | `tests/e2e.js` — 84 pemeriksaan |
| Uninstall harus presisi | `.ds/manifest.json` + `.git/ds-recovery/original/` (salinan pra-install, dibandingkan byte-per-byte saat revert) |

Aturan yang cuma ditulis di dokumen cenderung kelanggar lagi dalam bentuk baru. Kalau
mau kepegang, harus ada yang nolak commit-nya.

---

## 7. Sekarang dan selanjutnya

Yang sedang dikerjakan: jadi standar di E-Systems — desainnya sekali, AI yang bangun
screen-nya, doctor yang ngecek. Habis itu baru mikir produk lain.

Targetnya sederhana: waktu dari desain ke halaman jadi lebih pendek, dan hasilnya tetap
on-brand tanpa perlu diperiksa manual satu-satu.

---

## Penutup

Makasih buat tim frontend yang mau ngomong terus terang waktu V1 belum sesuai. Tanpa itu
V3 nggak akan berbentuk seperti sekarang.

Design system ini masih jalan. Kalau ada yang aneh, kurang pas, atau bikin ribet —
bilang aja, kita iterasi lagi.

**— Raihan Allaam** · UI/UX Designer · ITS Elabram
*E-Systems Design System v3.3.0*
