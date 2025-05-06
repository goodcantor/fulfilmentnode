const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const input = require("input");
const config = require("./config");
const fs = require("fs");
const path = require("path");
const { NewMessage } = require("telegram/events");

// Настройка логирования
const logFile = fs.createWriteStream(path.join(__dirname, "bot.log"), { flags: "a" });
const log = (message) => {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;
    console.log(message);
    logFile.write(logMessage);
};

const stringSession = new StringSession(config.sessionString);

(async () => {
    try {
        const client = new TelegramClient(stringSession, config.apiId, config.apiHash, {
            connectionRetries: 5,
        });

        await client.start({
            phoneNumber: async () => await input.text("Введите номер телефона: "),
            password: async () => await input.text("Введите 2FA пароль: "),
            phoneCode: async () => await input.text("Введите код из Telegram: "),
            onError: (err) => log(`Ошибка авторизации: ${err}`),
        });

        log("🔵 Бот запущен и слушает события...");
        
        // Сохраняем строку сессии в .env файл
        if (!config.sessionString) {
            const sessionString = client.session.save();
            log("Ваша строка сессии (сохраняется в .env):");
            log(sessionString);
            
            const envContent = fs.readFileSync(".env", "utf8");
            const updatedContent = envContent.replace(
                /SESSION_STRING=.*/,
                `SESSION_STRING=${sessionString}`
            );
            fs.writeFileSync(".env", updatedContent);
        }

        client.addEventHandler(async (event) => {
            try {
                const message = event.message;
                if (!message || !message.text) return;

                const sender = await message.getSender();
                const chat = await message.getChat();
                const senderUsername = sender.username ? sender.username.toLowerCase() : "";
                const messageText = message.text;

                log(`📩 Новый пост в чате ${chat.id}: ${messageText.slice(0, 50)}...`);

                // Фильтруем ненужные сообщения
                if (
                    senderUsername.endsWith("bot") ||
                    config.bannedUsernames.includes(senderUsername) ||
                    config.bannedWords.some((word) => messageText.toLowerCase().includes(word))
                ) {
                    return;
                }

                // Проверка на ключевые слова
                if (config.keywords.some((word) => messageText.toLowerCase().includes(word))) {
                    let senderName = sender.firstName || "Нет имени";
                    if (sender.lastName) senderName += ` ${sender.lastName}`;
                    const profileLink = sender.username
                        ? `@${sender.username}`
                        : `tg://openmessage?user_id=${sender.id}`;

                    // Формируем корректные ссылки
                    let chatLink, messageLink;
                    if (chat.username) {
                        chatLink = `https://t.me/${chat.username}`;
                        messageLink = `https://t.me/${chat.username}/${message.id}`;
                    } else {
                        const chatIdStr = String(chat.id).replace("-100", "");
                        chatLink = `https://t.me/c/${chatIdStr}`;
                        messageLink = `https://t.me/c/${chatIdStr}/${message.id}`;
                    }

                    const messageToSend =
                        `🔔 **Новое сообщение!**\n\n` +
                        `👤 **От:** ${senderName}\n` +
                        `📌 **Профиль:** ${profileLink}\n` +
                        `📩 **Сообщение:** ${messageLink}\n` +
                        `💬 **Чат:** ${chatLink}\n\n` +
                        `✉️ **Текст:**\n\${messageText}\`;

                    await client.sendMessage(config.channelId, { message: messageToSend });
                    log(`✅ Сообщение отправлено в ${config.channelId}`);
                }
            } catch (e) {
                log(`⚠ Ошибка обработки сообщения: ${e}`);
            }
        }, new NewMessage({}));

        await client.connect();
        log("🔵 Бот запущен и слушает события...");
        
        // Держим бота запущенным
        await client.disconnected;
    } catch (e) {
        log(`❌ Критическая ошибка: ${e}`);
        process.exit(1);
    }
})();
