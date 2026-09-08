# Handoff developer — PBM Ops v5

## Target

Implementasikan perilaku dan tampilan prototipe ini dalam versi dengan backend/database. Pertahankan susunan halaman, kolom board, filter, grafik, detail, dialog CRUD, dan mode kalender. File JSX adalah acuan interaksi. Paket ini tidak memerlukan akses ke proyek landing-page lain di workspace.

## Entitas dan hubungan

| Entitas   | Field utama                                                                                                          | Hubungan / aturan                                                                         |
| --------- | -------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Client    | id, name, contract, bottleneck (catatan manual)                                                                      | Memiliki banyak task, cycle KPI, feedback.                                                |
| Task      | id, name, client, status, pic, due, cycle, revision, priority, type, brief, blocked                                  | client → Client; pic adalah role. due berupa tanggal YYYY-MM-DD tanpa zona waktu.         |
| Cycle KPI | id, client, cycle, periode, updateDate, status, layer, bottleneck, primaryMetric, hypothesis, optimization, variants | Unik pada pasangan client + nomor cycle. Ditampilkan di KPI dan Cycle Log.                |
| Variant   | id, label, isControl, targetVisit, realVisit, bounceRate, leadRate, intentRate                                       | Milik Cycle. Tepat satu control, nama varian unik di dalam cycle.                         |
| Feedback  | id, client, date, phase, from, fromType, topic, details, priority, action                                            | from = label role; fromType pm/owner/client. action kosong berarti belum ditindaklanjuti. |
| User      | id, email, role, active                                                                                              | Gmail unik case-insensitive. Minimal satu COO aktif.                                      |

ID baru berupa UUID. ID task seed historis berupa angka; gunakan ID konsisten pada implementasi server. Pisahkan koleksi variants menjadi tabel `cycle_variants` pada database, dengan foreign key ke cycles.

`task.cycle` adalah label cycle delivery. `cycles.cycle` adalah ronde pengukuran KPI. Referensi memiliki task delivery Cycle 1 ketika KPI masih Cycle 0. Karena itu prototipe tidak memaksakan foreign key task ke cycle KPI. Menghapus ronde KPI mempertahankan task delivery. Jika konsep tersebut ingin digabung dalam produksi, tentukan migrasi dan aturan relasinya lebih dulu.

## Aturan perhitungan

- Open Tasks = seluruh task dengan status selain `done`; overdue merupakan subset, bukan dikeluarkan dari jumlah open.
- Overdue = task belum Done dengan `due < tanggal lokal hari ini`.
- Health client: ada task open yang `blocked` → Blocked; jika tidak, ada overdue → Delayed; selain itu On Schedule. Nilai ini identik pada board dan hub.
- Fase client mengikuti task terhambat, lalu overdue, lalu client review, lalu task open pertama. Jika semua selesai: Live & Done. Tanpa task: Belum ada task.
- Bottleneck di hub berasal dari task blocked/overdue/review, bukan status lama yang tersimpan di seed. Catatan manual client disimpan terpisah dari hasil hitungan.
- Progress = pembagian task Done, Review, dan task lainnya. Client tanpa task tidak menampilkan progress palsu.
- Revisi client = jumlah revisi tertinggi dari task client; cycle client = nomor tertinggi dari delivery dan KPI.
- Total target/real visit = jumlah nilai varian yang sudah diisi; jika seluruhnya kosong, hasil null.
- Rate cycle = Σ(rate varian × real visit varian) / Σ(real visit). Jika traffic nol/tidak ada atau varian dengan traffic positif belum punya rate, hasil null. Simpan presisi penuh di server dan bulatkan saat ditampilkan.
- Nilai kosong = belum terukur, berbeda dari nol. Rate valid 0–100; visit dan revisi bilangan bulat nonnegatif.
- Cycle 0 = baseline awal kontrak setelah varian pertama launch. Memiliki tepat satu varian baseline, seluruh data visit/rate wajib diisi, status Baseline. Cycle 1+ = satu control dan ≥1 varian uji. UI memungkinkan penambahan banyak varian.
- Grafik dan delta menggunakan urutan nomor cycle. Penurunan lead rate dua cycle berturut-turut memicu Perlu Intervensi; sekali turun Perlu Dipantau. Status improvement pada log diisi operator; flag ringkasan dihitung otomatis.
- Penanda pada varian berarti lead rate tertinggi yang teramati, bukan kesimpulan signifikansi statistik A/B test.

## Status dan role

Status: intake → strategy → design → frontend → staging → qa → review → done. Urutan ini urutan tampilan, bukan pembatas perpindahan. Semua pasangan status diizinkan termasuk mundur dan langsung Done. Drag-and-drop dibatasi dalam client yang sama; perubahan client melalui edit task.

Card task urgent harus memiliki treatment visual rose dan label `Urgent`, baik pada card penuh maupun card ringkas. Dalam satu sel client/status, gunakan card ringkas ketika jumlah task ≥2; operator tetap dapat membuka semua card ke tampilan penuh.

Role: `coo`, `developer`, `creative`, `digital-marketer`, `project-manager`. UI menggunakan label COO, Developer, Creative, Digital Marketer, Project Manager. User boleh menggunakan nama pada alamat Gmail. Jangan tampilkan nama pribadi sebagai PIC di board/laporan.

| Role             | View                                          | Mutasi                                     |
| ---------------- | --------------------------------------------- | ------------------------------------------ |
| COO              | Semua tab                                     | CRUD semua entitas                         |
| Project Manager  | Semua tab                                     | CRUD semua entitas                         |
| Developer        | Execution Board, Feedback Loop                | Hanya `feedback.action`                    |
| Creative         | Execution Board, Feedback Loop                | Hanya `feedback.action`                    |
| Digital Marketer | Execution Board, KPI Dashboard, Feedback Loop | CRUD cycle KPI dan hanya `feedback.action` |

Permission prototipe diperiksa pada navigasi, affordance UI, dan fungsi mutasi store. Implementasi produksi wajib mengulang pemeriksaan ini pada setiap endpoint memakai identitas server. Jangan percaya role dari browser, dan jangan hanya menyembunyikan tombol. Login demo tidak boleh dibawa sebagai login produksi.

## Implementasi backend

Gunakan endpoint CRUD untuk `/clients`, `/tasks`, `/cycles`, `/feedback`, `/users`; update status task dapat memakai `PATCH /tasks/:id`. Sertakan variant array pada operasi cycle atau endpoint anak dengan transaksi konsisten.

Kontrak mutasi mengikuti fungsi murni `saveRecord`, `deleteRecord`, `moveTaskRecord` di JSX. Ganti pemanggilan `commit` pada OpsProvider menjadi adapter API. Setelah mutasi berhasil, perbarui satu cache/store yang sama agar seluruh halaman konsisten. Jangan membuat salinan state terpisah per halaman.

Implementasikan validasi server untuk enum, angka, tanggal, Gmail unik, satu control, unik client+cycle, dan COO aktif terakhir. Gunakan transaksi untuk cycle+variants dan cascade delete client. Tambahkan autentikasi sesungguhnya, audit log, concurrent-update handling, serta backup sesuai keputusan proyek produksi.

Rekomendasi penyimpanan tanggal: due/date/updateDate sebagai tipe DATE; created_at/updated_at sebagai timestamp. Jangan mengubah tanggal deadline lewat konversi UTC yang dapat menggeser hari.

## Skenario penerimaan

1. Buat client → langsung tampil di Clients, board, hub, KPI, dan semua dropdown. Client tanpa cycle tetap bisa membuka KPI tanpa error.
2. Buat task → kartu muncul pada kolom dan tanggal deadline. Ubah role, deadline, nama, status → board, kalender, hub mengikuti.
3. Pindah task Intake langsung QA, lalu kembali Strategy, lalu Done. Semua cara (dropdown/drag) menghasilkan status yang sama.
4. Tandai blocked, ubah deadline ke masa lalu, selesaikan task → health dan counter berubah sesuai rumus.
5. Tambahkan cycle dengan control + tiga varian; simpan, buka ulang, edit satu rate, hapus satu varian. Ringkasan, log, delta dan grafik memakai data terbaru.
6. Nomor cycle duplikat dan rate >100 ditolak tanpa perubahan data. Cycle 0 wajib memiliki satu varian baseline dengan seluruh visit/rate terisi.
7. Tambah feedback, baca detail utuh, ubah checkpoint/prioritas/tindak lanjut, hapus. Banner feedback ikut berubah.
8. Buat user Gmail, ganti role, login sebagai user tersebut. Tab dan mutasi langsung mengikuti role. COO aktif terakhir tidak boleh dihapus/nonaktif.
9. Hapus client: tampil jumlah task/cycle/feedback yang ikut dihapus. Batal tidak mengubah data. Konfirmasi menghapus seluruh relasi client itu saja.
10. Reload mempertahankan data prototipe. Tidak ada data pun seluruh halaman tetap bisa dirender.
11. Kalender: navigasi bulan, Hari ini, tahun kabisat, dan lebih dari tiga task di tanggal yang sama tetap dapat diakses.

## Validasi yang sudah dilakukan

Build produksi berhasil. Lima belas pengujian otomatis meliputi validitas seed, CRUD setiap entitas, cascade, perubahan delapan status, agregasi varian, baseline Cycle 0, migrasi data v5, matriks permission, kontrol UI per role, kontrak aksi terstruktur, role/login, geometri kalender, aturan card Execution Board, alur interaksi React, persistensi reload, dan halaman kosong. Pengujian ini tidak menggantikan UAT visual desktop/mobile, interaksi native drag-and-drop, atau pengujian backend yang belum dibangun.
