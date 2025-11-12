-- =====================================================
-- Admin SQL Execution Helper
-- =====================================================
-- Provides a restricted function to run read-only queries from admin tools
-- =====================================================

CREATE OR REPLACE FUNCTION admin_execute_sql(query_text TEXT)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
  sanitized_query TEXT := trim(query_text);
  lowered_query TEXT := lower(trim(query_text));
  result JSON;
  allowed_tables CONSTANT TEXT[] := ARRAY[
    'working_hours',
    'service_durations',
    'time_slots',
    'bookings',
    'admin_settings'
  ];
  target_table TEXT;
BEGIN
  IF sanitized_query IS NULL OR length(sanitized_query) = 0 THEN
    RAISE EXCEPTION 'Query cannot be empty';
  END IF;

  IF position(';' IN sanitized_query) > 0 THEN
    RAISE EXCEPTION 'Multiple statements are not allowed';
  END IF;

  IF NOT lowered_query LIKE 'select %' THEN
    RAISE EXCEPTION 'Only SELECT statements are allowed';
  END IF;

  SELECT regexp_replace(lowered_query, '^select\s+.*?\s+from\s+([a-z0-9_]+).*$', '\\1')
  INTO target_table;

  IF target_table IS NULL THEN
    RAISE EXCEPTION 'Unable to determine target table';
  END IF;

  IF NOT (target_table = ANY(allowed_tables)) THEN
    RAISE EXCEPTION 'Access to table "%" is not permitted', target_table;
  END IF;

  EXECUTE format(
    'SELECT COALESCE(json_agg(row_to_json(t)), ''[]''::json) FROM (%s) t',
    sanitized_query
  )
  INTO result;

  RETURN COALESCE(result, '[]'::json);
END;
$$;

REVOKE ALL ON FUNCTION admin_execute_sql(TEXT) FROM PUBLIC;
