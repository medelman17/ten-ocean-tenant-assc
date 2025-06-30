SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND (table_name LIKE '%orum%' OR table_name LIKE '%ser%' OR table_name LIKE '%opic%')
ORDER BY table_name; 