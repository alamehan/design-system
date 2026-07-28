# SAFETY — apa yang disentuh panel, dan apa yang tidak akan pernah disentuh

> Ditulis untuk siapa pun yang harus menyetujui ini. Sengaja spesifik, dan
> menyebutkan batasannya sejelas jaminannya.
> English: [SAFETY.en.md](./SAFETY.en.md)

---

## 1. Jawaban singkatnya

Panel menulis ke **empat** tempat di repo kamu, dan **semuanya dibungkus marker pembuka dan penutup** supaya bisa ditemukan dan dihapus dengan tepat.

Tidak ada yang ditimpa diam-diam. Tidak ada yang dihapus — hanya dipindah ke `.ds/.trash/`. Setiap aksi menampilkan rencana lengkap, termasuk isi file persisnya, sebelum dijalankan.

Yang **tidak** kami klaim: bahwa tidak ada yang bisa salah. §6 mendaftar apa yang tetap di luar kendali kami.

---

## 2. Semua file yang disentuh panel

| File | Yang ditulis | Marker | Cara dihapus |
|---|---|---|---|
| `CLAUDE.md` | satu blok ditambahkan di **akhir** | `<!-- design-system:begin -->` … `<!-- design-system:end -->` | hanya blok bertanda yang dicabut; teks kamu tetap |
| `.ds/bindings.md` | file utuh, dibuat **hanya kalau belum ada** | seluruh file, dilacak lewat hash di struk | hanya file itu yang dihapus — bukan folder `.ds/` |
| `tailwind.config.js` | **1 baris** (Level 1 saja) | `/* design-system:managed */` di ujung baris | baris bertanda dihapus |
| `nuxt.config.js` | **1 baris** (Level 1 saja) | `/* design-system:managed */` di ujung baris | baris bertanda dihapus |
| `.gitmodules` + `design-system/` | submodule git standar | native git | `git submodule deinit` + `git rm` |

Di **Level 0** hanya dua yang pertama yang ada. Build kamu sama sekali tidak disentuh.

Marker di baris config menempel *pada barisnya sendiri*, jadi tahan terhadap Prettier, ESLint `--fix`, dan reformat. Penghapusan mencocokkan marker, bukan teksnya — jadi tetap jalan meski formatter sudah menulis ulang tanda kutip atau indentasinya.

---

## 3. Struk pemasangan

Saat install, panel menulis `.ds/manifest.json` — catatan persis apa yang dia lakukan:

```json
{
  "schema": "ds-manifest-v1",
  "adoptionId": "…",
  "wizardVersion": "3.0.0",
  "level": "0",
  "dsVersion": "3.2.0",
  "dsCommit": "a1b2c3d",
  "managed": [
    { "path": "CLAUDE.md",        "mode": "block", "klass": "contract", "sha256": "…" },
    { "path": ".ds/bindings.md",  "mode": "file",  "klass": "living",   "sha256": "…" }
  ]
}
```

Satu file ini yang bikin semuanya mungkin:

- **Uninstall jadi presisi.** Panel membaca struk lalu membatalkan entri itu saja. Tidak menebak, tidak pattern-matching, tidak menghapus folder borongan.
- **Perubahan manual jadi terdeteksi.** Tiap region punya SHA-256; panel menghitung ulang tiap kali dibuka.
- **Adopsi jadi bisa dihitung.** Struk ikut ter-commit, jadi scan repo se-organisasi memberi angka nyata tanpa telemetry apa pun.

Event yang sering berubah masuk ke `.ds/history.jsonl` — append-only, satu objek JSON per baris — jadi dua developer yang install barengan tidak bikin merge conflict.

---

## 4. Tidak ada yang dihapus

Setiap aksi destruktif **menyalin dulu** file-nya ke `.ds/.trash/<nama>.<timestamp>`, dan log-nya mencetak lokasinya.

Berlaku untuk uninstall, restore ke default, pembersihan file lama, dan update panel. Kalau ada yang salah, isi sebelumnya masih ada di disk.

`.ds/.trash/` dan `.ds/history.jsonl` sengaja **selamat dari uninstall**. Panel memberi tahu itu di rencana, sebelum kamu konfirmasi.

---

## 5. Perubahan manual: terdeteksi, dan diperlakukan dengan benar

Panel membedakan dua jenis perubahan, karena menyamakannya justru keliru.

| Kelas | File | Kenapa berubah | Respons panel |
|---|---|---|---|
| **Kontrak** | blok `CLAUDE.md`, baris config | seharusnya tidak berubah | peringatan + tawaran **Kembalikan** |
| **Hidup** | `.ds/bindings.md` | **memang diharapkan berubah** | info netral + tawaran **Kirim ke desainer** |

`.ds/bindings.md` itu *memang* untuk diedit. Self-Healing Map Law (`CLAUDE.md` §4) menyuruh setiap AI agent mengoreksinya begitu petanya keliru. Menandai itu sebagai kerusakan akan bikin panel teriak serigala di repo yang sehat — dan orang akan belajar mengabaikannya.

Jadi sebaliknya: repo yang peta bindings-nya berkembang adalah repo yang menemukan sesuatu yang belum diketahui template. **Kirim ke desainer** mengemas versi kamu — lengkap dengan diff, repo, branch, dan versi design system — ke `.ds/requests/`, menyalinnya ke clipboard, lalu membuka aplikasi email. Koreksi yang berguna kemudian masuk ke rilis berikutnya untuk semua orang.

**Kembalikan** selalu tersedia juga, dan selalu mem-backup versi kamu lebih dulu.

---

## 6. Yang tetap di luar kendali kami

Disebut terus terang, karena checklist bertuliskan "100% aman" tidak layak dibaca.

| Risiko | Mitigasi | Sisa risiko |
|---|---|---|
| Developer mengedit file **di dalam** `design-system/` | secara kontrak itu submodule read-only yang di-pin; `doctor` melaporkannya | git akan menolak update bersih; editnya hilang saat `checkout` |
| `git push --force` menimpa commit adopsi | adopsi adalah satu commit yang bisa direview | pemulihan git biasa (`reflog`) berlaku |
| Mati listrik di tengah penulisan | penulisan kecil dan per-file; `.ds/.trash/` menyimpan salinan sebelumnya | satu file bisa terpotong; jalankan ulang panel |
| Kode akses Level 1 | ini **gerbang sosial, bukan keamanan** — kodenya tertulis polos di dalam file. Tujuannya supaya ada yang bertanya ke pemelihara sebelum menyentuh config build | siapa pun yang membuka file bisa membacanya |
| Telemetry | **mati secara default**; kalau dinyalakan, payload persisnya ditampilkan sebelum pengiriman pertama dan bisa ditolak permanen | nol kalau dibiarkan mati |
| URL repo salah | setelah clone, panel memastikan `catalog/INDEX.md`, `dist/variables.css` dan `CLAUDE.md` ada, dan menggagalkan langkahnya kalau tidak | kamu masih bisa mengarah ke fork yang lolos cek itu |

---

## 7. Cara memverifikasi sendiri

```bash
node design-system/src/scripts/doctor.js        # read-only. Tidak pernah menulis file.
node design-system/tests/e2e.js                 # menjalankan siklus penuh + assert
cat .ds/manifest.json                           # struknya
cat .ds/history.jsonl                           # setiap kejadian, berurutan
ls -la .ds/.trash/                              # setiap versi yang pernah diganti
git diff                                        # semua yang panel lakukan adalah git biasa
```

Test end-to-end membangun repo sekali pakai, install, mengedit file secara manual, mengembalikannya, update, rollback, uninstall, lalu mengulang jalur migrasi untuk repo yang dipasang panel versi lama — dengan assert di tiap langkah. Termasuk cek eksplisit bahwa tulisan developer sendiri di `CLAUDE.md` dan file miliknya di `.ds/` selamat dari uninstall.

---

## 8. Tiga bug yang diperbaiki rilis ini

Ditemukan lewat audit, direproduksi, dan sekarang ditutup oleh test suite.

1. **Install bisa melapor sukses padahal tidak commit apa pun.** `git add` batal total kalau ada satu path yang tidak ada, jadi nol file ter-stage; hasil "nothing to commit"-nya lalu dianggap sukses. Sekarang panel hanya men-stage path yang ada, memverifikasi index, dan melaporkan daftar file yang sebenarnya.
2. **Uninstall menghapus seluruh folder `.ds/`**, ikut membawa file milik developer. Sekarang penghapusan digerakkan struk, file per file; `.ds/` sendiri hanya dihapus kalau sudah kosong.
3. **Pembersihan file lama menghapus setiap baris yang mengandung `design system`** dari `CLAUDE.md`, termasuk kalimat developer sendiri. Sekarang sadar-bagian dan mem-backup file-nya lebih dulu.
