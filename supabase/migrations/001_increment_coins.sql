-- Run this in Supabase SQL Editor
CREATE OR REPLACE FUNCTION increment_coins(user_id UUID, amount INT)
RETURNS INT
LANGUAGE plpgsql
AS $$
DECLARE
  new_balance INT;
BEGIN
  UPDATE profiles
  SET coins = coins + amount, updated_at = NOW()
  WHERE id = user_id
  RETURNING coins INTO new_balance;
  RETURN new_balance;
END;
$$;
