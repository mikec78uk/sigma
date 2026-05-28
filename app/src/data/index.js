export const HOSPITAL_CLIENTS = [
  { id: 'BHA-001', name: 'Birmingham Heartlands Hospital',     code: 'BHA-001', postcode: 'B9 5SS',   region: 'West Midlands',     group: 'University Hospitals Birmingham NHS Trust', terms: '30 days', type: 'hospital' },
  { id: 'RGT-104', name: 'Royal Glasgow Trust',                code: 'RGT-104', postcode: 'G4 0SF',   region: 'Greater Glasgow',   group: 'NHS Greater Glasgow & Clyde',               terms: '30 days', type: 'hospital' },
  { id: 'NCH-220', name: 'Northwick Park Pharmacy',            code: 'NCH-220', postcode: 'HA1 3UJ',  region: 'London NW',         group: 'London North West Healthcare',              terms: '45 days', type: 'nrt'      },
  { id: 'LST-318', name: "Leeds St James's University Hospital",code: 'LST-318', postcode: 'LS9 7TF', region: 'Yorkshire',         group: 'Leeds Teaching Hospitals',                  terms: '30 days', type: 'hospital' },
  { id: 'MAN-411', name: 'Manchester Royal Infirmary',         code: 'MAN-411', postcode: 'M13 9WL',  region: 'Greater Manchester', group: 'Manchester University NHS FT',             terms: '30 days', type: 'hospital' },
  { id: 'BRI-509', name: 'Bristol Southmead Hospital',         code: 'BRI-509', postcode: 'BS10 5NB', region: 'South West',        group: 'North Bristol NHS Trust',                   terms: '30 days', type: 'nrt'      },
]

export const ORDER_TYPES = [
  { id: 'hospital', title: 'Hospital / Bulk / MLD',  short: 'Hospital', desc: "Standard order against the customer's hospital pricing schedule.", available: true  },
  { id: 'nrt',      title: 'Nicotine Replacement Therapy (NRT)', short: 'NRT', desc: 'Items dispatched from a dedicated depot.', available: true, depot: { name: 'Sigma NRT Distribution Centre', location: 'Runcorn, Cheshire', code: 'NRT-RC1' } },
]

export const SHIPPING_AGENTS = [
  { code: 'DPDP-NXT',  label: 'DPD Pharma — Next day, temp-controlled' },
  { code: 'DHL-MED',   label: 'DHL Medical Express — Next day' },
  { code: 'RM-T24',    label: 'Royal Mail Tracked 24' },
  { code: 'OWN-FLT',   label: 'Sigma own fleet — South' },
  { code: 'OWN-FLT-N', label: 'Sigma own fleet — North' },
]

export const MANUAL_PICK_REASONS = [
  { code: 'MP-01', label: 'Short-dated stock requested' },
  { code: 'MP-02', label: 'Batch traceability requirement' },
  { code: 'MP-03', label: 'Customer-specified pack' },
  { code: 'MP-04', label: 'Damaged stock concern at DC' },
  { code: 'MP-05', label: 'Recall verification' },
  { code: 'MP-99', label: 'Other (specify in note)' },
]

export const CATALOGUE = [
  { sku: 'SC-04127', name: 'Amoxicillin 500mg Capsules',               pack: '21 caps',   form: 'CAP', category: 'Antibiotics',    msp: 2.84, unit: 2.84, stock: 4280,  stockState: 'ok',  dt: true,  controlled: false },
  { sku: 'SC-04128', name: 'Amoxicillin 250mg/5ml Oral Suspension',    pack: '100ml',     form: 'SUS', category: 'Antibiotics',    msp: 1.74, listPrice: 1.92, discount: 9.4,  unit: 1.74, stock: 612,   stockState: 'ok',  dt: true,  controlled: false },
  { sku: 'SC-04219', name: 'Co-amoxiclav 625mg Tablets',               pack: '21 tabs',   form: 'TAB', category: 'Antibiotics',    msp: 4.18, unit: 4.18, stock: 38,    stockState: 'low', dt: true,  controlled: false },
  { sku: 'SC-04341', name: 'Clarithromycin 500mg Tablets',             pack: '14 tabs',   form: 'TAB', category: 'Antibiotics',    msp: 3.62, unit: 3.62, stock: 0,     stockState: 'out', dt: false, controlled: false },
  { sku: 'SC-05010', name: 'Ramipril 5mg Capsules',                    pack: '28 caps',   form: 'CAP', category: 'Cardiovascular', msp: 1.18, unit: 1.18, stock: 9120,  stockState: 'ok',  dt: true,  controlled: false },
  { sku: 'SC-05011', name: 'Ramipril 10mg Capsules',                   pack: '28 caps',   form: 'CAP', category: 'Cardiovascular', msp: 1.21, listPrice: 1.36, discount: 11.0, unit: 1.21, stock: 7440,  stockState: 'ok',  dt: true,  controlled: false },
  { sku: 'SC-05123', name: 'Atorvastatin 40mg Film-coated Tablets',    pack: '28 tabs',   form: 'TAB', category: 'Cardiovascular', msp: 1.80, listPrice: 1.96, discount: 8.0,  unit: 1.80, stock: 11200, stockState: 'ok',  dt: true,  controlled: false, variants: [{ code: 'ATORV-ACT', description: 'Atorvastatin 40mg Film-coated Tablets — Actavis', priority: 1 }, { code: 'ATORV-TEV', description: 'Atorvastatin 40mg Tablets — Teva', priority: 0 }, { code: 'ATORV-SAN', description: 'Atorvastatin 40mg Film-coated Tablets — Sandoz', priority: 0 }] },
  { sku: 'SC-05124', name: 'Atorvastatin 80mg Film-coated Tablets',    pack: '28 tabs',   form: 'TAB', category: 'Cardiovascular', msp: 2.42, unit: 2.42, stock: 240,   stockState: 'low', dt: true,  controlled: false },
  { sku: 'SC-06502', name: 'Salbutamol 100mcg CFC-free Inhaler',       pack: '200 dose',  form: 'INH', category: 'Respiratory',    msp: 1.48, unit: 1.48, stock: 2680,  stockState: 'ok',  dt: false, controlled: false },
  { sku: 'SC-06503', name: 'Salbutamol 2.5mg/2.5ml Nebuliser Solution',pack: '20x2.5ml', form: 'NEB', category: 'Respiratory',    msp: 3.10, unit: 3.10, stock: 96,    stockState: 'low', dt: true,  controlled: false },
  { sku: 'SC-06621', name: 'Beclometasone 200mcg Inhaler',             pack: '200 dose',  form: 'INH', category: 'Respiratory',    msp: 6.85, unit: 6.85, stock: 1840,  stockState: 'ok',  dt: true,  controlled: false },
  { sku: 'SC-07811', name: 'Paracetamol 500mg Tablets',                pack: '100 tabs',  form: 'TAB', category: 'Analgesics',     msp: 0.81, listPrice: 0.94, discount: 13.8, unit: 0.81, stock: 18450, stockState: 'ok',  dt: true,  controlled: false },
  { sku: 'SC-07815', name: 'Paracetamol 120mg/5ml Oral Suspension',    pack: '100ml',     form: 'SUS', category: 'Analgesics',     msp: 1.12, unit: 1.12, stock: 3210,  stockState: 'ok',  dt: true,  controlled: false },
  { sku: 'SC-07920', name: 'Ibuprofen 400mg Tablets',                  pack: '84 tabs',   form: 'TAB', category: 'Analgesics',     msp: 1.78, unit: 1.78, stock: 6420,  stockState: 'ok',  dt: true,  controlled: false },
  { sku: 'SC-07925', name: 'Codeine Phosphate 30mg Tablets',           pack: '100 tabs',  form: 'TAB', category: 'Analgesics',     msp: 5.21, unit: 5.21, stock: 412,   stockState: 'ok',  dt: true,  controlled: true,  exportRestricted: true },
  { sku: 'SC-08402', name: 'Omeprazole 20mg Gastro-Resistant Capsules',pack: '28 caps',   form: 'CAP', category: 'Gastro',         msp: 1.04, unit: 1.04, stock: 8900,  stockState: 'ok',  dt: true,  controlled: false },
  { sku: 'SC-08404', name: 'Lansoprazole 30mg Capsules',               pack: '28 caps',   form: 'CAP', category: 'Gastro',         msp: 1.18, unit: 1.18, stock: 5640,  stockState: 'ok',  dt: true,  controlled: false },
  { sku: 'SC-08612', name: 'Metformin 500mg Tablets',                  pack: '84 tabs',   form: 'TAB', category: 'Diabetes',       msp: 1.32, unit: 1.32, stock: 12340, stockState: 'ok',  dt: true,  controlled: false, variants: [{ code: 'METF-BRI', description: 'Metformin 500mg Tablets — Bristol Labs', priority: 1 }, { code: 'METF-WAR', description: 'Metformin 500mg Tablets — Warnex', priority: 0 }, { code: 'METF-MOR', description: 'Metformin 500mg Tablets — Morningside', priority: 0 }] },
  { sku: 'SC-08613', name: 'Metformin 1000mg Tablets',                 pack: '56 tabs',   form: 'TAB', category: 'Diabetes',       msp: 1.31, listPrice: 1.46, discount: 10.3, unit: 1.31, stock: 88,    stockState: 'low', dt: true,  controlled: false },
  { sku: 'SC-09201', name: 'Levothyroxine 100mcg Tablets',             pack: '28 tabs',   form: 'TAB', category: 'Endocrine',      msp: 0.92, unit: 0.92, stock: 14210, stockState: 'ok',  dt: true,  controlled: false },
  { sku: 'SC-09502', name: 'Sertraline 50mg Tablets',                  pack: '28 tabs',   form: 'TAB', category: 'CNS',            msp: 1.24, unit: 1.24, stock: 7280,  stockState: 'ok',  dt: true,  controlled: false },
  { sku: 'SC-09506', name: 'Citalopram 20mg Tablets',                  pack: '28 tabs',   form: 'TAB', category: 'CNS',            msp: 1.08, unit: 1.08, stock: 0,     stockState: 'out', dt: false, controlled: false },
  { sku: 'SC-09611', name: 'Diazepam 5mg Tablets',                     pack: '28 tabs',   form: 'TAB', category: 'CNS',            msp: 1.96, unit: 1.96, stock: 320,   stockState: 'ok',  dt: true,  controlled: true,  exportRestricted: true },
  { sku: 'SC-10220', name: 'Furosemide 40mg Tablets',                  pack: '28 tabs',   form: 'TAB', category: 'Diuretic',       msp: 0.88, unit: 0.88, stock: 5210,  stockState: 'ok',  dt: true,  controlled: false },
  { sku: 'SC-10412', name: 'Bisoprolol 5mg Tablets',                   pack: '28 tabs',   form: 'TAB', category: 'Cardiovascular', msp: 0.96, unit: 0.96, stock: 6420,  stockState: 'ok',  dt: true,  controlled: false },
]

export const CATEGORIES = ['All', 'Antibiotics', 'Cardiovascular', 'Respiratory', 'Analgesics', 'Gastro', 'Diabetes', 'Endocrine', 'CNS', 'Diuretic']

export const NRT_CATEGORIES = ['All', 'Patches', 'Gum', 'Lozenges', 'Inhalator', 'Spray', 'Microtab']

export const NRT_CATALOGUE = [
  // Patches (12)
  { sku: 'NC-10001', name: 'Nicorette Invisipatch 25mg/16hr Patch Step 1',  pack: '7 patches',    form: 'PCH', category: 'Patches',   msp: 8.50,  unit: 8.50,  stock: 2400, stockState: 'ok',  dt: false, controlled: false },
  { sku: 'NC-10002', name: 'Nicorette Invisipatch 15mg/16hr Patch Step 2',  pack: '7 patches',    form: 'PCH', category: 'Patches',   msp: 7.20,  unit: 7.20,  stock: 1840, stockState: 'ok',  dt: false, controlled: false },
  { sku: 'NC-10003', name: 'Nicorette Invisipatch 10mg/16hr Patch Step 3',  pack: '7 patches',    form: 'PCH', category: 'Patches',   msp: 6.80,  unit: 6.80,  stock: 1620, stockState: 'ok',  dt: false, controlled: false },
  { sku: 'NC-10004', name: 'NiQuitin Clear 21mg/24hr Patch Step 1',         pack: '7 patches',    form: 'PCH', category: 'Patches',   msp: 9.10,  unit: 9.10,  stock: 980,  stockState: 'ok',  dt: false, controlled: false },
  { sku: 'NC-10005', name: 'NiQuitin Clear 14mg/24hr Patch Step 2',         pack: '7 patches',    form: 'PCH', category: 'Patches',   msp: 8.40,  unit: 8.40,  stock: 760,  stockState: 'ok',  dt: false, controlled: false },
  { sku: 'NC-10006', name: 'NiQuitin Clear 7mg/24hr Patch Step 3',          pack: '7 patches',    form: 'PCH', category: 'Patches',   msp: 7.90,  unit: 7.90,  stock: 540,  stockState: 'low', dt: false, controlled: false },
  { sku: 'NC-10007', name: 'Nicotinell TTS30 21mg/24hr Patch',              pack: '7 patches',    form: 'PCH', category: 'Patches',   msp: 8.80,  unit: 8.80,  stock: 1120, stockState: 'ok',  dt: false, controlled: false },
  { sku: 'NC-10008', name: 'Nicotinell TTS20 14mg/24hr Patch',              pack: '7 patches',    form: 'PCH', category: 'Patches',   msp: 7.60,  unit: 7.60,  stock: 880,  stockState: 'ok',  dt: false, controlled: false },
  { sku: 'NC-10009', name: 'Nicotinell TTS10 7mg/24hr Patch',               pack: '7 patches',    form: 'PCH', category: 'Patches',   msp: 6.90,  unit: 6.90,  stock: 640,  stockState: 'low', dt: false, controlled: false },
  { sku: 'NC-10010', name: 'Generic Nicotine 21mg/24hr Patch',              pack: '7 patches',    form: 'PCH', category: 'Patches',   msp: 4.68,  listPrice: 5.20, discount: 10.0, unit: 4.68,  stock: 3200, stockState: 'ok',  dt: false, controlled: false },
  { sku: 'NC-10011', name: 'Generic Nicotine 14mg/24hr Patch',              pack: '7 patches',    form: 'PCH', category: 'Patches',   msp: 4.80,  unit: 4.80,  stock: 2800, stockState: 'ok',  dt: false, controlled: false },
  { sku: 'NC-10012', name: 'Generic Nicotine 7mg/24hr Patch',               pack: '7 patches',    form: 'PCH', category: 'Patches',   msp: 4.20,  unit: 4.20,  stock: 2400, stockState: 'ok',  dt: false, controlled: false },
  // Gum (14)
  { sku: 'NC-20001', name: 'Nicorette 2mg Original Gum',                    pack: '30 pieces',    form: 'GUM', category: 'Gum',       msp: 3.40,  unit: 3.40,  stock: 4200, stockState: 'ok',  dt: false, controlled: false },
  { sku: 'NC-20002', name: 'Nicorette 4mg Original Gum',                    pack: '30 pieces',    form: 'GUM', category: 'Gum',       msp: 3.80,  unit: 3.80,  stock: 3800, stockState: 'ok',  dt: false, controlled: false },
  { sku: 'NC-20003', name: 'Nicorette 2mg Freshmint Gum',                   pack: '105 pieces',   form: 'GUM', category: 'Gum',       msp: 10.80, promo: 9.72,  unit: 9.72,  stock: 1640, stockState: 'ok',  dt: false, controlled: false },
  { sku: 'NC-20004', name: 'Nicorette 4mg Freshmint Gum',                   pack: '105 pieces',   form: 'GUM', category: 'Gum',       msp: 11.40, unit: 11.40, stock: 1420, stockState: 'ok',  dt: false, controlled: false },
  { sku: 'NC-20005', name: 'Nicorette 2mg Fruit Gum',                       pack: '30 pieces',    form: 'GUM', category: 'Gum',       msp: 3.40,  unit: 3.40,  stock: 2600, stockState: 'ok',  dt: false, controlled: false },
  { sku: 'NC-20006', name: 'Nicorette 4mg Fruit Gum',                       pack: '30 pieces',    form: 'GUM', category: 'Gum',       msp: 3.80,  unit: 3.80,  stock: 2200, stockState: 'ok',  dt: false, controlled: false },
  { sku: 'NC-20007', name: 'NiQuitin 2mg Freshmint Gum',                    pack: '30 pieces',    form: 'GUM', category: 'Gum',       msp: 3.20,  unit: 3.20,  stock: 1800, stockState: 'ok',  dt: false, controlled: false },
  { sku: 'NC-20008', name: 'NiQuitin 4mg Freshmint Gum',                    pack: '30 pieces',    form: 'GUM', category: 'Gum',       msp: 3.60,  unit: 3.60,  stock: 1600, stockState: 'ok',  dt: false, controlled: false },
  { sku: 'NC-20009', name: 'Nicotinell 2mg Freshmint Gum',                  pack: '96 pieces',    form: 'GUM', category: 'Gum',       msp: 8.90,  unit: 8.90,  stock: 1200, stockState: 'ok',  dt: false, controlled: false },
  { sku: 'NC-20010', name: 'Nicotinell 4mg Freshmint Gum',                  pack: '96 pieces',    form: 'GUM', category: 'Gum',       msp: 9.40,  unit: 9.40,  stock: 980,  stockState: 'low', dt: false, controlled: false },
  { sku: 'NC-20011', name: 'Generic Nicotine 2mg Gum',                      pack: '105 pieces',   form: 'GUM', category: 'Gum',       msp: 6.20,  promo: 5.58,  unit: 5.58,  stock: 5200, stockState: 'ok',  dt: false, controlled: false },
  { sku: 'NC-20012', name: 'Generic Nicotine 4mg Gum',                      pack: '105 pieces',   form: 'GUM', category: 'Gum',       msp: 6.80,  unit: 6.80,  stock: 4800, stockState: 'ok',  dt: false, controlled: false },
  { sku: 'NC-20013', name: 'Nicorette 4mg Icy White Gum',                   pack: '30 pieces',    form: 'GUM', category: 'Gum',       msp: 3.80,  unit: 3.80,  stock: 1400, stockState: 'ok',  dt: false, controlled: false },
  { sku: 'NC-20014', name: 'Nicotinell Fruit & Mint 2mg Gum',               pack: '96 pieces',    form: 'GUM', category: 'Gum',       msp: 8.90,  unit: 8.90,  stock: 840,  stockState: 'low', dt: false, controlled: false },
  // Lozenges (10)
  { sku: 'NC-30001', name: 'Nicorette 1.5mg Mint Lozenge',                  pack: '20 lozenges',  form: 'LOZ', category: 'Lozenges',  msp: 3.60,  unit: 3.60,  stock: 3200, stockState: 'ok',  dt: false, controlled: false },
  { sku: 'NC-30002', name: 'Nicorette 4mg Mint Lozenge',                    pack: '20 lozenges',  form: 'LOZ', category: 'Lozenges',  msp: 4.10,  unit: 4.10,  stock: 2800, stockState: 'ok',  dt: false, controlled: false },
  { sku: 'NC-30003', name: 'NiQuitin 1.5mg Mini Mint Lozenge',              pack: '20 lozenges',  form: 'LOZ', category: 'Lozenges',  msp: 3.40,  unit: 3.40,  stock: 2400, stockState: 'ok',  dt: false, controlled: false },
  { sku: 'NC-30004', name: 'NiQuitin 2mg Mini Mint Lozenge',                pack: '20 lozenges',  form: 'LOZ', category: 'Lozenges',  msp: 3.20,  unit: 3.20,  stock: 2100, stockState: 'ok',  dt: false, controlled: false },
  { sku: 'NC-30005', name: 'NiQuitin 4mg Mini Mint Lozenge',                pack: '20 lozenges',  form: 'LOZ', category: 'Lozenges',  msp: 3.80,  unit: 3.80,  stock: 1800, stockState: 'ok',  dt: false, controlled: false },
  { sku: 'NC-30006', name: 'Nicotinell 1mg Mint Lozenge',                   pack: '36 lozenges',  form: 'LOZ', category: 'Lozenges',  msp: 4.20,  unit: 4.20,  stock: 1400, stockState: 'ok',  dt: false, controlled: false },
  { sku: 'NC-30007', name: 'Generic Nicotine 2mg Lozenge',                  pack: '36 lozenges',  form: 'LOZ', category: 'Lozenges',  msp: 2.40,  unit: 2.40,  stock: 4600, stockState: 'ok',  dt: false, controlled: false },
  { sku: 'NC-30008', name: 'Generic Nicotine 4mg Lozenge',                  pack: '36 lozenges',  form: 'LOZ', category: 'Lozenges',  msp: 2.80,  unit: 2.80,  stock: 4200, stockState: 'ok',  dt: false, controlled: false },
  { sku: 'NC-30009', name: 'NiQuitin 4mg Mini Lozenge Bulk',                pack: '100 lozenges', form: 'LOZ', category: 'Lozenges',  msp: 14.80, unit: 14.80, stock: 640,  stockState: 'low', dt: false, controlled: false },
  { sku: 'NC-30010', name: 'Generic Nicotine 4mg Lozenge Bulk',             pack: '96 lozenges',  form: 'LOZ', category: 'Lozenges',  msp: 6.80,  unit: 6.80,  stock: 0,    stockState: 'out', dt: false, controlled: false },
  // Inhalator (6)
  { sku: 'NC-40001', name: 'Nicorette Inhalator 10mg Cartridges',           pack: '4 cartridges', form: 'INH', category: 'Inhalator', msp: 5.20,  unit: 5.20,  stock: 1800, stockState: 'ok',  dt: false, controlled: false },
  { sku: 'NC-40002', name: 'Nicorette Inhalator 10mg Cartridges',           pack: '20 cartridges',form: 'INH', category: 'Inhalator', msp: 18.90, unit: 18.90, stock: 1200, stockState: 'ok',  dt: false, controlled: false },
  { sku: 'NC-40003', name: 'Nicorette Inhalator 15mg Cartridges',           pack: '4 cartridges', form: 'INH', category: 'Inhalator', msp: 5.80,  unit: 5.80,  stock: 1400, stockState: 'ok',  dt: false, controlled: false },
  { sku: 'NC-40004', name: 'Nicorette Inhalator 15mg Cartridges',           pack: '20 cartridges',form: 'INH', category: 'Inhalator', msp: 21.40, unit: 21.40, stock: 840,  stockState: 'ok',  dt: false, controlled: false },
  { sku: 'NC-40005', name: 'Nicorette Inhalator Starter Kit 15mg',          pack: '1 kit',        form: 'INH', category: 'Inhalator', msp: 24.80, unit: 24.80, stock: 480,  stockState: 'low', dt: false, controlled: false },
  { sku: 'NC-40006', name: 'Generic Nicotine Inhalator 15mg',               pack: '20 cartridges',form: 'INH', category: 'Inhalator', msp: 14.60, promo: 13.14, unit: 13.14, stock: 640,  stockState: 'ok',  dt: false, controlled: false },
  // Spray (9)
  { sku: 'NC-50001', name: 'Nicorette QuickMist 1mg Mouth Spray',           pack: '150 doses',    form: 'SPR', category: 'Spray',     msp: 10.80, unit: 10.80, stock: 2200, stockState: 'ok',  dt: false, controlled: false },
  { sku: 'NC-50002', name: 'Nicorette QuickMist Cool Berry 1mg Spray',      pack: '150 doses',    form: 'SPR', category: 'Spray',     msp: 10.80, unit: 10.80, stock: 1800, stockState: 'ok',  dt: false, controlled: false },
  { sku: 'NC-50003', name: 'Nicorette QuickMist Duo 1mg Spray',             pack: '2×150 doses',  form: 'SPR', category: 'Spray',     msp: 19.60, promo: 17.64, unit: 17.64, stock: 1200, stockState: 'ok',  dt: false, controlled: false },
  { sku: 'NC-50004', name: 'Nicorette Nasal Spray 500mcg/dose',             pack: '200 doses',    form: 'SPR', category: 'Spray',     msp: 12.40, unit: 12.40, stock: 640,  stockState: 'low', dt: false, controlled: false },
  { sku: 'NC-50005', name: 'NiQuitin Mouth Spray 1mg',                      pack: '150 doses',    form: 'SPR', category: 'Spray',     msp: 10.40, unit: 10.40, stock: 1600, stockState: 'ok',  dt: false, controlled: false },
  { sku: 'NC-50006', name: 'Nicotinell Mouth Spray 1mg',                    pack: '150 doses',    form: 'SPR', category: 'Spray',     msp: 10.60, unit: 10.60, stock: 1200, stockState: 'ok',  dt: false, controlled: false },
  { sku: 'NC-50007', name: 'Generic Nicotine Mouth Spray 1mg',              pack: '150 doses',    form: 'SPR', category: 'Spray',     msp: 7.80,  unit: 7.80,  stock: 2800, stockState: 'ok',  dt: false, controlled: false },
  { sku: 'NC-50008', name: 'Nicorette Nasal Spray 500mcg Refill',           pack: '200 doses',    form: 'SPR', category: 'Spray',     msp: 11.80, unit: 11.80, stock: 0,    stockState: 'out', dt: false, controlled: false },
  { sku: 'NC-50009', name: 'NiQuitin Spray Duo Pack 1mg',                   pack: '2×150 doses',  form: 'SPR', category: 'Spray',     msp: 19.20, unit: 19.20, stock: 480,  stockState: 'low', dt: false, controlled: false },
  // Microtab (4)
  { sku: 'NC-60001', name: 'Nicorette Microtab 2mg Sublingual Tablets',     pack: '100 tablets',  form: 'TAB', category: 'Microtab',  msp: 8.60,  unit: 8.60,  stock: 1800, stockState: 'ok',  dt: false, controlled: false },
  { sku: 'NC-60002', name: 'Nicorette Microtab 2mg Sublingual Tablets',     pack: '40 tablets',   form: 'TAB', category: 'Microtab',  msp: 3.80,  unit: 3.80,  stock: 2400, stockState: 'ok',  dt: false, controlled: false },
  { sku: 'NC-60003', name: 'Generic Nicotine 2mg Sublingual Tablets',       pack: '100 tablets',  form: 'TAB', category: 'Microtab',  msp: 5.40,  unit: 5.40,  stock: 2800, stockState: 'ok',  dt: false, controlled: false },
  { sku: 'NC-60004', name: 'NiQuitin Strips 2.5mg',                         pack: '14 strips',    form: 'STR', category: 'Microtab',  msp: 4.80,  unit: 4.80,  stock: 960,  stockState: 'ok',  dt: false, controlled: false },
]

export const ORDERS_SEED = [
  { id: 'SO-2026-04425', ref: 'Respiratory stock top-up',           clientId: 'NCH-220', type: 'hospital', status: 'pending-approval', placed: '2026-05-12 10:14', lines: 7,  total: 1840.20, agent: 'DPDP-NXT',  poNumber: 'PO-2026-00848', shipDate: '2026-05-16', note: null, approverComment: 'Items required for urgent patient care — supply cannot be delayed. Agreed with account manager Sarah T. on 10 May — see email thread ref #4821.' },
  { id: 'SO-2026-04424', ref: 'Diabetic ward restock',              clientId: 'BHA-001', type: 'hospital', status: 'pending-approval', placed: '2026-05-11 16:22', lines: 12, total: 3210.55, agent: 'OWN-FLT',   poNumber: 'PO-2026-00846', shipDate: '2026-05-15', note: 'Urgent — ward running low on insulin supplies.', approverComment: null },
  { id: 'SO-2026-04422', ref: 'Oncology supportive care restock',    clientId: 'MAN-411', type: 'hospital', status: 'submitted', placed: '2026-05-10 11:05', lines: 8,  total: 2614.80, agent: 'OWN-FLT',   poNumber: 'PO-2026-00843', shipDate: '2026-05-15', note: null, approverComment: 'Discussed with James (commercial) last week — pricing reflects the Q2 contract rate agreed for this account.', approvedBy: 'James Whitfield', approvedAt: '2026-05-10 14:22' },
  { id: 'SO-2026-04421', ref: 'Pharmacy Dispensary — Apr restock',  clientId: 'BHA-001', type: 'hospital', status: 'submitted', placed: '2026-05-09 09:12', lines: 18, total: 4128.42, agent: 'DPDP-NXT',  poNumber: 'PO-2026-00841', shipDate: '2026-05-12', note: 'Please deliver to pharmacy goods-in. Contact Jane Marsh on arrival.' },
  { id: 'SO-2026-04420', ref: 'Critical antibiotics top-up',         clientId: 'MAN-411', type: 'hospital', status: 'submitted', placed: '2026-05-09 08:46', lines: 6,  total: 942.18,  agent: 'OWN-FLT-N', poNumber: 'PO-2026-00840', shipDate: '2026-05-13', note: null },
  { id: 'SO-2026-04419', ref: 'Ward 4B controlled drugs',            clientId: 'LST-318', type: 'hospital', status: 'submitted', placed: '2026-05-08 17:31', lines: 4,  total: 318.40,  agent: 'DHL-MED',   poNumber: 'PO-2026-00837', shipDate: '2026-05-14', note: 'Batch traceability documentation required with delivery.' },
  { id: 'SO-2026-04418', ref: 'Routine weekly — May W2',             clientId: 'RGT-104', type: 'hospital', status: 'submitted', placed: '2026-05-08 14:02', lines: 22, total: 5712.04, agent: 'OWN-FLT-N', poNumber: 'PO-2026-00835', shipDate: '2026-05-12', note: null },
  { id: 'SO-2026-04416', ref: 'Respiratory clinic stock',            clientId: 'NCH-220', type: 'hospital', status: 'submitted', placed: '2026-05-08 11:18', lines: 9,  total: 1290.60, agent: 'DPDP-NXT',  poNumber: 'PO-2026-00831', shipDate: '2026-05-15', note: 'Short-dated stock acceptable for inhalers — minimum 6 months expiry.' },
  { id: 'SO-2026-04412', ref: 'Endocrine review — May',              clientId: 'BRI-509', type: 'hospital', status: 'submitted', placed: '2026-05-07 16:44', lines: 11, total: 2185.30, agent: 'RM-T24',    poNumber: 'PO-2026-00822', shipDate: '2026-05-16', note: null },
  { id: 'SO-2026-04415', ref: 'Cardiology monthly restock',           clientId: 'LST-318', type: 'hospital', status: 'rejected',  placed: '2026-05-07 11:30', lines: 14, total: 2940.80, agent: 'DHL-MED',   poNumber: 'PO-2026-00829', shipDate: '2026-05-14', note: null, rejectionNote: 'This order cannot be fulfilled at this time. Leeds St James\'s University Hospital has exceeded their credit limit and their account is currently on hold. Please contact the credit control team to resolve before resubmitting.' },
  { id: 'SO-2026-04410', ref: 'Analgesics bulk order',               clientId: 'RGT-104', type: 'hospital', status: 'rejected',  placed: '2026-05-06 09:45', lines: 5,  total: 890.40,  agent: 'RM-T24',    poNumber: 'PO-2026-00818', shipDate: null,         note: null, rejectionNote: 'Order placed on hold — Royal Group of Hospitals has an outstanding balance that has exceeded the agreed credit limit. Fulfilment will resume once payment is received or a credit extension is approved.' },
  { id: 'DR-2026-04408', ref: 'Credit review draft',                  clientId: 'BHA-001', type: 'hospital', status: 'draft',     placed: '2026-05-07 09:00', lines: 7,  total: 1822.10, agent: null,         poNumber: null,            shipDate: null,         note: null },
  { id: 'DR-2026-00318', ref: 'Cardiology top-up (incomplete)',      clientId: 'MAN-411', type: 'hospital', status: 'draft',     placed: '2026-05-10 16:18', lines: 3,  total: 184.80,  agent: null,         poNumber: null,            shipDate: null,         note: null },
  { id: 'DR-2026-00317', ref: 'Untitled draft',                      clientId: 'LST-318', type: 'hospital', status: 'draft',     placed: '2026-05-10 14:52', lines: 1,  total: 24.20,   agent: null,         poNumber: null,            shipDate: null,         note: null },
  { id: 'DR-2026-00314', ref: 'Diabetes restock plan',               clientId: 'RGT-104', type: 'hospital', status: 'draft',     placed: '2026-05-09 18:04', lines: 9,  total: 612.40,  agent: null,         poNumber: null,            shipDate: null,         note: null },
  { id: 'SO-2026-04430', ref: 'NRT programme — May resupply',        clientId: 'MAN-411', type: 'nrt',      status: 'submitted',  placed: '2026-05-13 09:22', lines: 8,  total: 312.40,  agent: 'DPDP-NXT',   poNumber: 'PO-2026-00860', shipDate: '2026-05-16', note: 'Standing NRT order for smoking cessation clinic.' },
  { id: 'SO-2026-04427', ref: 'NRT starter packs — CCG contract',   clientId: 'NCH-220', type: 'nrt',      status: 'submitted',  placed: '2026-05-11 14:08', lines: 5,  total: 184.60,  agent: 'RM-T24',     poNumber: 'PO-2026-00852', shipDate: '2026-05-15', note: null },
  { id: 'SO-2026-04423', ref: 'Stop smoking service — Q2 stock',    clientId: 'LST-318', type: 'nrt',      status: 'submitted',  placed: '2026-05-09 11:40', lines: 11, total: 498.20,  agent: 'DPDP-NXT',   poNumber: 'PO-2026-00844', shipDate: '2026-05-13', note: 'Delivery must be to pharmacy reception only.' },
  { id: 'DR-2026-00320', ref: 'NRT patches & gum top-up',           clientId: 'BHA-001', type: 'nrt',      status: 'draft',      placed: '2026-05-12 15:30', lines: 4,  total: 148.80,  agent: null,          poNumber: null,            shipDate: null,         note: null },
  { id: 'DR-2026-00319', ref: 'Smoking cessation programme restock', clientId: 'RGT-104', type: 'nrt',      status: 'draft',      placed: '2026-05-11 10:14', lines: 6,  total: 221.60,  agent: null,          poNumber: null,            shipDate: null,         note: null },

  // EDI — successfully processed
  { id: 'EDI-2026-04436', ref: 'Weekly standing order — W20',      clientId: 'BHA-001', type: 'hospital', status: 'submitted',  edi: true, placed: '2026-05-14 07:41', lines: 8,  total: 2184.40, agent: 'DPDP-NXT',    poNumber: 'PO-2026-00866', shipDate: '2026-05-17', note: null },
  { id: 'EDI-2026-04426', ref: 'Analgesics standing order',         clientId: 'LST-318', type: 'hospital', status: 'submitted',  edi: true, placed: '2026-05-11 07:55', lines: 4,  total: 892.60,  agent: 'DHL-MED',     poNumber: 'PO-2026-00851', shipDate: '2026-05-14', note: null },

  // EDI — price mismatch errors awaiting resolution
  { id: 'EDI-2026-04435', ref: 'Cardiovascular restock — EDI',     clientId: 'MAN-411', type: 'hospital', status: 'edi-error',  edi: true, placed: '2026-05-14 06:12', lines: 5,  total: 0,       agent: 'DPDP-NXT',    poNumber: 'PO-2026-00864', shipDate: '2026-05-17', note: null,
    ediErrors: [
      { sku: 'SC-05011', name: 'Ramipril 10mg Capsules',                 orderedPrice: 1.45, systemPrice: 1.36 },
      { sku: 'SC-05123', name: 'Atorvastatin 40mg Film-coated Tablets',  orderedPrice: 2.10, systemPrice: 1.96 },
    ],
  },
  { id: 'EDI-2026-04429', ref: 'Antibiotics top-up — EDI',         clientId: 'RGT-104', type: 'hospital', status: 'edi-error',  edi: true, placed: '2026-05-12 06:30', lines: 3,  total: 0,       agent: 'OWN-FLT-N',   poNumber: 'PO-2026-00856', shipDate: '2026-05-15', note: null,
    ediErrors: [
      { sku: 'SC-04128', name: 'Amoxicillin 250mg/5ml Oral Suspension',  orderedPrice: 2.05, systemPrice: 1.92 },
    ],
  },
]
