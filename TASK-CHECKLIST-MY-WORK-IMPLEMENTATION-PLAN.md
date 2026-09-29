# Implementation Plan — Checklist Ownership, Deadline, Reordering, dan My Work

**Project:** PBM Ops Board  
**Stack:** Laravel, Inertia, React, TypeScript, Tailwind CSS 4, MySQL  
**Status:** Ready for implementation  
**Tanggal:** 28 September 2026

## 1. Ringkasan keputusan

Task Board tetap menjadi alat koordinasi utama untuk COO dan Project Manager. Calendar tetap digunakan untuk melihat distribusi deadline. Sebuah view baru bernama **Pekerjaan Saya** akan menjadi tampilan kerja harian bagi tim delivery.

Checklist menjadi unit kerja operasional di dalam sebuah task. Setiap checklist memiliki PIC utama, deadline, status selesai, dan urutan. Semua role dapat menyelesaikan checklist yang ditugaskan kepada role mereka. COO dan Project Manager dapat mengelola seluruh isi dan urutan checklist.

Navigasi Task Board akan memiliki tiga view:

1. **Pekerjaan Saya** — menentukan pekerjaan yang harus dilakukan sekarang.
2. **Board** — memantau posisi task per client dan status delivery.
3. **Calendar** — melihat jadwal dan deadline task serta checklist.

Default view:

- COO dan Project Manager: **Board**.
- Role delivery lainnya: **Pekerjaan Saya**.

## 2. Masalah yang diselesaikan

Board saat ini efektif untuk menjawab posisi sebuah task, tetapi belum efektif untuk menjawab pertanyaan harian anggota tim: **“Apa yang harus saya kerjakan sekarang?”**

Satu task dapat melibatkan beberapa divisi dan berisi beberapa langkah kerja, tetapi seluruh checklist saat ini belum memiliki penanggung jawab dan deadline masing-masing. Akibatnya, anggota tim harus membuka task satu per satu, menafsirkan urutan pekerjaan, dan mencari sendiri bagian yang menjadi tanggung jawabnya.

Jika kondisi ini dibiarkan:

- Tim delivery sulit menentukan prioritas harian.
- PM harus berulang kali mengarahkan pekerjaan secara manual.
- Checklist tidak dapat dipakai sebagai sumber status eksekusi yang akurat.
- Keterlambatan per langkah baru terlihat ketika deadline task sudah terlewati.

## 3. Tujuan

### Tujuan pengguna

- Anggota tim dapat menemukan pekerjaan yang harus dilakukan hari ini dalam satu tampilan.
- Setiap checklist memiliki PIC dan deadline yang jelas.
- PIC checklist dapat memperbarui status pekerjaannya sendiri tanpa menunggu PM atau COO.
- PM dan COO dapat menyusun ulang serta mengelola checklist langsung dari detail task.
- Struktur Board per client tetap dipertahankan.

### Indikator keberhasilan

- Minimal 80% anggota delivery menggunakan Pekerjaan Saya pada minggu pertama.
- Minimal 90% checklist aktif memiliki PIC dan deadline setelah masa penyesuaian satu minggu.
- Anggota tim dapat menemukan pekerjaan berikutnya dalam waktu kurang dari 30 detik.
- Checklist yang selesai diperbarui oleh PIC pada hari yang sama.
- Pertanyaan rutin kepada PM mengenai “hari ini mengerjakan apa” berkurang secara nyata setelah dua minggu.

## 4. Di luar scope versi ini

- Komentar atau diskusi per checklist.
- Attachment atau bukti kerja per checklist.
- Estimasi jam dan time tracking.
- Dependency otomatis antar-checklist.
- Notifikasi email, WhatsApp, atau push notification.
- Checklist dengan lebih dari satu PIC utama.
- Sub-checklist bertingkat.
- Riwayat audit lengkap setiap perubahan checklist.
- Priority terpisah pada checklist; priority tetap mengikuti task induk.

Pembatasan ini menjaga checklist tetap sederhana dan mencegahnya berubah menjadi task management system kedua di dalam task.

## 5. Model kerja

### Task

Task tetap menjadi wadah pekerjaan per client dan memiliki:

- Client.
- Jenis pekerjaan: Build, Optimization, atau Quick.
- Status: Intake, In Progress, Review, atau Done.
- PIC yang terlibat.
- Deadline task.
- Priority.
- Brief.
- Checklist proses.

### Checklist

Setiap checklist memiliki:

| Field | Aturan |
|---|---|
| Nama | Wajib, maksimal 255 karakter |
| PIC utama | Satu role, wajib untuk checklist baru |
| Deadline | Satu tanggal, wajib untuk checklist baru |
| Status | Belum selesai atau Selesai |
| Urutan | Angka berurutan mulai dari 0 |
| Task induk | Wajib |

Keputusan menggunakan satu PIC utama bertujuan menjaga akuntabilitas. Role lain yang terlibat tetap dicatat pada PIC task induk.

### Aturan deadline

- Deadline checklist dapat berbeda untuk setiap langkah.
- Jika deadline checklist melewati deadline task, UI menampilkan peringatan sebelum disimpan.
- Peringatan tidak memblokir COO/PM karena terdapat kasus handoff atau perubahan jadwal.
- Mengubah deadline task tidak otomatis menimpa deadline checklist yang sudah diatur.
- Checklist lama yang belum memiliki deadline masuk kelompok **Belum dijadwalkan**.
- Perbandingan overdue menggunakan timezone aplikasi `Asia/Jakarta`.

### Aturan urutan

- COO dan PM dapat memindahkan urutan checklist dengan drag-and-drop.
- Pada mobile dan untuk aksesibilitas, tersedia tombol **Naik** dan **Turun**.
- Nomor langkah diperbarui otomatis setelah urutan disimpan.
- Perubahan urutan disimpan dalam satu transaksi database.
- Reordering tidak mengubah status, PIC, atau deadline checklist.

## 6. Authorization

### Matriks permission

| Tindakan | COO/PM | PIC checklist | Role lain |
|---|---:|---:|---:|
| Melihat checklist | Ya | Ya | Ya, jika dapat melihat task |
| Mengubah status checklist | Ya | Ya | Tidak |
| Mengubah nama | Ya | Tidak | Tidak |
| Mengubah PIC | Ya | Tidak | Tidak |
| Mengubah deadline | Ya | Tidak | Tidak |
| Menambah checklist | Ya | Tidak | Tidak |
| Menghapus checklist | Ya | Tidak | Tidak |
| Mengubah urutan | Ya | Tidak | Tidak |

Makna “seluruh role dapat mengubah checklist” pada versi ini adalah setiap role delivery dapat mengubah status checklist yang PIC-nya sama dengan role user tersebut. COO dan PM tetap dapat mengubah status semua checklist.

Permission harus diterapkan pada:

- Tombol dan input React.
- Laravel Gate atau Policy.
- Validasi endpoint backend.

Menyembunyikan tombol di frontend saja tidak dianggap cukup.

## 7. Rancangan Pekerjaan Saya

### Tujuan view

Pekerjaan Saya harus dapat dipahami tanpa penjelasan tambahan. Setelah membuka halaman, user langsung melihat pekerjaan paling mendesak yang menjadi tanggung jawabnya.

### Kelompok daftar

Urutan tampilan:

1. **Terlambat** — deadline sebelum hari ini dan belum selesai.
2. **Hari Ini** — deadline hari ini dan belum selesai.
3. **Berikutnya** — deadline dalam tujuh hari setelah hari ini.
4. **Belum Dijadwalkan** — checklist milik user tanpa deadline.
5. **Selesai Hari Ini** — collapsed secara default.

Checklist dengan deadline lebih dari tujuh hari tidak ditampilkan secara default. User dapat memilih filter **Semua pekerjaan** untuk melihatnya.

### Bentuk item

Setiap item menampilkan:

- Checkbox status.
- Nama checklist.
- Nama client.
- Nama task induk.
- Deadline atau jumlah hari keterlambatan.
- Jenis pekerjaan task.
- PIC.
- Indikator urgent jika task induknya urgent.
- Aksi **Buka task**.

Informasi seperti brief, cycle, seluruh PIC task, dan metadata lainnya hanya muncul di detail task.

### Task tanpa checklist

Quick task dapat tidak memiliki checklist. Agar tetap muncul di Pekerjaan Saya:

- Task tanpa checklist diperlakukan sebagai satu item kerja.
- PIC dan deadline menggunakan nilai dari task.
- Checkbox selesai memindahkan status task ke Done.
- Item menampilkan label kecil **Task langsung** agar berbeda dari checklist.

### Sorting

Urutan di dalam setiap kelompok:

1. Task urgent.
2. Deadline paling dekat.
3. Urutan checklist.
4. Nama client.

### Filter

Filter utama:

- Pekerjaan Saya.
- Semua Tim, hanya untuk role yang memiliki akses pengawasan.
- Client.
- PIC/role, hanya untuk COO dan PM.
- Jenis pekerjaan.
- Tampilkan pekerjaan selesai.

Filter lanjutan ditempatkan dalam satu kontrol **Filter** agar header tidak penuh.

### Empty state

- Tidak ada pekerjaan hari ini: **“Tidak ada pekerjaan yang jatuh tempo hari ini.”**
- Semua pekerjaan selesai: **“Pekerjaan hari ini selesai.”**
- Tidak ada checklist untuk role: **“Belum ada checklist yang ditugaskan kepada role Anda.”**

## 8. Perubahan detail task

Detail task tetap ringkas dan mempertahankan struktur yang sudah dibuat.

Untuk setiap checklist, tampilkan:

- Drag handle bagi COO/PM.
- Checkbox status.
- Nomor urutan.
- Nama checklist.
- PIC role.
- Deadline.
- Label Belum/Selesai.
- Indikator overdue.

Mode baca dan mode edit dipisahkan:

- **Mode baca:** PIC dapat mencentang checklist secara langsung.
- **Mode edit:** COO/PM dapat mengubah nama, PIC, deadline, urutan, menambah, dan menghapus checklist.

Perubahan status disimpan langsung. Perubahan struktur disimpan melalui tombol **Simpan checklist** agar beberapa perubahan dapat divalidasi dan dikirim dalam satu transaksi.

## 9. Calendar

Calendar akan menampilkan dua jenis item:

- Deadline task.
- Deadline checklist.

Checklist menggunakan tampilan yang lebih kecil dan memiliki label PIC. Jika jumlah item dalam satu tanggal terlalu banyak, Calendar menampilkan jumlah tambahan dan membuka daftar hari ketika diklik.

Filter Calendar:

- Hanya task.
- Hanya checklist.
- Semua deadline.
- PIC.
- Client.

Default untuk role delivery adalah checklist miliknya. Default COO/PM adalah semua deadline.

## 10. Operations Hub dan laporan

Versi pertama tidak mengubah formula laporan task mingguan dan bulanan. Data checklist dipakai untuk monitoring tambahan:

- Checklist overdue aktif.
- Checklist jatuh tempo hari ini.
- Checklist tanpa PIC.
- Checklist tanpa deadline.
- Completion rate checklist pada periode terpilih.

Kartu monitoring checklist dapat ditambahkan setelah Pekerjaan Saya stabil. Endpoint dan query sebaiknya dirancang agar data tersebut mudah ditambahkan tanpa migrasi ulang.

## 11. Perubahan database

Tambahkan kolom pada `task_checklist_items`:

| Kolom | Tipe | Catatan |
|---|---|---|
| `pic_role` | string nullable + index | Menggunakan value dari `UserRole` |
| `due` | date nullable + index | Deadline checklist |
| `completed_at` | date nullable | Diisi ketika status berubah menjadi selesai |

Kolom yang sudah ada tetap digunakan:

- `task_id`.
- `label`.
- `completed`.
- `position`.
- timestamps.

Index yang disarankan:

- `(pic_role, completed, due)` untuk query Pekerjaan Saya.
- `(task_id, position)` untuk detail task dan reordering.

### Migrasi data lama

- `pic_role` checklist lama diisi dari PIC utama task.
- `due` checklist lama diisi dari deadline task.
- `completed_at` checklist yang sudah selesai diisi dari `updated_at` sebagai nilai awal.
- Task tanpa checklist tidak perlu dibuatkan checklist otomatis.
- Migrasi tidak menghapus task, status lama, maupun riwayat yang sudah ada.

## 12. Perubahan backend

### Model dan serialization

`TaskChecklistItem` perlu mendukung:

- `pic_role`.
- `due`.
- `completed_at`.
- Cast boolean dan date.

Payload task ke Inertia harus menyertakan seluruh field checklist tersebut.

### Validasi

- `label`: wajib dan maksimal 255 karakter.
- `picRole`: harus sesuai enum role yang aktif.
- `due`: tanggal valid.
- `completed`: boolean.
- `position`: integer non-negatif dan unik di dalam task.
- Maksimal 50 checklist per task.

### Persistensi checklist

Mekanisme saat ini yang menghapus lalu membuat ulang seluruh checklist perlu diganti dengan **upsert berdasarkan ID**. Tujuannya:

- ID checklist tetap stabil.
- Status tidak hilang saat nama, PIC, deadline, atau urutan berubah.
- Referensi dari Pekerjaan Saya tidak berubah.
- `completed_at` dapat dipertahankan.

Dalam satu transaksi:

1. Validasi semua item.
2. Update item yang memiliki ID dan memang milik task tersebut.
3. Buat item baru.
4. Hapus item lama yang tidak lagi dikirim.
5. Normalisasi `position` menjadi 0 sampai N-1.

### Endpoint

Rute yang dibutuhkan:

- `PATCH /tasks/{task}/checklist/{item}/status` — mengubah status satu checklist.
- `PUT /tasks/{task}/checklist` — menyimpan nama, PIC, deadline, tambah/hapus, dan urutan.

Endpoint status harus ringan agar checkbox terasa langsung. Endpoint struktur hanya dapat digunakan COO/PM.

### Query Pekerjaan Saya

Data sebaiknya dikirim melalui Inertia props, bukan REST fetch.

Query harus:

- Memuat checklist beserta task dan client.
- Membatasi checklist berdasarkan role user untuk role delivery.
- Membolehkan COO/PM memilih semua role.
- Menggunakan timezone aplikasi.
- Menghasilkan kelompok overdue, today, upcoming, unscheduled, dan completedToday.
- Menyertakan task tanpa checklist sebagai item kerja langsung.

## 13. Perubahan frontend

Komponen yang disarankan:

- `TaskViewToggle` — Pekerjaan Saya, Board, Calendar.
- `MyWorkView` — container dan filter.
- `WorkSection` — kelompok Terlambat, Hari Ini, dan seterusnya.
- `WorkListItem` — satu checklist atau task langsung.
- `ChecklistRow` — tampilan checklist pada detail task.
- `ChecklistEditor` — CRUD dan reorder checklist.
- `ChecklistAssigneeSelect` — pilihan role.
- `ChecklistDueField` — input deadline dan warning deadline task.
- `ChecklistReorderControls` — drag handle serta tombol Naik/Turun.

State tampilan seperti view aktif dan filter boleh disimpan pada URL query parameter atau session browser. Data bisnis tetap berasal dari database melalui Inertia.

## 14. User stories

### Role delivery

- Sebagai anggota delivery, saya ingin melihat checklist milik saya yang overdue dan jatuh tempo hari ini agar saya tahu apa yang harus dikerjakan lebih dahulu.
- Sebagai PIC checklist, saya ingin menandai pekerjaan selesai langsung dari Pekerjaan Saya atau detail task agar status delivery selalu aktual.
- Sebagai anggota delivery, saya ingin membuka task induk dari checklist agar saya dapat membaca brief dan konteks pekerjaan.

### Project Manager

- Sebagai PM, saya ingin menetapkan PIC dan deadline per checklist agar setiap langkah memiliki tanggung jawab yang jelas.
- Sebagai PM, saya ingin menyusun ulang checklist agar urutan proses sesuai kebutuhan delivery.
- Sebagai PM, saya ingin melihat pekerjaan seluruh tim berdasarkan urgency agar saya dapat menangani keterlambatan lebih cepat.

### COO

- Sebagai COO, saya ingin melihat checklist overdue dan belum terjadwal agar saya dapat menilai risiko delivery.
- Sebagai COO, saya ingin memiliki akses penuh pada struktur dan status checklist agar saya dapat melakukan koreksi ketika diperlukan.

## 15. Acceptance criteria

### PIC dan deadline

- [ ] Form checklist COO/PM memiliki field PIC dan deadline.
- [ ] PIC hanya dapat dipilih dari role yang tersedia.
- [ ] Deadline checklist terlihat pada detail task dan Pekerjaan Saya.
- [ ] Deadline yang melewati deadline task menghasilkan warning yang jelas.
- [ ] Checklist lama tetap tersedia setelah migrasi.

### Reordering

- [ ] COO/PM dapat mengubah urutan dengan drag-and-drop pada desktop.
- [ ] COO/PM dapat menggunakan tombol Naik/Turun pada mobile.
- [ ] Urutan baru bertahan setelah halaman dimuat ulang.
- [ ] Reordering tidak mengubah status, PIC, atau deadline.

### Status checklist

- [ ] PIC checklist dapat menandai checklist miliknya selesai atau belum selesai.
- [ ] COO/PM dapat mengubah status seluruh checklist.
- [ ] Role yang bukan PIC tidak dapat mengubah status checklist tersebut.
- [ ] Backend mengembalikan 403 untuk perubahan yang tidak berizin.
- [ ] Menandai selesai mengisi `completed_at`.
- [ ] Membatalkan selesai mengosongkan `completed_at`.
- [ ] Progress task diperbarui setelah status checklist berubah.

### Pekerjaan Saya

- [ ] Role delivery membuka Task Board dan masuk ke Pekerjaan Saya secara default.
- [ ] COO/PM tetap masuk ke Board secara default.
- [ ] Checklist dikelompokkan menjadi Terlambat, Hari Ini, Berikutnya, Belum Dijadwalkan, dan Selesai Hari Ini.
- [ ] Checklist milik role lain tidak muncul pada Pekerjaan Saya role delivery.
- [ ] Task tanpa checklist tetap muncul sebagai task langsung.
- [ ] Checkbox dapat diperbarui langsung dari list.
- [ ] Setiap item dapat membuka detail task induk.
- [ ] Tampilan tetap mudah digunakan pada mobile dan tablet.

### Calendar

- [ ] Deadline task dan checklist muncul pada tanggal yang benar.
- [ ] PIC dan nama task induk dapat dikenali dari item checklist.
- [ ] Filter task/checklist dan PIC bekerja konsisten.

## 16. Skenario pengujian

### Backend feature tests

- COO membuat checklist dengan PIC dan deadline.
- PM mengubah nama, PIC, deadline, serta urutan checklist.
- Developer menyelesaikan checklist dengan PIC Developer.
- Developer ditolak ketika mencoba mengubah checklist milik Creative.
- COO dan PM dapat mengubah status checklist role mana pun.
- Role delivery ditolak ketika mencoba menambah, menghapus, atau reorder checklist.
- Checklist dengan ID milik task lain ditolak.
- Upsert mempertahankan ID dan status item yang tidak dihapus.
- `completed_at` mengikuti perubahan status.
- Query Pekerjaan Saya mengelompokkan tanggal dengan benar pada timezone Jakarta.
- Task tanpa checklist muncul sebagai task langsung.

### Frontend checks

- Empty, loading, validation error, dan permission state.
- Desktop, tablet, dan mobile.
- Drag-and-drop desktop.
- Tombol Naik/Turun mobile.
- Checkbox optimistic state dan rollback jika server menolak.
- Filter Pekerjaan Saya.
- Navigasi dari item ke detail task.
- Calendar task dan checklist.

### Regression checks

- CRUD task tetap bekerja.
- Multi-PIC task tetap bekerja.
- Board per client tetap tersedia.
- Filter PIC dan Done archive tetap bekerja.
- Operations Hub dan laporan task tidak berubah hasilnya.
- Authorization dinamis tab dan role tetap bekerja.

## 17. Tahapan implementasi

### Fase 1 — Data dan authorization

1. Buat migration field checklist.
2. Backfill PIC, deadline, dan completed_at.
3. Update model dan payload Inertia.
4. Buat policy/Gate status checklist dan pengelolaan struktur.
5. Refactor sinkronisasi checklist menjadi upsert.
6. Tambahkan backend feature tests.

### Fase 2 — Checklist editor

1. Tambahkan PIC dan deadline pada form task.
2. Perbarui detail task.
3. Implementasikan perubahan status langsung.
4. Implementasikan drag-and-drop serta Naik/Turun.
5. Verifikasi permission COO, PM, dan delivery.

### Fase 3 — Pekerjaan Saya

1. Buat query dan Inertia props.
2. Buat grouping dan sorting.
3. Buat list item checklist dan task langsung.
4. Tambahkan filter.
5. Terapkan default view berdasarkan role.
6. Uji desktop, tablet, dan mobile.

### Fase 4 — Calendar dan hardening

1. Tambahkan deadline checklist ke Calendar.
2. Tambahkan filter Calendar.
3. Jalankan seluruh regression test.
4. Periksa performa query dan tambahkan index bila diperlukan.
5. Jalankan build produksi dan visual QA.

## 18. Risiko dan mitigasi

| Risiko | Mitigasi |
|---|---|
| Checklist menjadi terlalu kompleks | Batasi field hanya nama, PIC, deadline, status, dan urutan |
| Tanggung jawab tidak jelas | Gunakan satu PIC utama per checklist |
| User mengubah pekerjaan divisi lain | Enforce authorization pada backend |
| Data status hilang ketika checklist diedit | Gunakan upsert berbasis ID, bukan delete-and-recreate |
| Pekerjaan Saya kembali menjadi daftar panjang | Default hanya overdue, hari ini, tujuh hari ke depan, dan belum terjadwal |
| Deadline checklist tidak konsisten dengan task | Tampilkan warning jika melewati deadline task |
| Drag-and-drop sulit di mobile | Sediakan tombol Naik dan Turun |
| Query melambat ketika data bertambah | Tambahkan composite index dan eager loading yang terukur |

## 19. Keputusan default untuk implementasi

Keputusan berikut dianggap sudah disetujui kecuali diubah sebelum coding:

- Nama view: **Pekerjaan Saya**.
- Satu PIC utama per checklist.
- PIC checklist adalah role, bukan user individual.
- Status checklist tetap dua keadaan: Belum selesai dan Selesai.
- Semua role dapat mengubah checklist yang ditugaskan kepada role mereka.
- COO dan PM dapat mengubah seluruh status dan struktur checklist.
- Checklist baru wajib memiliki PIC dan deadline.
- Data lama menggunakan PIC utama dan deadline task sebagai hasil backfill.
- View delivery default adalah Pekerjaan Saya.
- View COO/PM default adalah Board.
- Task Quick tanpa checklist muncul sebagai task langsung.
- Deadline yang melewati deadline task menghasilkan warning, bukan hard block.

## 20. Definition of done

Fitur dianggap selesai apabila:

- Migration dapat dijalankan pada database existing tanpa kehilangan data.
- Seluruh acceptance criteria P0 terpenuhi.
- Test backend, TypeScript check, dan production build lulus.
- Permission telah diuji dengan akun COO, PM, Developer, Creative, dan Digital Marketer.
- Tampilan Pekerjaan Saya serta detail task telah diperiksa pada desktop, tablet, dan mobile.
- Checklist dapat diubah statusnya oleh PIC dan dikelola strukturnya oleh COO/PM.
- Board, Calendar, Operations Hub, dan laporan task tidak mengalami regression.
- Dokumentasi handoff developer diperbarui setelah implementasi final.
