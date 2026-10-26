-- Notification rows already use recipient_id. This adds the JSON payload column
-- used by the API for screen routing and fee/attendance details.
alter table public.notifications
  add column if not exists metadata jsonb;

comment on column public.notifications.metadata is
  'Thông tin bổ sung cho thông báo, ví dụ loại khoản thu và mã học sinh để điều hướng trong ứng dụng.';
