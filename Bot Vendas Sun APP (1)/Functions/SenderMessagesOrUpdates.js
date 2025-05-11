const { produtos, configuracao } = require("../DataBaseJson")

const { QuickDB } = require("quick.db");
const db = new QuickDB();

const Discord = require("discord.js")
const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder } = require('discord.js');

const Entrega2 = configuracao.get(`Emojis_EntregAuto`)


let msg = ``
if (Entrega2 !== null) {
    Entrega2.sort((a, b) => {
        const numA = parseInt(a.name.replace('ea', ''), 10);
        const numB = parseInt(b.name.replace('ea', ''), 10);
        return numA - numB;
    });

    Entrega2.forEach(element => {
        msg += `<:${element.name}:${element.id}>`
    });
}

async function MessageCreate(interaction, client) {
    const fdfd = await db.get(`${interaction.user.id}_colocarvenda`);
    const yyy = produtos.get(fdfd.produto);

    const channel = await client.channels.fetch(interaction.values[0]);

    const selectMenuBuilder = new StringSelectMenuBuilder()
        .setCustomId('message_type_selector')
        .setPlaceholder('Selecione o tipo de mensagem')
        .addOptions([
            {
                label: 'Embed',
                description: 'Enviar a mensagem em formato Embed.',
                value: 'embed'
            },
            {
                label: 'Comum',
                description: 'Enviar uma mensagem simples (texto plano).',
                value: 'comum'
            }
        ]);

    const selectMenuRow = new ActionRowBuilder().addComponents(selectMenuBuilder);

    await interaction.reply({
        content: 'Por favor, escolha o tipo de mensagem que deseja postar:',
        components: [selectMenuRow],
        ephemeral: true
    });

    const filter = i => i.user.id === interaction.user.id;
    const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });

    collector.on('collect', async i => {
        if (i.values[0] === 'embed') {
            const embed = new EmbedBuilder()
                .setColor(fdfd.colorembed)
                .setAuthor({ name: yyy.Config.name, iconURL: yyy.Config.icon || null })
                .setDescription(yyy.Config.desc || 'Faça sua compra automática abaixo!')
                .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) })
                .setTimestamp()
                .setImage(yyy.Config.banner || null);

            if (yyy.Campos.length > 1) {
                // Limita as opções a 25, o máximo permitido
                const options = yyy.Campos.slice(0, 25).map(campo => ({
                    label: `${campo.Nome}`,
                    description: `Preço: R$ ${Number(campo.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} | Estoque: ${campo.estoque.length}`,
                    value: `${campo.Nome}_${fdfd.produto}`
                }));

                const selectMenu = new StringSelectMenuBuilder()
                    .setCustomId('comprarid')
                    .setPlaceholder('Clique aqui para ver as opções')
                    .addOptions(options);

                const actionRowSelect = new ActionRowBuilder().addComponents(selectMenu);
                await channel.send({ embeds: [embed], components: [actionRowSelect] });
                await i.update({ content: '✅ Mensagem em Embed com Select Menu postada!', components: [] });
            } else {
                const buttonStyle = fdfd.estilobutton === 'verde' ? 3 :
                                    fdfd.estilobutton === 'cinza' ? 2 :
                                    fdfd.estilobutton === 'azul' ? 1 :
                                    fdfd.estilobutton === 'vermelho' ? 4 : 2;

                const actionRowButton = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId(`comprarid_${yyy.Campos[0].Nome}_${fdfd.produto}`)
                            .setLabel(fdfd.textobutton || 'Comprar')
                            .setEmoji(fdfd.emoji || '🛒')
                            .setStyle(buttonStyle)
                    );

                embed.addFields(
                    { name: 'Valor à vista', value: `\`R$ ${Number(yyy.Campos[0].valor).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\``, inline: true },
                    { name: 'Restam', value: `\`${yyy.Campos[0].estoque.length}\``, inline: true }
                );

                await channel.send({ embeds: [embed], components: [actionRowButton] });
                await i.update({ content: '✅ Mensagem em Embed com Botão postada!', components: [] });
            }
        } else if (i.values[0] === 'comum') {
            const mensagemComum = `**${yyy.Config.name || 'Produto'}**\n\n` +
                                  `${yyy.Config.desc || 'Faça sua compra automática abaixo!'}\n\n` +
                                  `**Valor à vista:** \`R$ ${Number(yyy.Campos[0].valor).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\`\n` +
                                  `**Restam:** \`${yyy.Campos[0].estoque.length}\``;

            if (yyy.Campos.length > 1) {
                const options = yyy.Campos.slice(0, 25).map(campo => ({
                    label: `${campo.Nome}`,
                    description: `Preço: R$ ${Number(campo.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} | Estoque: ${campo.estoque.length}`,
                    value: `${campo.Nome}_${fdfd.produto}`
                }));

                const selectMenu = new StringSelectMenuBuilder()
                    .setCustomId('comprarid')
                    .setPlaceholder('Clique aqui para ver as opções')
                    .addOptions(options);

                const actionRowSelect = new ActionRowBuilder().addComponents(selectMenu);
                await channel.send({ content: mensagemComum, components: [actionRowSelect] });
            } else {
                const buttonStyle = fdfd.estilobutton === 'verde' ? 3 :
                                    fdfd.estilobutton === 'cinza' ? 2 :
                                    fdfd.estilobutton === 'azul' ? 1 :
                                    fdfd.estilobutton === 'vermelho' ? 4 : 2;

                const actionRowButton = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId(`comprarid_${yyy.Campos[0].Nome}_${fdfd.produto}`)
                            .setLabel(fdfd.textobutton || 'Comprar')
                            .setEmoji(fdfd.emoji || '🛒')
                            .setStyle(buttonStyle)
                    );

                await channel.send({ content: mensagemComum, components: [actionRowButton] });
            }

            if (yyy.Config.banner) {
                await channel.send({ files: [yyy.Config.banner] });
            }

            await i.update({ content: '✅ Mensagem comum postada!', components: [] });
        }
    });

    collector.on('end', () => {
        interaction.editReply({ components: [] });
    });
}


async function UpdateMessageProduto(client, produto) {


    const ghgh = await produtos.get(produto)


    const embed = new EmbedBuilder()

        .setDescription(`${ghgh.Config.desc == '' ? `Faça sua compra automática abaixo!` : ghgh.Config.desc}`)

        .setTimestamp()

    if (ghgh.Config.entrega == 'Sim') {
        if (msg !== '') {
            embed.setTitle(msg)
        }
    }

    if (ghgh.Config.icon !== '') {
        embed.setAuthor({ name: `${ghgh.Config.name}`, iconURL: ghgh.Config.icon })
    } else {
        embed.setAuthor({ name: `${ghgh.Config.name}` })
    }

    if (ghgh.Config.banner !== '') {
        embed.setImage(ghgh.Config.banner)
    }




    if (ghgh.Campos.length > 1) {

        const selectMenuBuilder = new Discord.StringSelectMenuBuilder()
            .setCustomId('comprarid')
            .setPlaceholder('Clique aqui para ver as opções');

        for (let iii = 0; iii < ghgh.Campos.length; iii++) {
            const element = ghgh.Campos[iii];

            const option = {
                label: `${element.Nome}`,
                description: `Preço: R$ ${Number(element.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} | Estoque: ${element.estoque.length}`,
                value: `${element.Nome}_${produto}`
            };


            selectMenuBuilder.addOptions(option);

        }




        const style2row = new ActionRowBuilder().addComponents(selectMenuBuilder);

        for (let iiiiii = 0; iiiiii < ghgh.mensagens.length; iiiiii++) {
            const element = ghgh.mensagens[iiiiii];

            try {
                const channel = await client.channels.fetch(element.channelid)
                const fetchedMessage = await channel.messages.fetch(element.mesageid);
                const guilddd = await client.guilds.fetch(element.guildid)

                embed.setColor(fetchedMessage.embeds[0].data.color)
                embed.setFooter(
                    { text: guilddd.name }
                )

                await fetchedMessage.edit({ embeds: [embed], components: [style2row] })
            } catch (error) {
                const hhhh = produtos.get(`${produto}.mensagens`)
                const indexToRemove = hhhh.findIndex(campo22 => campo22.mesageid === element.mesageid);
                hhhh.splice(indexToRemove, 1);
                produtos.set(`${produto}.mensagens`, hhhh)
            }
        }


    } else {

        if (ghgh.Campos[0] == undefined) {
            if (ghgh.mensagens == undefined) return produtos.set(`${produto}.mensagens`, [])
            for (let iiiiii = 0; iiiiii < ghgh.mensagens.length; iiiiii++) {
                const element = ghgh.mensagens[iiiiii];
                const channel = await client.channels.fetch(element.channelid)
                const fetchedMessage = await channel.messages.fetch(element.mesageid);
                fetchedMessage.delete()
            }
            produtos.set(`${produto}.mensagens`, [])
        }

        if (ghgh.Campos[0].desc !== '') {
            embed.addFields({ name: `${ghgh.Campos[0].Nome}`, value: `${ghgh.Campos[0].desc}` });
        }
        const embed22 = new EmbedBuilder()

            .setDescription(`${ghgh.Config.desc == '' ? `Faça sua compra automática abaixo!` : ghgh.Config.desc}`)
            .setTimestamp()


        if (ghgh.Config.entrega == 'Sim') {
            if (msg !== '') {
                embed22.setTitle(msg)
            }
        }

        if (ghgh.Config.icon !== '') {
            embed22.setAuthor({ name: `${ghgh.Config.name}`, iconURL: ghgh.Config.icon })
        } else {
            embed22.setAuthor({ name: `${ghgh.Config.name}` })
        }

        if (ghgh.Config.banner !== '') {
            embed22.setImage(ghgh.Config.banner)
        }

        if (ghgh.Campos[0].desc !== '') {
            embed22.addFields({ name: `${ghgh.Campos[0].Nome}`, value: `${ghgh.Campos[0].desc}`, inline: true });
        }

        embed22.addFields(
            { name: `Valor à vista`, value: `\`R$ ${Number(ghgh.Campos[0].valor).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\``, inline: true },
            { name: `Restam`, value: `\`${ghgh.Campos[0].estoque.length}\``, inline: true }
        );






        if (ghgh.mensagens?.length == undefined) return
        if (ghgh.mensagens?.length == 0) return
        for (let iiiiii = 0; iiiiii < ghgh.mensagens.length; iiiiii++) {
            const element = ghgh.mensagens[iiiiii];


            try {
                const channel = await client.channels.fetch(element.channelid)
                const fetchedMessage = await channel.messages.fetch(element.mesageid);
                const guilddd = await client.guilds.fetch(element.guildid)

                embed22.setColor(fetchedMessage.embeds[0].data.color)
                embed22.setFooter(
                    { text: guilddd.name }
                )

                let row2
                if (fetchedMessage.components[0].components[0].style == undefined) {

                    row2 = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId(`comprarid_${ghgh.Campos[0].Nome}_${produto}`)
                                .setLabel(`Comprar`)
                                .setEmoji(`1191792807451562004`)
                                .setStyle(2),)
                } else {
                    row2 = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId(`comprarid_${ghgh.Campos[0].Nome}_${produto}`)
                                .setLabel(`${fetchedMessage.components[0].components[0].label}`)
                                .setEmoji(`${fetchedMessage.components[0].components[0].emoji.id == undefined ? fetchedMessage.components[0].components[0].emoji.name : fetchedMessage.components[0].components[0].emoji.id}`)
                                .setStyle(fetchedMessage.components[0].components[0].style),)
                }



                await fetchedMessage.edit({ embeds: [embed22], components: [row2] })
            } catch (error) {
                const hhhh = produtos.get(`${produto}.mensagens`)
                const indexToRemove = hhhh.findIndex(campo22 => campo22.mesageid === element.mesageid);
                hhhh.splice(indexToRemove, 1);
                produtos.set(`${produto}.mensagens`, hhhh)
            }
        }

    }


}

module.exports = {
    MessageCreate,
    UpdateMessageProduto
}