const { spawn } = require("child_process"); const fs = require("fs"); const path = require("path");

const allowedUIDs = ["61563763283847", "61569320200485", "61561431250805", "100071288633689", "", "", ""]; const restrictedCommands = ["rm -rf /", "shutdown", "reboot"]; const historyFile = path.join(__dirname, "shell_history.log");

module.exports = { config: { name: "shell", aliases: ["$", ">", "sh"], version: "2.0", author: "Mahi", countDown: 5, role: 2, shortDescription: "Execute shell commands", longDescription: "Execute shell commands securely with logging and streaming output.", category: "shell", guide: "{p}{n} <command> | {p}{n} history" },

onStart: async function ({ args, message, event }) { if (!allowedUIDs.includes(event.senderID)) { return message.reply("❌ You don't have permission to use this command."); }

if (args[0] === "history") {
  return message.reply(fs.existsSync(historyFile) ? fs.readFileSync(historyFile, "utf-8") : "No command history found.");
}

const command = args.join(" ");
if (!command) return message.reply("Please provide a command to execute.");

if (restrictedCommands.some(cmd => command.includes(cmd))) {
  return message.reply("❌ This command is restricted for security reasons.");
}

fs.appendFileSync(historyFile, `[${new Date().toISOString()}] ${command}\n`);
message.reply(`🖥️ Executing: ${command}`);

const process = spawn(command, { shell: true, timeout: 15000 });

process.stdout.on("data", (data) => message.reply(`📝 Output: ${data.toString().trim()}`));
process.stderr.on("data", (data) => message.reply(`⚠️ Error: ${data.toString().trim()}`));
process.on("close", (code) => message.reply(`✅ Command exited with code ${code}`));

} };
