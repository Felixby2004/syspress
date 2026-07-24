import prisma from '../prisma.js';

export const Weight = {
  async create({ userId, weight, measuredAt, notes }) {
    return await prisma.weight.create({
      data: {
        userId,
        weight,
        measuredAt: measuredAt ? new Date(measuredAt) : undefined,
        notes,
      }
    });
  },

  async findByUserId(userId) {
    return await prisma.weight.findMany({
      where: { userId, active: true },
      orderBy: { measuredAt: 'desc' },
    });
  },

  async update(id, userId, data) {
    const existing = await prisma.weight.findFirst({
      where: { id, userId, active: true },
    });
    if (!existing) return null;

    return await prisma.weight.update({
      where: { id },
      data: {
        weight: data.weight,
        measuredAt: data.measuredAt ? new Date(data.measuredAt) : undefined,
        notes: data.notes,
      },
    });
  },

  async softDelete(id, userId) {
    const existing = await prisma.weight.findFirst({
      where: { id, userId, active: true },
    });
    if (!existing) return null;

    return await prisma.weight.update({
      where: { id },
      data: { active: false },
    });
  },

  async getStats(userId) {
    const weights = await prisma.weight.findMany({
      where: { userId, active: true },
      orderBy: { measuredAt: 'asc' },
      select: { weight: true, measuredAt: true },
    });
    return weights;
  }
};