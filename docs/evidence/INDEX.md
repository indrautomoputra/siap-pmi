# Evidence Index

## Daftar Folder Dry-Run
- /docs/evidence/dry-run-YYYYMMDD/
  - 00_environment.md
  - 01_normal_flow.md
  - 02_error_flow.md
  - 03_db_queries.md
  - 04_policies_pg_policies.csv atau .md
  - 05_endpoint_to_rls_map.md
  - screenshots/ (jika memakai gambar)
  - logs/ (jika memakai JSON/log)

## Bukti Minimal per Bugfix
- Log response (JSON) atau screenshot UI.
- Satu query verifikasi DB untuk event scoping (event_id benar).
- Hasil pg_policies yang relevan.
- Pemetaan endpoint → guard → role → tabel → policy.

## Catatan
- Setiap perubahan bugfix harus menambahkan entry baru di folder dry-run dengan tanggal eksekusi.
- Bukti disusun rapi agar siap untuk SOP dan audit internal.

## Frontend
- Smoke test write flows: /docs/frontend/Smoke_Test_Write_Flows.md
- UX polish & A11Y: /docs/frontend/UX_Polish_A11Y.md
- Frontend readiness note: /docs/frontend/Frontend_Readiness_Note.md
- Human smoke evidence plan: /docs/frontend/Human_Smoke_Evidence_Plan.md
