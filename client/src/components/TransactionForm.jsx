import { useState } from 'react';
import api from '../api/axios';

const EXPENSE_CATEGORIES = ['Food', 'Rent', 'Transport', 'Utilities', 'Health', 'Shopping', 'Other'];
const INCOME_CATEGORIES = ['Salary', 'Freelance', 'Investment', 'Gift', 'Other'];

export default function TransactionForm({ onCreated }) {
  const [type, setType] = useState('expense');
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  const switchType = (next) => {
    setType(next);
    setCategory(next === 'expense' ? EXPENSE_CATEGORIES[0] : INCOME_CATEGORIES[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!amount || Number(amount) <= 0) {
      setError('Enter an amount greater than 0');
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post('/transactions', {
        type,
        category,
        amount: Number(amount),
        description,
        date,
      });
      onCreated(data);
      setAmount('');
      setDescription('');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not add transaction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="panel">
      <h2>Add a transaction</h2>
      {error && <div className="error-banner">{error}</div>}
      <form className="tx-form" onSubmit={handleSubmit}>
        <div className="field">
          <label>Type</label>
          <div className="type-toggle">
            <button
              type="button"
              className={type === 'income' ? 'active-income' : ''}
              onClick={() => switchType('income')}
            >
              Income
            </button>
            <button
              type="button"
              className={type === 'expense' ? 'active-expense' : ''}
              onClick={() => switchType('expense')}
            >
              Expense
            </button>
          </div>
        </div>

        <div className="field">
          <label htmlFor="category">Category</label>
          <select id="category" value={category} onChange={(e) => setCategory(e.target.value)}>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="amount">Amount</label>
          <input
            id="amount"
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
          />
        </div>

        <div className="field">
          <label htmlFor="date">Date</label>
          <input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>

        <div className="field" style={{ gridColumn: 'span 2' }}>
          <label htmlFor="description">Note (optional)</label>
          <input
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Groceries at the market"
          />
        </div>

        <button className="btn btn-primary" type="submit" disabled={loading} style={{ gridColumn: 'span 6' }}>
          {loading ? 'Adding…' : 'Add transaction'}
        </button>
      </form>
    </div>
  );
}
