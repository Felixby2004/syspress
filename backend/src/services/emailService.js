import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

console.log('🔧 Configurando emailService...');
console.log('SMTP_HOST:', process.env.SMTP_HOST);
console.log('SMTP_USER:', process.env.SMTP_USER);
console.log('SMTP_PORT:', process.env.SMTP_PORT);
console.log('FROM_EMAIL:', process.env.FROM_EMAIL);

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000,
});

// Verificar conexión al iniciar
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Error al conectar con SMTP:', error);
  } else {
    console.log('✅ Conexión SMTP establecida correctamente');
  }
});

// ===== ENVÍO DE CÓDIGO DE VERIFICACIÓN =====
export const sendVerificationEmail = async (toEmail, code) => {
  console.log(`📧 Enviando correo de verificación a ${toEmail}...`);
  try {
    const info = await transporter.sendMail({
      from: `"SysPress" <${process.env.FROM_EMAIL || 'no-reply@syspress.com'}>`,
      to: toEmail,
      subject: 'Código de Verificación - SysPress',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #2a7de1;">Bienvenido a SysPress</h2>
          <p>Tu código de verificación es:</p>
          <div style="background: #f5f7fa; padding: 12px; border-radius: 6px; text-align: center; font-size: 24px; letter-spacing: 4px; font-weight: bold; color: #1a2a3a;">
            ${code}
          </div>
          <p style="margin-top: 16px; color: #666;">Este código expirará en 10 minutos.</p>
          <p>Saludos,<br/>El equipo de SysPress</p>
        </div>
      `,
    });
    console.log('✅ Correo de verificación enviado:', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Error al enviar correo de verificación:', error);
    console.error('Detalles:', error.response || error.message);
    return false;
  }
};

// ===== ENVÍO DE CÓDIGO PARA RECUPERACIÓN DE CONTRASEÑA =====
export const sendResetPasswordEmail = async (toEmail, code) => {
  console.log(`📧 Enviando correo de recuperación a ${toEmail}...`);
  try {
    const info = await transporter.sendMail({
      from: `"SysPress" <${process.env.FROM_EMAIL || 'no-reply@syspress.com'}>`,
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
    console.log('✅ Correo de recuperación enviado:', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Error al enviar correo de recuperación:', error);
    console.error('Detalles:', error.response || error.message);
    return false;
  }
};