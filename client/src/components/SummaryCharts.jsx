import { Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const PALETTE = ['#4fa88a', '#c1553d', '#c9a050', '#6b8fa3', '#8a6bab', '#9aa3ab', '#5c7a6b'];

export default function SummaryCharts({ summary }) {
  const expenseByCategory = summary.byCategory.filter((c) => c.type === 'expense');

  const pieData = {
    labels: expenseByCategory.map((c) => c.category),
    datasets: [
      {
        data: expenseByCategory.map((c) => c.total),
        backgroundColor: PALETTE,
        borderColor: '#171f26',
        borderWidth: 2,
      },
    ],
  };

  const monthly = summary.monthly;
  const barData = {
    labels: monthly.map((m) => m.month),
    datasets: [
      {
        label: 'Income',
        data: monthly.map((m) => m.income || 0),
        backgroundColor: '#4fa88a',
        borderRadius: 2,
      },
      {
        label: 'Expense',
        data: monthly.map((m) => m.expense || 0),
        backgroundColor: '#c1553d',
        borderRadius: 2,
      },
    ],
  };

  const legendFont = { family: 'Inter', size: 11 };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top', labels: { color: '#9aa3ab', font: legendFont, boxWidth: 10 } },
    },
    scales: {
      x: { ticks: { color: '#9aa3ab', font: legendFont }, grid: { color: '#2b3742' } },
      y: { ticks: { color: '#9aa3ab', font: legendFont }, grid: { color: '#2b3742' } },
    },
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom', labels: { color: '#9aa3ab', font: legendFont, boxWidth: 10 } },
    },
  };

  return (
    <div className="charts-row">
      <div className="panel">
        <h2>Income vs expense by month</h2>
        {monthly.length ? <Bar data={barData} options={barOptions} /> : <p className="empty-note">Not enough data yet.</p>}
      </div>
      <div className="panel">
        <h2>Spending by category</h2>
        {expenseByCategory.length ? (
          <Pie data={pieData} options={pieOptions} />
        ) : (
          <p className="empty-note">No expenses recorded yet.</p>
        )}
      </div>
    </div>
  );
}
