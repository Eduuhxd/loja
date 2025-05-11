// discord.js
const { ActivityType } = require("discord.js");

// config.json
const config = require("../../../config.json");

// axios - request
const axios = require("axios");

// event
module.exports = {
    name: "ready",
    async execute(client) {

        // main logs
        console.log(`[LOG] ${client.user.username} is ready!`);

        // bot status
        const textStatus = `Vendas Automáticas`;
        client.user.setActivity(textStatus, {
            type: ActivityType.Custom
        });
        client.user.setStatus("online");

        // changes the bot description to the official one
        const description = `<a:emoji_24:1142605393852375090> Bot de vendas por mensalidade e sem taxas adicionais\n<a:Aviso2:1153002548849029251> Personalizavel via comandos\n<a:Suporte:1153001753588011128> Barato\n Interessado? 👇🏼\n https://discord.com/invite/fvmmNfmktB/n`
        await axios.patch(`https://discord.com/api/v10/applications/${client.user.id}`, {
            description: description
        }, {
            headers: {
                "Authorization": `Bot ${config.token}`,
                "Content-Type": 'application/json',
            }
        });

    },
};