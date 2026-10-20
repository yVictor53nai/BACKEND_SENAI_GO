function validarContentType(req, res, next) {
  // Ignora validação para métodos GET, DELETE ou requisições sem corpo
  if (['GET', 'DELETE', 'OPTIONS'].includes(req.method) || !req.headers['content-length'] || req.headers['content-length'] === '0') {
    return next();
  }

  const contentType = req.headers['content-type'];
  
  if (contentType && contentType.includes('application/json')) {
    return next();
  }

  // Se não houver content-type explicitado em um POST com body, força/permite continuar
  next();
}

module.exports = validarContentType;