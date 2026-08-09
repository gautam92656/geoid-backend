-- Resync auto-increment sequences after seed data inserted explicit IDs.
SELECT setval(
  pg_get_serial_sequence('suppliers', 'id'),
  COALESCE((SELECT MAX(id) FROM suppliers), 1)
);

SELECT setval(
  pg_get_serial_sequence('clients', 'id'),
  COALESCE((SELECT MAX(id) FROM clients), 1)
);
