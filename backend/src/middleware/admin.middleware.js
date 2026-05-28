export const verifyAdmin = (req, res, next) => {
  if (req.user?.rol !== 'admin') {
    return res.status(403).json({ mensaje: 'Acceso denegado: se requiere rol admin' });
  }
  next();
};
