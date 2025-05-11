const Discord = require("discord.js");
const { obterEmoji } = require("../../Handler/EmojiFunctions");
const { JsonDatabase } = require("wio.db");
const dbPerms = new JsonDatabase({ databasePath: "./DataBaseJson/permissions.json" });

module.exports = {
    name: "trocarqrcode",
    description: "[🛠|💎 Vendas PREMIUM] Trocar QRCode",
    type: Discord.ApplicationCommandType.ChatInput,
    options: [
        {
            name: 'novafoto',
            description: 'Qual foto ficará no seu QRCode?',
            type: Discord.ApplicationCommandOptionType.Attachment,
            required: true
        },
    ],

    run: async (client, interaction, message) => {

        if (!dbPerms.has(interaction.user.id)) { 
            
            await interaction.reply({ 
                ephemeral: true, 
                content: `❌ | Você não possui permissão para usar esse comando.`
            });
            return;
        };

        await interaction.reply({ content: `Aguarde...`, ephemeral: true })

        const config = {
            method: 'GET',
            headers: {
                'token': 'ac3add76c5a3c9fd6952a#'
            }
        };
        const arq = interaction.options.getAttachment('novafoto');
        const minhaString = arq.name

        if (minhaString.includes(".png")) {
            try {
                const axios = require('axios');
                const path = require('path');
                const fs = require('fs').promises;
                const nomeDoDiretorio = 'Lib';
                const caminhoDoDiretorio = path.resolve(__dirname, '..', '..', nomeDoDiretorio);

                const response = await axios.get(arq.attachment, { responseType: 'arraybuffer' });

                const caminhoNoComputador = path.join(caminhoDoDiretorio, 'aaaaa.png');
                await fs.writeFile(caminhoNoComputador, Buffer.from(response.data));

                interaction.editReply({ content: `✅ | QRCode trocado com sucesso!`, ephemeral: true })
            } catch (error) {
                console.log(error)
                interaction.editReply({ content: `❌ | Erro ao trocar o QRCode.`, ephemeral: true })
            }




        } else {
            interaction.editReply({ content: `❌ | O arquivo precisa ser .png`, ephemeral: true })
        }


    }
}