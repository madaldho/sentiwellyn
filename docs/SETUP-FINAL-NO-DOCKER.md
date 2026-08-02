# DataHub Sentinel — Setup Final Tanpa Docker

Dokumen ini adalah jalur utama yang direkomendasikan untuk proyek hackathon. Semua file proyek berada di:

`/Users/madaldho/Proyek/Hackathon/datahub-sentinel`

## Keputusan teknis

- Aplikasi utama: Next.js + TypeScript.
- Backend nyata: DataHub Cloud melalui URL dan token yang kamu miliki.
- Mode cadangan: fixture lokal yang deterministik dan diberi label `DEMO MODE`.
- Chat agent: API Sentinel yang dapat dipanggil dari browser, Hermes, OpenClaw, atau klien MCP.
- Docker: tidak diperlukan untuk development utama.
- Python: tidak diperlukan untuk aplikasi utama MVP.

Catatan penting: memiliki package atau kode konektor DataHub tidak otomatis berarti sudah terhubung ke DataHub. Untuk mode Cloud, tetap diperlukan workspace DataHub Cloud yang aktif, URL, token, dan izin mutasi jika ingin melakukan write-back.

## Apa yang berjalan di mana?

```text
Mac kamu
└── /Users/madaldho/Proyek/Hackathon/datahub-sentinel
    ├── Next.js web app       http://localhost:3000
    ├── API routes / agent    berjalan di server Next.js
    ├── SQLite/JSON lokal     riwayat scan dan citation demo
    └── MCP bridge opsional   untuk Hermes/OpenClaw

DataHub Cloud
└── workspace hosted          URL HTTPS milik workspace kamu
    ├── metadata graph
    ├── entities, schema, lineage
    └── write-back metadata
```

Browser hanya berbicara ke API internal Next.js. Token DataHub tidak boleh dimasukkan ke browser, Git, screenshot, atau prompt Stitch.

## Prasyarat yang sudah ada

Hasil pemeriksaan mesin:

- macOS
- Node.js `v24.11.0`
- Python `3.14.0` (tidak dibutuhkan untuk MVP TypeScript)
- Streamlit terpasang, tetapi tidak dipakai pada jalur final
- Docker belum terpasang dan tidak perlu dipasang
- Ruang disk sekitar 58 GiB dan RAM 16 GB

## Yang perlu disiapkan

1. Akun atau workspace DataHub Cloud yang aktif.
2. DataHub Cloud URL, contoh placeholder: `https://<workspace>.datahub.cloud`.
3. Personal Access Token/API token dengan izin read metadata.
4. Token dengan izin write metadata hanya jika kamu mengaktifkan tombol `Apply Fix`.
5. API key model untuk fitur agent. Untuk development, aplikasi harus tetap dapat berjalan dalam `DEMO MODE` tanpa key tersebut.
6. Akun GitHub publik untuk repository submission.
7. Akun Devpost dan keanggotaan hackathon.

Jangan menaruh token asli di dokumen, source code, commit, atau chat. Gunakan `.env.local`, yang masuk `.gitignore`.

## Satu jalur instalasi

Buka Terminal dan jalankan:

```bash
cd /Users/madaldho/Proyek/Hackathon/datahub-sentinel
node --version
npm --version
npm install
cp .env.example .env.local
```

Isi `.env.local` dengan placeholder berikut. Nama variabel final akan disesuaikan saat implementasi konektor:

```dotenv
# Pilih cloud untuk koneksi nyata, demo untuk tanpa kredensial
DATAHUB_MODE=demo

# Jangan commit file ini
DATAHUB_CLOUD_URL=https://your-workspace.example
DATAHUB_CLOUD_TOKEN=
DATAHUB_ALLOW_MUTATIONS=false

# Provider model yang dipilih saat implementasi
MODEL_API_KEY=
MODEL_NAME=

# Untuk integrasi Hermes/OpenClaw lokal
SENTINEL_MCP_PORT=7331
SENTINEL_PUBLIC_BASE_URL=http://localhost:3000
```

Jalankan mode demo terlebih dahulu:

```bash
npm run dev
```

Buka `http://localhost:3000`. Mode demo harus menampilkan badge `DEMO MODE — fixture data`, sehingga output demo tidak disalahartikan sebagai hasil live DataHub.

Cek readiness API tanpa membuka credential:

```bash
curl -sS http://localhost:3000/api/health
```

Pada mode demo, response memiliki `status: "ok"`. Pada mode Cloud, response tetap `status: "degraded"` sampai adapter read live diverifikasi; endpoint tidak melakukan request DataHub dan tidak mengembalikan token.

## Mengaktifkan DataHub Cloud

Setelah workspace dan token tersedia:

```dotenv
DATAHUB_MODE=cloud
DATAHUB_CLOUD_URL=https://your-real-workspace-url
DATAHUB_CLOUD_TOKEN=isi-di-lokal-saja
DATAHUB_ALLOW_MUTATIONS=false
```

Lalu restart server:

```bash
# hentikan server dengan Ctrl+C
npm run dev
```

Urutan verifikasi yang wajib sebelum tombol write-back dianggap selesai:

1. `Health check`: aplikasi dapat menjangkau URL Cloud.
2. `Read test`: cari satu entity yang memang ada dan tampilkan URN, schema, owner, dan lineage.
3. `Proposal test`: agent membuat usulan perubahan tanpa menulis.
4. `Mutation test`: hanya satu perubahan aman pada entity uji, setelah konfirmasi eksplisit.
5. `Read-back test`: baca ulang entity dan pastikan field berubah sesuai response API.
6. `Revert test`: kembalikan perubahan jika endpoint dan izin mendukung.

Jika salah satu langkah gagal, tetap gunakan `DEMO MODE` untuk UI dan jangan mengklaim live write-back pada video.

## Mode yang tersedia

### `demo`

- Tidak perlu DataHub Cloud, token, atau model API.
- Menggunakan fixture yang tersimpan di `src/lib/fixtures`.
- Cocok untuk membangun UI, menguji scoring, merekam alur tampilan, dan menghindari rate limit.
- Setiap halaman wajib menampilkan badge demo.

### `cloud`

- Parser konfigurasi Cloud dan client GraphQL read-only sudah tersedia sebagai boundary terisolasi dan diuji dengan mock transport.
- Adapter belum diaktifkan pada MVP saat ini.
- Endpoint `/api/scan` mengembalikan HTTP 503 jika URL/token wajib belum ada, dan HTTP 501 jika konfigurasi valid tetapi read adapter belum diverifikasi.
- Setelah adapter aktif, health/risk score harus memakai engine yang sama seperti demo dan menampilkan hasil nyata.
- Mutasi default harus `false` dan selalu membutuhkan konfirmasi manusia.

### Tidak ada `local` pada jalur ini

Kita sengaja tidak menjadikan local DataHub/Docker sebagai prasyarat. Jika nanti diperlukan untuk reproduksi offline, itu adalah jalur tambahan, bukan syarat submission.

## Alur produk yang akan dibangun

```text
User atau chat agent
        ↓
Sentinel command/chat API
        ↓
DataHubAdapter (demo atau cloud)
        ↓
Watcher → Predictor → Proposal → Approval → Healer
        ↓
Citation log + Runbook + dashboard
        ↓
Read-back verification ke DataHub Cloud
```

Keduanya harus memakai interface adapter yang sama. Jangan membuat scoring demo terpisah dari scoring Cloud, karena itu membuat demo sulit dipercaya.

## Integrasi Hermes/OpenClaw

Hermes/OpenClaw bukan tempat utama menyimpan dashboard. Keduanya menjadi interface percakapan yang memanggil tools Sentinel.

Target integrasi:

```text
Telegram/Discord/CLI Hermes/OpenClaw
        ↓
MCP tools atau HTTP API Sentinel
        ↓
Sentinel agent
        ↓
DataHub Cloud
```

Tools yang direncanakan:

- `sentinel_scan`: scan entity atau domain.
- `sentinel_risk_report`: health score dan prediksi risiko.
- `sentinel_propose_fix`: membuat proposal tanpa mutasi.
- `sentinel_apply_fix`: hanya setelah user mengonfirmasi proposal dan entity.
- `sentinel_runbook`: membuat runbook dari evidence.
- `sentinel_citations`: menampilkan alasan dan sumber setiap proposal/fix.

Untuk Hermes, koneksi MCP akan dikonfigurasi setelah server MCP TypeScript dibuat. Jangan mengaku integrasi sudah aktif sebelum `hermes mcp test <nama-server>` benar-benar berhasil. Untuk OpenClaw, gunakan adapter/bridge yang tersedia di environment pengguna; jangan mengirim token DataHub ke frontend atau ke prompt model.

## Alur demo pemenang yang realistis

Demo terbaik tidak menekan tombol `Auto-Fix All` secara membabi buta. Tampilkan kontrol dan bukti:

1. Chat: “Scan dataset customer_orders dan cari risiko 7 hari ke depan.”
2. Sentinel menjawab entity, health score, risk score, downstream impact, dan evidence.
3. Chat: “Buat proposal perbaikan, jangan terapkan dulu.”
4. UI menampilkan diff metadata, confidence, citation, dan runbook.
5. User menekan `Approve this fix` untuk satu perubahan aman.
6. Aplikasi menulis ke DataHub Cloud.
7. Aplikasi membaca ulang entity dan menampilkan `Verified in DataHub`.
8. Chat menjawab ringkas dengan URN, perubahan, citation ID, dan status verifikasi.

Ini lebih kuat secara teknis daripada output angka besar yang tidak dapat diverifikasi.

## Batas keamanan

- Jangan aktifkan mutasi secara default.
- Jangan mengizinkan model menjalankan URL arbitrary atau mengubah entity arbitrary tanpa validasi.
- Whitelist operasi metadata yang didukung.
- Simpan audit event: siapa meminta, entity apa, perubahan apa, evidence apa, timestamp, status API.
- Masking token di log.
- Gunakan fixture untuk data sensitif atau data sintetis.
- Jangan memasukkan token ke prompt Stitch, README, video, screenshot, atau Devpost.

## Troubleshooting cepat

### `npm install` gagal
Periksa Node dan npm, lalu jalankan `npm cache verify`. Jangan langsung menghapus lockfile. Pastikan menjalankan perintah dari folder proyek final.

### Cloud tidak bisa dijangkau
Periksa URL workspace, token, jaringan, dan izin. Jalankan dari server-side route, bukan browser langsung. CORS browser bukan alasan untuk mengekspos token.

### Token dapat membaca tetapi tidak menulis
Itu normal jika permission read-only. Tetap gunakan proposal mode dan aktifkan mutation hanya dengan token/role yang memang diberi izin.

### Model API tidak tersedia
Jalankan `DATAHUB_MODE=demo` dan gunakan deterministic planner/template fallback. Submission tidak boleh bergantung pada satu panggilan model yang tidak dapat diulang.

## Definition of done untuk fase setup

- [x] Folder proyek berada di lokasi final: `/Users/madaldho/Proyek/Hackathon/datahub-sentinel`.
- [x] `npm install` berhasil dan `package-lock.json` tersedia.
- [x] `npm run typecheck` dan `npm run build` berhasil.
- [x] Production dashboard terbuka dan endpoint demo `/api/scan` mengembalikan HTTP 200.
- [x] Filter/search, proposal review, evidence trail, dan guarded demo approval terverifikasi di browser.
- [x] Badge demo terlihat dan mode Cloud yang belum dikonfigurasi mengembalikan HTTP 501 secara jujur.
- [ ] Cloud read berhasil dengan kredensial nyata.
- [ ] Mutation aman berhasil dan diverifikasi read-back; sampai itu selesai fitur tetap proposal-only.
- [ ] Hermes/OpenClaw MCP bridge diuji setelah contract Sentinel stabil.
