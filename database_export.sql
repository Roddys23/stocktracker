-- StockWatch Database Export
  -- Generated: 2026-03-07T13:34:44.423Z
  -- Compatible with PostgreSQL (Supabase, Render, etc.)

  -- Drop tables if they exist (in reverse dependency order)
  DROP TABLE IF EXISTS page_items CASCADE;
  DROP TABLE IF EXISTS status_history CASCADE;
  DROP TABLE IF EXISTS settings CASCADE;
  DROP TABLE IF EXISTS products CASCADE;

  -- Create tables
  CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    url TEXT NOT NULL,
    label TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'No Change',
    last_raw_status TEXT,
    last_checked_at TIMESTAMP,
    is_active BOOLEAN NOT NULL DEFAULT true
  );

  CREATE TABLE page_items (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL,
    item_name TEXT NOT NULL,
    item_status TEXT NOT NULL DEFAULT 'Unknown',
    last_seen_at TIMESTAMP DEFAULT NOW()
  );

  CREATE TABLE status_history (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL,
    status TEXT NOT NULL,
    change_description TEXT NOT NULL,
    detected_at TIMESTAMP DEFAULT NOW()
  );

  CREATE TABLE settings (
    id SERIAL PRIMARY KEY,
    discord_webhook_url TEXT
  );

  -- ============================================
  -- DATA: Products (3 rows)
  -- ============================================
  INSERT INTO products (id, url, label, status, last_raw_status, last_checked_at, is_active) VALUES
  (1, 'https://example.com/product/rtx-4090', 'RTX 4090 GPU', 'No Change', 'Unknown', NULL, false),
  (2, 'https://example.com/product/ps5-pro', 'PS5 Pro', 'No Change', 'Unknown', NULL, false),
  (3, 'https://thebrokenbindingsub.com/collections/dragons-hoard', 'broken binding fantasy ', 'No Change', 'Unknown, Unknown, Unknown, Unknown, Unknown, Unknown, Unknown, Unknown, Unknown, Unknown, Unknown, Unknown, Unknown, Unknown, Unknown, Unknown, Out of Stock, Unknown, Unknown, Unknown, Unknown, Unknown, Unknown, Unknown, Unknown, Out of Stock, Out of Stoc', '2026-03-07 13:30:01.508', true);

  -- ============================================
  -- DATA: Page Items (109 rows)
  -- ============================================
  INSERT INTO page_items (id, product_id, item_name, item_status, last_seen_at) VALUES (3, 3, 'The Demon King', 'Unknown', '2026-03-07 13:30:01.518');
INSERT INTO page_items (id, product_id, item_name, item_status, last_seen_at) VALUES (4, 3, 'Tai-Pan', 'Unknown', '2026-03-07 13:30:01.557');
INSERT INTO page_items (id, product_id, item_name, item_status, last_seen_at) VALUES (5, 3, 'Between Two Fires', 'Unknown', '2026-03-07 13:30:01.562');
INSERT INTO page_items (id, product_id, item_name, item_status, last_seen_at) VALUES (6, 3, 'Grimdark Magazine Issue #46', 'Unknown', '2026-03-07 13:30:01.567');
INSERT INTO page_items (id, product_id, item_name, item_status, last_seen_at) VALUES (7, 3, 'First Mage on the Moon', 'Unknown', '2026-03-07 13:30:01.571');
INSERT INTO page_items (id, product_id, item_name, item_status, last_seen_at) VALUES (8, 3, 'The Book of Fallen Leaves', 'Unknown', '2026-03-07 13:30:01.575');
INSERT INTO page_items (id, product_id, item_name, item_status, last_seen_at) VALUES (9, 3, 'Travel Light', 'Unknown', '2026-03-07 13:30:01.579');
INSERT INTO page_items (id, product_id, item_name, item_status, last_seen_at) VALUES (10, 3, 'The Shadow Gate - TBB Press Edition', 'Unknown', '2026-03-07 13:30:01.582');
INSERT INTO page_items (id, product_id, item_name, item_status, last_seen_at) VALUES (11, 3, 'Natural Engines; Books 1-2', 'Unknown', '2026-03-07 13:30:01.586');
INSERT INTO page_items (id, product_id, item_name, item_status, last_seen_at) VALUES (12, 3, 'Steel Gods', 'Unknown', '2026-03-07 13:30:01.589');
INSERT INTO page_items (id, product_id, item_name, item_status, last_seen_at) VALUES (13, 3, 'Of Blood and Fire - Endless Edition (1st Printing)', 'Unknown', '2026-03-07 13:30:01.592');
INSERT INTO page_items (id, product_id, item_name, item_status, last_seen_at) VALUES (14, 3, 'Asian Saga; Books 1-2', 'Unknown', '2026-03-07 13:30:01.596');
INSERT INTO page_items (id, product_id, item_name, item_status, last_seen_at) VALUES (15, 3, 'Shogun (2nd Printing)', 'Unknown', '2026-03-07 13:30:01.599');
INSERT INTO page_items (id, product_id, item_name, item_status, last_seen_at) VALUES (16, 3, 'The Dwarves; Books 1-2', 'Unknown', '2026-03-07 13:30:01.602');
INSERT INTO page_items (id, product_id, item_name, item_status, last_seen_at) VALUES (17, 3, 'The Faithful Dark', 'Unknown', '2026-03-07 13:30:01.606');
INSERT INTO page_items (id, product_id, item_name, item_status, last_seen_at) VALUES (18, 3, 'The Wonder Engine', 'Unknown', '2026-03-07 13:30:01.61');
INSERT INTO page_items (id, product_id, item_name, item_status, last_seen_at) VALUES (19, 3, 'The Clocktaur War Duology', 'Out of Stock', '2026-03-07 13:30:01.614');
INSERT INTO page_items (id, product_id, item_name, item_status, last_seen_at) VALUES (20, 3, 'Nine Goblins', 'Unknown', '2026-03-07 13:30:01.617');
INSERT INTO page_items (id, product_id, item_name, item_status, last_seen_at) VALUES (21, 3, 'A God of Countless Guises', 'Unknown', '2026-03-07 13:30:01.621');
INSERT INTO page_items (id, product_id, item_name, item_status, last_seen_at) VALUES (22, 3, 'Sistah Samurai - TBB Press Edition with Slipcase', 'Unknown', '2026-03-07 13:30:01.624');
INSERT INTO page_items (id, product_id, item_name, item_status, last_seen_at) VALUES (23, 3, 'Cleopatra', 'Unknown', '2026-03-07 13:30:01.628');
INSERT INTO page_items (id, product_id, item_name, item_status, last_seen_at) VALUES (24, 3, 'Dead Man in a Ditch', 'Unknown', '2026-03-07 13:30:01.631');
INSERT INTO page_items (id, product_id, item_name, item_status, last_seen_at) VALUES (25, 3, 'The Last Smile in Sunder City', 'Unknown', '2026-03-07 13:30:01.634');
INSERT INTO page_items (id, product_id, item_name, item_status, last_seen_at) VALUES (26, 3, 'Sister Wake', 'Unknown', '2026-03-07 13:30:01.637');
INSERT INTO page_items (id, product_id, item_name, item_status, last_seen_at) VALUES (27, 3, 'Of Blood and Bone Trilogy - Reprint with New Jackets', 'Unknown', '2026-03-07 13:30:01.64');
INSERT INTO page_items (id, product_id, item_name, item_status, last_seen_at) VALUES (28, 3, 'The Devils - Unsigned Reprint', 'Out of Stock', '2026-03-07 13:30:01.644');
INSERT INTO page_items (id, product_id, item_name, item_status, last_seen_at) VALUES (29, 3, 'Blood Over Bright Haven - Unsigned Reprint', 'Out of Stock', '2026-03-07 13:30:01.657');
INSERT INTO page_items (id, product_id, item_name, item_status, last_seen_at) VALUES (30, 3, 'Katabasis', 'Unknown', '2026-03-07 13:30:01.66');
INSERT INTO page_items (id, product_id, item_name, item_status, last_seen_at) VALUES (31, 3, 'Among the Burning Flowers - Signed', 'Unknown', '2026-03-07 13:30:01.664');
INSERT INTO page_items (id, product_id, item_name, item_status, last_seen_at) VALUES (32, 3, 'The Echoes Saga 1-3 - Indie Endless Editions (1st Printing)', 'Unknown', '2026-03-07 13:30:01.667');
INSERT INTO page_items (id, product_id, item_name, item_status, last_seen_at) VALUES (33, 3, 'A Time of Dragons; The Last Ballad of Hope - Indie Endless Edition (1st Printing)', 'Unknown', '2026-03-07 13:30:01.67');
INSERT INTO page_items (id, product_id, item_name, item_status, last_seen_at) VALUES (34, 3, 'A Time of Dragons; In the Shadow of Kings - Indie Endless Edition (2nd Printing)', 'Unknown', '2026-03-07 13:30:01.673');
INSERT INTO page_items (id, product_id, item_name, item_status, last_seen_at) VALUES (35, 3, 'A Time of Dragons; Once There Were Heroes - Indie Endless Edition (3rd Printing)', 'Unknown', '2026-03-07 13:30:01.676');
INSERT INTO page_items (id, product_id, item_name, item_status, last_seen_at) VALUES (36, 3, 'Leviathan - TBB Exclusive Hardback (1st Printing)', 'Unknown', '2026-03-07 13:30:01.679');
INSERT INTO page_items (id, product_id, item_name, item_status, last_seen_at) VALUES (37, 3, 'Made Things', 'Unknown', '2026-03-07 13:30:01.681');
INSERT INTO page_items (id, product_id, item_name, item_status, last_seen_at) VALUES (38, 3, 'For Whom the Belle Tolls Deluxe', 'Unknown', '2026-03-07 13:30:01.684');
INSERT INTO page_items (id, product_id, item_name, item_status, last_seen_at) VALUES (39, 3, 'This Gilded Abyss', 'Unknown', '2026-03-07 13:30:01.687');
INSERT INTO page_items (id, product_id, item_name, item_status, last_seen_at) VALUES (40, 3, 'Fallen City', 'Unknown', '2026-03-07 13:30:01.69');
INSERT INTO page_items (id, product_id, item_name, item_status, last_seen_at) VALUES (41, 3, 'The Wolf and His King', 'Unknown', '2026-03-07 13:30:01.693');
INSERT INTO page_items (id, product_id, item_name, item_status, last_seen_at) VALUES (42, 3, 'A Judgement of Powers', 'Unknown', '2026-03-07 13:30:01.696');
INSERT INTO page_items (id, product_id, item_name, item_status, last_seen_at) VALUES (43, 3, 'An Instruction In Shadow', 'Unknown', '2026-03-07 13:30:01.699');
INSERT INTO page_items (id, product_id, item_name, item_status, last_seen_at) VALUES (44, 3, 'Unbound - Indie Endless Edition (1st Printing)', 'Unknown', '2026-03-07 13:30:01.702');
INSERT INTO page_items (id, product_id, item_name, item_status, last_seen_at) VALUES (45, 3, 'Ascendant - Indie Endless Edition (2nd Printing)', 'Unknown', '2026-03-07 13:30:01.705');
INSERT INTO page_items (id, product_id, item_name, item_status, last_seen_at) VALUES (46, 3, 'Songs of Chaos 2-pack - Indie Endless Editions', 'Unknown', '2026-03-07 13:30:01.707');
INSERT INTO page_items (id, product_id, item_name, item_status, last_seen_at) VALUES (47, 3, 'The Tower of the Tyrant', 'Unknown', '2026-03-07 13:30:01.71');
INSERT INTO page_items (id, product_id, item_name, item_status, last_seen_at) VALUES (48, 3, 'Snake-Eater', 'Unknown', '2026-03-07 13:30:01.713');
INSERT INTO page_items (id, product_id, item_name, item_status, last_seen_at) VALUES (49, 3, 'The Age of Darkness Trilogy', 'Unknown', '2026-03-07 13:30:01.717');
INSERT INTO page_items (id, product_id, item_name, item_status, last_seen_at) VALUES (50, 3, 'Daughter of the Otherworld', 'Unknown', '2026-03-07 13:30:01.719');
INSERT INTO page_items (id, product_id, item_name, item_status, last_seen_at) VALUES (51, 3, 'How to Defeat a Demon King in Ten Easy Steps', 'Unknown', '2026-03-07 13:30:01.723');
INSERT INTO page_items (id, product_id, item_name, item_status, last_seen_at) VALUES (52, 3, 'A Bond Undone', 'Unknown', '2026-03-07 13:30:01.726');
INSERT INTO page_items (id, product_id, item_name, item_status, last_seen_at) VALUES (53, 3, 'A Hero Born', 'Unknown', '2026-03-07 13:30:01.729');
INSERT INTO page_items (id, product_id, item_name, item_status, last_seen_at) VALUES (54, 3, 'Legends of the Condor Heroes 2-pack', 'Unknown', '2026-03-07 13:30:01.732');
INSERT INTO page_items (id, product_id, item_name, item_status, last_seen_at) VALUES (55, 3, 'Hierarchy Deluxe 2-pack', 'Unknown', '2026-03-07 13:30:01.734');
INSERT INTO page_items (id, product_id, item_name, item_status, last_seen_at) VALUES (56, 3, 'The Malazan Book of The Fallen; Books 4-6', 'Unknown', '2026-03-07 13:30:01.738');
INSERT INTO page_items (id, product_id, item_name, item_status, last_seen_at) VALUES (57, 3, 'The Malazan Book of The Fallen; Books 1-3 - Unsigned Third Printing', 'Unknown', '2026-03-07 13:30:01.74');
INSERT INTO page_items (id, product_id, item_name, item_status, last_seen_at) VALUES (58, 3, 'EU ONLY - The Malazan Book of The Fallen; Books 2-3 - Unsigned Third Printing', 'Unknown', '2026-03-07 13:30:01.745');
INSERT INTO page_items (id, product_id, item_name, item_status, last_seen_at) VALUES (59, 3, 'Sharp Ends', 'Out of Stock', '2026-03-07 13:30:01.747');
INSERT INTO page_items (id, product_id, item_name, item_status, last_seen_at) VALUES (60, 3, 'Tales of the Plains', 'Unknown', '2026-03-07 13:30:01.751');
INSERT INTO page_items (id, product_id, item_name, item_status, last_seen_at) VALUES (61, 3, 'Brigands & Breadknives', 'Unknown', '2026-03-07 13:30:01.754');
INSERT INTO page_items (id, product_id, item_name, item_status, last_seen_at) VALUES (62, 3, 'Legends And Lattes', 'Unknown', '2026-03-07 13:30:01.756');
INSERT INTO page_items (id, product_id, item_name, item_status, last_seen_at) VALUES (63, 3, 'The Copper Cat Trilogy', 'Unknown', '2026-03-07 13:30:01.759');
INSERT INTO page_items (id, product_id, item_name, item_status, last_seen_at) VALUES (64, 3, 'Hemlock & Silver', 'Unknown', '2026-03-07 13:30:01.763');
INSERT INTO page_items (id, product_id, item_name, item_status, last_seen_at) VALUES (65, 3, 'T. Kingfisher 2-pack', 'Unknown', '2026-03-07 13:30:01.766');
INSERT INTO page_items (id, product_id, item_name, item_status, last_seen_at) VALUES (66, 3, 'Lucid', 'Unknown', '2026-03-07 13:30:01.77');
INSERT INTO page_items (id, product_id, item_name, item_status, last_seen_at) VALUES (67, 3, 'War for the Rose Throne; Books 1-5', 'Unknown', '2026-03-07 13:30:01.773');
INSERT INTO page_items (id, product_id, item_name, item_status, last_seen_at) VALUES (68, 3, 'Paved with Good Intentions', 'Unknown', '2026-03-07 13:30:01.777');
INSERT INTO page_items (id, product_id, item_name, item_status, last_seen_at) VALUES (69, 3, 'The Bone Raiders', 'Unknown', '2026-03-07 13:30:01.779');
INSERT INTO page_items (id, product_id, item_name, item_status, last_seen_at) VALUES (70, 3, 'The Bloodsworn Saga', 'Unknown', '2026-03-07 13:30:01.783');
INSERT INTO page_items (id, product_id, item_name, item_status, last_seen_at) VALUES (71, 3, 'Alchemy and a Cup of Tea', 'Unknown', '2026-03-07 13:30:01.786');
INSERT INTO page_items (id, product_id, item_name, item_status, last_seen_at) VALUES (72, 3, 'Tea You at the Altar', 'Unknown', '2026-03-07 13:30:01.79');
INSERT INTO page_items (id, product_id, item_name, item_status, last_seen_at) VALUES (73, 3, 'A Pirate''s Life For Tea', 'Unknown', '2026-03-07 13:30:01.792');
INSERT INTO page_items (id, product_id, item_name, item_status, last_seen_at) VALUES (74, 3, 'The Damned King', 'Unknown', '2026-03-07 13:30:01.795');
INSERT INTO page_items (id, product_id, item_name, item_status, last_seen_at) VALUES (75, 3, 'The Inheritance Cycle - Unsigned', 'Unknown', '2026-03-07 13:30:01.801');
INSERT INTO page_items (id, product_id, item_name, item_status, last_seen_at) VALUES (76, 3, 'The Inheritance Cycle - EU ONLY Books 3-4 - Unsigned', 'Unknown', '2026-03-07 13:30:01.805');
INSERT INTO page_items (id, product_id, item_name, item_status, last_seen_at) VALUES (77, 3, 'Four Ruined Realms', 'Unknown', '2026-03-07 13:30:01.807');
INSERT INTO page_items (id, product_id, item_name, item_status, last_seen_at) VALUES (78, 3, 'Three Shattered Souls', 'Unknown', '2026-03-07 13:30:01.812');
INSERT INTO page_items (id, product_id, item_name, item_status, last_seen_at) VALUES (79, 3, 'Seal of the Worm', 'Unknown', '2026-03-07 13:30:01.815');
INSERT INTO page_items (id, product_id, item_name, item_status, last_seen_at) VALUES (80, 3, 'War Master''s Gate', 'Unknown', '2026-03-07 13:30:01.818');
INSERT INTO page_items (id, product_id, item_name, item_status, last_seen_at) VALUES (81, 3, 'Heirs of The Blade', 'Unknown', '2026-03-07 13:30:01.821');
INSERT INTO page_items (id, product_id, item_name, item_status, last_seen_at) VALUES (82, 3, 'The Art of Legend', 'Unknown', '2026-03-07 13:30:01.824');
INSERT INTO page_items (id, product_id, item_name, item_status, last_seen_at) VALUES (83, 3, 'Heart of the Wyrdwood', 'Unknown', '2026-03-07 13:30:01.828');
INSERT INTO page_items (id, product_id, item_name, item_status, last_seen_at) VALUES (84, 3, 'Warlords Of Wyrdwood', 'Unknown', '2026-03-07 13:30:01.832');
INSERT INTO page_items (id, product_id, item_name, item_status, last_seen_at) VALUES (85, 3, 'The Sorrow of the Sea - Numbered Edition', 'Unknown', '2026-03-07 13:30:01.835');
INSERT INTO page_items (id, product_id, item_name, item_status, last_seen_at) VALUES (86, 3, 'The Blood Dimmed Tide - Numbered Edition', 'Unknown', '2026-03-07 13:30:01.838');
INSERT INTO page_items (id, product_id, item_name, item_status, last_seen_at) VALUES (87, 3, 'The Tainted Khan', 'Unknown', '2026-03-07 13:30:01.842');
INSERT INTO page_items (id, product_id, item_name, item_status, last_seen_at) VALUES (88, 3, 'The Way of Edan - TBB Press Edition', 'Unknown', '2026-03-07 13:30:01.845');
INSERT INTO page_items (id, product_id, item_name, item_status, last_seen_at) VALUES (89, 3, 'Born of an Iron Storm', 'Unknown', '2026-03-07 13:30:01.849');
INSERT INTO page_items (id, product_id, item_name, item_status, last_seen_at) VALUES (90, 3, 'A Tide Of Black Steel', 'Unknown', '2026-03-07 13:30:01.852');
INSERT INTO page_items (id, product_id, item_name, item_status, last_seen_at) VALUES (91, 3, 'Age of Wrath 2-pack', 'Unknown', '2026-03-07 13:30:01.856');
INSERT INTO page_items (id, product_id, item_name, item_status, last_seen_at) VALUES (92, 3, 'The Talon Duology', 'Unknown', '2026-03-07 13:30:01.859');
INSERT INTO page_items (id, product_id, item_name, item_status, last_seen_at) VALUES (93, 3, 'The Lie that Binds Them', 'Unknown', '2026-03-07 13:30:01.862');
INSERT INTO page_items (id, product_id, item_name, item_status, last_seen_at) VALUES (94, 3, 'The Aulirean Gates', 'Unknown', '2026-03-07 13:30:01.865');
INSERT INTO page_items (id, product_id, item_name, item_status, last_seen_at) VALUES (95, 3, 'Between Dragons and Their Wrath', 'Unknown', '2026-03-07 13:30:01.868');
INSERT INTO page_items (id, product_id, item_name, item_status, last_seen_at) VALUES (96, 3, 'The Scour', 'Unknown', '2026-03-07 13:30:01.871');
INSERT INTO page_items (id, product_id, item_name, item_status, last_seen_at) VALUES (97, 3, 'Caesar''s Avenger', 'Unknown', '2026-03-07 13:30:01.874');
INSERT INTO page_items (id, product_id, item_name, item_status, last_seen_at) VALUES (98, 3, 'Lion Hearts', 'Unknown', '2026-03-07 13:30:01.878');
INSERT INTO page_items (id, product_id, item_name, item_status, last_seen_at) VALUES (99, 3, 'A Palace Near the Wind', 'Unknown', '2026-03-07 13:30:01.882');
INSERT INTO page_items (id, product_id, item_name, item_status, last_seen_at) VALUES (100, 3, 'Witch Queen of Redwinter', 'Unknown', '2026-03-07 13:30:01.885');
INSERT INTO page_items (id, product_id, item_name, item_status, last_seen_at) VALUES (101, 3, 'Blacklight Born', 'Unknown', '2026-03-07 13:30:01.888');
INSERT INTO page_items (id, product_id, item_name, item_status, last_seen_at) VALUES (102, 3, 'Rook & Rose - Tier 2 Leftovers', 'Unknown', '2026-03-07 13:30:01.891');
INSERT INTO page_items (id, product_id, item_name, item_status, last_seen_at) VALUES (103, 3, 'The Drowned Kingdom 2-pack', 'Unknown', '2026-03-07 13:30:01.895');
INSERT INTO page_items (id, product_id, item_name, item_status, last_seen_at) VALUES (104, 3, 'The Bright Sword', 'Unknown', '2026-03-07 13:30:01.898');
INSERT INTO page_items (id, product_id, item_name, item_status, last_seen_at) VALUES (105, 3, 'Anji Kills a King', 'Unknown', '2026-03-07 13:30:01.901');
INSERT INTO page_items (id, product_id, item_name, item_status, last_seen_at) VALUES (106, 3, 'Seven Recipes for Revolution', 'Unknown', '2026-03-07 13:30:01.905');
INSERT INTO page_items (id, product_id, item_name, item_status, last_seen_at) VALUES (107, 3, 'A Darkness Returns', 'Unknown', '2026-03-07 13:30:01.907');
INSERT INTO page_items (id, product_id, item_name, item_status, last_seen_at) VALUES (108, 3, 'In the Shadow of their Dying', 'Unknown', '2026-03-07 13:30:01.91');
INSERT INTO page_items (id, product_id, item_name, item_status, last_seen_at) VALUES (109, 3, 'The Last Vigilant', 'Unknown', '2026-03-07 13:30:01.913');
INSERT INTO page_items (id, product_id, item_name, item_status, last_seen_at) VALUES (110, 3, 'Navola', 'Unknown', '2026-03-07 13:30:01.916');
INSERT INTO page_items (id, product_id, item_name, item_status, last_seen_at) VALUES (111, 3, 'The Reaper', 'Unknown', '2026-03-07 13:30:01.919');

  -- ============================================
  -- DATA: Status History (113 rows)
  -- ============================================
  INSERT INTO status_history (id, product_id, status, change_description, detected_at) VALUES (1, 3, 'Out of Stock', 'Initial scan: "The Bone Season; Books 1-5 - Leftover Sets" is Out of Stock', '2026-03-05 15:15:00.354698');
INSERT INTO status_history (id, product_id, status, change_description, detected_at) VALUES (2, 3, 'Out of Stock', 'Initial scan: "The Bone Season; Books 1-5 - Slightly Damaged Leftover Sets" is Out of Stock', '2026-03-05 15:15:00.542768');
INSERT INTO status_history (id, product_id, status, change_description, detected_at) VALUES (3, 3, 'Unknown', 'Initial scan: "The Demon King" is Unknown', '2026-03-05 15:15:00.548486');
INSERT INTO status_history (id, product_id, status, change_description, detected_at) VALUES (4, 3, 'Unknown', 'Initial scan: "Tai-Pan" is Unknown', '2026-03-05 15:15:00.553981');
INSERT INTO status_history (id, product_id, status, change_description, detected_at) VALUES (5, 3, 'Unknown', 'Initial scan: "Between Two Fires" is Unknown', '2026-03-05 15:15:00.559595');
INSERT INTO status_history (id, product_id, status, change_description, detected_at) VALUES (6, 3, 'Unknown', 'Initial scan: "Grimdark Magazine Issue #46" is Unknown', '2026-03-05 15:15:00.564978');
INSERT INTO status_history (id, product_id, status, change_description, detected_at) VALUES (7, 3, 'Unknown', 'Initial scan: "First Mage on the Moon" is Unknown', '2026-03-05 15:15:00.570328');
INSERT INTO status_history (id, product_id, status, change_description, detected_at) VALUES (8, 3, 'Unknown', 'Initial scan: "The Book of Fallen Leaves" is Unknown', '2026-03-05 15:15:00.57683');
INSERT INTO status_history (id, product_id, status, change_description, detected_at) VALUES (9, 3, 'Unknown', 'Initial scan: "Travel Light" is Unknown', '2026-03-05 15:15:00.58206');
INSERT INTO status_history (id, product_id, status, change_description, detected_at) VALUES (10, 3, 'Unknown', 'Initial scan: "The Shadow Gate - TBB Press Edition" is Unknown', '2026-03-05 15:15:00.587603');
INSERT INTO status_history (id, product_id, status, change_description, detected_at) VALUES (11, 3, 'Unknown', 'Initial scan: "Natural Engines; Books 1-2" is Unknown', '2026-03-05 15:15:00.592919');
INSERT INTO status_history (id, product_id, status, change_description, detected_at) VALUES (12, 3, 'Unknown', 'Initial scan: "Steel Gods" is Unknown', '2026-03-05 15:15:00.598818');
INSERT INTO status_history (id, product_id, status, change_description, detected_at) VALUES (13, 3, 'Unknown', 'Initial scan: "Of Blood and Fire - Endless Edition (1st Printing)" is Unknown', '2026-03-05 15:15:00.604827');
INSERT INTO status_history (id, product_id, status, change_description, detected_at) VALUES (14, 3, 'Unknown', 'Initial scan: "Asian Saga; Books 1-2" is Unknown', '2026-03-05 15:15:00.610482');
INSERT INTO status_history (id, product_id, status, change_description, detected_at) VALUES (15, 3, 'Unknown', 'Initial scan: "Shogun (2nd Printing)" is Unknown', '2026-03-05 15:15:00.616615');
INSERT INTO status_history (id, product_id, status, change_description, detected_at) VALUES (16, 3, 'Unknown', 'Initial scan: "The Dwarves; Books 1-2" is Unknown', '2026-03-05 15:15:00.622136');
INSERT INTO status_history (id, product_id, status, change_description, detected_at) VALUES (17, 3, 'Unknown', 'Initial scan: "The Faithful Dark" is Unknown', '2026-03-05 15:15:00.63036');
INSERT INTO status_history (id, product_id, status, change_description, detected_at) VALUES (18, 3, 'Unknown', 'Initial scan: "The Wonder Engine" is Unknown', '2026-03-05 15:15:00.636728');
INSERT INTO status_history (id, product_id, status, change_description, detected_at) VALUES (19, 3, 'Out of Stock', 'Initial scan: "The Clocktaur War Duology" is Out of Stock', '2026-03-05 15:15:00.64227');
INSERT INTO status_history (id, product_id, status, change_description, detected_at) VALUES (20, 3, 'Unknown', 'Initial scan: "Nine Goblins" is Unknown', '2026-03-05 15:15:00.647651');
INSERT INTO status_history (id, product_id, status, change_description, detected_at) VALUES (21, 3, 'Unknown', 'Initial scan: "A God of Countless Guises" is Unknown', '2026-03-05 15:15:00.653444');
INSERT INTO status_history (id, product_id, status, change_description, detected_at) VALUES (22, 3, 'Unknown', 'Initial scan: "Sistah Samurai - TBB Press Edition with Slipcase" is Unknown', '2026-03-05 15:15:00.658899');
INSERT INTO status_history (id, product_id, status, change_description, detected_at) VALUES (23, 3, 'Unknown', 'Initial scan: "Cleopatra" is Unknown', '2026-03-05 15:15:00.66426');
INSERT INTO status_history (id, product_id, status, change_description, detected_at) VALUES (24, 3, 'Unknown', 'Initial scan: "Dead Man in a Ditch" is Unknown', '2026-03-05 15:15:00.66906');
INSERT INTO status_history (id, product_id, status, change_description, detected_at) VALUES (25, 3, 'Unknown', 'New item found: "The Last Smile in Sunder City" (Unknown)', '2026-03-06 12:00:00.491185');
INSERT INTO status_history (id, product_id, status, change_description, detected_at) VALUES (26, 3, 'Unknown', 'New item found: "Sister Wake" (Unknown)', '2026-03-06 12:00:00.50519');
INSERT INTO status_history (id, product_id, status, change_description, detected_at) VALUES (27, 3, 'Removed', '"The Bone Season; Books 1-5 - Leftover Sets" is no longer listed on the page', '2026-03-06 12:00:00.514899');
INSERT INTO status_history (id, product_id, status, change_description, detected_at) VALUES (28, 3, 'Removed', '"The Bone Season; Books 1-5 - Slightly Damaged Leftover Sets" is no longer listed on the page', '2026-03-06 12:00:00.517058');
INSERT INTO status_history (id, product_id, status, change_description, detected_at) VALUES (29, 3, 'Unknown', 'New item found: "Of Blood and Bone Trilogy - Reprint with New Jackets" (Unknown)', '2026-03-07 11:56:07.478391');
INSERT INTO status_history (id, product_id, status, change_description, detected_at) VALUES (30, 3, 'Out of Stock', 'New item found: "The Devils - Unsigned Reprint" (Out of Stock)', '2026-03-07 11:56:07.491029');
INSERT INTO status_history (id, product_id, status, change_description, detected_at) VALUES (31, 3, 'Out of Stock', 'New item found: "Blood Over Bright Haven - Unsigned Reprint" (Out of Stock)', '2026-03-07 11:56:07.497236');
INSERT INTO status_history (id, product_id, status, change_description, detected_at) VALUES (32, 3, 'Unknown', 'New item found: "Katabasis" (Unknown)', '2026-03-07 11:56:07.502304');
INSERT INTO status_history (id, product_id, status, change_description, detected_at) VALUES (33, 3, 'Unknown', 'New item found: "Among the Burning Flowers - Signed" (Unknown)', '2026-03-07 11:56:07.508516');
INSERT INTO status_history (id, product_id, status, change_description, detected_at) VALUES (34, 3, 'Unknown', 'New item found: "The Echoes Saga 1-3 - Indie Endless Editions (1st Printing)" (Unknown)', '2026-03-07 11:56:07.514768');
INSERT INTO status_history (id, product_id, status, change_description, detected_at) VALUES (35, 3, 'Unknown', 'New item found: "A Time of Dragons; The Last Ballad of Hope - Indie Endless Edition (1st Printing)" (Unknown)', '2026-03-07 11:56:07.520676');
INSERT INTO status_history (id, product_id, status, change_description, detected_at) VALUES (36, 3, 'Unknown', 'New item found: "A Time of Dragons; In the Shadow of Kings - Indie Endless Edition (2nd Printing)" (Unknown)', '2026-03-07 11:56:07.526651');
INSERT INTO status_history (id, product_id, status, change_description, detected_at) VALUES (37, 3, 'Unknown', 'New item found: "A Time of Dragons; Once There Were Heroes - Indie Endless Edition (3rd Printing)" (Unknown)', '2026-03-07 11:56:07.541148');
INSERT INTO status_history (id, product_id, status, change_description, detected_at) VALUES (38, 3, 'Unknown', 'New item found: "Leviathan - TBB Exclusive Hardback (1st Printing)" (Unknown)', '2026-03-07 11:56:07.546875');
INSERT INTO status_history (id, product_id, status, change_description, detected_at) VALUES (39, 3, 'Unknown', 'New item found: "Made Things" (Unknown)', '2026-03-07 11:56:07.552305');
INSERT INTO status_history (id, product_id, status, change_description, detected_at) VALUES (40, 3, 'Unknown', 'New item found: "For Whom the Belle Tolls Deluxe" (Unknown)', '2026-03-07 11:56:07.558314');
INSERT INTO status_history (id, product_id, status, change_description, detected_at) VALUES (41, 3, 'Unknown', 'New item found: "This Gilded Abyss" (Unknown)', '2026-03-07 11:56:07.562992');
INSERT INTO status_history (id, product_id, status, change_description, detected_at) VALUES (42, 3, 'Unknown', 'New item found: "Fallen City" (Unknown)', '2026-03-07 11:56:07.568334');
INSERT INTO status_history (id, product_id, status, change_description, detected_at) VALUES (43, 3, 'Unknown', 'New item found: "The Wolf and His King" (Unknown)', '2026-03-07 11:56:07.573119');
INSERT INTO status_history (id, product_id, status, change_description, detected_at) VALUES (44, 3, 'Unknown', 'New item found: "A Judgement of Powers" (Unknown)', '2026-03-07 11:56:07.578398');
INSERT INTO status_history (id, product_id, status, change_description, detected_at) VALUES (45, 3, 'Unknown', 'New item found: "An Instruction In Shadow" (Unknown)', '2026-03-07 11:56:07.583197');
INSERT INTO status_history (id, product_id, status, change_description, detected_at) VALUES (46, 3, 'Unknown', 'New item found: "Unbound - Indie Endless Edition (1st Printing)" (Unknown)', '2026-03-07 11:56:07.589002');
INSERT INTO status_history (id, product_id, status, change_description, detected_at) VALUES (47, 3, 'Unknown', 'New item found: "Ascendant - Indie Endless Edition (2nd Printing)" (Unknown)', '2026-03-07 11:56:07.595034');
INSERT INTO status_history (id, product_id, status, change_description, detected_at) VALUES (48, 3, 'Unknown', 'New item found: "Songs of Chaos 2-pack - Indie Endless Editions" (Unknown)', '2026-03-07 11:56:07.600506');
INSERT INTO status_history (id, product_id, status, change_description, detected_at) VALUES (49, 3, 'Unknown', 'New item found: "The Tower of the Tyrant" (Unknown)', '2026-03-07 11:56:07.606165');
INSERT INTO status_history (id, product_id, status, change_description, detected_at) VALUES (50, 3, 'Unknown', 'New item found: "Snake-Eater" (Unknown)', '2026-03-07 11:56:07.611118');
INSERT INTO status_history (id, product_id, status, change_description, detected_at) VALUES (51, 3, 'Unknown', 'New item found: "The Age of Darkness Trilogy" (Unknown)', '2026-03-07 11:56:07.616566');
INSERT INTO status_history (id, product_id, status, change_description, detected_at) VALUES (52, 3, 'Unknown', 'New item found: "Daughter of the Otherworld" (Unknown)', '2026-03-07 11:56:07.622214');
INSERT INTO status_history (id, product_id, status, change_description, detected_at) VALUES (53, 3, 'Unknown', 'New item found: "How to Defeat a Demon King in Ten Easy Steps" (Unknown)', '2026-03-07 11:56:07.627639');
INSERT INTO status_history (id, product_id, status, change_description, detected_at) VALUES (54, 3, 'Unknown', 'New item found: "A Bond Undone" (Unknown)', '2026-03-07 11:56:07.634175');
INSERT INTO status_history (id, product_id, status, change_description, detected_at) VALUES (55, 3, 'Unknown', 'New item found: "A Hero Born" (Unknown)', '2026-03-07 11:56:07.639715');
INSERT INTO status_history (id, product_id, status, change_description, detected_at) VALUES (56, 3, 'Unknown', 'New item found: "Legends of the Condor Heroes 2-pack" (Unknown)', '2026-03-07 11:56:07.64515');
INSERT INTO status_history (id, product_id, status, change_description, detected_at) VALUES (57, 3, 'Unknown', 'New item found: "Hierarchy Deluxe 2-pack" (Unknown)', '2026-03-07 11:56:07.650264');
INSERT INTO status_history (id, product_id, status, change_description, detected_at) VALUES (58, 3, 'Unknown', 'New item found: "The Malazan Book of The Fallen; Books 4-6" (Unknown)', '2026-03-07 11:56:07.654875');
INSERT INTO status_history (id, product_id, status, change_description, detected_at) VALUES (59, 3, 'Unknown', 'New item found: "The Malazan Book of The Fallen; Books 1-3 - Unsigned Third Printing" (Unknown)', '2026-03-07 11:56:07.660249');
INSERT INTO status_history (id, product_id, status, change_description, detected_at) VALUES (60, 3, 'Unknown', 'New item found: "EU ONLY - The Malazan Book of The Fallen; Books 2-3 - Unsigned Third Printing" (Unknown)', '2026-03-07 11:56:07.66509');
INSERT INTO status_history (id, product_id, status, change_description, detected_at) VALUES (61, 3, 'Out of Stock', 'New item found: "Sharp Ends" (Out of Stock)', '2026-03-07 11:56:07.670289');
INSERT INTO status_history (id, product_id, status, change_description, detected_at) VALUES (62, 3, 'Unknown', 'New item found: "Tales of the Plains" (Unknown)', '2026-03-07 11:56:07.676465');
INSERT INTO status_history (id, product_id, status, change_description, detected_at) VALUES (63, 3, 'Unknown', 'New item found: "Brigands & Breadknives" (Unknown)', '2026-03-07 11:56:07.682372');
INSERT INTO status_history (id, product_id, status, change_description, detected_at) VALUES (64, 3, 'Unknown', 'New item found: "Legends And Lattes" (Unknown)', '2026-03-07 11:56:07.688081');
INSERT INTO status_history (id, product_id, status, change_description, detected_at) VALUES (65, 3, 'Unknown', 'New item found: "The Copper Cat Trilogy" (Unknown)', '2026-03-07 11:56:07.693549');
INSERT INTO status_history (id, product_id, status, change_description, detected_at) VALUES (66, 3, 'Unknown', 'New item found: "Hemlock & Silver" (Unknown)', '2026-03-07 11:56:07.698488');
INSERT INTO status_history (id, product_id, status, change_description, detected_at) VALUES (67, 3, 'Unknown', 'New item found: "T. Kingfisher 2-pack" (Unknown)', '2026-03-07 11:56:07.704146');
INSERT INTO status_history (id, product_id, status, change_description, detected_at) VALUES (68, 3, 'Unknown', 'New item found: "Lucid" (Unknown)', '2026-03-07 11:56:07.709578');
INSERT INTO status_history (id, product_id, status, change_description, detected_at) VALUES (69, 3, 'Unknown', 'New item found: "War for the Rose Throne; Books 1-5" (Unknown)', '2026-03-07 11:56:07.715301');
INSERT INTO status_history (id, product_id, status, change_description, detected_at) VALUES (70, 3, 'Unknown', 'New item found: "Paved with Good Intentions" (Unknown)', '2026-03-07 11:56:07.721173');
INSERT INTO status_history (id, product_id, status, change_description, detected_at) VALUES (71, 3, 'Unknown', 'New item found: "The Bone Raiders" (Unknown)', '2026-03-07 11:56:07.726923');
INSERT INTO status_history (id, product_id, status, change_description, detected_at) VALUES (72, 3, 'Unknown', 'New item found: "The Bloodsworn Saga" (Unknown)', '2026-03-07 11:56:07.732034');
INSERT INTO status_history (id, product_id, status, change_description, detected_at) VALUES (73, 3, 'Unknown', 'New item found: "Alchemy and a Cup of Tea" (Unknown)', '2026-03-07 11:56:07.737771');
INSERT INTO status_history (id, product_id, status, change_description, detected_at) VALUES (74, 3, 'Unknown', 'New item found: "Tea You at the Altar" (Unknown)', '2026-03-07 11:56:07.743304');
INSERT INTO status_history (id, product_id, status, change_description, detected_at) VALUES (75, 3, 'Unknown', 'New item found: "A Pirate''s Life For Tea" (Unknown)', '2026-03-07 11:56:07.749072');
INSERT INTO status_history (id, product_id, status, change_description, detected_at) VALUES (76, 3, 'Unknown', 'New item found: "The Damned King" (Unknown)', '2026-03-07 11:56:07.755189');
INSERT INTO status_history (id, product_id, status, change_description, detected_at) VALUES (77, 3, 'Unknown', 'New item found: "The Inheritance Cycle - Unsigned" (Unknown)', '2026-03-07 11:56:07.760451');
INSERT INTO status_history (id, product_id, status, change_description, detected_at) VALUES (78, 3, 'Unknown', 'New item found: "The Inheritance Cycle - EU ONLY Books 3-4 - Unsigned" (Unknown)', '2026-03-07 11:56:07.765329');
INSERT INTO status_history (id, product_id, status, change_description, detected_at) VALUES (79, 3, 'Unknown', 'New item found: "Four Ruined Realms" (Unknown)', '2026-03-07 11:56:07.77076');
INSERT INTO status_history (id, product_id, status, change_description, detected_at) VALUES (80, 3, 'Unknown', 'New item found: "Three Shattered Souls" (Unknown)', '2026-03-07 11:56:07.776495');
INSERT INTO status_history (id, product_id, status, change_description, detected_at) VALUES (81, 3, 'Unknown', 'New item found: "Seal of the Worm" (Unknown)', '2026-03-07 11:56:07.782023');
INSERT INTO status_history (id, product_id, status, change_description, detected_at) VALUES (82, 3, 'Unknown', 'New item found: "War Master''s Gate" (Unknown)', '2026-03-07 11:56:07.78745');
INSERT INTO status_history (id, product_id, status, change_description, detected_at) VALUES (83, 3, 'Unknown', 'New item found: "Heirs of The Blade" (Unknown)', '2026-03-07 11:56:07.793333');
INSERT INTO status_history (id, product_id, status, change_description, detected_at) VALUES (84, 3, 'Unknown', 'New item found: "The Art of Legend" (Unknown)', '2026-03-07 11:56:07.798859');
INSERT INTO status_history (id, product_id, status, change_description, detected_at) VALUES (85, 3, 'Unknown', 'New item found: "Heart of the Wyrdwood" (Unknown)', '2026-03-07 11:56:07.804463');
INSERT INTO status_history (id, product_id, status, change_description, detected_at) VALUES (86, 3, 'Unknown', 'New item found: "Warlords Of Wyrdwood" (Unknown)', '2026-03-07 11:56:07.81008');
INSERT INTO status_history (id, product_id, status, change_description, detected_at) VALUES (87, 3, 'Unknown', 'New item found: "The Sorrow of the Sea - Numbered Edition" (Unknown)', '2026-03-07 11:56:07.815395');
INSERT INTO status_history (id, product_id, status, change_description, detected_at) VALUES (88, 3, 'Unknown', 'New item found: "The Blood Dimmed Tide - Numbered Edition" (Unknown)', '2026-03-07 11:56:07.820891');
INSERT INTO status_history (id, product_id, status, change_description, detected_at) VALUES (89, 3, 'Unknown', 'New item found: "The Tainted Khan" (Unknown)', '2026-03-07 11:56:07.826291');
INSERT INTO status_history (id, product_id, status, change_description, detected_at) VALUES (90, 3, 'Unknown', 'New item found: "The Way of Edan - TBB Press Edition" (Unknown)', '2026-03-07 11:56:07.831754');
INSERT INTO status_history (id, product_id, status, change_description, detected_at) VALUES (91, 3, 'Unknown', 'New item found: "Born of an Iron Storm" (Unknown)', '2026-03-07 11:56:07.838062');
INSERT INTO status_history (id, product_id, status, change_description, detected_at) VALUES (92, 3, 'Unknown', 'New item found: "A Tide Of Black Steel" (Unknown)', '2026-03-07 11:56:07.843781');
INSERT INTO status_history (id, product_id, status, change_description, detected_at) VALUES (93, 3, 'Unknown', 'New item found: "Age of Wrath 2-pack" (Unknown)', '2026-03-07 11:56:07.849329');
INSERT INTO status_history (id, product_id, status, change_description, detected_at) VALUES (94, 3, 'Unknown', 'New item found: "The Talon Duology" (Unknown)', '2026-03-07 11:56:07.854846');
INSERT INTO status_history (id, product_id, status, change_description, detected_at) VALUES (95, 3, 'Unknown', 'New item found: "The Lie that Binds Them" (Unknown)', '2026-03-07 11:56:07.860547');
INSERT INTO status_history (id, product_id, status, change_description, detected_at) VALUES (96, 3, 'Unknown', 'New item found: "The Aulirean Gates" (Unknown)', '2026-03-07 11:56:07.868006');
INSERT INTO status_history (id, product_id, status, change_description, detected_at) VALUES (97, 3, 'Unknown', 'New item found: "Between Dragons and Their Wrath" (Unknown)', '2026-03-07 11:56:07.873359');
INSERT INTO status_history (id, product_id, status, change_description, detected_at) VALUES (98, 3, 'Unknown', 'New item found: "The Scour" (Unknown)', '2026-03-07 11:56:07.879477');
INSERT INTO status_history (id, product_id, status, change_description, detected_at) VALUES (99, 3, 'Unknown', 'New item found: "Caesar''s Avenger" (Unknown)', '2026-03-07 11:56:07.885322');
INSERT INTO status_history (id, product_id, status, change_description, detected_at) VALUES (100, 3, 'Unknown', 'New item found: "Lion Hearts" (Unknown)', '2026-03-07 11:56:07.891598');
INSERT INTO status_history (id, product_id, status, change_description, detected_at) VALUES (101, 3, 'Unknown', 'New item found: "A Palace Near the Wind" (Unknown)', '2026-03-07 11:56:07.897009');
INSERT INTO status_history (id, product_id, status, change_description, detected_at) VALUES (102, 3, 'Unknown', 'New item found: "Witch Queen of Redwinter" (Unknown)', '2026-03-07 11:56:07.903046');
INSERT INTO status_history (id, product_id, status, change_description, detected_at) VALUES (103, 3, 'Unknown', 'New item found: "Blacklight Born" (Unknown)', '2026-03-07 11:56:07.908757');
INSERT INTO status_history (id, product_id, status, change_description, detected_at) VALUES (104, 3, 'Unknown', 'New item found: "Rook & Rose - Tier 2 Leftovers" (Unknown)', '2026-03-07 11:56:07.915041');
INSERT INTO status_history (id, product_id, status, change_description, detected_at) VALUES (105, 3, 'Unknown', 'New item found: "The Drowned Kingdom 2-pack" (Unknown)', '2026-03-07 11:56:07.92053');
INSERT INTO status_history (id, product_id, status, change_description, detected_at) VALUES (106, 3, 'Unknown', 'New item found: "The Bright Sword" (Unknown)', '2026-03-07 11:56:07.927257');
INSERT INTO status_history (id, product_id, status, change_description, detected_at) VALUES (107, 3, 'Unknown', 'New item found: "Anji Kills a King" (Unknown)', '2026-03-07 11:56:07.932428');
INSERT INTO status_history (id, product_id, status, change_description, detected_at) VALUES (108, 3, 'Unknown', 'New item found: "Seven Recipes for Revolution" (Unknown)', '2026-03-07 11:56:07.938291');
INSERT INTO status_history (id, product_id, status, change_description, detected_at) VALUES (109, 3, 'Unknown', 'New item found: "A Darkness Returns" (Unknown)', '2026-03-07 11:56:07.944287');
INSERT INTO status_history (id, product_id, status, change_description, detected_at) VALUES (110, 3, 'Unknown', 'New item found: "In the Shadow of their Dying" (Unknown)', '2026-03-07 11:56:07.950781');
INSERT INTO status_history (id, product_id, status, change_description, detected_at) VALUES (111, 3, 'Unknown', 'New item found: "The Last Vigilant" (Unknown)', '2026-03-07 11:56:07.956146');
INSERT INTO status_history (id, product_id, status, change_description, detected_at) VALUES (112, 3, 'Unknown', 'New item found: "Navola" (Unknown)', '2026-03-07 11:56:07.961865');
INSERT INTO status_history (id, product_id, status, change_description, detected_at) VALUES (113, 3, 'Unknown', 'New item found: "The Reaper" (Unknown)', '2026-03-07 11:56:07.968062');

  -- ============================================
  -- Reset sequences to correct values
  -- ============================================
  SELECT setval('products_id_seq', (SELECT COALESCE(MAX(id), 0) FROM products));
  SELECT setval('page_items_id_seq', (SELECT COALESCE(MAX(id), 0) FROM page_items));
  SELECT setval('status_history_id_seq', (SELECT COALESCE(MAX(id), 0) FROM status_history));
  SELECT setval('settings_id_seq', (SELECT COALESCE(MAX(id), 0) FROM settings));
  