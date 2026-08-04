# TUTORIAL PRAKTIS — Dari Nol Sampai Jalan

> English: [TUTORIAL.en.md](./TUTORIAL.en.md)

> Baca file ini SATU KALI dari atas ke bawah, ikuti urutannya, selesai.
> Estimasi total waktu: ±15 menit (di luar review PR oleh tim frontend).

---

## Apa isi paket ini?

Zip delivery berisi **2 folder** dengan tujuan berbeda:

| Folder | Untuk siapa | Diapakan |
|---|---|---|
| `design-system-v3/` | **Kamu (author/designer)** | Di-push jadi repo git baru bernama `design-system` |
| `portal-nuxt-package/` | **Tim frontend** | Isinya (2 file) di-copy ke dalam repo `portal-nuxt` |

Setelah kedua langkah itu selesai, AI (Claude/Cursor/dll) yang bekerja di portal-nuxt otomatis "kenal" design system dan menghasilkan UI yang on-spec — tanpa install apa pun, tanpa menyentuh build/runtime.

---

> 🧙 **Males ngetik command?** Ada **Setup Wizard** — lihat bagian “Cara termudah” di LANGKAH 2. LANGKAH 1 (push repo) tetap dilakukan sekali oleh author.

## LANGKAH 1 — Push repo `design-system` (kamu, ±5 menit)

```bash
# 1. Masuk ke folder hasil ekstrak
cd design-system-v3

# 2. Jadikan repo git
git init
git add .
git commit -m "feat: design system v3.0.0 — truth/reference/binding"

# 3. Buat repo kosong bernama `design-system` di git host kantor
#    (HARUS di host/organisasi yang SAMA dengan portal-nuxt,
#     agar tim frontend punya akses baca)

# 4. Push
git remote add origin <git-url-repo-design-system>
git branch -M main
git push -u origin main
```

✅ **Cek berhasil:** buka repo di browser — harus terlihat `src/`, `dist/`, `catalog/`, `reference/`, `CLAUDE.md`, `SETUP.md`, `TUTORIAL.md`.

> 💡 Opsional: buka `reference/gallery.html` di browser (double-click) untuk melihat galeri semua komponen referensi.

---

## LANGKAH 2 — Adopsi di portal-nuxt / Level 0 (tim frontend, ±5 menit)

### Cara termudah — Design System Panel

```bash
# dari root repo frontend kamu — satu baris, bisa diulang kapan saja
curl -fsSL <RAW-URL-REPO-DS>/raw/main/tools/ds-setup.cjs -o ds-setup.cjs
node ds-setup.cjs
```

Setelah design system terpasang, panel bisa memperbarui dirinya sendiri dari submodule — tidak perlu curl lagi.

Tidak perlu hafal command. Paketnya **literally 1 file**:

1. Copy `ds-setup.cjs` (satu-satunya isi folder `portal-nuxt-package/`) ke **root repo portal-nuxt**.
2. Jalankan: `node ds-setup.cjs` (perintah yang sama di Windows/macOS/Linux).
3. Browser terbuka otomatis → URL repo design-system sudah terisi (tinggal sesuaikan jika perlu) → pilih **Level 0** → klik **Process…**
4. Muncul modal konfirmasi berisi **rencana lengkap**: setiap command & file yang akan dibuat, plus daftar apa yang TIDAK disentuh. Klik confirm.
5. Wizard menjalankan semuanya, commit rapi otomatis (opsional), lalu **doctor** memverifikasi. Kalau ALL PASS → selesai, langsung vibe code.
6. Setelah terinstall, di UI muncul card **AI Prompts**: prompt siap copy-paste untuk menguji end-to-end — AI membuat 1 halaman dashboard percobaan (`pages/ds-smoke-test.vue`) yang memakai komponen ter-mapping, token sesuai level, icon Tabler, dan ilustrasi SVG design system, lalu diverifikasi **doctor**. Sukses = dev tinggal vibe code seperti biasa.

> Wizard yang sama juga punya tombol **Update** (tarik versi design system terbaru), **Run doctor**, dan **Revert** (copot total dalam 1 klik). Aman dijalankan berulang kali (idempotent) dan **append-aware untuk `CLAUDE.md`**: kalau repo sudah punya `CLAUDE.md`, section design system ditambahkan di baris paling akhir di antara marker — isi milik dev tidak disentuh, dan revert hanya mencabut section itu. Hanya berjalan di 127.0.0.1, dan TIDAK menyentuh apa pun di luar langkah-langkah dokumen ini. Sejak v2, `node ds-setup.cjs` membuka **Design System Dashboard** satu halaman — bukan cuma wizard install. Lima tab: **Overview** (status adopsi + info live yang dibaca langsung dari folder design-system — versi, token, spec, catalog — plus tombol **Check for updates** → **Update now** kalau author merilis versi baru, galeri komponen, dan semua docs 1 klik), **Setup** (wizard install — kalau sudah terinstall ada banner jelas supaya nggak install dobel), **Maintain** (doctor / update / revert), **Changelog** (riwayat versi design system v1 → v2 → v3 + release notes live dari CHANGELOG.md), dan **AI Prompts** — prompt library best-practice siap copy-paste (smoke test dashboard lengkap (tabel selalu di dalam card putih, panel detail dibuka dari tombol view — bukan klik row), bikin feature baru, **migrasi/rebuild feature lama**, nambah UI, redesign on-spec, audit styling off-brand, review perubahan; placeholder [BRACKETS] kini tampil sebagai **kolom isian** yang meng-update teks prompt otomatis sebelum di-copy; semuanya sudah membawa aturan design system dan menyesuaikan Level adopsi; untuk hasil paling presisi disarankan dijalankan dengan Claude Opus terbaru, reasoning effort high). Dashboard juga punya **tour guide interaktif** (muncul otomatis saat pertama kali dibuka, bisa diulang lewat tombol **❓ Tour** di kiri bawah), **progress bar** real-time saat proses berjalan, dan **terkunci setelah satu proses sukses** — untuk menjalankan proses lain, tutup dashboard lalu jalankan ulang `node ds-setup.cjs`.

### Cara manual (setara, untuk yang suka terminal)

Semua dilakukan di dalam repo `portal-nuxt`, sebagai **satu PR**:

```bash
# 1. Tambahkan design system sebagai submodule read-only (SATU-SATUNYA "install")
git submodule add <git-url-repo-design-system> design-system

# 2. Generate 2 file instruksi (sudah embedded di dalam wizard):
node ds-setup.cjs extract
#    - CLAUDE.md          → portal-nuxt/CLAUDE.md
#    - .ds/bindings.md    → portal-nuxt/.ds/bindings.md

# 3. Commit + buka PR
git add .
git commit -m "chore: adopt design-system v3 (Level 0, reference-only)"
```

**Yang perlu direview frontend di PR ini:** file `.ds/bindings.md` — peta spec design system → komponen mereka sendiri (mis. `atom-01 Button → <GlobalsUiButton>`). Sudah kuisi lengkap (27 entri + driftNotes + gaps); mereka tinggal validasi, koreksi kalau ada yang keliru.

⚠️ **Level 0 tidak mengubah build/runtime SAMA SEKALI.** Tidak mungkin merusak apa pun. Revert = hapus submodule + 2 file.

---

## LANGKAH 3 — Verifikasi (±1 menit)

Di root portal-nuxt:

```bash
node design-system/src/scripts/doctor.js
```

`doctor` bersifat **read-only** (tidak pernah menulis file). Ia mendeteksi level adopsi, mengecek wiring, memvalidasi setiap entri bindings terhadap file komponen asli, dan mengecek config drift.

✅ **Cek berhasil:** semua baris `PASS`, exit code 0. (Sudah kutes end-to-end di repo portal-nuxt asli: ALL PASS.)

❌ Kalau ada FAIL: baca pesannya — doctor selalu menyebut file & baris persisnya. Lihat juga bagian Troubleshooting di `SETUP.md`.

---

## LANGKAH 4 — Cara kerja harian: vibe coding dengan AI

Tidak ada yang perlu dihafal. Rantai instruksinya otomatis:

1. Developer menyuruh AI bikin/ubah UI di portal-nuxt.
2. AI membaca `portal-nuxt/CLAUDE.md` (tipis) → diarahkan ke `design-system/CLAUDE.md` (hukum universal) → `design-system/catalog/INDEX.md` (daftar semua komponen, 1 baris per komponen) → load HANYA spec yang relevan (`catalog/components/<kode>.md`) → eksekusi pakai komponen frontend sesuai `.ds/bindings.md`.
3. Hasil: UI on-spec, pakai komponen milik frontend, tanpa hardcode warna/ukuran.

**Self-Healing Map:** kalau AI menemukan mapping di `.ds/bindings.md` yang basi/bolong saat bekerja, ia wajib memperbaikinya di PR yang sama. Peta merawat dirinya sendiri.

---

## LANGKAH 5 — Workflow update desain (kamu, tiap ada perubahan)

```bash
# Di repo design-system:
# 1. Edit desain di Figma → update src/foundations.json / src/components/*.json
# 2. Build + validasi + regenerate catalog:
node src/scripts/build.js
node src/scripts/split-catalog.js
# 3. Commit + push (CI akan memvalidasi ulang otomatis)
git add . && git commit -m "feat(tokens): ..." && git push
```

Di sisi portal-nuxt, frontend mengambil update **kapan pun mereka siap** (bukan otomatis):

```bash
git submodule update --remote design-system
git commit -m "chore: bump design-system"
```

> 📌 Aturan versi: rename/hapus token = MAJOR version + alias deprecasi 1 siklus. `doctor` memberi peringatan kalau bump melompati MAJOR. Selalu cek `CHANGELOG.md`.

---

## LANGKAH 6 (OPSIONAL) — Naik ke Level 1: live tokens (+2 baris)

> 🔑 Lewat wizard, Level 1 meminta **kode akses** dari author (Raihan Allaam) — hubungi author dulu karena ada info manual yang perlu disampaikan. Default kodenya `DSV3-RAIHAN`; author bisa menggantinya di baris atas `ds-setup.cjs` atau lewat env `DS_L1_CODE` sebelum wizard dijalankan.

Kalau frontend mau dark mode + class token yang selalu sinkron:

1. `tailwind.config.js` → tambah `presets: [require("./design-system/dist/tailwind.preset.js")]`
2. `nuxt.config.js` → tambah `"~/design-system/dist/variables.css"` di array `css`
3. Jalankan `doctor` lagi → harus PASS di Level 1.

Revert = hapus 2 baris itu. Level 2 (alias warna legacy) sepenuhnya keputusan frontend — lihat `SETUP.md`.

---

## Rollback total (kalau suatu saat dibutuhkan)

```bash
git submodule deinit -f design-system
git rm -f design-system
rm -rf .git/modules/design-system
git rm -f CLAUDE.md .ds/bindings.md
git commit -m "revert: remove design-system"
```

Selesai — repo kembali persis seperti semula.

---

## Peta dokumen (kalau butuh lebih dalam)

| File | Isi |
|---|---|
| `TUTORIAL.md` | **File ini** — jalur cepat dari nol sampai jalan |
| `SETUP.md` | Detail adoption ladder Level 0/1/2 + troubleshooting |
| `README.md` | Arsitektur Truth/Reference/Binding + layout repo |
| `CLAUDE.md` | Hukum universal untuk AI (jangan diedit sembarangan) |
| `catalog/INDEX.md` | Router katalog — daftar semua komponen |
| `reference/gallery.html` | Galeri visual semua komponen (buka di browser) |
| `CHANGELOG.md` | Riwayat versi + aturan semver |
| `portal-nuxt-package/.ds/bindings.md` | Peta spec → komponen portal-nuxt (tinggal review) |

---

## Catatan v2.4.0 — Kalau repo kamu pernah pakai design system versi LAMA (v1/v2)

Buka dashboard seperti biasa (`node ds-setup.cjs`). Kalau di repo masih ada sisa **paket design system lama yang dulu di-deliver** (folder `design-system/` hasil copy, `plugins/design-system.js`, halaman contoh, `.ds-backup/`, pointer CLAUDE.md lama, baris config lama), tab **Setup** otomatis menampilkan kartu peringatan berisi daftar temuannya.

- Itu **bukan** komponen/kode asli portal kamu — kode asli tidak akan disentuh sama sekali.
- **Rekomendasi: bersihkan dulu** supaya install v3 mulus tanpa redundant/konflik. Ketik `HAPUS DS LAMA` di kolom konfirmasi lalu klik **🧹 Bersihkan file DS lama** (ada rencana lengkap sebelum apapun dijalankan).
- Kalau memilih tidak menghapus, install tetap bisa dilanjut.
- CLAUDE.md yang sudah berisi catatan kamu sendiri aman: hanya baris peninggalan DS lama yang dicabut.

---

## Catatan v3.3.0

- **Reference tier sekarang jujur.** `reference/gallery.html` benar-benar render pakai
  **Fustat** (font-nya ditanam base64 supaya jalan meski file dibuka lewat `file://`)
  dan ikonnya **Tabler asli** dari sprite MIT, bukan SVG gambar tangan. Sebelum ini
  CSS-nya *menyebut* Fustat tapi tidak pernah memuatnya — jadi semua penilaian visual
  terhadap gallery dibuat di font yang salah.
- **Navigasi panel** sekarang pill mengapung di bawah. Menu **⋯** berisi putar tour,
  ganti tema, dan tutup panel.
- **Dokumen dirender**, bukan markdown mentah. Ada tab Pratinjau (default) dan Markdown.
- **Panel menulis `.gitignore` + `.gitattributes`** (blok bertanda). `.ds/` tidak
  diignore seluruhnya — alasannya di [SAFETY.id.md §2b](./SAFETY.id.md).
- Peta lengkap arsitektur: [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md).
