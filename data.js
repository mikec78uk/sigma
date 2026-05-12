/* Mock data for Sigma Connect ordering prototype */

window.HOSPITAL_CLIENTS = [
  { id: "BHA-001", name: "Birmingham Heartlands Hospital", code: "BHA-001", region: "West Midlands", group: "University Hospitals Birmingham NHS Trust", terms: "30 days" },
  { id: "RGT-104", name: "Royal Glasgow Trust", code: "RGT-104", region: "Greater Glasgow", group: "NHS Greater Glasgow & Clyde", terms: "30 days" },
  { id: "NCH-220", name: "Northwick Park Pharmacy", code: "NCH-220", region: "London NW", group: "London North West Healthcare", terms: "45 days" },
  { id: "LST-318", name: "Leeds St James's University Hospital", code: "LST-318", region: "Yorkshire", group: "Leeds Teaching Hospitals", terms: "30 days" },
  { id: "MAN-411", name: "Manchester Royal Infirmary", code: "MAN-411", region: "Greater Manchester", group: "Manchester University NHS FT", terms: "30 days" },
  { id: "BRI-509", name: "Bristol Southmead Hospital", code: "BRI-509", region: "South West", group: "North Bristol NHS Trust", terms: "30 days" },
];

window.ORDER_TYPES = [
  { id: "hospital", title: "Hospital", desc: "Standard order against the customer's hospital pricing schedule. Routed via SAP order entry.", available: true },
  { id: "bulk",     title: "Bulk Order", desc: "Large-volume order with tiered pricing and extended lead time. Requires commercial pre-approval.", available: false },
  { id: "nrt",      title: "NRT", desc: "Non-routine transfer (split shipments, manual allocations). Used for shortages and special handling.", available: false },
];

window.SHIPPING_AGENTS = [
  { code: "DPDP-NXT",  label: "DPD Pharma — Next day, temp-controlled" },
  { code: "DHL-MED",   label: "DHL Medical Express — Next day" },
  { code: "RM-T24",    label: "Royal Mail Tracked 24" },
  { code: "OWN-FLT",   label: "Sigma own fleet — South" },
  { code: "OWN-FLT-N", label: "Sigma own fleet — North" },
];

window.MANUAL_PICK_REASONS = [
  { code: "MP-01", label: "Short-dated stock requested" },
  { code: "MP-02", label: "Batch traceability requirement" },
  { code: "MP-03", label: "Customer-specified pack" },
  { code: "MP-04", label: "Damaged stock concern at DC" },
  { code: "MP-05", label: "Recall verification" },
  { code: "MP-99", label: "Other (specify in note)" },
];

/* Product catalogue — realistic generic UK pharma SKUs, fictional codes */
window.CATALOGUE = [
  { sku: "SC-04127", name: "Amoxicillin 500mg Capsules",        pack: "21 caps",   form: "CAP", category: "Antibiotics",   msp: 2.84,  promo: null,  unit: 2.84,  stock: 4280, stockState: "ok",  dt: true,  controlled: false },
  { sku: "SC-04128", name: "Amoxicillin 250mg/5ml Oral Suspension", pack: "100ml",  form: "SUS", category: "Antibiotics",   msp: 1.92,  promo: 1.74,  unit: 1.74,  stock: 612,  stockState: "ok",  dt: true,  controlled: false },
  { sku: "SC-04219", name: "Co-amoxiclav 625mg Tablets",         pack: "21 tabs",  form: "TAB", category: "Antibiotics",   msp: 4.18,  promo: null,  unit: 4.18,  stock: 38,   stockState: "low", dt: true,  controlled: false },
  { sku: "SC-04341", name: "Clarithromycin 500mg Tablets",       pack: "14 tabs",  form: "TAB", category: "Antibiotics",   msp: 3.62,  promo: null,  unit: 3.62,  stock: 0,    stockState: "out", dt: false, controlled: false },
  { sku: "SC-05010", name: "Ramipril 5mg Capsules",              pack: "28 caps",  form: "CAP", category: "Cardiovascular",msp: 1.18,  promo: null,  unit: 1.18,  stock: 9120, stockState: "ok",  dt: true,  controlled: false },
  { sku: "SC-05011", name: "Ramipril 10mg Capsules",             pack: "28 caps",  form: "CAP", category: "Cardiovascular",msp: 1.36,  promo: 1.21,  unit: 1.21,  stock: 7440, stockState: "ok",  dt: true,  controlled: false },
  { sku: "SC-05123", name: "Atorvastatin 40mg Film-coated Tablets", pack: "28 tabs",form: "TAB", category: "Cardiovascular",msp: 1.96, promo: null,  unit: 1.96,  stock: 11200,stockState: "ok",  dt: true,  controlled: false },
  { sku: "SC-05124", name: "Atorvastatin 80mg Film-coated Tablets", pack: "28 tabs",form: "TAB", category: "Cardiovascular",msp: 2.42, promo: null,  unit: 2.42,  stock: 240,  stockState: "low", dt: true,  controlled: false },
  { sku: "SC-06502", name: "Salbutamol 100mcg CFC-free Inhaler",  pack: "200 dose",form: "INH", category: "Respiratory",   msp: 1.48,  promo: null,  unit: 1.48,  stock: 2680, stockState: "ok",  dt: false, controlled: false },
  { sku: "SC-06503", name: "Salbutamol 2.5mg/2.5ml Nebuliser Solution", pack: "20x2.5ml",form:"NEB",category:"Respiratory",msp:3.10,promo: null,unit:3.10,stock: 96, stockState:"low", dt:true, controlled:false },
  { sku: "SC-06621", name: "Beclometasone 200mcg Inhaler",        pack: "200 dose",form: "INH", category: "Respiratory",   msp: 6.85,  promo: null,  unit: 6.85,  stock: 1840, stockState: "ok",  dt: true,  controlled: false },
  { sku: "SC-07811", name: "Paracetamol 500mg Tablets",           pack: "100 tabs",form: "TAB", category: "Analgesics",    msp: 0.94,  promo: 0.81,  unit: 0.81,  stock: 18450,stockState: "ok",  dt: true,  controlled: false },
  { sku: "SC-07815", name: "Paracetamol 120mg/5ml Oral Suspension",pack: "100ml",  form: "SUS", category: "Analgesics",    msp: 1.12,  promo: null,  unit: 1.12,  stock: 3210, stockState: "ok",  dt: true,  controlled: false },
  { sku: "SC-07920", name: "Ibuprofen 400mg Tablets",             pack: "84 tabs", form: "TAB", category: "Analgesics",    msp: 1.78,  promo: null,  unit: 1.78,  stock: 6420, stockState: "ok",  dt: true,  controlled: false },
  { sku: "SC-07925", name: "Codeine Phosphate 30mg Tablets",      pack: "100 tabs",form: "TAB", category: "Analgesics",    msp: 5.21,  promo: null,  unit: 5.21,  stock: 412,  stockState: "ok",  dt: true,  controlled: true  },
  { sku: "SC-08402", name: "Omeprazole 20mg Gastro-Resistant Capsules", pack:"28 caps",form:"CAP",category:"Gastro",      msp:1.04,promo:null,unit:1.04,stock:8900,stockState:"ok",dt:true,controlled:false },
  { sku: "SC-08404", name: "Lansoprazole 30mg Capsules",          pack: "28 caps", form: "CAP", category: "Gastro",        msp: 1.18,  promo: null,  unit: 1.18,  stock: 5640, stockState: "ok",  dt: true,  controlled: false },
  { sku: "SC-08612", name: "Metformin 500mg Tablets",             pack: "84 tabs", form: "TAB", category: "Diabetes",      msp: 1.32,  promo: null,  unit: 1.32,  stock: 12340,stockState: "ok",  dt: true,  controlled: false },
  { sku: "SC-08613", name: "Metformin 1000mg Tablets",            pack: "56 tabs", form: "TAB", category: "Diabetes",      msp: 1.46,  promo: 1.31,  unit: 1.31,  stock: 88,   stockState: "low", dt: true,  controlled: false },
  { sku: "SC-09201", name: "Levothyroxine 100mcg Tablets",        pack: "28 tabs", form: "TAB", category: "Endocrine",     msp: 0.92,  promo: null,  unit: 0.92,  stock: 14210,stockState: "ok",  dt: true,  controlled: false },
  { sku: "SC-09502", name: "Sertraline 50mg Tablets",             pack: "28 tabs", form: "TAB", category: "CNS",           msp: 1.24,  promo: null,  unit: 1.24,  stock: 7280, stockState: "ok",  dt: true,  controlled: false },
  { sku: "SC-09506", name: "Citalopram 20mg Tablets",             pack: "28 tabs", form: "TAB", category: "CNS",           msp: 1.08,  promo: null,  unit: 1.08,  stock: 0,    stockState: "out", dt: false, controlled: false },
  { sku: "SC-09611", name: "Diazepam 5mg Tablets",                pack: "28 tabs", form: "TAB", category: "CNS",           msp: 1.96,  promo: null,  unit: 1.96,  stock: 320,  stockState: "ok",  dt: true,  controlled: true  },
  { sku: "SC-10220", name: "Furosemide 40mg Tablets",             pack: "28 tabs", form: "TAB", category: "Diuretic",      msp: 0.88,  promo: null,  unit: 0.88,  stock: 5210, stockState: "ok",  dt: true,  controlled: false },
  { sku: "SC-10412", name: "Bisoprolol 5mg Tablets",              pack: "28 tabs", form: "TAB", category: "Cardiovascular",msp: 0.96,  promo: null,  unit: 0.96,  stock: 6420, stockState: "ok",  dt: true,  controlled: false },
];

window.CATEGORIES = ["All", "Antibiotics", "Cardiovascular", "Respiratory", "Analgesics", "Gastro", "Diabetes", "Endocrine", "CNS", "Diuretic"];

window.ORDERS_SEED = [
  { id: "SO-2026-04421", ref: "Pharmacy Dispensary — Apr restock", clientId: "BHA-001", type: "hospital", status: "submitted",  placed: "2026-05-09 09:12", lines: 18, total: 4128.42, agent: "DPDP-NXT" },
  { id: "SO-2026-04420", ref: "Critical antibiotics top-up",        clientId: "MAN-411", type: "hospital", status: "submitted",  placed: "2026-05-09 08:46", lines: 6,  total: 942.18,  agent: "OWN-FLT-N" },
  { id: "SO-2026-04419", ref: "Ward 4B controlled drugs",            clientId: "LST-318", type: "hospital", status: "submitted",  placed: "2026-05-08 17:31", lines: 4,  total: 318.40,  agent: "DHL-MED" },
  { id: "SO-2026-04418", ref: "Routine weekly — May W2",             clientId: "RGT-104", type: "hospital", status: "submitted",  placed: "2026-05-08 14:02", lines: 22, total: 5712.04, agent: "OWN-FLT-N" },
  { id: "SO-2026-04416", ref: "Respiratory clinic stock",            clientId: "NCH-220", type: "hospital", status: "submitted",  placed: "2026-05-08 11:18", lines: 9,  total: 1290.60, agent: "DPDP-NXT" },
  { id: "SO-2026-04412", ref: "Endocrine review — May",              clientId: "BRI-509", type: "hospital", status: "submitted",  placed: "2026-05-07 16:44", lines: 11, total: 2185.30, agent: "RM-T24" },
  { id: "SO-2026-04408", ref: "Order on hold — credit review",       clientId: "BHA-001", type: "hospital", status: "on-hold",    placed: "2026-05-07 09:00", lines: 7,  total: 1822.10, agent: "DPDP-NXT" },
  /* drafts */
  { id: "DR-2026-00318", ref: "Cardiology top-up (incomplete)",      clientId: "MAN-411", type: "hospital", status: "draft",      placed: "2026-05-10 16:18", lines: 3,  total: 184.80,  agent: null },
  { id: "DR-2026-00317", ref: "Untitled draft",                      clientId: "LST-318", type: "hospital", status: "draft",      placed: "2026-05-10 14:52", lines: 1,  total: 24.20,   agent: null },
  { id: "DR-2026-00314", ref: "Diabetes restock plan",                clientId: "RGT-104", type: "hospital", status: "draft",      placed: "2026-05-09 18:04", lines: 9,  total: 612.40,  agent: null },
];

/* Helper money formatter */
window.fmt = (n) => "£" + (Math.round(n * 100) / 100).toFixed(2);
window.fmtN = (n) => n.toLocaleString("en-GB");
