# PBM Ops — Developer Handoff

## Arsitektur

Halaman tunggal `PbmOps` dirender melalui Inertia. `DashboardController` menyusun props `auth`, `users`, `operations`, dan `team`. Mutasi React memakai router Inertia dan seluruh endpoint mengembalikan redirect dengan flash message. Tidak ada endpoint JSON untuk UI ini.

Kode utama:

- `app/Http/Controllers/OperationsController.php`: CRUD client, task, cycle, feedback, status task, serta serializer props.
- `app/Http/Controllers/TeamPerformanceController.php`: KPI definitions, laporan mingguan, snapshot metric, dan filter hierarki.
- `app/Http/Controllers/UserController.php`: CRUD akun serta assignment role.
- `app/Policies`: permission server.
- `app/Http/Requests`: validasi setiap mutasi.
- `resources/js/features/ops/PbmOpsApp.tsx`: UI operasional hasil port MVP.
- `resources/js/features/ops/TeamPerformance.tsx`: UI KPI tim.
- `database/data/ops-demo.json`: data demo yang sama dengan referensi MVP.

## Permission

| Role | Akses |
|---|---|
| COO | CRUD seluruh modul dan KPI Settings; melihat semua laporan tim |
| Project Manager | CRUD seluruh modul kecuali KPI Settings; melihat semua laporan tim |
| CMO | View Execution Board, Client KPI, Feedback, Team KPI; melihat lini marketing |
| Marketing Manager | View Execution Board dan Feedback; Team KPI untuk diri sendiri, Content Specialist, Appointment Setter |
| Digital Marketer | View Execution Board/Feedback, CRUD Client KPI, edit tindak lanjut feedback, Team KPI sendiri |
| Developer | View Execution Board/Feedback, edit tindak lanjut feedback, Team KPI sendiri |
| Creative | View Execution Board/Feedback, edit tindak lanjut feedback, Team KPI sendiri |
| Content Specialist | View Execution Board/Feedback dan Team KPI sendiri |
| Appointment Setter | View Execution Board/Feedback dan Team KPI sendiri |

UI menyembunyikan tombol dan tab sesuai role. Gate Laravel tetap menjadi kontrol utama, sehingga request manual tidak dapat melewati permission.

## Riwayat delivery

Task tidak dihapus otomatis setelah Done. `completed_at` dan `due_at_completion` menyimpan fakta penyelesaian, sedangkan `task_status_events` mencatat setiap perpindahan status. Execution Board hanya menampilkan task Done dari periode yang dipilih secara default. Laporan mingguan dan bulanan tetap dapat menghitung total task, selesai, selesai tepat waktu, belum selesai, serta terlambat tanpa kehilangan histori.

## Snapshot KPI tim

`team_kpi_definitions` adalah konfigurasi KPI aktif. Saat laporan pertama kali disimpan untuk suatu minggu, definisi disalin ke `team_report_metrics`. Perubahan nama atau target sesudahnya tidak mengubah laporan lama. Setiap user hanya dapat menulis laporannya sendiri. Query laporan mengikuti hierarki role sebelum data diberikan ke frontend.

## Aturan penting

- Email user harus memakai domain `gmail.com`.
- Task ditugaskan ke role, bukan user tertentu.
- Cycle 0 wajib memiliki tepat satu varian baseline dengan semua angka terisi.
- Cycle 1 dan seterusnya wajib memiliki satu control dan minimal satu varian uji.
- Hanya COO yang dapat mengubah KPI Settings.
- COO aktif terakhir dan akun yang sedang dipakai tidak dapat dihapus.
- Operations Hub, kalender, dan laporan delivery membaca tabel `tasks` yang sama dengan Execution Board.

## Deployment

Gunakan MySQL dengan charset `utf8mb4`. Jalankan migration sebelum build dirilis. Pastikan `APP_ENV=production`, `APP_DEBUG=false`, `APP_URL` benar, HTTPS aktif, dan kredensial seeder diganti atau seeder demo tidak dijalankan pada database produksi.
