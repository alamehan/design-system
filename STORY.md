# 📖 STORY.md — Cerita di Balik E-Systems Design System V3

> Ditulis oleh **Raihan Allaam** — UI/UX Designer, ITS Elabram 🎨
> Ini bukan dokumentasi teknis. Ini cerita gimana design system ini lahir, jatuh, bangkit, dan akhirnya jadi sesuatu yang (semoga) kalian cintai. Dokumentasi teknisnya ada di `README.md`, `SETUP.md`, `TUTORIAL.id.md` / `TUTORIAL.en.md`, dan peta lengkapnya di `docs/ARCHITECTURE.md`.

---

## 🌱 Chapter 1 — Awal Mula: Mimpi Satu Sumber Kebenaran

Semua berawal dari rasa capek yang relatable banget: tiap bikin fitur baru, UI-nya suka **beda-beda dikit**. Tombol di halaman A beda radius sama halaman B. Warna "biru brand" ternyata ada 5 versi. 😅

Jadi aku mulai proyek ambisius: **E-Systems Design System**. Aku duduk, aku rapiin semuanya:

- 🎨 **181 design tokens** (warna, spacing, typography, radius, shadow — semuanya!)
- 🧩 **64 komponen** yang aku spec-kan satu-satu dalam **76 file JSON** — dari atom sekecil button sampai panel & composite gede
- 🖼️ Ratusan asset: ilustrasi karakter, option menus, icon custom
- 📐 12 page blueprint biar layout konsisten

Semuanya aku tulis dalam **JSON** — bahasa yang bisa dibaca mesin *dan* AI. Ini keputusan yang nanti terbukti jadi penyelamat. 🔮

## 💥 Chapter 2 — Reality Check: V1 Ditolak

V1 aku ship lengkap dengan komponen Vue + installer otomatis. Hasilnya?

**Tim frontend nge-revert semuanya.** 🥲

Dan setelah aku dengerin baik-baik... mereka BENAR:

- ❌ Komponen Vue-ku **redundan** — portal-nuxt udah punya 500+ komponen sendiri yang battle-tested
- ❌ Installer-ku (790 baris!) nge-inject file ke repo mereka secara *opaque* — dev nggak tau apa yang berubah
- ❌ Adopsinya "all or nothing" — nggak ada jalan tengah

Pelajaran terbesarnya: **design system yang bagus itu bukan yang paling lengkap, tapi yang paling bisa diadopsi.** Ego turun, notes kebuka, mulai lagi. 💪

## 🧠 Chapter 3 — Rethink Total: Lahirnya V3

Aku bongkar total filosofinya. V3 bukan lagi "library komponen kedua" — V3 adalah **sumber kebenaran yang dibaca AI**, sementara kodenya tetap 100% punya tim frontend. Arsitekturnya jadi 3 lapis:

1. 📜 **Truth layer** — spec JSON + token. Satu-satunya kebenaran desain.
2. 🖼️ **Reference layer** — 27 komponen versi HTML+CSS murni, buat mata manusia & AI "lihat" hasil yang benar.
3. 🔗 **Binding layer** — `.ds/bindings.md`, kamus kecil yang memetakan spec-ku ke komponen existing kalian (`GlobalsUiButton` dkk). Nggak ada komponen baru. Nol.

Ditambah prinsip yang nggak bisa ditawar:

- 🪜 **Adoption ladder**: Level 0 (referensi read-only, zero risk) → Level 1 (+2 baris config, token live + dark mode)
- 🩺 **Doctor**: script diagnosis yang **read-only** — dia cuma lapor, nggak pernah ngubah apa pun
- ↩️ **Semua reversible**: satu commit rapi, satu klik revert, repo balik bersih
- 🤖 **AI-first**: `CLAUDE.md` chain yang bikin AI coding agent otomatis patuh sama design system

## 🔨 Chapter 4 — Eksekusi

V3 dieksekusi tuntas: repo baru berisi catalog **52 file spec**, INDEX untuk AI, 27 reference HTML + gallery, doctor + linter + CI, dan `TUTORIAL.md` end-to-end Bahasa Indonesia. Diuji langsung ke repo portal-nuxt asli: **doctor ALL PASS** ✅. Nggak ada satu file existing pun yang berubah tanpa persetujuan.

## 🧙 Chapter 5 — Setup Wizard: Biar Dev Tinggal Vibe Code

Masih ada satu keluhan valid: "setup-nya masih buka terminal, clone, edit config... capek 😮‍💨"

Maka lahirlah **DS Setup Wizard** — `ds-setup.cjs`, **literally 1 file**, zero dependency. Copy ke repo, jalanin `node ds-setup.cjs`, browser kebuka, dan:

- 👋 **Tour guide** step-by-step (bisa diulang lewat tombol ❓ Tour) — biar dev paham *kenapa*, bukan cuma *gimana*
- 🛡️ **Plan-first**: semua command ditunjukkan dulu + daftar apa yang TIDAK disentuh, baru jalan setelah confirm
- 📊 **Progress bar** real-time + log transparan
- 🔑 **Level 1 pakai kode akses** dariku — karena naik level itu keputusan bareng, bukan kecelakaan
- 🔒 **Satu proses per sesi** — nggak bakal ke-run dua kali
- 🧪 **Test with AI**: prompt siap copy-paste buat nge-test seluruh design system dalam 1 halaman dashboard percobaan

Dari 790 baris installer yang ditolak... jadi wizard yang nggak pernah gerak tanpa izin. Belajar dari luka. 😄

## 🚀 Chapter 6 — Ambisi

Ini baru mulai. Roadmap-nya:

- 🎯 **Sekarang**: jadi standar di E-Systems — desain sekali, AI bangun screen-nya, doctor yang jagain
- 🌍 **Selanjutnya**: scale ke produk-produk lain
- ⏱️ **Mimpinya**: dari *weeks per feature* → *hours* — dengan hasil yang 100% on-brand, otomatis terverifikasi

Design it once — the product follows. Itu kalimatnya. Itu ambisinya. ✨

---

## 🙏 Penutup

Makasih buat tim frontend yang jujur waktu nge-revert V1 — tanpa itu, V3 nggak akan pernah sebagus ini. Design system ini hidup: kalau ada yang aneh, bilang aku, kita iterasi lagi.

**— Raihan Allaam** · UI/UX Designer · ITS Elabram 🎨
*E-Systems Design System v3.3.0*

---

*Update paling gres: si wizard akhirnya naik kelas jadi **Design System Dashboard** 📊 — satu perintah `node ds-setup.cjs`, dan SEMUA tentang design system ada di sana: status repo, info live (versi, token, spec — dibaca langsung dari repo DS, jadi selalu up-to-date), cek update dariku, galeri komponen, docs lengkap, install, maintain, sampai test with AI. One command to rule them all. 😎*

---

## 🔍 Chapter 7 — Audit yang Bikin Malu (v3.2 → v3.3)

Aku minta satu AI ngaudit ulang semuanya dari nol. Bukan "cek dong bener nggak" — tapi
"reproduksi tiap klaim yang kutulis". Hasilnya bikin nyengir kecut. 😅

Tiga yang paling nyeleneh:

**1. Wizard bisa lapor "ALL DONE ✅" tanpa commit apa pun.** `git add` itu batal
*total* kalau ada satu path yang nggak ada. Jadi nol file ter-stage, git bilang
"nothing to commit", dan kodeku menganggap itu sukses. Dev lihat centang hijau, ngira
beres, padahal repo-nya nggak berubah sama sekali.

**2. Uninstall menghapus seluruh folder `.ds/`.** Termasuk file milik dev sendiri yang
kebetulan dia taruh di situ. Aku nggak pernah kepikiran orang bakal naruh apa-apa di
sana — padahal wajar banget.

**3. Katalog AI kehilangan 24 dari 76 spec** — semua `panel-*` dan `page-*` — karena
satu regex nggak bisa match tanda hubung. Dan yang 24 itu nggak hilang begitu aja: dia
nyampur ke `TOKENS.md`, file yang dibaca tiap AI agent sebagai *kamus token*. Jadi
selama berbulan-bulan, setiap agent yang kerja di repo ini punya kosakata token yang
salah, dan nggak ada yang tahu.

Lalu di v3.3 ketahuan yang paling menohok buatku sebagai **desainer**:

**Reference gallery-ku menyebut Fustat, tapi nggak pernah memuatnya.** CSS-nya nulis
`font-family: "Fustat"` — tanpa satu pun `@font-face`. Browser diam-diam jatuh ke
font sistem. Artinya: setiap kali aku bilang "oke, ini udah bener" sambil ngeliatin
gallery, aku menilai di font yang salah. Padahal law #2 di `HISTORY.md` itu tulisanku
sendiri: *jangan pernah kasih verdict visual tanpa stamp versi yang cocok*. Ternyata
stamp-nya cocok, fontnya yang bohong. 🙃

Pelajarannya sama kayak dulu, cuma bentuknya lain: **sesuatu yang keliatan benar dan
nggak pernah error adalah tempat persembunyian terbaik buat bug.** Yang bikin gagal
loud itu gampang — yang gagal *sunyi* itu yang mahal.

Makanya sekarang tiap pelajaran itu jadi **gate**, bukan catatan:

- `contract-check.js` — nolak rilis yang menghapus token tanpa MAJOR + alias
- `lint-reference.js` — nolak font yang disebut tapi nggak dimuat, dan ikon gambar
  tangan yang ngaku-ngaku Tabler
- `tests/e2e.js` — 84 assertion yang benar-benar install, ngedit file, restore,
  update, rollback, uninstall, di repo sungguhan
- `.ds/manifest.json` — struk. Uninstall nggak nebak lagi, dia baca

Aku nggak nulis ini buat pamer udah diperbaiki. Aku nulis ini karena aku pengen versi
diriku enam bulan lagi inget: **dokumentasi yang nggak dijaga mesin akan jadi bohong,
cepat atau lambat.** 💪

**— Raihan Allaam** · v3.3.0
