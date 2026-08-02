# Design Handoff — DataHub Sentinel

Folder ini berisi hasil export Stitch dan screenshot implementasi browser.

Prompt aktif: `../docs/STITCH-PROMPTS-V3.md`

Versi lama sudah usang, jangan dipakai:
- `../docs/STITCH-PROMPTS.md` (v1) — palet warna beda dari `DESIGN.md`.
- `../docs/STITCH-PROMPTS-V2.md` — benar palet, tapi belum punya blok anti-slop dan kosakata depth/luminance.

## Urutan kirim ke Stitch

1. BLOK A (MASTER)
2. BLOK B (ANTI-SLOP)
3. Baru BLOK 1..8, satu per satu.

## Nama file yang diharapkan

- `01-overview.png` — control room overview
- `02-scan-risks.png` — scan & risks + detail drawer
- `03-proposal-review.png` — proposal, approval, verification (paling menentukan)
- `04-runbook-viewer.png` — runbook document
- `05-citation-trail.png` — audit trail
- `06-chat-agent.png` — operator console
- `07-settings.png` — connection & safety settings
- `08-design-system.png` — token dan komponen

Prioritas kalau waktu terbatas: `01`, `03`, `02`.

## Setelah export

Bilang ke agent: "desain sudah di design/". Agent akan membaca gambarnya lalu implementasi ke kode dan verifikasi di browser.

## Aturan

- Jangan simpan token, URL workspace nyata, data pribadi, atau screenshot kredensial di folder ini.
- Asset demo boleh memakai synthetic data, tetapi aplikasi harus tetap memberi badge `DEMO · FIXTURES`.
- Simpan screenshot browser hasil implementasi di `design/implemented/` supaya beda jelas antara desain referensi dan produk yang benar-benar berjalan.
