# PRODUCT REQUIREMENT DOCUMENT (PRD)

| **Project Name** | **QontakSales CRM Platform (MVP)** |
| :--- | :--- |
| **Tech Stack** | **Backend:** Django REST Framework (DRF) <br>**Database:** PostgreSQL <br>**Frontend:** React (Vite + `pnpm`), Bootstrap 5 |
| **Document Version**| 1.0 (MVP Focus) |

---

## 1. Executive Summary & Objective
Tujuan proyek ini adalah membangun platform **SaaS Sales CRM (Minimum Viable Product)** yang berfokus pada efisiensi pengelolaan prospek penjualan (*leads*). Sistem ini mendigitalisasi proses konversi manual melalui visualisasi jalur penjualan (*Sales Pipeline*) berbentuk papan Kanban, pencatatan aktivitas agen secara kronologis, serta penyajian analitik performa penjualan bagi manajemen.

---

## 2. User Personas & Role Matrix
1. **Sales Manager (Owner/Admin):** Mengelola tim sales, melihat dasbor performa kumulatif seluruh agen, memantau total omzet perusahaan, dan mengelola direktori prospek global.
2. **Sales Agent (Tim Lapangan/Online):** Mengelola prospek yang ditugaskan kepadanya, memindahkan kartu oportunitas di Kanban Board, serta mencatat log aktivitas harian dengan klien.

---

## 3. Core Architecture & Multi-Tenancy Flow
* **Data Isolation:** Menggunakan arsitektur *Single-Database Multi-Tenant*. Setiap baris data pada tabel pelanggan, pipeline, dan log aktivitas wajib mengikat `company_id` pengguna untuk menjamin isolasi data antar-perusahaan konsumen SaaS.
* **Role Checking:** Backend DRF menyaring muatan data REST API berdasarkan peran token pengguna. `SALES_AGENT` hanya akan menerima objek data miliknya sendiri (`assigned_to = user_id`).

---

## 4. Feature Requirements (MVP Scope)

### Module 1: Authentication & User Management
* **Multi-tenant Registration:** Registrasi pengguna baru otomatis melahirkan entitas perusahaan (`Company`) baru dan mendaftarkan pendaftar sebagai `SALES_MANAGER`.
* **Agent Creation:** Akun Manager dapat mengundang atau mendaftarkan akun baru untuk stafnya dengan otomatis mengunci `company_id` yang sama dan menetapkan peran `SALES_AGENT`.

### Module 2: Fitur 1 - Manajemen Prospek (Leads & Contact Management)
* **Contact Directory:** Menyimpan profil komprehensif calon pembeli yang meliputi bidang: *Nama Lengkap*, *Nomor HP/WhatsApp*, *Asal Perusahaan*, dan *Nilai Potensi Penjualan (Deal Value)*.
* **Tagging System:** Fitur klasifikasi instan bertipe teks (Tag) untuk memisahkan temperatur prospek.
  * Tag `Hot`: Calon pembeli berniat tinggi / siap bertransaksi.
  * Tag `Cold`: Pertanyaan masuk tahap awal / belum teredukasi.

### Module 3: Fitur 2 - Jalur Penjualan (Sales Pipeline / Kanban Board)
* **Kanban Visualizer:** Menggunakan modul komponen Bootstrap 5 Cards bertipe *drag-and-drop* atau interaksi klik tombol pindah kolom.
* **Standard Stages:** Oportunitas sales wajib mengalir melalui 5 tahapan sekuensial:
  1. `Prospek Baru` (Inisiasi awal data masuk)
  2. `Hubungi` (Sedang dalam proses komunikasi aktif)
  3. `Presentasi/Negosiasi` (Tahap pengajuan proposal dan penawaran harga)
  4. `Won` (Penjualan berhasil - Kesepakatan ditutup dengan sukses)
  5. `Lost` (Penjualan gagal - Prospek membatalkan pembelian)

### Module 4: Fitur 3 - Manajemen Aktivitas & Catatan Sales (Activity Logs)
* **Interaction Timeline:** Halaman detail prospek yang menyajikan riwayat catatan dari Agen secara kronologis terbalik (paling baru berada di atas).
* **Manual Log Entry:** Form isian teks ringkas bagi agen sales untuk mendokumentasikan hasil interaksi lapangan maupun online secara instan setelah selesai menghubungi klien.

### Module 5: Fitur 4 - Dashboard Performa & Laporan (Sales Analytics)
* **KPI Metrics Card:** Menampilkan widget ringkasan data meliputi: *Total Pendapatan Terkonversi* (Akumulasi nilai finansial dari status `Won`), *Win Rate Tim* (Rasio persentase status `Won` terhadap total seluruh prospek), dan *Jumlah Prospek Aktif*.
* **Leaderboard Rank:** Komponen tabel pemeringkat yang mengurutkan pencapaian konversi penjualan Agen teratas dalam satu lingkungan perusahaan.

---

## 5. Technical Specifications & Database Schema (PostgreSQL)

### Django Model Definition Template
```python
# database schema mock-up untuk replikasi ke models.py

class Company(models.Model):
    name = models.CharField(max_length=255)

class CustomUser(AbstractUser):
    company = models.ForeignKey(Company, on_delete=models.CASCADE)
    role = models.CharField(max_length=20, choices=[('MANAGER', 'Sales Manager'), ('AGENT', 'Sales Agent')])

class Lead(models.Model):
    STAGE_CHOICES = [
        ('NEW', 'Prospek Baru'),
        ('CONTACTED', 'Hubungi'),
        ('NEGOTIATION', 'Presentasi/Negosiasi'),
        ('WON', 'Won'),
        ('LOST', 'Lost'),
    ]
    company = models.ForeignKey(Company, on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    phone_number = models.CharField(max_length=20)
    company_source = models.CharField(max_length=255)
    potential_value = models.DecimalField(max_digits=12, decimal_places=2)
    stage = models.CharField(max_length=20, choices=STAGE_CHOICES, default='NEW')
    tag = models.CharField(max_length=50, choices=[('HOT', 'Hot'), ('COLD', 'Cold')])
    assigned_to = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True)

class ActivityLog(models.Model):
    lead = models.ForeignKey(Lead, on_delete=models.CASCADE, related_name='logs')
    agent = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    notes = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
```

---

## 6. Frontend Layout Guide (React + Bootstrap 5)
* `/src/pages/Dashboard.jsx`: Menampilkan kartu metrik finansial menggunakan elemen `.card` Bootstrap bermutasi warna aksen border sesuai status indikator data, dilengkapi tabel peringkat agen teraktif.
* `/src/pages/LeadsDirectory.jsx`: Tabel data responsif untuk manipulasi, pencarian, serta penyaringan daftar kontak klien berdasarkan Tag `Hot`/`Cold`.
* `/src/pages/KanbanPipeline.jsx`: Tampilan multi-kolom berdampingan menggunakan utilitas flexbox Bootstrap (`d-flex flex-row overflow-x-auto`) untuk memetakan distribusi 5 tahapan penjualan.

---

## 7. Non-Functional Requirements
* **Data Security:** Autentikasi menyeluruh menggunakan JWT. Verifikasi token wajib disematkan pada *Header* HTTP Request di setiap permintaan data CRUD dari sisi React client.
* **Query Performance:** Indeksasi database PostgreSQL wajib diterapkan pada kolom kunci penentu filter yaitu `company_id`, `stage`, dan `assigned_to` untuk mencegah latensi ketika total baris aktivitas melonjak tinggi.
