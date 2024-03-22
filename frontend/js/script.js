// Login elements
const login = document.querySelector(".login")
const loginForm = login.querySelector(".login__form")
const loginInput = login.querySelector(".login__input")

// Chat elements
const chat = document.querySelector(".chat")
const chatForm = chat.querySelector(".chat__form")
const chatInput = chat.querySelector(".chat__input")
const chatMessages = chat.querySelector(".chat__messages")

const colors = [
    "cadetblue",
    "chocolate",
    "aquamarine",
    "hotpink",
    "gold",
    "darkkhaki",
    "brown"
]

const user = { id: "", name: "", color: "" }

let websocket 

const createMessageSelfElement = (content) => {
    const div = document.createElement("div")

    div.classList.add("message--self")
    div.innerHTML = content

    return div
}

const createMessageOtherElement = (content, sender, senderColor) => {
    const div = document.createElement("div")
    const span = document.createElement("span")

    div.classList.add("message--other")

    div.classList.add("message--self")
    span.classList.add("message--sender")
    span.style.color = senderColor

    div.appendChild(span)

    span.innerHTML = sender
    div.innerHTML += content

    return div
}

const getRandomColor = () => {
    const randomIndex = Math.floor(Math.random() * colors.length)
    return colors[randomIndex]
}

const scrollScreen = () => {
    window.scrollTo({ 
        top: document.body.scrollHeight,
        behavior: "smooth"
    })
}

const proccessMessage = ({ data }) => {
    const { userId, userName, userColor, content } = JSON.parse(data)

    const message =
     userId == user.id 
        ? createMessageSelfElement(content) 
        : createMessageOtherElement(content, userName, userColor)

    chatMessages.appendChild(message)

    scrollScreen()
}

const handleLogin = (event) => {
    event.preventDefault()

    user.id = crypto.randomUUID()
    user.name = loginInput.value
    user.color = getRandomColor()

    login.style.display = "none"
    chat.style.display = "flex"

    websocket = new WebSocket("wss://chat-frontend-jwvq.onrender.com")
    websocket.onmessage = proccessMessage
}

const sendMessage = (event) => {
    event.preventDefault()

    let messageContent = chatInput.value;

    if (audioBlob) {
        // Se houver um áudio capturado, envie-o junto com a mensagem de texto
        const audioMessage = {
            userId: user.id,
            userName: user.name,
            userColor: user.color,
            content: messageContent,
            audio: audioBlob
        };

        websocket.send(JSON.stringify(audioMessage));

        // Limpa o áudioBlob após enviar
        audioBlob = null;
    } else {
        // Se não houver áudio, envie apenas a mensagem de texto
        const textMessage = {
            userId: user.id,
            userName: user.name,
            userColor: user.color,
            content: messageContent
        };

        websocket.send(JSON.stringify(textMessage));
    }

    chatInput.value = "";
};

  
  // Exemplo de como enviar um arquivo de áudio para o servidor
  function sendAudioFileToServer(file) {
    const reader = new FileReader();
  
    reader.onload = function() {
      const audioData = reader.result;
  
      const message = {
        audio: audioData
      };
  
      websocket.send(JSON.stringify(message));
    };
  
    reader.readAsBinaryString(file);
  }

let mediaRecorder;
let isRecording = false;
let audioBlob;

function startRecording() {
    navigator.mediaDevices.getUserMedia({ audio: true })
    .then(function(stream) {
        const audioChunks = [];
        mediaRecorder = new MediaRecorder(stream);

        mediaRecorder.addEventListener("dataavailable", function(event) {
            audioChunks.push(event.data);
        });

        mediaRecorder.addEventListener("stop", function() {
            audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
            const audioUrl = URL.createObjectURL(audioBlob);
            const audio = document.createElement('audio');
            audio.controls = true;
            audio.src = audioUrl;
            document.getElementById("chat").appendChild(audio);
            isRecording = false;
            document.getElementById("recordButton").innerText = "Iniciar Gravação";
        });

        mediaRecorder.start();
        isRecording = true;
        document.getElementById("recordButton").innerText = "Parar Gravação";
    });
}

function stopRecordingAndSend() {
    if (isRecording) {
        mediaRecorder.stop();
        isRecording = false;
        document.getElementById("recordButton").innerText = "Iniciar Gravação";
        // Enviar o áudio capturado para o chat
        if (audioBlob) {
            const audio = document.createElement('audio');
            audio.controls = true;
            audio.src = URL.createObjectURL(audioBlob);
            document.getElementById("chat").appendChild(audio);
        }
    }
}

function toggleRecording() {
    if (isRecording) {
        stopRecordingAndSend();
        sendAudioFileToServer()
    } else {
        startRecording();
    }
}

document.getElementById("recordButton").addEventListener("click", toggleRecording);


loginForm.addEventListener("submit", handleLogin)
chatForm.addEventListener("submit", sendMessage)