const axios = require("axios");
const { v4: uuidv4 } = require("uuid");

const userMemory = {};

module.exports = {
  config: {
    name: "chat",
    version: "2.2",
    author: "@RI F AT",
    role: 2,
    category: "ai",
    shortDescription: {
      en: "Roleplay with character + image"
    }
  },

  onStart: async function ({ message, event, args, commandName }) {
    const userId = event.senderID;

    if (!userMemory[userId]) {
      userMemory[userId] = {
        character: "stepmom",
        session: uuidv4()
      };
    }

    if (args[0] === "set" && args[1]) {
      const character = args.slice(1).join(" ").trim().replace(/\s+/g, "+").toLowerCase();
      userMemory[userId] = {
        character,
        session: uuidv4()
      };
      return message.reply(`✅ Character set to: ${character.replace(/\+/g, " ")}\n🔄 New session started.`);
    }

    const prompt = userMemory[userId].character;
    const session = userMemory[userId].session;
    const msg = args.join(" ");
    if (!msg) {
      return message.reply(
        "⚠️ Please enter a message.\nUse `/chat set <character>` to change character.\nExample: `/chat set foxgirl maid`"
      );
    }

    const chatURL = `https://nsfw-chatbot.onrender.com/roleplay?prompt=${encodeURIComponent(prompt)}&message=${encodeURIComponent(msg)}&session=${session}`;
    const imgURL = `https://ai.lab70018.workers.dev?prompt=${encodeURIComponent(msg)}`;

    try {
      const res = await axios.get(chatURL);
      const reply = res.data?.reply || "⚠️ No reply from model.";

      message.reply(
        {
          body: reply,
          attachment: await global.utils.getStreamFromURL(imgURL)
        },
        (err, info) => {
          if (!err) {
            global.GoatBot.onReply.set(info.messageID, {
              commandName,
              messageID: info.messageID,
              author: userId
            });
          }
        }
      );
    } catch (err) {
      console.error(err.message);
      message.reply("❌ Failed to connect to chatbot or image API.");
    }
  },

  onReply: async function ({ message, event, args, Reply }) {
    const { author, commandName } = Reply;
    if (event.senderID !== author) return;

    const userId = event.senderID;
    if (!userMemory[userId]) return;

    const prompt = userMemory[userId].character;
    const session = userMemory[userId].session;
    const msg = args.join(" ");
    if (!msg) return;

    const chatURL = `https://nsfw-chatbot.onrender.com/roleplay?prompt=${encodeURIComponent(prompt)}&message=${encodeURIComponent(msg)}&session=${session}`;
    const imgURL = `https://ai.lab70018.workers.dev?prompt=${encodeURIComponent(msg)}`;

    try {
      const res = await axios.get(chatURL);
      const reply = res.data?.reply || "⚠️ No reply from model.";

      message.reply(
        {
          body: reply,
          attachment: await global.utils.getStreamFromURL(imgURL)
        },
        (err, info) => {
          if (!err) {
            global.GoatBot.onReply.set(info.messageID, {
              commandName,
              messageID: info.messageID,
              author: userId
            });
          }
        }
      );
    } catch (err) {
      console.error(err.message);
      message.reply("❌ Failed to connect to chatbot or image API.");
    }
  }
};
