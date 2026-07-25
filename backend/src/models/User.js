import prisma from '../prisma.js';
import bcrypt from 'bcrypt';

export const User = {

  async create({ name, email, password, verificationCode }) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const hashedCode = await bcrypt.hash(verificationCode, 10);
    return await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        verificationCodeHash: hashedCode,
        isVerified: false,
      },
      select: { id: true, name: true, email: true, createdAt: true }
    });
  },

  async findByEmail(email) {
    return await prisma.user.findUnique({ where: { email } });
  },

  async findById(id) {
    return await prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, isVerified: true, createdAt: true }
    });
  },

  async updateVerificationCode(email, newCode) {
    const hashedCode = await bcrypt.hash(newCode, 10);
    return await prisma.user.update({
      where: { email },
      data: { verificationCodeHash: hashedCode, isVerified: false },
    });
  },

  async verifyUser(email, plainCode) {
    const user = await this.findByEmail(email);
    if (!user) return null;
    const isValid = await bcrypt.compare(plainCode, user.verificationCodeHash);
    if (!isValid) return null;
    await prisma.user.update({
      where: { email },
      data: { isVerified: true, verificationCodeHash: null },
    });
    return user;
  },

  async validatePassword(email, password) {
    const user = await this.findByEmail(email);
    if (!user) return null;
    const valid = await bcrypt.compare(password, user.password);
    return valid ? user : null;
  },

  // Nuevo método para actualizar nombre
  async updateName(userId, newName) {
    return await prisma.user.update({
      where: { id: userId },
      data: { name: newName },
      select: { id: true, name: true, email: true }
    });
  },

  // Nuevo método para cambiar contraseña
  async updatePassword(userId, newPassword) {
    const hashed = await bcrypt.hash(newPassword, 10);
    return await prisma.user.update({
      where: { id: userId },
      data: { password: hashed },
    });
  },

  // Método para obtener usuario con contraseña (solo para verificación)
  async findByIdWithPassword(id) {
    return await prisma.user.findUnique({
      where: { id },
      // No usar select para incluir password
    });
  },

  // ===== MÉTODOS PARA RECUPERACIÓN DE CONTRASEÑA =====
  async setResetPasswordCode(email, plainCode) {
    const hashedCode = await bcrypt.hash(plainCode, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos
    return await prisma.user.update({
      where: { email },
      data: {
        resetPasswordToken: hashedCode,      // ← nombre correcto
        resetPasswordExpires: expiresAt,      // ← nombre correcto
      },
    });
  },

  async verifyResetPasswordCode(email, plainCode) {
    const user = await this.findByEmail(email);
    if (!user) return null;
    // Verificar si el token existe y no ha expirado
    if (!user.resetPasswordToken) return null;
    if (new Date() > new Date(user.resetPasswordExpires)) return null;
    const isValid = await bcrypt.compare(plainCode, user.resetPasswordToken);
    if (!isValid) return null;
    return user;
  },

  // Limpiar código de recuperación después de usarlo
  async clearResetPasswordCode(email) {
    return await prisma.user.update({
      where: { email },
      data: {
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });
  },

};