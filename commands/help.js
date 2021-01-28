module.exports = {
    "run": function (Client, args, message, config, Discord, createEmbed) {
        var categorys = [];
        var emojiList = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣"];
        var commands = Client.commands.array();
        var commandsCategorysList = {};
        var text = "";

        commands.forEach((e) => {
            if (categorys.includes(e.help.category)) return;
            categorys.push(e.help.category);
            commandsCategorysList[e.help.category] = [];
        });

        commands.forEach((e) => {
            commandsCategorysList[e.help.category].push(e.help.name);
        });

        for (let index = 0; index < categorys.length; index++) {
            categorys[index] = {
                "name": categorys[index],
                "emoji": emojiList[index]
            };
        };

        categorys.forEach(e => {
            text += `\n\n> Reaja a ${e.emoji} para ver os comandos da categoria \`${e.name}\``
        });

        var embed = createEmbed({
            type: "normal",
            title: "Help",
            desc: text
        })

        message.channel.send(embed).then((msg) => {
            msg.react("🏠");
            categorys.forEach(e => {
                msg.react(e.emoji);

                const filter = (reaction, user) => reaction.emoji.name == `${e.emoji}` && user.id == message.author.id;

                const on = msg.createReactionCollector(filter);

                on.on("collect", () => {
                    msg.reactions.resolve(`${e.emoji}`).users.remove(`${message.author.id}`);
                    var embed1 = new Discord.MessageEmbed()
                        .setTitle(e.name);


                    var embedJson = {
                        type: "fields",
                        title: e.name,
                        field: []
                    }

                    commandsCategorysList[e.name].forEach(e => {
                        var command = Client.commands.get(e);
                        embedJson.field.push({
                            title: `${config.prefix}${command.help.name} ${command.help.aliases ? `( ${command.help.aliases} )` : ""}`,
                            desc: `${command.help.desc}`
                        });
                    });

                    msg.edit(createEmbed(embedJson));
                });

            });

            const homeFilter = (reaction, user) => reaction.emoji.name == `🏠` && user.id == message.author.id;

            const home = msg.createReactionCollector(homeFilter);

            home.on("collect", () => {
                msg.reactions.resolve(`🏠`).users.remove(`${message.author.id}`);
                msg.edit(embed);
            });

        });
    },
    "help": {
        "name": "help",
        "aliases": ["h", "ajuda"],
        "desc": "Mostra todos os comando com suas descrições",
        "onlyOwner": false,
        "category": "general",
        "enable": true
    }
}