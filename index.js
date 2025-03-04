// index.js
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const readline = require('readline');
const { loadCommands, loadEvents } = require('./handlers/handler');
const { log } = require('./lib/sample');

// دالة لاستقبال إدخال رمز الجلسة من المستخدم
function askForSessionCode() {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question('أدخل رمز الجلسة (8 أحرف) إن وجد، أو اضغط Enter لاستخدام طريقة QR: ', (answer) => {
      rl.close();
      // إذا كان الإدخال صحيحًا بطول 8 أحرف استخدمه، وإلا استخدم "default"
      if (answer && answer.trim().length === 8) {
        resolve(answer.trim());
      } else {
        resolve('default');
      }
    });
  });
}

(async () => {
  // الحصول على رمز الجلسة من المستخدم
  const clientId = await askForSessionCode();
  log(`سيتم استخدام session clientId: ${clientId}`);

  // تهيئة عميل واتساب باستخدام LocalAuth لتخزين بيانات الجلسة داخل مجلد sessions
  const client = new Client({
    authStrategy: new LocalAuth({ clientId }),
    puppeteer: {
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'] // خيارات لتحسين الأداء
    }
  });

  // عرض رمز QR في حالة عدم وجود جلسة محفوظة
  client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
    log('امسح رمز QR لتسجيل الدخول.');
  });

  // عند جاهزية العميل
  client.on('ready', () => {
    log('البوت جاهز للعمل!');
  });

  // تحميل الأوامر والأحداث عبر الـ handler
  loadCommands(client);
  loadEvents(client);

  // تحميل الإضافات (Plugins) من مجلد plugins إن وجد
  const fs = require('fs');
  const path = require('path');
  const pluginsPath = path.join(__dirname, 'plugins');
  if (fs.existsSync(pluginsPath)) {
    fs.readdirSync(pluginsPath)
      .filter(file => file.endsWith('.js'))
      .forEach(file => {
        const plugin = require(path.join(pluginsPath, file));
        if (typeof plugin === 'function') {
          plugin(client);
          log(`تم تحميل الإضافة: ${file}`);
        }
      });
  }

  // بدء تشغيل العميل
  client.initialize();
})();
