# PBM Ops — MVP revisi v5

Prototipe interaktif hasil modifikasi `pbm_ops_mvp.jsx`. Tampilan gelap, kanban per client, Operations Hub, KPI, grafik, Cycle Log, dan Feedback Loop dari referensi dipertahankan. Ditambah halaman Clients dan Users & Roles.

## Menjalankan

Runtime PHP portable, dependency Composer, `.env`, dan hasil build frontend sudah
disiapkan. Di Windows, jalankan aplikasi Laravel dari folder proyek:

```bat
serve.cmd
```

Buka `http://127.0.0.1:8000/`. Jika port tersebut digunakan aplikasi lain,
pilih port lain, misalnya `serve.cmd 8010`.

Untuk pengembangan frontend, gunakan Node.js 22 atau lebih baru lalu jalankan:

```sh
npm ci
npm run dev
```

Buka `http://127.0.0.1:5175/`. Pada PowerShell yang memblokir `npm.ps1`, gunakan
`npm.cmd run dev`. Untuk hasil build: `npm.cmd run build`. Pengujian frontend:
`npm.cmd test`. Pengujian backend:
`.tools\php\php.exe artisan test`.

Login demo: **coo@gmail.com** dengan password **password**. Akun lain tersedia melalui tombol pilihan role di halaman login. Email demo adalah data contoh; aplikasi tidak mengirim email dan tidak terhubung ke Google.

## Peta 13 revisi

| No. | Permintaan                   | Implementasi / lokasi                                                                                                                                                                   |
| --- | ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | CRUD client                  | Tab Clients: tambah, lihat, edit, hapus dengan rincian dampak.                                                                                                                          |
| 2   | CRUD cycle log               | KPI → Cycle Log: tambah, expand varian, edit, hapus.                                                                                                                                    |
| 3   | CRUD cycle KPI               | Tombol Tambah cycle KPI dan Edit/Hapus cycle terakhir pada tabel ringkasan. Seluruh riwayat dikelola melalui Cycle Log.                                                                 |
| 4   | CRUD feedback                | Feedback Loop: tambah, detail/edit, hapus; checkpoint 30/50/90, role, prioritas dan tindak lanjut.                                                                                      |
| 5   | CRUD user & role             | Users & Roles: tambah Gmail, edit role, aktif/nonaktif, hapus. Minimal satu COO aktif. Permission langsung mengikuti role.                                                              |
| 6   | Update & delete task         | Klik kartu di board atau kalender → detail → edit/hapus. Juga tersedia tambah task.                                                                                                     |
| 7   | Bebas pindah status          | Drag kartu pada baris client yang sama; dropdown pada detail/edit mendukung semua delapan status, maju maupun mundur. Dropdown juga digunakan pada ponsel/keyboard.                     |
| 8   | Operations Hub sinkron       | Task, jumlah per tahap, workload per role, overdue, health, revisi, fase, dan progress berasal dari store yang sama. Open Tasks mencakup semua task belum Done.                         |
| 9   | Beberapa varian uji          | Satu control + minimal satu varian uji untuk Cycle 1+. Varian uji bisa ditambah/dihapus tanpa batas jumlah tetap. Cycle 0 berisi satu varian pertama dengan data baseline awal kontrak. |
| 10  | Role menggantikan nama orang | COO, Developer, Creative, Digital Marketer, Project Manager. Nama pribadi referensi dibuang; nama bisnis client tetap dipertahankan.                                                    |
| 11  | Gmail login                  | Validasi @gmail.com, unik tanpa membedakan huruf besar/kecil. Role tampil pada operasi; email identitas terlihat pada pengelolaan akun.                                                 |
| 12  | DESIGN & BACKEND             | Label kolom board, pilihan status, dan ringkasan tahap sudah diganti.                                                                                                                   |
| 13  | Calendar menampilkan data    | Bulan berjalan, navigasi bulan, daftar bulan yang memiliki task, seluruh task per tanggal tanpa batas tiga kartu. Data mengikuti deadline yang diedit.                                  |

## File utama

- `src/pbm_ops_mvp.jsx`: komponen utama, seed data, store bersama, model CRUD, form, dan style tambahan yang disematkan. Dapat dipakai sebagai pengganti komponen JSX referensi pada host dengan React, Lucide, Recharts dan Tailwind.
- `src/main.jsx`, `src/style.css`, `index.html`, `vite.config.js`: wrapper untuk menjalankan proyek.
- `DEVELOPER-HANDOFF.md`: model data, aturan, kontrak implementasi, dan skenario penerimaan.
- `tests/ops.test.mjs`: pengujian model dan interaksi React, tanpa browser.

## Batas prototipe

Data berada di `localStorage` browser ini, key `pbm-ops-v5`; sesi demo di `sessionStorage`, key `pbm-ops-v5-session`. Refresh mempertahankan perubahan. Browser, origin, atau perangkat lain memiliki data sendiri. Data tidak sinkron antar-tab secara realtime.

Login adalah simulasi pemilihan akun, bukan autentikasi. Permission UI dan mutasi prototipe sudah mengikuti role. Developer tetap perlu menerapkan pemeriksaan izin yang sama di backend; kontrol client-side tidak menjadi batas keamanan produksi.

## Permission role

| Role             | Tab yang terlihat                             | Hak perubahan                                                                 |
| ---------------- | --------------------------------------------- | ----------------------------------------------------------------------------- |
| COO              | Semua tab                                     | CRUD semua data                                                               |
| Project Manager  | Semua tab                                     | CRUD semua data                                                               |
| Developer        | Execution Board, Feedback Loop                | Execution Board read-only; hanya edit Action/Tindak Lanjut feedback           |
| Creative         | Execution Board, Feedback Loop                | Execution Board read-only; hanya edit Action/Tindak Lanjut feedback           |
| Digital Marketer | Execution Board, KPI Dashboard, Feedback Loop | CRUD KPI; Execution Board read-only; hanya edit Action/Tindak Lanjut feedback |

Menghapus client menghapus task, cycle, dan feedback terkait setelah konfirmasi. Menghapus cycle KPI tidak menghapus task delivery. Menghapus user tidak menghapus tugas karena tugas ditugaskan ke role.

Data contoh tetap memakai periode 2026 dari referensi. Kalender awal memakai bulan berjalan; gunakan pilihan bulan untuk melihat data lama. Rate seed dinormalisasi dari varian sehingga angka ringkasan bisa berbeda sedikit dari angka pembulatan manual pada referensi.

Task urgent memakai card rose dengan label khusus. Dalam satu sel client/status, card otomatis diringkas mulai dari dua task dan tetap dapat dibuka ke tampilan lengkap.

Build dan 15 pengujian model/interaksi React telah dijalankan. Pengujian mencakup matriks role, migrasi data lama, pembatasan kontrol UI, jalur update tindak lanjut, dan aturan card Execution Board. Pengujian tersebut bukan pemeriksaan visual browser atau drag-and-drop native pada perangkat sungguhan.
