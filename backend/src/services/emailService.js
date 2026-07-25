import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

// Configurar transporte con Gmail (usando Contraseña de Aplicación)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASS,
  },
  // Opcional: si tienes problemas de conexión, añade:
  // pool: true,
  // maxConnections: 1,
  // rateDelta: 1000,
  // rateLimit: 5,
});

// ===== ENVÍO DE CÓDIGO DE VERIFICACIÓN =====
export const sendVerificationEmail = async (toEmail, code) => {
  try {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px; padding: 20px;">
        <h2 style="color: #1F3A93; text-align: center;">Verifica tu correo</h2>
        <p style="font-size: 16px; color: #333;">¡Hola!</p>
        <p style="font-size: 14px; color: #666;">Usa el siguiente código para completar tu verificación:</p>
        <div style="background-color: #f0f0f0; border-left: 4px solid #FFD700; padding: 20px; margin: 20px 0; text-align: center;">
          <p style="font-size: 32px; font-weight: bold; color: #1F3A93; letter-spacing: 5px; margin: 0;">${code}</p>
        </div>
        <p style="font-size: 12px; color: #999; text-align: center;">Este código expirará en 10 minutos.</p>
      </div>
    `;

    const info = await transporter.sendMail({
      from: `"SysPress" <${process.env.GMAIL_USER}>`,
      to: toEmail,
      subject: '🔐 Código de verificación - SysPress',
      html,
    });

    console.log('Correo enviado:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error al enviar correo:', error);
    return false;
  }
};

// ===== ENVÍO DE CÓDIGO PARA RECUPERACIÓN DE CONTRASEÑA =====
export const sendResetPasswordEmail = async (toEmail, code) => {
  try {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px; padding: 20px;">
        <h2 style="color: #1F3A93; text-align: center;">Recuperación de contraseña</h2>
        <p style="font-size: 16px; color: #333;">Hola,</p>
        <p style="font-size: 14px; color: #666;">Usa el siguiente código para restablecer tu contraseña:</p>
        <div style="background-color: #f0f0f0; border-left: 4px solid #FFD700; padding: 20px; margin: 20px 0; text-align: center;">
          <p style="font-size: 32px; font-weight: bold; color: #1F3A93; letter-spacing: 5px; margin: 0;">${code}</p>
        </div>
        <p style="font-size: 12px; color: #999; text-align: center;">Este código expirará en 10 minutos.</p>
      </div>
    `;

    const info = await transporter.sendMail({
      from: `"SysPress" <${process.env.GMAIL_USER}>`,
      to: toEmail,
      subject: '🔐 Recuperación de contraseña - SysPress',
      html,
    });

    console.log('Correo de recuperación enviado:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error al enviar correo de recuperación:', error);
    return false;
  }
};