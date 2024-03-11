const { WebSocketServer } = require("ws")
const dotenv = require("dotenv")
const fs = require('fs')

dotenv.config()

const wss = new WebSocketServer({ port: process.env.PORT || 8080 })

websocket.onmessage = function(event) {
    const data = JSON.parse(event.data);
  
    // Verificar se a mensagem contém o nome do arquivo de áudio
    if (data.audioFileName) {
      const audioUrl = `wss://chat-backend-pmzy.onrender.com${data.audioFileName}`;
  
      // Criar um elemento de áudio e reproduzir o áudio
      const audioElement = new Audio(audioUrl);
      audioElement.controls = true;
      document.body.appendChild(audioElement);
    }
  };

wss.on('connection', function connection(ws) {
    ws.on('message', function incoming(message) {
      try {
        const parsedMessage = JSON.parse(message);
  
        // Verificar se a mensagem contém áudio
        if (parsedMessage.audio) {
          const audioData = parsedMessage.audio;
          const fileName = `audio_${Date.now()}.wav`;
  
          // Salvar os dados de áudio em um arquivo
          fs.writeFile(fileName, audioData, 'binary', (err) => {
            if (err) {
              console.error('Erro ao salvar o arquivo de áudio:', err);
              return;
            }
            console.log('Arquivo de áudio salvo:', fileName);
  
            // Enviar confirmação ao cliente, se necessário
            // ws.send(JSON.stringify({ audioSaved: true }));
          });
        } else {
          // Lidar com a mensagem de texto
          console.log('Recebeu mensagem de texto:', parsedMessage);
        }
      } catch (error) {
        console.error('Erro ao analisar mensagem JSON:', error);
      }
    });
  });