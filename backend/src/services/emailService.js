import { google } from 'googleapis';
import dotenv from 'dotenv';
dotenv.config();

// Configurar OAuth2 con las credenciales
const oauth2Client = new google.auth.OAuth2(
  process.env.GMAIL_CLIENT_ID,
  process.env.GMAIL_CLIENT_SECRET,
  'https://developers.google.com/oauthplayground' // Redirección para obtener refresh token
);

// Asignar el refresh token
oauth2Client.setCredentials({
  refresh_token: process.env.GMAIL_REFRESH_TOKEN,
});

// Crear instancia de Gmail
const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

// Función para codificar el correo a base64url (formato que espera la API de Gmail)
const encodeEmail = (to, subject, htmlContent) => {
  const emailLines = [
    `To: ${to}`,
    'Content-Type: text/html; charset="UTF-8"',
    'MIME-Version: 1.0',
    `Subject: =?UTF-8?Q?${subject}?=`,
    '',
    htmlContent,
  ];
  const email = emailLines.join('\r\n');
  // Codificar a base64url (eliminar caracteres +, / y =)
  return Buffer.from(email)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
};

// ===== ENVÍO DE CÓDIGO DE VERIFICACIÓN (REGISTRO) =====
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
        <p style="font-size: 12px; color: #999; text-align: center;">Saludos,<br/>El equipo de SysPress</p>
      </div>
    `;

    const rawMessage = encodeEmail(
      toEmail,
      '🔐 Código de verificación - SysPress',
      html
    );

    const response = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: rawMessage,
      },
    });

    console.log('✅ Correo enviado (vía API):', response.data.id);
    return true;
  } catch (error) {
    console.error('❌ Error al enviar correo (API):', error);
    // Si el refresh token expiró, imprimir mensaje para renovarlo
    if (error.message.includes('invalid_grant')) {
      console.error('🔄 El refresh token ha expirado. Obtén uno nuevo en el OAuth Playground.');
    }
    return false;
  }
};