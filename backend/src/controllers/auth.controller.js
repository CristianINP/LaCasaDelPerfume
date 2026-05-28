import db from '../config/db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

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
      { id: user.id_usuario, email: user.email, rol: user.rol },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      mensaje: 'Login correcto',
      token,
      usuario: { id: user.id_usuario, nombre: user.nombre, email: user.email, rol: user.rol }
    });
  } catch (error) {
    console.error('Error en login:', error.message);
    res.status(500).json({ mensaje: 'Error en login' });
  }
};

// FORGOT PASSWORD
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ mensaje: 'El email es obligatorio' });
    }

    // Verificar si el usuario existe (sin revelar el resultado al cliente)
    const [rows] = await db.promise().query(
      'SELECT id_usuario FROM usuarios WHERE email = ?',
      [email]
    );

    if (rows.length > 0) {
      // Generar token seguro
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

      // Guardar token en la base de datos (invalidar tokens anteriores del mismo email)
      await db.promise().query(
        'UPDATE password_resets SET used = 1 WHERE email = ? AND used = 0',
        [email]
      );

      await db.promise().query(
        'INSERT INTO password_resets (email, token, expires_at) VALUES (?, ?, ?)',
        [email, token, expiresAt]
      );

      // Enviar email con nodemailer
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4200';
      const resetLink = `${frontendUrl}/reset-password?token=${token}`;

      await transporter.sendMail({
        from: `"LC Perfume" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Restablecer contraseña — LC Perfume',
        html: `
          <div style="font-family:Arial,sans-serif;background:#0a1028;color:#e8eaf6;padding:40px;border-radius:12px;max-width:520px;margin:auto;">
            <h2 style="color:#4a9eff;letter-spacing:4px;font-size:18px;margin-bottom:8px;">LC PERFUME</h2>
            <h3 style="color:#e8eaf6;font-size:16px;font-weight:400;margin-bottom:24px;">Restablecer contraseña</h3>
            <p style="color:#a0b0cc;font-size:14px;line-height:1.6;">
              Recibimos una solicitud para restablecer la contraseña de tu cuenta.
              Haz clic en el botón de abajo para crear una nueva contraseña.
            </p>
            <p style="text-align:center;margin:32px 0;">
              <a href="${resetLink}"
                style="background:linear-gradient(135deg,#4a9eff,#7b4fff);color:#fff;text-decoration:none;
                       padding:14px 32px;border-radius:8px;font-size:13px;letter-spacing:2px;display:inline-block;">
                RESTABLECER CONTRASEÑA
              </a>
            </p>
            <p style="color:#6070a0;font-size:12px;line-height:1.6;">
              Este enlace expirará en <strong style="color:#a0b0cc;">1 hora</strong>.
              Si no solicitaste este cambio, puedes ignorar este correo.
            </p>
            <hr style="border:none;border-top:1px solid rgba(74,158,255,0.15);margin:24px 0;" />
            <p style="color:#6070a0;font-size:11px;">LC Perfume · Tienda de perfumes</p>
          </div>
        `,
      });
    }

    // Siempre responder con éxito (no revelar si el email existe)
    res.json({ mensaje: 'Si tu correo está registrado, recibirás un enlace en breve.' });
  } catch (error) {
    console.error('Error en forgotPassword:', error.message);
    res.status(500).json({ mensaje: 'Error al procesar la solicitud' });
  }
};

// RESET PASSWORD
export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ mensaje: 'Token y contraseña son obligatorios' });
    }

    if (password.length < 6) {
      return res.status(400).json({ mensaje: 'La contraseña debe tener al menos 6 caracteres' });
    }

    // Buscar token válido (no usado y no expirado)
    const [rows] = await db.promise().query(
      'SELECT * FROM password_resets WHERE token = ? AND used = 0 AND expires_at > NOW()',
      [token]
    );

    if (rows.length === 0) {
      return res.status(400).json({ mensaje: 'El enlace es inválido o ha expirado' });
    }

    const reset = rows[0];

    // Actualizar contraseña del usuario
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.promise().query(
      'UPDATE usuarios SET password = ? WHERE email = ?',
      [hashedPassword, reset.email]
    );

    // Marcar token como usado
    await db.promise().query(
      'UPDATE password_resets SET used = 1 WHERE id = ?',
      [reset.id]
    );

    res.json({ mensaje: 'Contraseña restablecida correctamente' });
  } catch (error) {
    console.error('Error en resetPassword:', error.message);
    res.status(500).json({ mensaje: 'Error al restablecer la contraseña' });
  }
};
