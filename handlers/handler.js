// handlers/handler.js
const fs = require('fs');
const path = require('path');

// تحميل ملفات الأوامر من مجلد commands
function loadCommands(client) {
  client.commands = new Map();
  const commandsPath = path.join(__dirname, '../commands');
  if (fs.existsSync(commandsPath)) {
    fs.readdirSync(commandsPath)
      .filter(file => file.endsWith('.js'))
      .forEach(file => {
        const command = require(path.join(commandsPath, file));
        if (command && command.name) {
          client.commands.set(command.name.toLowerCase(), command);
          console.log(`تم تحميل الأمر: ${command.name}`);
        }
      });
  }
}

// تحميل ملفات الأحداث من مجلد events
function loadEvents(client) {
  const eventsPath = path.join(__dirname, '../events');
  if (fs.existsSync(eventsPath)) {
    fs.readdirSync(eventsPath)
      .filter(file => file.endsWith('.js'))
      .forEach(file => {
        const event = require(path.join(eventsPath, file));
        if (event && event.name && typeof event.execute === 'function') {
          client.on(event.name, (...args) => event.execute(client, ...args));
          console.log(`تم تحميل الحدث: ${event.name}`);
        }
      });
  } else {
    console.log('مجلد الأحداث (events) غير موجود.');
  }
}

module.exports = { loadCommands, loadEvents };
