const client = require("../index");
const { Collection, MessageEmbed } = require("discord.js");
const Timeout = new Collection();
const schema = require("../models/custom-commands");
const ms = require("ms");
const db = require("../reconDB");
const { user } = require("../index");
client.on("message", async (message) => {
  const p = await client.prefix(message);

  
  if (message.content.match(new RegExp(`^<@!?${client.user.id}> prefix`))) {
    return message.channel.send(
      new MessageEmbed()
        .setTitle(`Hello ${message.author.tag}`)
        .setDescription(
          `My Prefix in this server in ${p}. If you want help, then use '${p}help\n[Invite Me](https://discord.com/oauth2/authorize?client_id=849850184023670796&scope=bot&permissions=8589934591) | [Support Server](https://discord.gg/abCV8XmrAf)`
        )
        .setThumbnail(message.guild.iconURL())
        .setColor("RANDOM")
        .setFooter(
          `Requested by ${message.author.tag}`,
          message.author.displayAvatarURL({ dynamic: true })
        )
    );
  }
  

  if (message.author.bot) return;
  if (!message.content.startsWith(p)) return;
  if (!message.guild) return;
  if (!message.member)
    message.member = await message.guild.fetchMember(message);
  const args = message.content.slice(p.length).trim().split(/ +/g);
  const cmd = args.shift().toLowerCase();
  if (cmd.length == 0) return;
  const data = await schema.findOne({ Guild: message.guild.id, Command: cmd });
  if (data) message.channel.send(data.Response);
  let command = client.commands.get(cmd);
  if (!command) command = client.commands.get(client.aliases.get(cmd));
  if (command) {
    if (command.cooldown) {
      if (Timeout.has(`${command.name}${message.author.id}`))
         return message.channel.send(
           `You are on a \`${ms(
             Timeout.get(`${command.name}${message.author.id}`) - Date.now(),
             { long: true }
           )}\` cooldown.`
         );
        
      command.run(client, message, args);
      Timeout.set(
        `${command.name}${message.author.id}`,
        Date.now() + command.cooldown
      );
      setTimeout(() => {
        Timeout.delete(`${command.name}${message.author.id}`);
      }, command.cooldown);
    } else command.run(client, message, args);
  }
});



