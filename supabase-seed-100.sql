-- CYLIX DeFi - Seed 100 Test Users (Fixed v3)
-- Uses generate_series + gen_random_bytes for wallets — no array, no index issues

-- Step 1: Clean old test data
DELETE FROM champions_pool_winners;
DELETE FROM community_pool_qualifiers;
DELETE FROM community_pool_distributions;
DELETE FROM apex_pool_qualifiers;
DELETE FROM apex_pool_distributions;
DELETE FROM apex_pool_blocks;
DELETE FROM matrix_earnings;
DELETE FROM matrix_11;
DELETE FROM matrix_tree;
DELETE FROM user_slots;
DELETE FROM transactions;
DELETE FROM earnings;
DELETE FROM notifications;
DELETE FROM withdrawals;

-- Step 2: Remove old sponsors & reseed
DELETE FROM users WHERE referral_code IN ('CXL4FLZK', 'CXL237BX');

-- Step 3: Re-create sponsors
INSERT INTO users (wallet, referral_code, is_active, total_invested, total_earned, ascension_balance, directs, team_size)
VALUES ('0x742d35Cc6634C0532925a3b844Bc9e7595f2bD18', 'CXL4FLZK', true, 500000, 750000, 250000, 0, 0);
INSERT INTO users (wallet, referral_code, is_active, total_invested, total_earned, ascension_balance, directs, team_size)
VALUES ('0x6B175474E89094C44Da98b954EedeAC495271d0F', 'CXL237BX', true, 500000, 750000, 250000, 0, 0);

-- Step 4: Generate 100 users (50+50)
DO $$
DECLARE
  sp1 UUID; sp2 UUID; uid UUID; i INT; j INT;
  all_s1 UUID[] := '{}'; all_s2 UUID[] := '{}';
BEGIN
  SELECT id INTO sp1 FROM users WHERE referral_code = 'CXL4FLZK';
  SELECT id INTO sp2 FROM users WHERE referral_code = 'CXL237BX';

  -- 50 users under CXL4FLZK
  FOR i IN 1..50 LOOP
    INSERT INTO users (wallet, referral_code, sponsor_id, is_active)
    VALUES ('0x' || encode(gen_random_bytes(20), 'hex'), 'S1' || LPAD(i::TEXT, 3, '0'), sp1, true)
    RETURNING id INTO uid;
    all_s1 := array_append(all_s1, uid);
  END LOOP;

  -- 50 users under CXL237BX
  FOR i IN 1..50 LOOP
    INSERT INTO users (wallet, referral_code, sponsor_id, is_active)
    VALUES ('0x' || encode(gen_random_bytes(20), 'hex'), 'S2' || LPAD(i::TEXT, 3, '0'), sp2, true)
    RETURNING id INTO uid;
    all_s2 := array_append(all_s2, uid);
  END LOOP;

  -- Give each user 1-3 slots (orbits 1-5)
  FOREACH uid IN ARRAY all_s1 || all_s2 LOOP
    FOR j IN 1..((random()*2)::INT + 1) LOOP
      INSERT INTO user_slots (user_id, slot_id, slot_name, slot_orbit, invested, earned, daily_earned, max_cap, progress, status)
      VALUES (uid,
        'orbit-' || ((random()*4)::INT + 1),
        CASE ((random()*4)::INT + 1)
          WHEN 1 THEN 'Spark' WHEN 2 THEN 'Vortex' WHEN 3 THEN 'Comet Pulse' WHEN 4 THEN 'Nova Crux' ELSE 'Cyber Node'
        END,
        (random()*4)::INT + 1,
        CASE ((random()*4)::INT + 1) WHEN 1 THEN 5 WHEN 2 THEN 10 WHEN 3 THEN 50 WHEN 4 THEN 100 ELSE 500 END,
        (random()*300)::DECIMAL,
        CASE ((random()*4)::INT + 1) WHEN 1 THEN 0.15 WHEN 2 THEN 0.30 WHEN 3 THEN 1.50 WHEN 4 THEN 3.00 ELSE 15.00 END,
        CASE ((random()*4)::INT + 1) WHEN 1 THEN 10 WHEN 2 THEN 20 WHEN 3 THEN 100 WHEN 4 THEN 200 ELSE 1000 END,
        (random()*80 + 5)::DECIMAL, 'active');
    END LOOP;
  END LOOP;

  -- Matrix root nodes
  INSERT INTO matrix_tree (user_id, owner_id, parent_id, side, level, position) VALUES (sp1, sp1, NULL, NULL, 1, 1);
  INSERT INTO matrix_tree (user_id, owner_id, parent_id, side, level, position) VALUES (sp2, sp2, NULL, NULL, 1, 1);

  -- BFS placement for SP1 team
  FOR i IN 1..array_length(all_s1, 1) LOOP
    INSERT INTO matrix_tree (user_id, owner_id, parent_id, side, level, position)
    SELECT all_s1[i], sp1, mt.id,
      CASE WHEN (SELECT count(*) FROM matrix_tree t2 WHERE t2.parent_id = mt.id AND t2.side = 'left') = 0 THEN 'left' ELSE 'right' END,
      mt.level + 1, i
    FROM matrix_tree mt
    WHERE mt.owner_id = sp1 AND mt.level < 11
      AND ((SELECT count(*) FROM matrix_tree t2 WHERE t2.parent_id = mt.id AND t2.side = 'left') = 0
        OR (SELECT count(*) FROM matrix_tree t2 WHERE t2.parent_id = mt.id AND t2.side = 'right') = 0)
    ORDER BY mt.level, mt.position
    LIMIT 1;
  END LOOP;

  -- BFS placement for SP2 team
  FOR i IN 1..array_length(all_s2, 1) LOOP
    INSERT INTO matrix_tree (user_id, owner_id, parent_id, side, level, position)
    SELECT all_s2[i], sp2, mt.id,
      CASE WHEN (SELECT count(*) FROM matrix_tree t2 WHERE t2.parent_id = mt.id AND t2.side = 'left') = 0 THEN 'left' ELSE 'right' END,
      mt.level + 1, i
    FROM matrix_tree mt
    WHERE mt.owner_id = sp2 AND mt.level < 11
      AND ((SELECT count(*) FROM matrix_tree t2 WHERE t2.parent_id = mt.id AND t2.side = 'left') = 0
        OR (SELECT count(*) FROM matrix_tree t2 WHERE t2.parent_id = mt.id AND t2.side = 'right') = 0)
    ORDER BY mt.level, mt.position
    LIMIT 1;
  END LOOP;

  -- Unilevel matrix
  FOREACH uid IN ARRAY all_s1 LOOP
    INSERT INTO matrix_11 (user_id, sponsor_id, level) VALUES (uid, sp1, 1);
    INSERT INTO matrix_11 (user_id, sponsor_id, level) VALUES (uid, sp2, 2);
  END LOOP;
  FOREACH uid IN ARRAY all_s2 LOOP
    INSERT INTO matrix_11 (user_id, sponsor_id, level) VALUES (uid, sp2, 1);
  END LOOP;

  -- Apex pool test balance
  INSERT INTO apex_pool_blocks (block_number, value, completed, distributed)
  SELECT 0, (random()*5000+100)::DECIMAL, true, true FROM generate_series(1,20);
  INSERT INTO apex_pool_blocks (block_number, value, completed, distributed)
  SELECT 0, (random()*3000+50)::DECIMAL, true, false FROM generate_series(1,10);

  -- Update sponsor stats
  UPDATE users SET directs = 50, team_size = 50 WHERE id IN (sp1, sp2);

  RAISE NOTICE 'Done: 100 users + slots + tree + pool blocks seeded!';
END $$;