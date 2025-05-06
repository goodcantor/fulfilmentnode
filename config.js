require('dotenv').config();

module.exports = {
    apiId: parseInt(process.env.API_ID) || 20290530,
    apiHash: process.env.API_HASH || "605c849a8c71e5952db576c39dd0201a",
    channelId: process.env.CHANNEL_ID || -1002673291270,
    sessionString: process.env.SESSION_STRING || "",
    
    keywords: [
        "фуллфилмент",
        "фулфилмент",
        "фуллфилимент",
        "фулфилимент",
        "ффилмент",
        "фулфилметн",
        "фф",
        "фулфелмент",
        "фулфиллмент",
        "фулфилмен",
        "фулфилмет",
        "фуллфилмет",
        "фулфилимнет",
        "филмент",
        "филлмент",
    ],

  bannedWords: [
        "эффект",
        "графического",
        "графический",
        "графика",
        "предлагаю",
        "предлагает",
        "предлагаем",
        "предлагаете",
        "предлагают",
        "предложил",
        "предложила",
        "предложило",
        "предложили",
        "предложить",
        "предложу",
        "предложим",
        "предложишь",
        "предложите",
    ],

    bannedUsernames: [
        "grouphelpbot",
        "bgdnbgdn",
        "birinim",
        "zamerova21",
        "Jose8Per",
        "Tagranovich",
    ]
}; 