# PBM Ops — Developer Handoff

## Arsitektur

Halaman tunggal `PbmOps` dirender melalui Inertia. `DashboardController` menyusun props `auth`, `users`, `operations`, `team`, dan `permissions`. Mutasi React memakai router Inertia dan seluruh endpoint mengembalikan redirect dengan flash message. Tidak ada endpoint JSON untuk UI ini.

Kode utama:

- `app/Http/Controllers/OperationsController.php`: CRUD client, task, cycle, feedback, status task, serta serializer props.
- `app/Http/Controllers/TeamPerformanceController.php`: KPI definitions, laporan mingguan, snapshot metric, dan filter hierarki.
- `app/Http/Controllers/UserController.php`: CRUD akun serta assignment role.
- `app/Http/Controllers/RolePermissionController.php`: pengaturan tab, ability, dan cakupan laporan setiap role.
- `app/Policies`: permission server.
- `app/Http/Requests`: validasi setiap mutasi.
- `resources/js/features/ops/PbmOpsApp.tsx`: UI operasional hasil port MVP.
- `resources/js/features/ops/TeamPerformance.tsx`: UI KPI tim.
- `database/data/ops-demo.json`: data demo yang sama dengan referensi MVP.

## Permission

Permission disimpan pada tabel `role_permissions` dan dapat diedit dari tab Users & Roles. Setiap role memiliki tiga konfigurasi:

- `tabs`: halaman yang tampil dan dapat dibuka.
- `abilities`: CRUD atau tindakan yang dapat dilakukan.
- `report_roles`: role yang rekap Team Performance KPI-nya boleh dibaca.

Nilai awal migration mengikuti matriks MVP sebelumnya. COO dan Project Manager dapat mengelola permission secara default. Sistem menolak perubahan yang membuat tidak ada lagi user aktif yang dapat membuka Users & Roles dan mengelola permission. UI menyembunyikan tombol dan tab berdasarkan konfigurasi yang sama, sedangkan Gate Laravel tetap menjadi kontrol utama untuk setiap request manual.

## Riwayat delivery

Task tidak dihapus otomatis setelah Done. `completed_at` dan `due_at_completion` menyimpan fakta penyelesaian, sedangkan `task_status_events` mencatat setiap perpindahan status. Execution Board hanya menampilkan task Done dari periode yang dipilih secara default. Laporan mingguan dan bulanan tetap dapat menghitung total task, selesai, selesai tepat waktu, belum selesai, serta terlambat tanpa kehilangan histori.

## Snapshot KPI tim

`team_kpi_definitions` adalah konfigurasi KPI aktif. Saat laporan pertama kali disimpan untuk suatu minggu, definisi disalin ke `team_report_metrics`. Perubahan atau penghapusan definisi sesudahnya tidak mengubah laporan lama. Setiap user hanya dapat menulis laporannya sendiri jika memiliki ability `team_reports.submit`. Query laporan mengikuti `report_roles` sebelum data diberikan ke frontend.

## Aturan penting

- Email user harus memakai domain `gmail.com`.
- Task ditugaskan ke role, bukan user tertentu.
- Cycle 0 wajib memiliki tepat satu varian baseline dengan semua angka terisi.
- Cycle 1 dan seterusnya wajib memiliki satu control dan minimal satu varian uji.
- Akses KPI Settings mengikuti ability `team_kpi.manage`; default-nya hanya COO.
- COO aktif terakhir dan akun yang sedang dipakai tidak dapat dihapus.
- Operations Hub, kalender, dan laporan delivery membaca tabel `tasks` yang sama dengan Execution Board.

## Deployment

Gunakan MySQL dengan charset `utf8mb4`. Jalankan migration sebelum build dirilis. Pastikan `APP_ENV=production`, `APP_DEBUG=false`, `APP_URL` benar, HTTPS aktif, dan kredensial seeder diganti atau seeder demo tidak dijalankan pada database produksi.
