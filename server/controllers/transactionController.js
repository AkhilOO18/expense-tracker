const Transaction = require('../models/Transaction');

const dateFilter = (from, to) => {
  const filter = {};
  if (from || to) {
    filter.date = {};
    if (from) filter.date.$gte = new Date(from);
    if (to) filter.date.$lte = new Date(to);
  }
  return filter;
};

exports.list = async (req, res) => {
  try {
    const { type, category, from, to } = req.query;
    const filter = { user: req.userId, ...dateFilter(from, to) };
    if (type) filter.type = type;
    if (category) filter.category = category;

    const transactions = await Transaction.find(filter).sort({ date: -1 });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch transactions', error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { type, category, amount, description, date } = req.body;
    if (!type || !category || amount === undefined) {
      return res.status(400).json({ message: 'type, category and amount are required' });
    }
    if (!['income', 'expense'].includes(type)) {
      return res.status(400).json({ message: "type must be 'income' or 'expense'" });
    }
    if (Number(amount) <= 0) {
      return res.status(400).json({ message: 'amount must be greater than 0' });
    }

    const transaction = await Transaction.create({
      user: req.userId,
      type,
      category,
      amount,
      description,
      date: date || Date.now(),
    });
    res.status(201).json(transaction);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create transaction', error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
    res.json(transaction);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update transaction', error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      user: req.userId,
    });
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
    res.json({ message: 'Transaction deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete transaction', error: err.message });
  }
};

exports.summary = async (req, res) => {
  try {
    const { from, to } = req.query;
    const mongoose = require('mongoose');
    const match = {
      user: new mongoose.Types.ObjectId(req.userId),
      ...dateFilter(from, to),
    };

    const totals = await Transaction.aggregate([
      { $match: match },
      { $group: { _id: '$type', total: { $sum: '$amount' } } },
    ]);

    const totalIncome = totals.find((t) => t._id === 'income')?.total || 0;
    const totalExpense = totals.find((t) => t._id === 'expense')?.total || 0;

    const byCategory = await Transaction.aggregate([
      { $match: match },
      { $group: { _id: { category: '$category', type: '$type' }, total: { $sum: '$amount' } } },
      { $project: { _id: 0, category: '$_id.category', type: '$_id.type', total: 1 } },
      { $sort: { total: -1 } },
    ]);

    const monthlyRaw = await Transaction.aggregate([
      { $match: match },
      {
        $group: {
          _id: { month: { $dateToString: { format: '%Y-%m', date: '$date' } }, type: '$type' },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.month': 1 } },
    ]);

    const monthlyMap = {};
    monthlyRaw.forEach((m) => {
      const key = m._id.month;
      if (!monthlyMap[key]) monthlyMap[key] = { month: key, income: 0, expense: 0 };
      monthlyMap[key][m._id.type] = m.total;
    });

    res.json({
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      byCategory,
      monthly: Object.values(monthlyMap),
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to compute summary', error: err.message });
  }
};
