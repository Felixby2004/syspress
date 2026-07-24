import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || 'no-reply@syspress.com';

// ===== ENVÍO DE CÓDIGO DE VERIFICACIÓN =====
export const sendVerificationEmail = async (toEmail, code) => {
  try {
    const response = await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      {
        sender: { 
          name: 'SysPress', 
          email: FROM_EMAIL 
        },
        to: [{ email: toEmail }],
        subject: 'Código de Verificación - SysPress',
        htmlContent: `
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
      },
      {
        headers: {
          'api-key': BREVO_API_KEY,
          'Content-Type': 'application/json',
        },
      }
    );
    console.log('Correo enviado correctamente:', response.data);
    return true;
  } catch (error) {
    console.error('Error al enviar correo de verificación:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error(error.message);
    }
    return false;
  }
};

// ===== ENVÍO DE CÓDIGO PARA RECUPERACIÓN DE CONTRASEÑA =====
export const sendResetPasswordEmail = async (toEmail, code) => {
  try {
    const response = await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      {
        sender: { 
          name: 'SysPress', 
          email: FROM_EMAIL 
        },
        to: [{ email: toEmail }],
        subject: 'Recuperación de contraseña - SysPress',
        htmlContent: `
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
      },
      {
        headers: {
          'api-key': BREVO_API_KEY,
          'Content-Type': 'application/json',
        },
      }
    );
    console.log('Correo de recuperación enviado:', response.data);
    return true;
  } catch (error) {
    console.error('Error al enviar correo de recuperación:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error(error.message);
    }
    return false;
  }
};