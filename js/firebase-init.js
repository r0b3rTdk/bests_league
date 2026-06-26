// ============================================================
// BESTS LEAGUE — Inicialização do Google Firebase
// ============================================================

const firebaseConfig = {
  apiKey: "AIzaSyAfWCI1dYVNG5XL61LtxBmdyBGNALT9i30",
  authDomain: "bestsleague.firebaseapp.com",
  databaseURL: "https://bestsleague-default-rtdb.firebaseio.com",
  projectId: "bestsleague",
  storageBucket: "bestsleague.firebasestorage.app",
  messagingSenderId: "837349711192",
  appId: "1:837349711192:web:eb229637e12cc9b992592d",
  measurementId: "G-953ZXV5Y3L"
};

// Inicializa o Firebase globalmente
firebase.initializeApp(firebaseConfig);

// Expõe a referência do Realtime Database para os outros arquivos usarem
const db = firebase.database();