// Importações necessárias
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

// Configuração do seu projeto
const firebaseConfig = {
  apiKey: "AIzaSyBE4OJYYb_IhxDPC9Id4AAos3aKnavGkBM",
  authDomain: "mdo-danca.firebaseapp.com",
  databaseURL: "https://mdo-danca-default-rtdb.firebaseio.com",
  projectId: "mdo-danca",
  storageBucket: "mdo-danca.firebasestorage.app",
  messagingSenderId: "329395251893",
  appId: "1:329395251893:web:328fea574cf33276316cfc"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);

// Inicializa Realtime Database
const db = getDatabase(app);

// Exporta para usar no script.js
export { db };
