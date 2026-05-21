import db from '../config/db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// REGISTRO
export const register = async (req, res) => {
  try {
    const { nombre, apellido = '', email, password, telefono } = req.body;

    if (!nombre || !email || !password) {
      return res.status(400).json({ mensaje: 'nombre, email y password son obligatorios' });
    }

    const [existingUser] = await db.promise().query(
      'SELECT * FROM usuarios WHERE email = ?',
      [email]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({ mensaje: 'El usuario ya existe' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.promise().query(
      'INSERT INTO usuarios (nombre, apellido, email, telefono, password) VALUES (?, ?, ?, ?, ?)',
      [nombre, apellido, email, telefono || null, hashedPassword]
    );

    res.status(201).json({ mensaje: 'Usuario registrado correctamente' });
  } catch (error) {
    console.error('Error en register:', error.message);
    res.status(500).json({ mensaje: 'Error al registrar usuario' });
  }
};

// LOGIN
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ mensaje: 'email y password son obligatorios' });
    }

    const [rows] = await db.promise().query(
      'SELECT * FROM usuarios WHERE email = ?',
      [email]
    );

    if (rows.length === 0) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    const user = rows[0];

    if (!user.password) {
      return res.status(401).json({ mensaje: 'Esta cuenta no tiene contraseña configurada' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ mensaje: 'Contraseña incorrecta' });
    }

    const token = jwt.sign(
      { id: user.id_usuario, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      mensaje: 'Login correcto',
      token,
      usuario: { id: user.id_usuario, nombre: user.nombre, email: user.email }
    });
  } catch (error) {
    console.error('Error en login:', error.message);
    res.status(500).json({ mensaje: 'Error en login' });
  }
};
