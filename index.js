const {
    clearInterval
} = require("timers");

// Lading modules
const Discord = require("discord.js"),
    Client = new Discord.Client(),
    config = require("./json/config.json"),
    fs = require("fs"),
    cooldown = require("./cooldown.js");

// Variables
var owners = [""];
var cooldownTime = {};

// Rendering of "commands"
Client.commands = new Discord.Collection();
Client.commands.aliases = new Discord.Collection

fs.readdir("./commands", (err, files) => {
    if (err) throw err;

    const commandsFiles = files.filter(f => f.split(".").pop() == "js");

    commandsFiles.forEach((f, i) => {
        var props = require(`./commands/${f}`);

        /* EX: 
        {
            run: function(Client, args, message, config, Discord){},
            help: {
                name: "",
                aliases:"",
                desc: "",
                onlyOwner: false,
                category: ""
            }
        } */

        Client.commands.set(props.help.name, props);
        props.help.aliases.forEach(e => {
            Client.commands.aliases.set(e, props);
        });
        console.log(`Command "${f}" have been rendered!`);
    });
});

// Functions
const sleep = (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}

function createEmbed(obj) {
    /* 
    {
        type: "default",
        title: "",
        desc: ""
        color: ",
        footer: "",
        author: ""
    } 
    
    {
        type: "fields".
        title: "",
        color: "",
        footer: "",
        author: ""
        fields: [
            {

            }
        ]
    }
    */

    var embed_;

    if (!obj.type) return console.error("it is necessary to define the type! (normal, fields)");
    if (obj.type == "normal") {
        var embed = new Discord.MessageEmbed()
            .setTitle(obj.title)
            .setDescription(obj.desc)
            .setFooter(obj.footer == "default" || obj.footer == null ? "Atenciosamente Mapree ©" : obj.footer)
            .setColor(obj.color == "default" || obj.color == null ? "WHITE" : obj.color);
        // .setAuthor(obj.author == "default" || obj.author == null ? `${message.author.username}` : obj.author);
        embed_ = embed;
    } else if (obj.type == "fields") {
        var embed = new Discord.MessageEmbed()
            .setTitle(obj.title)
            .setColor(obj.color == "default" || obj.color == null ? "WHITE" : obj.color)
            .setFooter(obj.footer == "default" || obj.footer == null ? "footer" : obj.footer);
        // .setAuthor(obj.author == "default" || obj.author == null ? "author" : obj.author);

        obj.field.forEach(e => {
            embed.addField(`${e.title}`, `${e.desc}`);
        });

        embed_ = embed;
    } else {
        console.error(`The type ${obj.type} not exist!`);
    }

    return embed_;

};

// Client ready
Client.on("ready", () => {
    console.log(`The Client ${Client.user.username} is ready!`);
});

// Client events
Client.on("message", async (message) => {
    const prefix = config.prefix;
    if (message.channel.type == "dm") return;
    if (message.author.bot) return;

    if (!message.content.toLocaleLowerCase().startsWith(prefix)) return;

    const args = message.content
        .trim()
        .slice(prefix.length)
        .split(/ + /g);

    var command = args.shift().toLocaleLowerCase();

    // cooldown[message.author.id] = 0;

    const commandFile = Client.commands.get(command) || Client.commands.aliases.get(command);
    if (!commandFile) return message.channel.send(`${message.author} o comando ${command} não existe! use ${prefix}help para ver todos comandos.`);
    if (commandFile.help.onlyOwner == true && owners.includes(message.author.id) == false) return message.channel.send(`${message.author} Esse comando é exclusivo para os donos!`);
    if (commandFile.help.enable == false && owners.includes(message.author.id) == false) return message.channel.send(`${message.author} Esse comando está desativado no momento!`);

    if(cooldownTime[message.author.id] > 0) {

        if(cooldownTime[message.author.id] >= (60 * 60 * 24)) {
            message.channel.send(`${message.author}, Aguarde mais ${Math.floor(cooldownTime[message.author.id] / (60* 60 * 24))} dia(s) para executar esse comando novamente!`);
        } else if(cooldownTime[message.author.id] >= (60 * 60)){
            message.channel.send(`${message.author}, Aguarde mais ${Math.floor(cooldownTime[message.author.id] / (60 * 60))} hora(s) para executar esse comando novamente!`);
        } else if(cooldownTime[message.author.id] >= 60){
            message.channel.send(`${message.author}, Aguarde mais ${Math.floor(cooldownTime[message.author.id] / 60)} minuto(s) para executar esse comando novamente!`);
        } else {
            message.channel.send(`${message.author}, Aguarde mais ${cooldownTime[message.author.id]} segundo(s) para executar esse comando novamente!`);
        }
    } else {
        cooldownTime[message.author.id] = 5;
        commandFile.run(Client, args, message, config, Discord, createEmbed);

        while (cooldownTime[message.author.id] != 0) {
            await sleep(1000);
            cooldownTime[message.author.id]--;
        }
    }
});

// Client login
Client.login(config.token);