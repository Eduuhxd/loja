// discord.js
const moment = require('moment');
require('moment/locale/pt-br');
const {Client, GatewayIntentBits,Collection, Partials, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, StringSelectMenuBuilder, Events } = require("discord.js");
const { antispam, servidor } = require("./config.json");

// client
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages
    ]
});

// allows you to import the client externally
module.exports = client;

// config.json
const config = require("./config.json");

// fs - files
const { readdirSync } = require("node:fs");

// collections
client.commands = new Collection();

// import the handlers
const handlers = readdirSync("./src/handler").filter((file) => file.endsWith('.js'));
for (const file of handlers) {
    require(`./src/handler/${file}`)(client);
};

// loads the collections with the types of commands
client.handleCommands("./src/slashCommands");

// clear - login
console.clear();
client.login(config.token);

// unhandledRejection
process.on("unhandledRejection", (reason, promise) => {
    console.error(reason + " " + promise);
    return;
});

// uncaughtException
process.on("uncaughtException", (error, origin) => {
    console.error(error + " " + origin);
    return;
});

const userAttempts = {};
 
client.on('guildMemberAdd', async member => {
  // Reinicia as tentativas do usuário quando ele entra
  userAttempts[member.id] = 0;
  sendCaptcha(member);
});
 
async function sendCaptcha(member) {
  const creationTime = new Date() - member.user.createdAt;
  const daysSinceCreation = creationTime / (1000 * 60 * 60 * 24);
  const hasDefaultAvatar = member.user.avatar === null;
 
  if (daysSinceCreation < 10 && hasDefaultAvatar) {
    const logChannel = await client.channels.fetch(`${antispam}`); // Substitua 'ID_DO_CANAL_DE_LOGS' pelo ID real do seu canal de logs
    const embed = new EmbedBuilder()
      .setColor('#ffaa00')
      .setTitle('🔔 Aviso de Captcha [SUSPECT]')
      .setDescription(`O usuário <@${member.id}> (${member.user.tag}), com a conta criada recentemente: **${moment(member.user.createdAt).format('LLLL')}** e sem foto de perfil, recebeu um captcha de verificação.`)
      .addFields({ name: 'Ação Necessária', value: 'Resolver o captcha enviado em sua DM em até 4 minutos.' })
      .setTimestamp();
    logChannel.send({  embeds: [embed] });
//content: '||<@&1035594075333726278>||',
 
    const captcha = generateCaptcha();
    const options = generateOptions(captcha);
    const channel = await member.createDM();
    const guildd = await client.guilds.fetch(`${servidor}`); // Substitua pelo ID real do seu servidoR
    const captchaEmbed = new EmbedBuilder()
      .setColor('#ff004e')
      .setTitle('🤖 Verificação de Segurança')
      .setDescription(`Olá! __Identificamos algo incomum na sua conta.__ Você tem 2 tentativas para provar que não é um robô. Código: **${captcha}**`)
      .setFooter({
        text: 'Você tem 4 Minutos para resolver o captcha, confirme o código em negrito abaixo',
        iconURL: guildd.iconURL(), 
     
 
      });
 
    await channel.send({ content: ` Atenção ${member}`,
      embeds: [captchaEmbed],
      components: [new ActionRowBuilder()
        .addComponents(
          new StringSelectMenuBuilder()
            .setCustomId('captcha')
            .setPlaceholder('👇 Selecione o captcha correto')
            .addOptions(options),
        )]
    });
 
    userAttempts[member.id] = { attempts: 0, timestamp: new Date() };
 
    // Reintegração da lógica de banimento após 4 minutos
    setTimeout(async () => {
      if (userAttempts[member.id] && userAttempts[member.id].attempts < 2) {
        const guild = await client.guilds.fetch(`${servidor}`); // Substitua pelo ID real do seu servidor
        const fetchedMember = await guild.members.fetch(member.id).catch(console.error);
        if (fetchedMember) {
          await fetchedMember.send('🚫 [BANIDO] Você não resolveu o captcha a tempo e foi considerado um spammer. Se voce acha que isso foi um erro contate o Developer, Discord: bigjhinz').catch(console.error);
          await fetchedMember.ban({ reason: '[Anti-Spam] Não resolveu o captcha a tempo' }).catch(console.error);
          const logggChannel = await client.channels.fetch(`${antispam}`); // Substitua 'ID_DO_CANAL_DE_LOGS' pelo ID real do seu canal de logs
          const embed = new EmbedBuilder()
      .setColor('#FF0000')
      .setTitle('🔔 Aviso de Captcha')
      .setDescription(`O usuário <@${fetchedMember.id}> (${fetchedMember.user.tag}) Foi banido`)
      .addFields({ name: 'Motivo', value: 'Não resolveu o captcha no tempo necessário' })
      .setTimestamp();
    logggChannel.send({ embeds: [embed] });
        }
        delete userAttempts[member.id];
      }
    }, 4 * 60 * 1000); // 4 minuto para resolver o captcha
  }
}
 
client.on('interactionCreate', async interaction => {
    if (!interaction.isStringSelectMenu() || interaction.customId !== 'captcha') return;
 
    const selectedValue = interaction.values[0];
    const captcha = interaction.message.embeds[0].description.match(/\*\*(.*?)\*\*/)[1];
    const memberAttempt = userAttempts[interaction.user.id];
    const currentTime = new Date();
 
    if (currentTime - memberAttempt.timestamp > 4 * 60 * 1000) {
      await interaction.reply({ content: '⏰ O tempo para resolver o captcha expirou.', ephemeral: true });
      return;
    }
 
    // Atualiza o componente para desabilitá-lo
    const disabledComponent = new ActionRowBuilder()
      .addComponents(
        new StringSelectMenuBuilder()
          .setCustomId('captcha')
          .setPlaceholder('👇 Selecione o captcha correto')
          .addOptions(interaction.message.components[0].components[0].data.options.map(option => ({
            ...option,
            default: option.value === selectedValue
          })))
          .setDisabled(true) // Desabilita o menu de seleção
      );
 
    if (selectedValue === captcha) {
      await interaction.update({
        content: 'Captcha resolvido com sucesso! Bem-vindo(a) ao servidor.',
        components: [disabledComponent],
        ephemeral: true
      });
      delete userAttempts[interaction.user.id];
 
      // Envia a mensagem para o canal de logs informando que o captcha foi resolvido
  const logChannel = await client.channels.fetch(`${antispam}`); // Substitua 'ID_DO_CANAL_DE_LOGS' pelo ID real do seu canal de logs
  const successEmbedCaptcha = new EmbedBuilder()
    .setColor('#00FF00') // Cor verde para indicar sucesso
    .setTitle(' Captcha Resolvido')
    .setDescription(`O usuário <@${interaction.user.id}> (${interaction.user.tag}) resolveu o captcha com sucesso e agora tem acesso ao servidor.`)
    .setTimestamp();
  await logChannel.send({ embeds: [successEmbedCaptcha] });
     
    } else {
      memberAttempt.attempts += 1;
      if (memberAttempt.attempts >= 2) {
        const guild = await client.guilds.fetch(`${servidor}`); //Substitua 'ID_DO_SERVIDOR' pelo ID real do seu servidor
        const fetchedMember = await guild.members.fetch(interaction.user.id).catch(console.error);
        if (fetchedMember) {
          await interaction.update({
            content: '🚫 Você falhou ao resolver o captcha duas vezes. **Você foi banido por suspeita de ser um bot de spam.**',
            components: [disabledComponent],
            ephemeral: true
          });
          await fetchedMember.ban({ reason: 'Falha ao resolver o captcha' }).catch(console.error);
          const loggChannel = await client.channels.fetch(`${antispam}`); // Substitua 'ID_DO_CANAL_DE_LOGS' pelo ID real do seu canal de logs
          const embed = new EmbedBuilder()
      .setColor('#FF0000')
      .setTitle('🔔 Aviso de Captcha')
      .setDescription(`O usuário <@${fetchedMember.id}> (${fetchedMember.user.tag}) Foi banido`)
      .addFields({ name: 'Motivo', value: 'Falhou todas as tentativas para solucionar o captcha' })
      .setTimestamp();
    loggChannel.send({ embeds: [embed] });
        }
        delete userAttempts[interaction.user.id];
      } else {
        await interaction.reply({
          content: ` Captcha incorreto. Verifique corretamente o código em **negrito**`,
          ephemeral: true
        });
      }
    }
  });
 
 
function generateCaptcha() {
  const characters = 'ABCDLKwFHczMsoj92qMtCZUGQ1FXvXEwMA2nyMmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}
 
function generateOptions(correctAnswer) {
  const options = [];
  for (let i = 0; i < 4; i++) {
    options.push({
      label: generateCaptcha(),
      value: generateCaptcha(),
    });
  }
  // Insere a resposta correta em uma posição aleatória
  options.splice(Math.floor(Math.random() * options.length), 0, { label: correctAnswer, value: correctAnswer });
 
  // Embaralha as opções usando o algoritmo Fisher-Yates
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]]; // Troca os elementos
  }
 
  return options.map(option => ({ label: option.label, value: option.value }));
}
