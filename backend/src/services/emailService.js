import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

// Configuración para Gmail con OAuth2 o contraseña de aplicación
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465, // Usar 465 con SSL (más estable que 587)
  secure: true, // true para 465, false para 587
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASS,
  },
  tls: {
    rejectUnauthorized: false, // Permite conexiones sin verificar certificado
  },
  connectionTimeout: 30000, // 30 segundos
  greetingTimeout: 30000,
  socketTimeout: 30000,
  debug: true, // Activar logs para depuración (opcional, eliminar en producción)
});

// ===== ENVÍO DE CÓDIGO DE VERIFICACIÓN =====
export const sendVerificationEmail = async (toEmail, code) => {
  try {
    const info = await transporter.sendMail({
      from: `"SysPress" <${process.env.GMAIL_USER}>`,
      to: toEmail,
      subject: 'Código de Verificación - SysPress',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #2a7de1;">Bienvenido a SysPress</h2>
          <p>Haz clic en el siguiente enlace o ingresa el código en la aplicación:</p>
          <div style="background: #f5f7fa; padding: 12px; border-radius: 6px; text-align: center; font-size: 24px; letter-spacing: 4px; font-weight: bold; color: #1a2a3a;">
            ${code}
          </div>
          <p style="margin-top: 16px; color: #666;">Este código expirará en 10 minutos.</p>
          <p>Saludos,<br/>El equipo de SysPress</p>
        </div>
      `,
    });
    console.log('Correo de verificación enviado:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error al enviar correo de verificación:', error);
    return false;
  }
};

// ===== ENVÍO DE CÓDIGO PARA RECUPERACIÓN DE CONTRASEÑA =====
export const sendPasswordResetEmail = async (toEmail, code) => {
  try {
    const info = await transporter.sendMail({
      from: `"SysPress" <${process.env.GMAIL_USER}>`,
      to: toEmail,
      subject: 'Recuperación de contraseña - SysPress',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #2a7de1;">Recuperación de contraseña</h2>
          <p>Hemos recibido una solicitud para restablecer tu contraseña. Usa el siguiente código:</p>
          <div style="background: #f5f7fa; padding: 12px; border-radius: 6px; text-align: center; font-size: 24px; letter-spacing: 4px; font-weight: bold; color: #1a2a3a;">
            ${code}
          </div>
          <p style="margin-top: 16px; color: #666;">Este código expirará en 10 minutos.</p>
          <p>Si no solicitaste este cambio, ignora este correo.</p>
          <p>Saludos,<br/>El equipo de SysPress</p>
        </div>
      `,
    });
    console.log('Correo de recuperación enviado:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error al enviar correo de recuperación:', error);
    return false;
  }
};