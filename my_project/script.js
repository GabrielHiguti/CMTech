// Definir as classes que o modelo reconhece
const CLASSES = ['Pessoa', 'Coca Cola Zero']; // Atualizado com as suas classes

// Variável para armazenar o modelo carregado
let model;

// Função para carregar o modelo
async function loadModel() {
    try {
        model = await tf.loadLayersModel('models/model.json');
        console.log("Modelo carregado com sucesso!");
    } catch (error) {
        console.error("Erro ao carregar o modelo:", error);
    }
}

// Carregar o modelo ao iniciar a página
loadModel();

// Selecionar o elemento de vídeo e botão de captura
const video = document.getElementById('camera');
const captureButton = document.getElementById('capture');

// Função para acessar a câmera
async function startCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;
    } catch (error) {
        console.error("Erro ao acessar a câmera:", error);
    }
}

// Iniciar a câmera ao carregar a página
startCamera();

// Função para capturar a imagem e fazer a previsão
async function captureImage() {
    try {
        // Criar um canvas para capturar o frame atual do vídeo
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Converter a imagem do canvas para um tensor do TensorFlow
        let imageData = tf.browser.fromPixels(canvas);

        // Redimensionar a imagem para o tamanho esperado pelo modelo: 224x224
        const resizedImage = tf.image.resizeBilinear(imageData, [224, 224]);

        // Normalizar a imagem para o intervalo [0, 1]
        const normalizedImage = resizedImage.div(255);

        // Adicionar uma dimensão para se tornar [1, 224, 224, 3]
        const inputImage = normalizedImage.expandDims(0);

        // Fazer a previsão usando o modelo carregado
        const prediction = await model.predict(inputImage).data();

        // Encontrar o índice da classe com a maior probabilidade
        const highestScoreIndex = prediction.indexOf(Math.max(...prediction));

        // Usar a constante CLASSES para obter o nome do produto correspondente
        const productName = CLASSES[highestScoreIndex];
        document.getElementById('product-info').textContent = `Produto: ${productName}`;

        // Falar o nome do produto usando a API de síntese de voz
        const utterance = new SpeechSynthesisUtterance(`Produto: ${productName}`);
        window.speechSynthesis.speak(utterance);
    } catch (error) {
        console.error("Erro ao capturar a imagem ou prever:", error);
    }
}

// Adicionar o evento de clique ao botão de captura
captureButton.addEventListener('click', captureImage);
