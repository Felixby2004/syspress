import { Weight } from '../models/Weight.js';

export const getWeights = async (req, res) => {
  try {
    const { limit, offset } = req.query;
    const weights = await Weight.findByUserId(req.userId, limit, offset);
    res.json(weights);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createWeight = async (req, res) => {
  try {
    const { weight, measuredAt, notes } = req.body;
    const newWeight = await Weight.create({
      userId: req.userId,
      weight: parseFloat(weight),
      measuredAt,
      notes,
    });
    res.status(201).json(newWeight);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const updateWeight = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Weight.update(id, req.userId, req.body);
    if (!updated) return res.status(404).json({ error: 'Peso no encontrado' });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteWeight = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Weight.delete(id, req.userId);
    if (!deleted) return res.status(404).json({ error: 'Peso no encontrado' });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getWeightStats = async (req, res) => {
  try {
    const stats = await Weight.getStats(req.userId);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};