const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('falar')
        .setDescription('Faz o bot enviar uma mensagem específica.')
        .addStringOption(option =>
            option.setName('mensagem')
                .setDescription('A mensagem que você quer que o bot envie.')
                .setRequired(true)
        )
        .addChannelOption(option =>
            option.setName('canal')
                .setDescription('Canal onde a mensagem será enviada (opcional).')
                .setRequired(false)
        ),
    async execute(interaction) {
        // Verifica se o usuário é o dono do servidor
        if (interaction.user.id !== interaction.guild.ownerId) {
            return interaction.reply({
                content: '❌ | Apenas o **dono do servidor** pode usar este comando!',
                ephemeral: true
            });
        }

        const mensagem = interaction.options.getString('mensagem');
        const canal = interaction.options.getChannel('canal') || interaction.channel;

        try {
            // Envia a mensagem no canal especificado
            await canal.send(mensagem);
            await interaction.reply({ content: '✅ | Mensagem enviada com sucesso!', ephemeral: true });
        } catch (error) {
            console.error(error);
            await interaction.reply({
                content: '❌ | Ocorreu um erro ao tentar enviar a mensagem.',
                ephemeral: true
            });
        }
    }
};