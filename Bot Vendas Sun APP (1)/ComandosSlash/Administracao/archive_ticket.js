const { EmbedBuilder, ApplicationCommandType, ActionRowBuilder, ButtonBuilder } = require("discord.js");
const { GerenciarCampos } = require("../../Functions/GerenciarCampos");
const Discord = require("discord.js");
const { JsonDatabase } = require("wio.db");
const dbPerms = new JsonDatabase({ databasePath: "./DataBaseJson/permissions.json" });

module.exports = {
    name: "archive_ticket",
    description: "Use para arquivar um ticket",
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "reason",
            description: "-",
            type: Discord.ApplicationCommandOptionType.String,
            required: false,
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
        const reasonaaa = interaction.options.getString("reason");
        if (interaction.channel.isThread()) {
            const ultimoIndice = interaction.channel.name.lastIndexOf("・");
            const ultimosNumeros = interaction.channel.name.slice(ultimoIndice + 1);
            await interaction.channel.setArchived(true);
            try {
                const user = await client.users.fetch(ultimosNumeros);
                await user.send({
                    content: `Olá <@!${ultimosNumeros}> seu ticket foi arquivado por ${interaction.user}.\n**Motivo:**\n${
                        reasonaaa == null ? `Nenhum motivo declarado!` : reasonaaa
                    }`,
                });
            } catch (error) {}
        } else {
            interaction.reply({ content: `Esse canal não é um ticket.`, ephemeral: true });
        }
    },
};
