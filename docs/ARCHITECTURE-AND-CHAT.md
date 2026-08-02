# DataHub Sentinel — Arsitektur Produk dan Chat Agent

## Tujuan

DataHub Sentinel adalah agent data reliability yang mengubah metadata DataHub menjadi tindakan yang bisa diaudit:

- menemukan metadata yang hilang atau berisiko;
- menghitung health dan risk score;
- memprediksi risiko berdasarkan evidence yang tersedia;
- membuat proposal perbaikan;
- meminta persetujuan manusia;
- menulis perubahan yang aman ke DataHub Cloud;
- memverifikasi perubahan dengan read-back;
- menyimpan citation dan runbook.

Kita tidak menjual klaim “AI memperbaiki semuanya”. Nilai utamanya adalah closed loop yang terkontrol dan dapat dibuktikan.

## Stack final MVP

```text
Next.js + TypeScript
├── App Router UI
├── Server route untuk DataHub token
├── Adapter: FixtureAdapter | CloudAdapter
├── Deterministic scoring engine
├── Agent planner dengan structured tool calls
├── Citation/runbook service
└── MCP server/bridge opsional

DataHub Cloud
└── metadata, schema, lineage, ownership, tags, documents

Hermes/OpenClaw
└── chat interface yang memanggil Sentinel tools
```

TypeScript dipilih agar satu project mudah dijalankan dengan Node. Bila endpoint atau SDK DataHub tertentu hanya tersedia di Python, kita buat service bridge kecil terpisah sebagai fallback, bukan menjadikan Docker wajib.

## Batas modul

### `DataHubAdapter`

Interface tunggal untuk demo dan Cloud:

```ts
export type DataHubAdapter = {
  search(input: SearchInput): Promise<EntitySummary[]>;
  getEntity(urn: string): Promise<EntityDetail>;
  getLineage(urn: string): Promise<LineageGraph>;
  proposeFix(input: FixInput): Promise<FixProposal>;
  applyFix(input: ApprovedFix): Promise<MutationResult>;
  verifyFix(input: VerificationInput): Promise<VerificationResult>;
};
```

`FixtureAdapter` mengembalikan data sintetis. `CloudAdapter` akan memanggil DataHub Cloud setelah kontrak read diverifikasi. Saat ini `src/lib/cloud/client.ts` menyediakan boundary GraphQL read-only terisolasi dengan injectable `fetch`; client tersebut sudah diuji, tetapi belum diaktifkan oleh `/api/scan`. Semua scoring dan UI tetap harus bergantung pada interface adapter yang sama.

### `Predictor`

Tidak boleh membuat probabilitas palsu seolah-olah berasal dari model statistik yang sudah dilatih. Untuk MVP, sebut sebagai `risk estimate` berbasis rule/evidence dan jelaskan formula.

Input minimal:

- owner ada/tidak;
- deskripsi ada/tidak;
- tag/glossary ada/tidak;
- jumlah upstream/downstream;
- freshness atau timestamp jika tersedia;
- schema change evidence jika tersedia.

Output:

- health score 0–100;
- risk score 0–100;
- severity;
- reasons;
- confidence/evidence quality;
- “what would reduce the risk”.

### `Proposal and Approval`

Setiap mutasi memiliki lifecycle:

```text
proposed → awaiting_approval → approved → applied → verified
                                      └→ rejected
                                      └→ failed
```

UI dan chat wajib menunjukkan URN, field lama, field baru, alasan, confidence, citation, dan dampak sebelum approval.

### `CitationService`

Citation bukan hiasan. Setiap evidence menyimpan:

```json
{
  "citationId": "CIT-<timestamp>-<short-id>",
  "source": "schema|lineage|ownership|usage|rule",
  "entityUrn": "urn:li:dataset:(...)",
  "facts": ["customer_id exists", "downstream count is 3"],
  "confidence": 0.84,
  "createdAt": "ISO-8601"
}
```

### `RunbookService`

Runbook harus menjawab:

- kondisi apa yang ditemukan;
- mengapa berisiko;
- evidence apa yang digunakan;
- tindakan yang disarankan;
- tindakan yang benar-benar diterapkan;
- cara memverifikasi atau membatalkan.

## Endpoint aplikasi yang direncanakan

```text
GET  /api/health
POST /api/scan
POST /api/risk-report
POST /api/proposals
POST /api/proposals/:id/approve
POST /api/proposals/:id/reject
GET  /api/proposals/:id
GET  /api/citations/:id
GET  /api/runbooks/:id
POST /api/chat
```

Semua route yang menggunakan token DataHub harus berjalan server-side.

## Contract chat

Input:

```json
{
  "message": "Scan customer_orders dan cari risiko minggu ini",
  "mode": "demo|cloud",
  "conversationId": "optional"
}
```

Output minimum:

```json
{
  "message": "Saya menemukan 2 risiko yang perlu ditinjau.",
  "actions": [
    {
      "type": "risk_report",
      "entityUrn": "urn:li:dataset:(...)",
      "riskScore": 82,
      "severity": "high",
      "citationIds": ["CIT-example-001"]
    }
  ],
  "requiresApproval": false,
  "mode": "demo"
}
```

Kalimat chat tidak boleh mengklaim mutasi berhasil jika `verifyFix` belum memberi hasil sukses.

## MCP tools untuk Hermes/OpenClaw

MCP adalah interface tambahan, bukan sumber data kedua. Tool names dan output harus memanggil service yang sama dengan UI.

```text
sentinel_scan
sentinel_risk_report
sentinel_propose_fix
sentinel_apply_fix
sentinel_get_runbook
sentinel_get_citations
```

Aturan tool:

- `sentinel_scan` dan `sentinel_risk_report` read-only.
- `sentinel_propose_fix` read-only dan menghasilkan proposal.
- `sentinel_apply_fix` menolak request tanpa `proposalId` dan `approvalToken`/approval state yang valid.
- `sentinel_apply_fix` selalu mengembalikan mutation response dan verification response.
- Tool mengembalikan JSON terstruktur, bukan hanya teks cantik.

Contoh percakapan:

```text
User: Scan customer_orders.
Agent: Menemukan health 61 dan risk 82. Ada 3 downstream. [lihat evidence]

User: Buatkan perbaikannya, jangan terapkan.
Agent: Proposal P-001: tambahkan owner berdasarkan lineage. Confidence 0.72.
        Citation CIT-001. Apply? Tidak, masih menunggu persetujuan.

User: Terapkan P-001.
Agent: Perubahan diterapkan dan diverifikasi di DataHub Cloud. Mutation ID ...
```

## Apa yang membuat submission kuat

1. Deep DataHub usage: search, entity detail, lineage, ownership/tags, mutation, dan read-back.
2. Agent melakukan kerja nyata tetapi guarded: proposal, approval, apply, verify.
3. Originalitas: risk estimate yang evidence-backed, citation trail, dan runbook yang dapat ditindaklanjuti.
4. Demo tidak bergantung pada angka fiktif: semua data demo diberi label dan semua angka live berasal dari response yang disimpan.
5. Integrasi chat menunjukkan agent dapat dipakai dari gateway, bukan hanya dashboard.

## Hal yang tidak boleh dilakukan

- Jangan membuat mock seolah-olah live Cloud.
- Jangan menyatakan probabilitas ilmiah tanpa dataset/training yang mendukung.
- Jangan memberi model akses arbitrary mutation.
- Jangan memasukkan DataHub token ke client-side bundle.
- Jangan menganggap Hermes/OpenClaw otomatis sudah terintegrasi sebelum koneksi diuji.
- Jangan menampilkan 1.104 entity atau angka lain kecuali benar-benar berasal dari fixture atau API response yang jelas sumbernya.
