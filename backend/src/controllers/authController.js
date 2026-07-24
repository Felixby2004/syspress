import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../services/emailService.js';
import crypto from 'crypto';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import prisma from '../prisma.js';
dotenv.config();

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validar nombre
    if (!name || name.trim().length < 2) {
      return res.status(400).json({ error: 'El nombre debe tener al menos 2 caracteres' });
    }

    const existing = await User.findByEmail(email);
    if (existing) {
      if (existing.isVerified) {
        return res.status(400).json({ error: 'El email ya está registrado y verificado.' });
      }
      const newCode = crypto.randomInt(100000, 999999).toString();
      await User.updateVerificationCode(email, newCode);
      await sendVerificationEmail(email, newCode);
      return res.status(200).json({
        message: 'Se ha reenviado un nuevo código de verificación a tu correo.',
        userId: existing.id,
        requiresVerification: true,
      });
    }

    const code = crypto.randomInt(100000, 999999).toString();
    const user = await User.create({ name, email, password, verificationCode: code });

    const emailSent = await sendVerificationEmail(email, code);
    if (!emailSent) {
      return res.status(500).json({ error: 'Error al enviar el correo de verificación' });
    }

    res.status(201).json({
      message: 'Usuario registrado. Revisa tu correo para el código de verificación.',
      userId: user.id,
      requiresVerification: true,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;
    const user = await User.verifyUser(email, code);
    if (!user) {
      return res.status(400).json({ error: 'Código incorrecto o usuario no encontrado.' });
    }
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({
      message: 'Cuenta verificada exitosamente.',
      token,
      user: { id: user.id, name: user.name, email: user.email }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.validatePassword(email, password);
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    if (!user.isVerified) {
      return res.status(403).json({ error: 'Cuenta no verificada. Revisa tu correo.' });
    }
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || name.trim().length < 2) {
      return res.status(400).json({ error: 'El nombre debe tener al menos 2 caracteres' });
    }
    const updated = await User.updateName(req.userId, name);
    res.json({ message: 'Perfil actualizado', user: updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Obtener usuario con la contraseña (sin select)
    const user = await User.findByIdWithPassword(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Verificar contraseña actual
    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Contraseña actual incorrecta' });
    }

    // Actualizar a nueva contraseña
    await User.updatePassword(req.userId, newPassword);
    res.json({ message: 'Contraseña actualizada exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Solicitar recuperación de contraseña
export const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findByEmail(email);
    if (!user) {
      // Por seguridad, no revelar si el email existe o no
      return res.status(200).json({ message: 'Si el email existe, recibirás un código de recuperación.' });
    }

    const code = crypto.randomInt(100000, 999999).toString();
    await User.setResetPasswordCode(email, code);
    const emailSent = await sendResetPasswordEmail(email, code);
    if (!emailSent) {
      return res.status(500).json({ error: 'Error al enviar el correo de recuperación' });
    }

    res.json({ message: 'Se ha enviado un código de recuperación a tu correo.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Verificar código de recuperación
export const verifyResetCode = async (req, res) => {
  try {
    const { email, code } = req.body;
    const user = await User.verifyResetPasswordCode(email, code);
    if (!user) {
      return res.status(400).json({ error: 'Código inválido o expirado.' });
    }
    res.json({ message: 'Código verificado correctamente.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Restablecer contraseña con código verificado
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findByEmail(email);
    if (!user) {
      // Por seguridad, no revelamos si el email existe o no
      return res.status(200).json({ message: 'Si el email existe, recibirás un código de recuperación.' });
    }

    // Generar código de 6 dígitos
    const code = crypto.randomInt(100000, 999999).toString();
    const hashedCode = await bcrypt.hash(code, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos

    // Guardar en la base de datos
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: hashedCode,
        resetPasswordExpires: expiresAt,
      },
    });

    // Enviar correo
    const emailSent = await sendPasswordResetEmail(email, code);
    if (!emailSent) {
      return res.status(500).json({ error: 'Error al enviar el correo de recuperación' });
    }

    res.status(200).json({ message: 'Se ha enviado un código de recuperación a tu correo.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al procesar la solicitud' });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    // Validar que la nueva contraseña tenga al menos 6 caracteres
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 6 caracteres' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ error: 'Email no registrado' });
    }

    // Verificar que el token exista y no haya expirado
    if (!user.resetPasswordToken || !user.resetPasswordExpires) {
      return res.status(400).json({ error: 'No hay solicitud de recuperación activa' });
    }

    if (new Date() > user.resetPasswordExpires) {
      return res.status(400).json({ error: 'El código de recuperación ha expirado' });
    }

    // Comparar código
    const isValid = await bcrypt.compare(code, user.resetPasswordToken);
    if (!isValid) {
      return res.status(400).json({ error: 'Código de recuperación incorrecto' });
    }

    // Hashear nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar contraseña y limpiar campos de recuperación
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });

    res.status(200).json({ message: 'Contraseña actualizada exitosamente. Ya puedes iniciar sesión.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al restablecer la contraseña' });
  }
};