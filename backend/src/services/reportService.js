import prisma from '../config/database.js';

export const generateReport = async (userId, from, to) => {
  // Filtros de fecha
  const where = { userId };
  if (from) where.measuredAt = { gte: new Date(from) };
  if (to) {
    const toDate = new Date(to);
    toDate.setHours(23, 59, 59, 999);
    where.measuredAt = { ...where.measuredAt, lte: toDate };
  }

  // Estadísticas agregadas
  const readings = await prisma.reading.findMany({
    where,
    orderBy: { measuredAt: 'desc' },
    take: 10, // para los últimos registros
  });

  const stats = await prisma.reading.aggregate({
    where,
    _count: { id: true },
    _avg: { systolic: true, diastolic: true, pulse: true },
    _min: { systolic: true, diastolic: true },
    _max: { systolic: true, diastolic: true },
  });

  // Clasificación
  let classification = 'Sin datos';
  const avgSys = stats._avg.systolic;
  const avgDia = stats._avg.diastolic;
  if (avgSys !== null && avgDia !== null) {
    if (avgSys < 120 && avgDia < 80) classification = 'Normal';
    else if (avgSys < 130 && avgDia < 80) classification = 'Elevada';
    else if (avgSys < 140 || avgDia < 90) classification = 'Hipertensión etapa 1';
    else classification = 'Hipertensión etapa 2';
  }

  return {
    summary: {
      total: stats._count.id,
      avg_sys: stats._avg.systolic,
      avg_dia: stats._avg.diastolic,
      avg_pulse: stats._avg.pulse,
      min_sys: stats._min.systolic,
      max_sys: stats._max.systolic,
      min_dia: stats._min.diastolic,
      max_dia: stats._max.diastolic,
    },
    recent: readings,
    classification,
  };
};