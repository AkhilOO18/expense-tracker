import api from '../api/axios';

const formatMoney = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(n);

const formatDate = (d) =>
  new Date(d).toLocaleDateString(undefined, { month: 'short', day: '2-digit', year: 'numeric' });

export default function TransactionList({ transactions, onDeleted }) {
  const handleDelete = async (id) => {
    try {
      await api.delete(`/transactions/${id}`);
      onDeleted(id);
    } catch {
      // silently ignore; list stays as-is if delete failed
    }
  };

  if (!transactions.length) {
    return (
      <div className="panel">
        <h2>Ledger</h2>
        <p className="empty-note">No entries yet. Add your first transaction above.</p>
      </div>
    );
  }

  return (
    <div className="panel">
      <h2>Ledger</h2>
      <table className="ledger">
        <thead>
          <tr>
            <th>Description</th>
            <th>Date</th>
            <th className="num">Amount</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((t) => (
            <tr key={t._id}>
              <td>
                <span className={`tick ${t.type}`} />
                {t.description || t.category}
                <div className="category">{t.category}</div>
              </td>
              <td className="date-col">{formatDate(t.date)}</td>
              <td className={`amount ${t.type}`}>
                {t.type === 'income' ? '+' : '−'} {formatMoney(t.amount)}
              </td>
              <td className="actions">
                <button className="icon-btn" onClick={() => handleDelete(t._id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
