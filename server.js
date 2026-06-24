const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const initSqlJs = require('sql.js');

const app = express();
const PORT = 3000;
const DB_PATH = path.join(__dirname, 'fitness.db');

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

let db;

// ====== sql.js 工具函数 ======
function dbAll(sql, params = []) {
  if (params.length > 0) {
    const stmt = db.prepare(sql);
    stmt.bind(params);
    const rows = [];
    while (stmt.step()) rows.push(stmt.getAsObject());
    stmt.free();
    return rows;
  }
  const results = db.exec(sql);
  if (!results || results.length === 0) return [];
  const { columns, values } = results[0];
  if (!values || values.length === 0) return [];
  return values.map(v => {
    const obj = {};
    columns.forEach((c, i) => { obj[c] = v[i]; });
    return obj;
  });
}

function dbGet(sql, params = []) {
  const rows = dbAll(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

function dbRun(sql, params = []) {
  if (params.length > 0) {
    const stmt = db.prepare(sql);
    stmt.bind(params);
    stmt.step();
    stmt.free();
  } else {
    db.run(sql);
  }
}
function saveDb() {
  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

// ====== 初始化数据库 ======
async function initDb() {
  const SQL = await initSqlJs();
  if (fs.existsSync(DB_PATH)) {
    db = new SQL.Database(fs.readFileSync(DB_PATH));
  } else {
    db = new SQL.Database();
  }

  const tables = db.exec("SELECT name FROM sqlite_master WHERE type='table'");
  const tableNames = tables.length > 0 ? tables[0].values.flat() : [];

  if (!tableNames.includes('users')) {
    db.run("CREATE TABLE users (id INTEGER PRIMARY KEY AUTOINCREMENT, nickname TEXT DEFAULT '', height REAL DEFAULT 170, weight REAL DEFAULT 70, age INTEGER DEFAULT 25, gender TEXT DEFAULT '男', goal TEXT DEFAULT '增肌', activity_level TEXT DEFAULT '中等', daily_calories INTEGER DEFAULT 2200)");
    db.run("INSERT INTO users (id) VALUES (1)");
  }
  if (!tableNames.includes('accounts')) {
    db.run("CREATE TABLE accounts (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL, nickname TEXT DEFAULT '', user_id INTEGER, created_at TEXT)");
  }
  if (!tableNames.includes('sessions')) {
    db.run("CREATE TABLE sessions (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, token TEXT UNIQUE NOT NULL, created_at TEXT, expires_at TEXT)");
  }
  if (!tableNames.includes('checkins')) {
    db.run("CREATE TABLE checkins (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER DEFAULT 1, date TEXT NOT NULL, training_done INTEGER DEFAULT 0, diet_done INTEGER DEFAULT 0, water_ml INTEGER DEFAULT 0, weight REAL DEFAULT 0, notes TEXT DEFAULT '', UNIQUE(user_id, date))");
  }
  if (!tableNames.includes('meals')) {
    db.run("CREATE TABLE meals (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER DEFAULT 1, date TEXT NOT NULL, meal_type TEXT DEFAULT '早餐', foods_json TEXT DEFAULT '[]', total_calories REAL DEFAULT 0, total_protein REAL DEFAULT 0, total_fat REAL DEFAULT 0, total_carbs REAL DEFAULT 0)");
  }
  if (!tableNames.includes('foods')) {
    db.run("CREATE TABLE foods (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, category TEXT NOT NULL, calories_per100g REAL DEFAULT 0, protein REAL DEFAULT 0, fat REAL DEFAULT 0, carbs REAL DEFAULT 0)");
    seedFoods();
  }
  if (!tableNames.includes('saved_meals')) {
    db.run("CREATE TABLE saved_meals (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER DEFAULT 1, name TEXT NOT NULL, foods_json TEXT DEFAULT '[]', total_calories REAL DEFAULT 0)");
  }
  if (!tableNames.includes('streaks')) {
    db.run("CREATE TABLE streaks (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER DEFAULT 1, badge TEXT NOT NULL, earned_date TEXT NOT NULL)");
  }

  if (!tableNames.includes("exercises")) {
    db.run("CREATE TABLE exercises (id INTEGER PRIMARY KEY AUTOINCREMENT, name_zh TEXT, name_en TEXT, category TEXT, primary_muscle TEXT, secondary_muscle TEXT, equipment TEXT, exercise_type TEXT, difficulty TEXT, description TEXT, breathing TEXT, common_errors TEXT, alternatives TEXT)");
    seedExercises();
  }
  if (!tableNames.includes("favorite_exercises")) {
    db.run("CREATE TABLE favorite_exercises (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER DEFAULT 1, exercise_id INTEGER, UNIQUE(user_id, exercise_id))");
  }
  if (!tableNames.includes("workout_plans")) {
    db.run("CREATE TABLE workout_plans (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER DEFAULT 1, name TEXT, duration_weeks INTEGER DEFAULT 4, days_per_week INTEGER DEFAULT 3, goal TEXT, is_preset INTEGER DEFAULT 0, created_at TEXT)");
  }
  if (!tableNames.includes("workout_days")) {
    db.run("CREATE TABLE workout_days (id INTEGER PRIMARY KEY AUTOINCREMENT, plan_id INTEGER, day_number INTEGER, name TEXT, focus_areas TEXT)");
  }
  if (!tableNames.includes("workout_exercises")) {
    db.run("CREATE TABLE workout_exercises (id INTEGER PRIMARY KEY AUTOINCREMENT, day_id INTEGER, exercise_id INTEGER, sets INTEGER DEFAULT 3, reps_min INTEGER DEFAULT 8, reps_max INTEGER DEFAULT 12, rest_seconds INTEGER DEFAULT 60, weight REAL DEFAULT 0, sort_order INTEGER DEFAULT 0)");
  }
  if (!tableNames.includes("training_logs")) {
    db.run("CREATE TABLE training_logs (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER DEFAULT 1, date TEXT, duration_minutes INTEGER DEFAULT 0, notes TEXT)");
  }
  if (!tableNames.includes("training_log_sets")) {
    db.run("CREATE TABLE training_log_sets (id INTEGER PRIMARY KEY AUTOINCREMENT, log_id INTEGER, exercise_id INTEGER, set_number INTEGER, reps INTEGER, weight REAL, completed INTEGER DEFAULT 1)");
  }
  if (!tableNames.includes("payments")) {
    db.run("CREATE TABLE payments (id INTEGER PRIMARY KEY AUTOINCREMENT, order_id TEXT UNIQUE NOT NULL, amount REAL DEFAULT 0.5, status TEXT DEFAULT 'pending', created_at TEXT, completed_at TEXT)");
  }
  if (!tableNames.includes("body_metrics")) {
    db.run("CREATE TABLE body_metrics (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER DEFAULT 1, date TEXT, weight REAL, body_fat REAL, chest REAL, waist REAL, hip REAL, arm REAL, thigh REAL)");
  }
  saveDb();
}

function seedFoods() {
  const foods = [
    ['白米饭','主食',116,2.6,0.3,25.6],['糙米饭','主食',111,2.5,0.9,23.0],['全麦面包','主食',246,8.5,3.4,47.0],['燕麦片','主食',367,13.5,6.7,66.3],['红薯','主食',86,1.6,0.1,20.1],
    ['土豆','主食',76,2.0,0.1,17.5],['荞麦面','主食',329,12.6,2.5,66.5],['玉米','主食',112,4.0,1.2,22.8],['意大利面','主食',350,12.0,1.5,73.0],['芋头','主食',58,1.3,0.2,13.1],
    ['紫薯','主食',82,1.8,0.2,18.5],['小米粥','主食',46,1.4,0.7,8.4],['藜麦','主食',368,14.1,6.1,64.2],['山药','主食',57,1.9,0.2,12.4],['南瓜','主食',26,1.0,0.1,5.3],
    ['鸡胸肉','肉类',165,31.0,3.6,0.0],['鸡蛋','肉类',144,13.3,8.8,1.6],['瘦牛肉','肉类',250,26.0,15.0,0.0],['猪瘦肉','肉类',242,20.0,17.0,0.0],['三文鱼','肉类',208,20.0,13.0,0.0],
    ['虾仁','肉类',99,24.0,0.3,0.0],['金枪鱼','肉类',130,26.0,2.0,0.0],['羊肉','肉类',294,17.0,24.0,0.0],['鸭肉','肉类',240,18.0,18.0,0.0],['鸡腿肉','肉类',209,26.0,11.0,0.0],
    ['豆腐','肉类',76,8.0,4.0,2.0],['龙利鱼','肉类',105,22.0,1.5,0.0],['鳗鱼','肉类',221,18.0,15.0,0.0],['鹌鹑蛋','肉类',160,12.8,11.1,1.0],['午餐肉','肉类',320,12.0,28.0,4.0],
    ['西兰花','蔬菜',34,2.8,0.4,6.6],['菠菜','蔬菜',23,2.9,0.4,3.6],['番茄','蔬菜',19,0.9,0.2,4.2],['黄瓜','蔬菜',16,0.7,0.1,3.6],['生菜','蔬菜',15,1.4,0.2,2.9],
    ['胡萝卜','蔬菜',41,0.9,0.2,9.6],['芹菜','蔬菜',16,0.7,0.2,3.4],['白菜','蔬菜',13,1.5,0.1,2.2],['青椒','蔬菜',22,0.9,0.2,5.0],['洋葱','蔬菜',40,1.1,0.1,9.3],
    ['蘑菇','蔬菜',22,3.1,0.3,3.3],['芦笋','蔬菜',20,2.2,0.1,3.9],['秋葵','蔬菜',31,2.0,0.1,7.0],['茄子','蔬菜',25,1.0,0.2,5.9],['豆芽','蔬菜',21,2.5,0.1,3.0],
    ['苹果','水果',53,0.3,0.2,13.8],['香蕉','水果',93,1.1,0.3,22.8],['橙子','水果',47,0.9,0.1,11.8],['蓝莓','水果',57,0.7,0.3,14.5],['草莓','水果',32,0.7,0.3,7.7],
    ['葡萄','水果',69,0.7,0.2,18.1],['猕猴桃','水果',61,1.1,0.5,14.7],['火龙果','水果',55,1.1,0.4,13.0],['牛油果','水果',160,2.0,14.7,8.5],['柚子','水果',42,0.8,0.1,10.7],
    ['西瓜','水果',30,0.6,0.2,7.6],['榴莲','水果',147,1.5,5.3,27.1],['芒果','水果',60,0.8,0.4,15.0],['樱桃','水果',46,1.0,0.3,11.0],['木瓜','水果',39,0.6,0.1,9.8],
    ['纯牛奶','乳制品',65,3.0,3.6,4.8],['酸奶','乳制品',72,3.5,3.3,6.0],['脱脂牛奶','乳制品',35,3.4,0.1,5.0],['奶酪','乳制品',350,25.0,27.0,1.3],['蛋白粉','乳制品',400,80.0,3.0,7.0],
    ['希腊酸奶','乳制品',97,9.0,5.0,4.0],['豆奶','乳制品',40,3.3,1.5,2.6],['椰奶','乳制品',230,2.3,23.8,3.3],['全脂奶粉','乳制品',500,26.0,27.0,38.0],['炼乳','乳制品',340,8.0,9.0,56.0],
    ['奶油','乳制品',340,2.5,35.0,3.5],['茅屋芝士','乳制品',98,11.0,4.3,3.4],['马苏里拉','乳制品',280,28.0,17.0,3.0],['冰激凌','乳制品',207,3.5,11.0,24.0],['开菲尔','乳制品',65,4.0,3.5,3.5],
    ['核桃','坚果',654,15.0,65.0,14.0],['杏仁','坚果',576,21.0,49.0,22.0],['花生','坚果',567,26.0,49.0,16.0],['腰果','坚果',553,18.0,44.0,30.0],['黑巧克力','坚果',546,5.0,31.0,61.0],
    ['全麦饼干','坚果',450,7.0,18.0,68.0],['能量棒','坚果',420,15.0,12.0,65.0],['葡萄干','坚果',299,3.1,0.5,79.2],['瓜子','坚果',582,24.0,50.0,20.0],['夏威夷果','坚果',718,7.9,76.0,14.0],
    ['芝麻','坚果',573,18.0,50.0,23.0],['奇亚籽','坚果',486,17.0,31.0,42.0],['亚麻籽','坚果',534,18.0,42.0,29.0],['南瓜籽','坚果',559,30.0,49.0,11.0],['开心果','坚果',560,20.0,45.0,28.0]
  ];
  const stmt = db.prepare('INSERT INTO foods (name, category, calories_per100g, protein, fat, carbs) VALUES (?, ?, ?, ?, ?, ?)');
  for (const item of foods) {
    stmt.bind(item);
    stmt.step();
    stmt.reset();
  }
  stmt.free();
  console.log('食物数据库已初始化，共' + foods.length + '条记录');
}

// ====== API 路由 ======

app.get('/api/user', (req, res) => {
  res.json(dbGet('SELECT * FROM users WHERE id = 1'));
});

app.post('/api/user', (req, res) => {
  const { nickname, height, weight, age, gender, goal, activity_level } = req.body;
  let bmr = 0;
  if (gender === '男') bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  else bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  const am = { '久坐':1.2, '轻度':1.375, '中等':1.55, '活跃':1.725, '高强度':1.9 };
  let tdee = bmr * (am[activity_level] || 1.55);
  if (goal === '减脂') tdee -= 300;
  else if (goal === '增肌') tdee += 200;
  dbRun('UPDATE users SET nickname=?, height=?, weight=?, age=?, gender=?, goal=?, activity_level=?, daily_calories=? WHERE id=1',
    [nickname, height, weight, age, gender, goal, activity_level, Math.round(tdee)]);
  res.json(dbGet('SELECT * FROM users WHERE id = 1'));
});

app.get('/api/checkins', (req, res) => {
  res.json(dbAll('SELECT * FROM checkins WHERE user_id=1 AND date LIKE ?', [(req.query.month || '') + '%']));
});

app.post('/api/checkin', (req, res) => {
  const { date, training_done, diet_done, water_ml, weight, notes } = req.body;
  const existing = dbGet('SELECT id FROM checkins WHERE user_id=1 AND date=?', [date]);
  if (existing) {
    dbRun('UPDATE checkins SET training_done=?, diet_done=?, water_ml=?, weight=?, notes=? WHERE id=?',
      [training_done ? 1 : 0, diet_done ? 1 : 0, water_ml || 0, weight || 0, notes || '', existing.id]);
  } else {
    dbRun('INSERT INTO checkins (user_id, date, training_done, diet_done, water_ml, weight, notes) VALUES (1, ?, ?, ?, ?, ?, ?)',
      [date, training_done ? 1 : 0, diet_done ? 1 : 0, water_ml || 0, weight || 0, notes || '']);
  }
  checkStreak(1, date);
  res.json(dbGet('SELECT * FROM checkins WHERE user_id=1 AND date=?', [date]));
});

function checkStreak(userId, date) {
  const allDates = dbAll('SELECT date FROM checkins WHERE user_id=? AND training_done=1 ORDER BY date DESC', [userId]);
  const streakDates = allDates.map(r => r.date).sort().reverse();
  let streak = streakDates.length > 0 ? 1 : 0;
  if (streakDates.length > 1) {
    let current = streakDates[0];
    for (let i = 1; i < streakDates.length; i++) {
      const diff = Math.round((new Date(current) - new Date(streakDates[i])) / 86400000);
      if (diff <= 1) { streak++; current = streakDates[i]; } else break;
    }
  }
  const badgeMap = {7:'7天训练达人',14:'14天铁粉',21:'21天自律之星',30:'30天健身王者'};
  for (const [days, badge] of Object.entries(badgeMap)) {
    if (streak >= parseInt(days) && !dbGet('SELECT id FROM streaks WHERE user_id=? AND badge=?', [userId, badge])) {
      dbRun('INSERT INTO streaks (user_id, badge, earned_date) VALUES (?, ?, ?)', [userId, badge, date]);
    }
  }
}

app.get('/api/streaks', (req, res) => res.json(dbAll('SELECT * FROM streaks WHERE user_id=1')));

app.get('/api/meals', (req, res) => {
  res.json(dbAll('SELECT * FROM meals WHERE user_id=1 AND date=?', [req.query.date || '']));
});

app.post('/api/meal', (req, res) => {
  const { date, meal_type, foods_json, total_calories, total_protein, total_fat, total_carbs } = req.body;
  dbRun('INSERT INTO meals (user_id, date, meal_type, foods_json, total_calories, total_protein, total_fat, total_carbs) VALUES (1, ?, ?, ?, ?, ?, ?, ?)',
    [date, meal_type, JSON.stringify(foods_json || []), total_calories || 0, total_protein || 0, total_fat || 0, total_carbs || 0]);
  res.json({ success: true });
});

app.delete('/api/meal/:id', (req, res) => {
  dbRun('DELETE FROM meals WHERE id=?', [req.params.id]);
  res.json({ success: true });
});

app.get('/api/foods', (req, res) => {
  const cat = req.query.category || '';
  res.json(cat ? dbAll('SELECT * FROM foods WHERE category=? ORDER BY name', [cat]) : dbAll('SELECT * FROM foods ORDER BY category, name'));
});

app.post('/api/foods', (req, res) => {
  const { name, category, calories_per100g, protein, fat, carbs } = req.body;
  dbRun('INSERT INTO foods (name, category, calories_per100g, protein, fat, carbs) VALUES (?, ?, ?, ?, ?, ?)',
    [name, category, calories_per100g, protein, fat, carbs]);
  const foods = dbAll('SELECT * FROM foods ORDER BY id DESC LIMIT 1');
  res.json({ id: foods[0]?.id, success: true });
});

app.get('/api/saved-meals', (req, res) => res.json(dbAll('SELECT * FROM saved_meals WHERE user_id=1')));

app.post('/api/saved-meals', (req, res) => {
  dbRun('INSERT INTO saved_meals (user_id, name, foods_json, total_calories) VALUES (1, ?, ?, ?)',
    [req.body.name, JSON.stringify(req.body.foods_json || []), req.body.total_calories || 0]);
  res.json({ success: true });
});

app.delete('/api/saved-meals/:id', (req, res) => {
  dbRun('DELETE FROM saved_meals WHERE id=?', [req.params.id]);
  res.json({ success: true });
});

app.get('/api/export', (req, res) => {
  res.json({
    user: dbGet('SELECT * FROM users WHERE id=1'),
    checkins: dbAll('SELECT * FROM checkins WHERE user_id=1'),
    meals: dbAll('SELECT * FROM meals WHERE user_id=1'),
    badges: dbAll('SELECT * FROM streaks WHERE user_id=1'),
    exportedAt: new Date().toISOString()
  });
});


// ====== Auth API ======
const loginAttempts = {};
const crypto = require("crypto");
function hashPwd(p) { return crypto.createHash("sha256").update(p + "-fit-salt-24").digest("hex"); }
function genToken() { return crypto.randomBytes(24).toString("hex"); }

app.post("/api/register", (req, res) => {
  const { email, password, nickname, height, weight, age, gender, goal } = req.body;
  if (!email || !password) return res.status(400).json({ error: "email and password required" });
  if (password.length < 8) return res.status(400).json({ error: "password min 8 chars" });
  if (dbGet("SELECT id FROM accounts WHERE email=?", [email])) return res.status(400).json({ error: "email exists" });
  const ph = hashPwd(password);
  dbRun("INSERT INTO users (nickname, height, weight, age, gender, goal) VALUES (?,?,?,?,?,?)", [nickname||"",height||170,weight||70,age||25,gender||"Male",goal||"Fitness"]);
  const u = dbAll("SELECT * FROM users ORDER BY id DESC LIMIT 1")[0];
  dbRun("INSERT INTO accounts (email, password_hash, nickname, user_id, created_at) VALUES (?,?,?,?,?)", [email,ph,nickname||"",u.id,new Date().toISOString()]);
  const tkn = genToken();
  dbRun("INSERT INTO sessions (user_id, token, created_at) VALUES (?,?,?)", [u.id,tkn,new Date().toISOString()]);
  res.json({ success:true, token:tkn, user:dbGet("SELECT * FROM users WHERE id=?",[u.id]) });
});

app.post("/api/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "email and password required" });
  const now = Date.now();
  if (loginAttempts[email] && loginAttempts[email].count >= 3 && (now - loginAttempts[email].lastTime) < 30000)
    return res.status(429).json({ error: "too many attempts, wait 30s" });
  const acc = dbGet("SELECT * FROM accounts WHERE email=?", [email]);
  if (!acc || acc.password_hash !== hashPwd(password)) {
    if (!loginAttempts[email]) loginAttempts[email] = { count:0, lastTime:now };
    loginAttempts[email].count++; loginAttempts[email].lastTime = now;
    return res.status(400).json({ error: "email or password wrong" });
  }
  loginAttempts[email] = { count:0, lastTime:now };
  const tkn = genToken();
  dbRun("INSERT INTO sessions (user_id, token, created_at) VALUES (?,?,?)", [acc.user_id, tkn, new Date().toISOString()]);
  res.json({ success:true, token:tkn, user:dbGet("SELECT * FROM users WHERE id=?",[acc.user_id]) });
});

app.post("/api/feishu-login", (req, res) => {
  let u = dbAll("SELECT * FROM users ORDER BY id DESC LIMIT 1")[0];
  if (!u) { dbRun("INSERT INTO users (nickname, height, weight, age, gender, goal) VALUES (?,?,?,?,?,?)",["Feishu User",170,70,25,"Male","Fitness"]); u = dbAll("SELECT * FROM users ORDER BY id DESC LIMIT 1")[0]; }
  const tkn = genToken();
  dbRun("INSERT INTO sessions (user_id, token, created_at) VALUES (?,?,?)", [u.id, tkn, new Date().toISOString()]);
  res.json({ success:true, token:tkn, user:dbGet("SELECT * FROM users WHERE id=?",[u.id]) });
});

app.get("/api/check-auth", (req, res) => {
  const auth = req.headers.authorization || "";
  const tkn = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!tkn) return res.json({ authed:false });
  const s = dbGet("SELECT * FROM sessions WHERE token=?", [tkn]);
  if (!s) return res.json({ authed:false });
  res.json({ authed:true, token:tkn, user:dbGet("SELECT * FROM users WHERE id=?",[s.user_id]) });
});

// ====== Feishu QR Code Login ======
const qrSessions = {};

app.post('/api/feishu/qrcode', (req, res) => {
  const qrcode_id = crypto.randomBytes(16).toString('hex');
  const expire_at = Date.now() + 300000;
  qrSessions[qrcode_id] = { status: 'waiting', expire_at, user: null, token: null };
  const qrData = JSON.stringify({ id: qrcode_id, action: 'feishu_login' });
  const qrcode_url = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=' + encodeURIComponent(qrData);
  res.json({ qrcode_id, qrcode_url, expire_at, expire_seconds: 300 });
});

app.get('/api/feishu/status/:qrcode_id', (req, res) => {
  const s = qrSessions[req.params.qrcode_id];
  if (!s) return res.status(404).json({ error: 'not found' });
  if (Date.now() > s.expire_at) { s.status = 'expired'; return res.json({ status: 'expired' }); }
  if (s.status === 'confirmed') return res.json({ status: 'confirmed', token: s.token, user: s.user });
  res.json({ status: s.status });
});

app.post('/api/feishu/simulate-scan/:qrcode_id', (req, res) => {
  const s = qrSessions[req.params.qrcode_id];
  if (!s) return res.status(404).json({ error: 'not found' });
  const now = Date.now();
  if (now > s.expire_at) { s.status = 'expired'; return res.json({ status: 'expired' }); }
  s.status = 'scanned';
  res.json({ status: 'scanned' });
});

app.post('/api/feishu/confirm-scan/:qrcode_id', (req, res) => {
  const s = qrSessions[req.params.qrcode_id];
  if (!s) return res.status(404).json({ error: 'not found' });
  let u = dbAll('SELECT * FROM users ORDER BY id DESC LIMIT 1')[0];
  if (!u) { dbRun('INSERT INTO users (nickname) VALUES (?)', ['FeishuUser']); u = dbAll('SELECT * FROM users ORDER BY id DESC LIMIT 1')[0]; }
  const tk = genToken();
  dbRun('INSERT INTO sessions (user_id, token, created_at) VALUES (?,?,?)', [u.id, tk, new Date().toISOString()]);
  s.status = 'confirmed'; s.token = tk; s.user = u;
  res.json({ status: 'confirmed', token: tk, user: u });
});

// ====== 启动服务器 ======


// ====== 支付系统 API ======
app.post('/api/payment/create', (req, res) => {
  const orderId = 'TG' + new Date().toISOString().slice(0,10).replace(/-/g,'') + Math.random().toString(36).slice(2,8).toUpperCase();
  dbRun("INSERT INTO payments (order_id, amount, status, created_at) VALUES (?, 0.5, 'pending', ?)", [orderId, new Date().toISOString()]);
  saveDb();
  res.json({ success: true, order_id: orderId, amount: 0.5, expire_minutes: 5, qrcode: { wechat: '/img/wechat_qr.jpg', alipay: '/img/alipay_qr.jpg' } });
});

app.get('/api/payment/check', (req, res) => {
  const orderId = req.query.order_id;
  const listAll = req.query.list_all;
  const secret = req.query.secret || '';
  if (listAll && secret === 'tieguan888') {
    return res.json({ success: true, orders: dbAll('SELECT * FROM payments ORDER BY id DESC') });
  }
  if (!orderId) return res.json({ success: false, message: '缺少订单号' });
  const payment = dbGet('SELECT * FROM payments WHERE order_id=?', [orderId]);
  if (!payment) return res.json({ success: false, message: '订单不存在' });
  const created = new Date(payment.created_at).getTime();
  if (payment.status === 'pending' && (Date.now() - created) > 300000) {
    dbRun("UPDATE payments SET status='expired' WHERE id=?", [payment.id]);
    saveDb();
    return res.json({ success: false, status: 'expired', message: '订单已过期' });
  }
  res.json({ success: payment.status === 'completed', status: payment.status, message: payment.status === 'completed' ? '支付成功' : '等待支付' });
});

app.post('/api/payment/confirm', (req, res) => {
  const { order_id, secret } = req.body;
  if (secret !== 'tieguan888') return res.status(403).json({ success: false, message: '密钥错误' });
  if (!order_id) return res.json({ success: false, message: '缺少订单号' });
  const payment = dbGet("SELECT * FROM payments WHERE order_id=? AND status='pending'", [order_id]);
  if (!payment) return res.json({ success: false, message: '订单不存在或已处理' });
  dbRun("UPDATE payments SET status='completed', completed_at=? WHERE id=?", [new Date().toISOString(), payment.id]);
  saveDb();
  res.json({ success: true, message: '订单已确认支付' });
});
// ====== Feishu OAuth Login ======
const FEISHU_OAUTH_ID = 'cli_aab0fa927024dcc7';
const FEISHU_OAUTH_SECRET = 'CLF2yKfotInw01Sn2LLgdexNNNjPSWtY';
const OAUTH_REDIRECT = 'http://localhost:3000/api/auth/feishu/callback';

app.get('/api/auth/feishu/login', function(req, res) {
  var state = crypto.randomBytes(8).toString('hex');
  var url = 'https://open.feishu.cn/open-apis/authen/v1/authorize' +
    '?app_id=' + encodeURIComponent(FEISHU_OAUTH_ID) +
    '&redirect_uri=' + encodeURIComponent(OAUTH_REDIRECT) +
    '&state=' + state;
  res.redirect(url);
});

app.get('/api/auth/feishu/callback', async function(req, res) {
  var code = req.query.code;
  if (!code) return res.status(400).send('Missing code');
  try {
    var tr = await fetch('https://open.feishu.cn/open-apis/authen/v1/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ grant_type: 'authorization_code', code: code, app_id: FEISHU_OAUTH_ID, app_secret: FEISHU_OAUTH_SECRET })
    });
    var td = await tr.json();
    if (td.code !== 0) return res.status(400).send('Token exchange failed: ' + td.msg);
    var ur = await fetch('https://open.feishu.cn/open-apis/authen/v1/user_info', {
      headers: { 'Authorization': 'Bearer ' + td.data.access_token }
    });
    var ud = await ur.json();
    if (ud.code !== 0) return res.status(400).send('User info failed: ' + ud.msg);
    var fu = ud.data;
    var u = dbGet('SELECT * FROM users WHERE id = 1');
    if (u) { dbRun('UPDATE users SET nickname = ? WHERE id = 1', [fu.name || fu.en_name || 'FeishuUser']); }
    else { dbRun('INSERT INTO users (nickname) VALUES (?)', [fu.name || 'FeishuUser']); }
    var tk = crypto.randomBytes(24).toString('hex');
    dbRun('INSERT INTO sessions (user_id, token, created_at) VALUES (?, ?, ?)', [1, tk, new Date().toISOString()]);
    res.redirect('/login.html?token=' + tk);
  } catch(e) { res.status(500).send('Feishu error: ' + e.message); }
});initDb().then(() => {
  app.listen(PORT, () => {
    console.log('🏋️ 健身网站服务器运行中');
    console.log('  本地地址: http://localhost:' + PORT);
  });
}).catch(err => {
  console.error('数据库初始化失败:', err);
});

// ====== 种子动作库 ======
function seedExercises() {
  try {
    const exPath = path.join(__dirname, 'exercises.json');
    if (!fs.existsSync(exPath)) { console.log('未找到 exercises.json'); return; }
    const raw = fs.readFileSync(exPath, 'utf-8');
    const data = JSON.parse(raw);
    if (!data.exercises || data.exercises.length === 0) return;
    const count = dbGet('SELECT COUNT(*) as c FROM exercises');
    if (count && count.c > 0) return;
    const stmt = db.prepare('INSERT INTO exercises (name_zh, name_en, category, primary_muscle, secondary_muscle, equipment, exercise_type, difficulty, description, breathing, common_errors, alternatives) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    for (const ex of data.exercises) {
      stmt.bind([ex.name_zh, ex.name_en, ex.category, ex.primary_muscle, ex.secondary_muscle, ex.equipment, ex.exercise_type, ex.difficulty, ex.description, ex.breathing, ex.common_errors, ex.alternatives]);
      stmt.step(); stmt.reset();
    }
    stmt.free();
    saveDb();
    console.log('动作库已初始化，共' + data.exercises.length + '个动作');
  } catch(e) { console.log('种子动作加载失败:', e.message); }
}


// ====== 动作库 API ======
app.get('/api/exercises', (req, res) => {
  const { category, difficulty, equipment, search } = req.query;
  let sql = 'SELECT * FROM exercises WHERE 1=1';
  const params = [];
  if (category) { sql += ' AND category=?'; params.push(category); }
  if (difficulty) { sql += ' AND difficulty=?'; params.push(difficulty); }
  if (equipment) { sql += ' AND equipment=?'; params.push(equipment); }
  if (search) { sql += ' AND (name_zh LIKE ? OR name_en LIKE ?)'; params.push('%' + search + '%', '%' + search + '%'); }
  sql += ' ORDER BY category, name_zh';
  res.json(dbAll(sql, params));
});

app.get('/api/exercises/favorites', (req, res) => {
  res.json(dbAll('SELECT e.* FROM exercises e JOIN favorite_exercises f ON e.id=f.exercise_id WHERE f.user_id=1'));
});

app.post('/api/exercises/favorites/:id', (req, res) => {
  const id = req.params.id;
  const existing = dbGet('SELECT id FROM favorite_exercises WHERE user_id=1 AND exercise_id=?', [id]);
  if (existing) {
    dbRun('DELETE FROM favorite_exercises WHERE id=?', [existing.id]);
    res.json({ favorited: false });
  } else {
    dbRun('INSERT INTO favorite_exercises (user_id, exercise_id) VALUES (1, ?)', [id]);
    res.json({ favorited: true });
  }
});

// ====== 训练计划 API ======
app.get('/api/workout-plans', (req, res) => {
  res.json(dbAll('SELECT * FROM workout_plans WHERE user_id=1 OR is_preset=1 ORDER BY is_preset DESC, id'));
});

app.post('/api/workout-plans', (req, res) => {
  const { name, duration_weeks, days_per_week, goal } = req.body;
  dbRun('INSERT INTO workout_plans (user_id, name, duration_weeks, days_per_week, goal, is_preset, created_at) VALUES (1, ?, ?, ?, ?, 0, ?)',
    [name, duration_weeks, days_per_week, goal, new Date().toISOString()]);
  res.json({ success: true });
});

app.get('/api/workout-plans/:id', (req, res) => {
  const plan = dbGet('SELECT * FROM workout_plans WHERE id=?', [req.params.id]);
  if (!plan) return res.json(null);
  plan.days = dbAll('SELECT * FROM workout_days WHERE plan_id=? ORDER BY day_number', [req.params.id]);
  for (const day of plan.days) {
    day.exercises = dbAll('SELECT we.*, e.name_zh as exercise_name, e.name_en as exercise_name_en, e.category FROM workout_exercises we JOIN exercises e ON we.exercise_id=e.id WHERE we.day_id=? ORDER BY we.sort_order', [day.id]);
  }
  res.json(plan);
});

// ====== 训练日志 API ======
app.get('/api/training-logs', (req, res) => {
  const date = req.query.date || '';
  const logs = date ? dbAll('SELECT * FROM training_logs WHERE user_id=1 AND date=?', [date]) : dbAll('SELECT * FROM training_logs WHERE user_id=1 ORDER BY date DESC LIMIT 30');
  for (const log of logs) {
    log.sets = dbAll('SELECT ts.*, e.name_zh as exercise_name FROM training_log_sets ts JOIN exercises e ON ts.exercise_id=e.id WHERE ts.log_id=?', [log.id]);
  }
  res.json(logs);
});

app.post('/api/training-log', (req, res) => {
  const { date, duration_minutes, notes } = req.body;
  dbRun('INSERT INTO training_logs (user_id, date, duration_minutes, notes) VALUES (1, ?, ?, ?)', [date, duration_minutes||0, notes||'']);
  const log = dbAll('SELECT * FROM training_logs ORDER BY id DESC LIMIT 1')[0];
  const sets = req.body.sets || [];
  for (const s of sets) {
    dbRun('INSERT INTO training_log_sets (log_id, exercise_id, set_number, reps, weight, completed) VALUES (?, ?, ?, ?, ?, ?)',
      [log.id, s.exercise_id, s.set_number, s.reps, s.weight, s.completed !== false ? 1 : 0]);
  }
  res.json(log);
});

// ====== 身体数据 API ======
app.get('/api/body-metrics', (req, res) => {
  const months = parseInt(req.query.months) || 3;
  const s = new Date(); s.setMonth(s.getMonth() - months);
  res.json(dbAll('SELECT * FROM body_metrics WHERE user_id=1 AND date>=? ORDER BY date', [s.toISOString().slice(0,10)]));
});

app.post('/api/body-metrics', (req, res) => {
  const { date, weight, body_fat, chest, waist, hip, arm, thigh } = req.body;
  const existing = dbGet('SELECT id FROM body_metrics WHERE user_id=1 AND date=?', [date]);
  if (existing) {
    dbRun('UPDATE body_metrics SET weight=?, body_fat=?, chest=?, waist=?, hip=?, arm=?, thigh=? WHERE id=?',
      [weight, body_fat, chest, waist, hip, arm, thigh, existing.id]);
  } else {
    dbRun('INSERT INTO body_metrics (user_id, date, weight, body_fat, chest, waist, hip, arm, thigh) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?)',
      [date, weight, body_fat, chest, waist, hip, arm, thigh]);
  }
  res.json({ success: true });
});

