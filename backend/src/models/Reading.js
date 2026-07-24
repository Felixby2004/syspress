import prisma from '../prisma.js';

export const Reading = {
  // Crear lectura (active = true por defecto en el esquema)
  async create({ userId, systolic, diastolic, pulse, measuredAt, notes }) {
    return await prisma.reading.create({
      data: {
        userId,
        systolic,
        diastolic,
        pulse,
        measuredAt: measuredAt ? new Date(measuredAt) : undefined,
        notes,
        // active se establece por defecto en true
      }
    });
  },

  // Obtener solo lecturas activas
  async findByUserId(userId, limit = 100, offset = 0) {
    return await prisma.reading.findMany({
      where: {
        userId,
        active: true,
      },
      orderBy: { measuredAt: 'desc' },
      skip: offset,
      take: limit,
    });
  },

  // Actualizar solo si está activa
  async update(id, userId, data) {
    // Verificar que la lectura exista y esté activa
    const existing = await prisma.reading.findFirst({
      where: { id, userId, active: true },
    });
    if (!existing) return null;

    return await prisma.reading.update({
      where: { id },
      data: {
        systolic: data.systolic,
        diastolic: data.diastolic,
        pulse: data.pulse,
        measuredAt: data.measured_at ? new Date(data.measured_at) : undefined,
        notes: data.notes,
      },
    });
  },

  // Eliminación lógica: poner active = false
  async softDelete(id, userId) {
    const existing = await prisma.reading.findFirst({
      where: { id, userId, active: true },
    });
    if (!existing) return null;

    return await prisma.reading.update({
      where: { id },
      data: { active: false },
    });
  },

  // (Opcional) Restaurar una lectura (cambiar active a true)
  async restore(id, userId) {
    const existing = await prisma.reading.findFirst({
      where: { id, userId, active: false },
    });
    if (!existing) return null;

    return await prisma.reading.update({
      where: { id },
      data: { active: true },
    });
  },

  // Obtener estadísticas solo de lecturas activas
  async getStats(userId, fromDate, toDate) {
    const where = { userId, active: true };
    if (fromDate) where.measuredAt = { gte: new Date(fromDate) };
    if (toDate) where.measuredAt = { ...where.measuredAt, lte: new Date(toDate) };

    const readings = await prisma.reading.findMany({
      where,
      select: { systolic: true, diastolic: true, pulse: true },
    });

    if (readings.length === 0) {
      return { total: 0, avg_sys: null, avg_dia: null, avg_pulse: null,
               min_sys: null, max_sys: null, min_dia: null, max_dia: null };
    }

    const total = readings.length;
    const sumSys = readings.reduce((a, r) => a + r.systolic, 0);
    const sumDia = readings.reduce((a, r) => a + r.diastolic, 0);
    const pulses = readings.filter(r => r.pulse !== null);
    const sumPulse = pulses.reduce((a, r) => a + r.pulse, 0);
    const sysValues = readings.map(r => r.systolic);
    const diaValues = readings.map(r => r.diastolic);

    return {
      total,
      avg_sys: sumSys / total,
      avg_dia: sumDia / total,
      avg_pulse: pulses.length ? sumPulse / pulses.length : null,
      min_sys: Math.min(...sysValues),
      max_sys: Math.max(...sysValues),
      min_dia: Math.min(...diaValues),
      max_dia: Math.max(...diaValues),
    };
  },
};