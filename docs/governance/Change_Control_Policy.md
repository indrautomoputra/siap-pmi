# Change Control & Freeze Policy

## Prinsip Umum
- Freeze fungsional: tidak menambah fitur baru.
- Operasi disiplin: event-based dan role per event wajib dipertahankan.
- Keputusan kelulusan oleh rapat manusia; sistem hanya mencatat satu keputusan.
- Tidak lintas provinsi.

## Perubahan yang Diizinkan
- Bugfix.
- Hardening (pengetatan guard/validasi).
- Pengetatan RLS/policy di Supabase.
- Kejelasan pesan error (tanpa ubah alur).

## Perubahan yang Dilarang
- Fitur baru.
- Perubahan prinsip event-based/role-per-event.
- Auto-grading atau kalkulasi kelulusan otomatis.
- Menjadikan evaluasi/KAP sebagai syarat kelulusan.
- Akses lintas provinsi.

## Alur Approval Perubahan
- Pengusul menyiapkan proposal singkat: tujuan, dampak, rencana uji.
- Review oleh Governance Steward.
- Persetujuan oleh Operations Lead sebelum eksekusi.
- Eksekusi terkontrol dan capture evidence.

## Format Request Perubahan (Template)
- Judul perubahan.
- Tipe: Bugfix/Hardening/Policy Tightening/Error Message.
- Deskripsi singkat dan alasan.
- Dampak yang diharapkan.
- Rencana uji (normal + error + RLS).
- Rencana rollback.
- Evidence yang akan dikumpulkan.

## Definition of Done untuk Bugfix
- Semua uji normal dan error lulus.
- Validasi RLS dan event scoping lolos.
- Evidence minimal tersedia di /docs/evidence (log/screenshot, query verifikasi, pg_policies).
- Tidak menambah fitur baru dan konsisten dengan prinsip operasional.
