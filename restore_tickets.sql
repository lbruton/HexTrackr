-- Restore all 16 tickets from backup CSV
-- Each ticket gets proper XT### numbering starting from XT001

INSERT INTO tickets (
    id, xt_number, date_submitted, date_due, hexagon_ticket, service_now_ticket, 
    location, devices, supervisor, tech, status, notes, created_at, updated_at
) VALUES 
('xt001', 'XT001', '2025-07-21', '2025-08-31', '10732408', 'INC1092015', 'GRIM', '["GRIMESNSWAN03", "GRIMESNSWAN02"]', 'VAN TINE, ROY', '', 'Open', '', datetime('now'), datetime('now')),
('xt002', 'XT002', '2025-08-21', '2025-08-28', '10723401', 'INC1091977', 'DIAT', '["DIAAIRNSWAN01"]', 'JENKINS II, JJ', '', 'Open', '', datetime('now'), datetime('now')),
('xt003', 'XT003', '2025-07-21', '2025-08-21', '10732405', 'INC1091991', 'GAPK', '["GALENANSWAN09", "GALENANSWAN07"]', 'SILVA, ROCKY; SNOW, PATRICK', '', 'Open', '', datetime('now'), datetime('now')),
('xt004', 'XT004', '2025-07-21', '2025-08-21', '10732403', 'INC1091983', 'DRUM', '["DRUMPNSWAN03"]', 'CANTRELL, JEREMY; LANCE, RYAN', '', 'Open', '', datetime('now'), datetime('now')),
('xt005', 'XT005', '2025-07-09', '2025-08-09', '10725874', 'INC1088253', 'FALL', '["FALLSNSWAN03", "FALLSNSWAN02", "FALLSNSWAN01"]', 'VAN TINE, ROY', '', 'Closed', '', datetime('now'), datetime('now')),
('xt006', 'XT006', '2025-07-09', '2025-08-09', '10725903', 'INC1088477', 'DUBQ', '["ALL SWITCHES"]', 'BINSTOCK, JEFF; GLAZEBROOK, BRADY; GROVER, ANTHONY', '', 'Completed', '', datetime('now'), datetime('now')),
('xt007', 'XT007', '2025-07-09', '2025-08-09', '10725877', 'INC1088311', 'ELPW', '["ALL SWITCHES"]', 'BRYANT, CLIFF; FLORES, JASON', '', 'Closed', '', datetime('now'), datetime('now')),
('xt008', 'XT008', '2025-07-09', '2025-08-09', '10725899', 'INC1088499', 'ELPS', '["ELPALHNSWAN16", "ELPALHNSWAN02"]', 'BRYANT, CLIFF; FLORES, JASON', '', 'Open', '', datetime('now'), datetime('now')),
('xt009', 'XT009', '2025-07-03', '2025-08-03', '10722923', 'INC1086892', 'CDRV', '["CEDARVNSWAN04"]', 'STOKES, DANIEL', '', 'In Progress', '', datetime('now'), datetime('now')),
('xt010', 'XT010', '2025-07-03', '2025-08-03', '10722924', 'INC1086900', 'CMCH', '["COMMANCNSWAN02", "COMMANCNSWAN03"]', 'ORTIZ, CESAR', '', 'Closed', '8-18-2025', datetime('now'), datetime('now')),
('xt011', 'XT011', '2025-07-03', '2025-08-03', '10722925', 'INC1086906', 'DALS', '["DALLASNSWAN07"]', 'LAMPE, DANNY; SMITH, MICHAEL', '', 'Closed', '', datetime('now'), datetime('now')),
('xt012', 'XT012', '2025-07-03', '2025-08-03', '10723359', 'INC1086948', 'DEMS', '["DESMSTNSWAN06", "DESMSTNSWAN08", "DESMSTNSWAN24"]', 'CRAWFORD, SCOTT; DIDLOTT, JUSTIN; ECKHOFF, MARCIA; GROVER, ANTHONY', '', 'Closed', '', datetime('now'), datetime('now')),
('xt013', 'XT013', '2025-07-02', '2025-08-02', '10722694', 'INC1086363', 'OMHA', '["OMAHANSWAN02", "OMAHANSWAN04"]', 'ARMIJO, NICK; BOSCH, JEFF', '', 'Open', '', datetime('now'), datetime('now')),
('xt014', 'XT014', '2025-06-25', '2025-07-25', '10713758', 'INC1084167', 'SPED', '["speedjnswan08", "speedjnswan09", "speedjnswan14"]', 'BROWN, HUNTER; BYRD, DAN; THOMAS, DUSTIN', '', 'Closed', '', datetime('now'), datetime('now')),
('xt015', 'XT015', '2025-05-20', '2025-06-20', '10694378', 'INC1070180', 'GLNP', '["glenpoolnswan01", "glenpoolnswan02", "glenpoolnswan03"]', 'DREYER, AARON; MCKENZIE, TY', '', 'Completed', '', datetime('now'), datetime('now')),
('xt016', 'XT016', '2025-07-23', '2025-09-01', '10733330', 'INC1093152', 'MTZA', '[]', 'ECKHOFF, MARCIA; GROVER, ANTHONY', '', 'Open', '', datetime('now'), datetime('now'));
