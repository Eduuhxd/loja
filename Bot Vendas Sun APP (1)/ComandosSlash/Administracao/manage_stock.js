const { EmbedBuilder, ApplicationCommandType, ActionRowBuilder, ButtonBuilder } = require("discord.js");
const { MessageStock } = require("../../Functions/ConfigEstoque.js");
const { JsonDatabase } = require("wio.db");
const dbPerms = new JsonDatabase({ databasePath: "./DataBaseJson/permissions.json" });
module.exports = {
  name: "manage_stock",
  description: "Use para configurar minhas funções",
  type: ApplicationCommandType.ChatInput,
  options: [{ name: "item", description: "-", type: 3, required: true, autocomplete: true }],

  run: async (client, interaction, message) => {

    if (!dbPerms.has(interaction.user.id)) { 
      
      await interaction.reply({ 
        ephemeral: true, 
        content: `❌ | Você não possui permissão para usar esse comando.`
      });
      return;
  };
    if (interaction.options._hoistedOptions[0].value == 'nada') return interaction.reply({ content: `Nenhum item registrado em seu BOT`, ephemeral: true })


    const separarpor_ = interaction.options._hoistedOptions[0].value.split('_')
    const produtoname = separarpor_[0]
    const camponame = separarpor_[1]

    MessageStock(interaction, 1, produtoname, camponame)

  }
}
