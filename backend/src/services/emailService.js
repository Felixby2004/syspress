import * as brevo from '@getbrevo/brevo';
import dotenv from 'dotenv';
dotenv.config();

// Configuración de la API de Brevo
const apiInstance = new brevo.TransactionalEmailsApi();
const apiKey = apiInstance.authentications['apiKey'];
apiKey.apiKey = process.env.BREVO_API_KEY;

// ===== ENVÍO DE CÓDIGO DE VERIFICACIÓN =====
export const sendVerificationEmail = async (toEmail, code) => {
  try {
    const sendSmtpEmail = new brevo.SendSmtpEmail();
    sendSmtpEmail.subject = 'Código de Verificación - SysPress';
    sendSmtpEmail.to = [{ email: toEmail }];
    sendSmtpEmail.htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #2a7de1;">Bienvenido a SysPress</h2>
        <p>Tu código de verificación es:</p>
        <div style="background: #f5f7fa; padding: 12px; border-radius: 6px; text-align: center; font-size: 24px; letter-spacing: 4px; font-weight: bold; color: #1a2a3a;">
          ${code}
        </div>
        <p style="margin-top: 16px; color: #666;">Este código expirará en 10 minutos.</p>
        <p>Saludos,<br/>El equipo de SysPress</p>
      </div>
    `;
    sendSmtpEmail.sender = { 
      name: 'SysPress',
      email: process.env.FROM_EMAIL || 'no-reply@syspress.com'
    };

    const response = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('Correo enviado correctamente:', response);
    return true;
  } catch (error) {
    console.error('Error al enviar correo de verificación:', error);
    return false;
  }
};

// ===== ENVÍO DE CÓDIGO PARA RECUPERACIÓN DE CONTRASEÑA =====
export const sendResetPasswordEmail = async (toEmail, code) => {
  try {
    const sendSmtpEmail = new brevo.SendSmtpEmail();
    sendSmtpEmail.subject = 'Recuperación de contraseña - SysPress';
    sendSmtpEmail.to = [{ email: toEmail }];
    sendSmtpEmail.htmlContent = `
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
    `;
    sendSmtpEmail.sender = { 
      name: 'SysPress',
      email: process.env.FROM_EMAIL || 'no-reply@syspress.com'
    };

    const response = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('Correo de recuperación enviado:', response);
    return true;
  } catch (error) {
    console.error('Error al enviar correo de recuperación:', error);
    return false;
  }
};