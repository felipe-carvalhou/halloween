/* =============================================================
   DADOS DO CONVITE — edite só este bloco
   -------------------------------------------------------------
   evento ........ nome grande da festa.
   anfitriao ..... quem convida (aparece como assinatura).
   texto ......... parágrafos da mensagem do anfitrião.
   data .......... 'AAAA-MM-DD'. Vazio = mostra "Em breve".
   horaInicio/horaFim  'HH:MM' (horário de Brasília).
                   horaFim pode passar da meia-noite (ex.: '03:00').
   mostrarEndereco  false = esconde rua e mapa; o endereço vai
                   só para quem confirmar pelo WhatsApp.
   whatsapp ...... só números, com 55 + DDD. Ex.: '5521999999999'.
                   Vazio = botão mostra "confirmação em breve".
   perguntarFantasia  true = pede a fantasia antes de confirmar.
   titulo ........ nome do evento na agenda do celular.

   Nome do convidado: vai no link → ?nome=Fulano
   Título da aba e prévia do WhatsApp: editar no topo do
   index.html e do convite.html (o WhatsApp não lê este arquivo).
   ============================================================= */
var CONFIG = {
  evento: 'Noite do Terror',
  subtitulo: 'Venha fantasiado. Ou venha como vítima.',
  anfitriao: 'Família Souza',

  chamada: 'Esta carta está com fome',
  dica: 'Toque nela… se tiver coragem',

  texto: [
    'Nesta noite, as luzes vão se apagar e a casa vai ser tomada por bruxas, vampiros e criaturas que ninguém sabe de onde vieram.',
    'Você foi escolhido para estar entre elas. Venha fantasiado, traga sua coragem e prepare-se para não querer ir embora.'
  ],

  data: '2026-10-31',
  horaInicio: '21:00',
  horaFim: '03:00',

  local: 'Casarão Souza',
  endereco: 'Rua Exemplo, 123 — Bairro',
  cidade: 'Rio de Janeiro',
  mostrarEndereco: true,

  whatsapp: '',
  perguntarFantasia: true,

  encerramento: 'Traga sua coragem.<br />A saída não é garantida.',

  titulo: 'Noite do Terror — festa de Halloween'
};

/* ----- Daqui para baixo não precisa mexer ----- */
