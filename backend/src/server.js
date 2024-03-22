const WebSocketServer = require('ws').Server;
const wss = new WebSocketServer({ port: process.env.PORT || 8080 });

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