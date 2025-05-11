const { ActionRowBuilder, ButtonBuilder } = require("discord.js");
const { configuracao, tickets } = require("../DataBaseJson");
const Discord = require("discord.js")

async function CreateTicket(interaction, valor) {


    await interaction.reply({ content: `🔄 | Aguarde estamos criando seu Ticket!`, ephemeral: true });
    await interaction.message.edit()

    const ggg = tickets.get(`tickets.funcoes.${valor}`)
    const aparencia = tickets.get(`tickets.aparencia`)

    if (ggg == null || Object.keys(ggg).length == 0) return interaction.editReply({ content: `❌ | Essa função não existe!`, ephemeral: true });

    const thread2222 = interaction.channel.threads.cache.find(x => x.name.includes(interaction.user.id));
    if (thread2222 !== undefined) {
        const row4 = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setURL(`https://discord.com/channels/${interaction.guild.id}/${thread2222.id}`)
                    .setLabel('Ir para o Ticket')
                    .setStyle(5)
            )

        interaction.editReply({ content: `❌ Você já possuí um ticket aberto.`, components: [row4] })
        return
    }


    const thread = await interaction.channel.threads.create({
        name: `${valor}・${interaction.user.username}・${interaction.user.id}`,
        autoArchiveDuration: 60,
        type: Discord.ChannelType.PrivateThread,
        reason: 'Ticket aberto',
        members: [interaction.user.id],
        permissionOverwrites: [
            {
                id: configuracao.get('ConfigRoles.cargoadm'), // Substitua pelo ID do seu cargo
                allow: [Discord.PermissionFlagsBits.SendMessagesInThreads],
            },
            {
                id: configuracao.get('ConfigRoles.cargosup'), // Substitua pelo ID do seu cargo
                allow: [Discord.PermissionFlagsBits.SendMessagesInThreads],
            },
            {
                id: interaction.user.id, // Substitua pelo ID do seu cargo
                allow: [Discord.PermissionFlagsBits.SendMessagesInThreads],
            },
        ],
    });

    const row4 = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setURL(`https://discord.com/channels/${interaction.guild.id}/${thread.id}`)
                .setLabel('Ir para o Ticket')
                .setStyle(5)
        )

    interaction.editReply({ content: `✅ Ticket criado com sucesso!`, components: [row4] })

    const embed = new Discord.EmbedBuilder()
        .setAuthor({ name: `${interaction.user.username}`, iconURL: `${interaction.user.displayAvatarURL({ dynamic: true })}` })
        .setTitle(`${valor}`)
        .setDescription(`${ggg.descricao == undefined ? ggg.predescricao : ggg.descricao}`)
        .setFooter(
            { text: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) }
        )
        .setTimestamp()

    if (ggg.banner !== undefined) {
        embed.setImage(`${ggg.banner}`)
    }

    if (aparencia.color !== undefined) {
        embed.setColor(`${aparencia.color}`)
    }

    const button = new Discord.ButtonBuilder()
        .setCustomId('arquivar')
        .setLabel('Arquivar')
        .setStyle(2)
    const button2 = new Discord.ButtonBuilder()
        .setCustomId('deletar')
        .setLabel('Deletar')
        .setStyle(4)

    const row = new Discord.ActionRowBuilder()
        .addComponents(button, button2);



    thread.send({ components: [row], embeds: [embed], content: `${interaction.user} ${configuracao.get('ConfigRoles.cargoadm') == null ? '' : `<@&${configuracao.get('ConfigRoles.cargoadm')}>`} ${configuracao.get('ConfigRoles.cargosup') == null ? '' : `<@&${configuracao.get('ConfigRoles.cargosup')}>`}` })


}

module.exports = {
    CreateTicket
}