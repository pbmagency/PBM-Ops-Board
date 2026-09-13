# PBM Ops

PBM Ops adalah aplikasi internal agency berbasis Laravel 12, Inertia, React 19, TypeScript, Tailwind CSS 4, dan MySQL. Laravel menangani autentikasi, authorization, validasi, query, serta persistence. React menerima data melalui Inertia props; aplikasi tidak memakai REST API atau penyimpanan browser sebagai sumber data.

## Fitur

- Execution Board dengan CRUD task, perpindahan ke seluruh status, kartu urgent, filter PIC dropdown, kalender, filter task Done, dan laporan delivery mingguan/bulanan.
- Operations Hub yang memakai data task yang sama dengan Execution Board.
- Client Performance KPI dengan CRUD cycle, Cycle 0 sebagai baseline launch pertama, dan banyak varian uji per cycle.
- Team Performance KPI sederhana untuk angka KPI serta hasil utama, penyebab target tidak tercapai, rencana minggu depan, dan keputusan yang dibutuhkan.
- Riwayat KPI tim dengan bar chart dan pembatasan hierarki laporan.
- KPI Settings dinamis khusus COO.
- Feedback Loop dengan CRUD, pagination, dan izin edit tindak lanjut untuk Developer, Creative, dan Digital Marketer.
- CRUD client dan user, termasuk aktivasi akun serta assign role.
- Autentikasi email/password Laravel dan authorization di server.
- Navigasi desktop serta breadcrumb mobile/tablet yang memuat role dan logout.

## Menjalankan aplikasi

1. Salin `.env.example` menjadi `.env`.
2. Buat database MySQL bernama `pbm_ops`, lalu sesuaikan `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, dan `DB_PASSWORD`.
3. Jalankan:

```bash
composer install
php artisan key:generate
php artisan migrate --seed
npm install
npm run build
php artisan serve
```

Untuk pengembangan frontend, gunakan `npm run dev` pada terminal kedua.

## Akun data awal

Semua akun memakai password `password`:

| Role | Email |
|---|---|
| COO | `coo@gmail.com` |
| Project Manager | `projectmanager@gmail.com` |
| CMO | `cmo@gmail.com` |
| Marketing Manager | `marketingmanager@gmail.com` |
| Digital Marketer | `digitalmarketer@gmail.com` |
| Creative | `creative@gmail.com` |
| Developer | `developer@gmail.com` |
| Content Specialist | `contentspecialist@gmail.com` |
| Appointment Setter | `appointmentsetter@gmail.com` |

Ganti password akun data awal sebelum digunakan pada lingkungan produksi.

## Pemeriksaan

```bash
php artisan test
vendor/bin/pint --test
npm test
npm run build
```

Detail struktur data, permission, dan aturan bisnis tersedia di [DEVELOPER-HANDOFF.md](DEVELOPER-HANDOFF.md).
