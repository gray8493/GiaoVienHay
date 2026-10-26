-- Migration 001: thêm cột phân công Giáo viên Bộ môn cho bảng classes
-- Schema mục tiêu đã được mô tả tại docs/architecture/database-schema.md (classes.subject_teachers jsonb)
-- Cách chạy: dán đoạn SQL này vào Supabase Dashboard -> SQL Editor -> Run
-- (Supabase PostgREST không cho phép ALTER TABLE nên phải chạy qua SQL Editor hoặc kết nối Postgres trực tiếp)

alter table public.classes
  add column if not exists subject_teachers jsonb not null default '[]'::jsonb;

comment on column public.classes.subject_teachers is
  'Phân công GVBM: [{"teacher_id": "usr_xxx", "subject_code": "MATH", "teacher_name": "...", "assigned_at": "..."}]';
