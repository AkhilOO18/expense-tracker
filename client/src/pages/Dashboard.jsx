import { useEffect, useState, useCallback } from 'react';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import TransactionForm from '../components/TransactionForm';
import TransactionList from '../components/TransactionList';
import SummaryCharts from '../components/SummaryCharts';

const formatMoney = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(n || 0);

export default function Dashboard() {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const loadAll = useCallback(async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const [txRes, summaryRes] = await Promise.all([
        api.get('/transactions'),
        api.get('/transactions/summary'),
      ]);
      setTransactions(txRes.data);
      setSummary(summaryRes.data);
    } catch (err) {
      setErrorMsg('Could not load your data. Please refresh.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const handleCreated = (tx) => {
    setTransactions((prev) => [tx, ...prev]);
    loadAll();
  };

  const handleDeleted = (id) => {
    setTransactions((prev) => prev.filter((t) => t._id !== id));
    loadAll();
  };

  return (
    <div className="app-shell">
      <Navbar />

      {errorMsg && <div className="error-banner">{errorMsg}</div>}

      {!loading && summary && (
        <>
          <div className="summary-row">
            <div className="stat-card income">
              <div className="label">Total income</div>
              <div className="value">{formatMoney(summary.totalIncome)}</div>
            </div>
            <div className="stat-card expense">
              <div className="label">Total expense</div>
              <div className="value">{formatMoney(summary.totalExpense)}</div>
            </div>
            <div className="stat-card balance">
              <div className="label">Balance</div>
              <div className="value">{formatMoney(summary.balance)}</div>
            </div>
          </div>

          <SummaryCharts summary={summary} />
        </>
      )}

      <TransactionForm onCreated={handleCreated} />

      {loading ? (
        <p className="empty-note">Loading your ledger…</p>
      ) : (
        <TransactionList transactions={transactions} onDeleted={handleDeleted} />
      )}
    </div>
  );
}
