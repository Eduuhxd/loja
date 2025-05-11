const { EmbedBuilder, ApplicationCommandType, ActionRowBuilder, ButtonBuilder } = require("discord.js");
const { GerenciarCampos } = require("../../Functions/GerenciarCampos");
const { getPermissions } = require("../../Functions/PermissionsCache.js");
const Discord = require("discord.js");

module.exports = {
    name: "testandoisso",
    description: "Use para arquivar um ticket",
    type: ApplicationCommandType.ChatInput,
    run: async (client, interaction, message) => {
        const axios = require('axios');

        const API_KEY = 'db9062a0-6c13-44ab-ae9f-3afaabc4192b';
        const API_URL = 'https://api.commerce.coinbase.com/charges';

        // Função para criar um novo pagamento
        async function criarPagamento(amount, currency, nomeDoItem, descricaoDoItem) {
            try {
                const response = await axios.post(API_URL, {
                    name: nomeDoItem,
                    description: descricaoDoItem,
                    local_price: {
                        amount: amount,
                        currency: currency
                    },
                    pricing_type: 'fixed_price'
                }, {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CC-Api-Key': API_KEY
                    }
                });

                return response.data.data; // Retorna os dados do pagamento
            } catch (error) {
                console.error('Erro ao criar pagamento:', error.response ? error.response.data : error.message);
                throw error;
            }
        }


        async function verificarStatusPagamento(chargeId) {
            try {
              const response = await axios.get(`https://api.commerce.coinbase.com/charges/${chargeId}`, {
                headers: {
                  'Content-Type': 'application/json',
                  'X-CC-Api-Key': API_KEY
                }
              });
          
              if (response.data && response.data.data && response.data.data.status) {
                const status = response.data.data.status;
                console.log(`Status do pagamento (charge_id ${chargeId}): ${status}`);
                
                // Verifica se o pagamento foi aprovado
                if (status === 'COMPLETED') {
                  console.log('O pagamento foi aprovado!');
                } else {
                  console.log('O pagamento ainda não foi aprovado.');
                }
              } else {
                console.log('Resposta inesperada da API:', response.data);
              }
            } catch (error) {
              console.error('Erro ao verificar status do pagamento:', error.response ? error.response.data : error.message);
              throw error;
            }
          }


        const novoPagamento = await criarPagamento(10.0, 'BRL', 'Produto Teste', 'Descrição do Produto Teste');
        console.log('Pagamento criado:', novoPagamento);


     //  await verificarStatusPagamento(novoPagamento.id);
      
    },
};