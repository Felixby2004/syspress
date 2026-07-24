import { Reading } from '../models/Reading.js';

export const getReadings = async (req, res) => {
  try {
    const { limit, offset } = req.query;
    const readings = await Reading.findByUserId(req.userId, limit, offset);
    res.json(readings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createReading = async (req, res) => {
  try {
    const { systolic, diastolic, pulse, measuredAt, notes } = req.body;
    const reading = await Reading.create({
      userId: req.userId,
      systolic,
      diastolic,
      pulse,
      measuredAt,
      notes,
    });
    res.status(201).json(reading);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const updateReading = async (req, res) => {
  try {
    const { id } = req.params;
    const reading = await Reading.update(id, req.userId, req.body);
    if (!reading) return res.status(404).json({ error: 'Reading not found or inactive' });
    res.json(reading);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteReading = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Reading.softDelete(id, req.userId);
    if (!result) return res.status(404).json({ error: 'Reading not found or already inactive' });
    res.status(204).send(); // No content, eliminación exitosa
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// (Opcional) Endpoint para restaurar
export const restoreReading = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Reading.restore(id, req.userId);
    if (!result) return res.status(404).json({ error: 'Reading not found or already active' });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};