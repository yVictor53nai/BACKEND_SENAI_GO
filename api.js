// src/services/api.js (ou caminho correspondente)
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000', // Confirme se a porta é efetivamente a 3000
});

export default api;