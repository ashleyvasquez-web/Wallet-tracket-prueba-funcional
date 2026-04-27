import { useState, useEffect } from 'react';
import { transactionsAPI, budgetsAPI } from '../services/api';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title } from 'chart.js';
import { Doughnut, Line } from 'react-chartjs-2';
import './Dashboard.css';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title);

const Dashboard = () => {
  const [summary, setSummary] = useState({ total_income: 0, total_expenses: 0, balance: 0, recent_transactions: [] });
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [summaryRes, budgetsRes] = await Promise.all([
        transactionsAPI.summary(),
        budgetsAPI.list()
      ]);
      // Handle paginated response for summary
      setSummary(summaryRes.data.results || summaryRes.data || summaryRes.data);
      // Handle paginated response for budgets
      setBudgets(budgetsRes.data.results || budgetsRes.data || []);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'USD' }).format(value);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getCategoryStyle = (category) => {
    const colors = {
      'Alimentación': 'bg-green-100 text-green-800',
      'Transporte': 'bg-blue-100 text-blue-800',
      'Entretenimiento': 'bg-purple-100 text-purple-800',
      'Vivienda': 'bg-orange-100 text-orange-800',
      'Servicios': 'bg-pink-100 text-pink-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const expensesChartData = {
    labels: budgets.map(b => b.category_name),
    datasets: [{
      data: budgets.map(b => b.spent),
      backgroundColor: [
        'rgba(34, 197, 94, 0.7)',
        'rgba(59, 130, 246, 0.7)',
        'rgba(139, 92, 246, 0.7)',
        'rgba(249, 115, 22, 0.7)',
        'rgba(236, 72, 153, 0.7)',
      ],
      borderColor: [
        'rgb(34, 197, 94)',
        'rgb(59, 130, 246)',
        'rgb(139, 92, 246)',
        'rgb(249, 115, 22)',
        'rgb(236, 72, 153)',
      ],
      borderWidth: 1,
    }]
  };

  const incomeVsExpensesData = {
    labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'],
    datasets: [
      {
        label: 'Ingresos',
        data: [400, 250.75, 2600, 0],
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: true,
        tension: 0.3
      },
      {
        label: 'Gastos',
        data: [965.50, 187.44, 482.49, 240],
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: true,
        tension: 0.3
      }
    ]
  };

  if (loading) {
    return <div className="loading">Cargando...</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Panel Principal</h2>
        <p>Resumen de tus finanzas personales</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card income">
          <div className="stat-icon">
            <i className="fas fa-arrow-down fa-rotate-180"></i>
          </div>
          <div className="stat-content">
            <p className="stat-label">Ingresos Totales</p>
            <h3 className="stat-value">{formatCurrency(summary.total_income)}</h3>
          </div>
        </div>

        <div className="stat-card expenses">
          <div className="stat-icon">
            <i className="fas fa-arrow-up fa-rotate-180"></i>
          </div>
          <div className="stat-content">
            <p className="stat-label">Gastos Totales</p>
            <h3 className="stat-value">{formatCurrency(summary.total_expenses)}</h3>
          </div>
        </div>

        <div className="stat-card balance">
          <div className="stat-icon">
            <i className="fas fa-wallet"></i>
          </div>
          <div className="stat-content">
            <p className="stat-label">Balance</p>
            <h3 className={`stat-value ${summary.balance >= 0 ? 'positive' : 'negative'}`}>
              {formatCurrency(summary.balance)}
            </h3>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="charts-grid">
        <div className="chart-card">
          <h4>Gastos por Categoría</h4>
          <div className="chart-container">
            <Doughnut data={expensesChartData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>

        <div className="chart-card">
          <h4>Ingresos vs Gastos</h4>
          <div className="chart-container">
            <Line data={incomeVsExpensesData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="recent-transactions">
        <h4>Transacciones Recientes</h4>
        <div className="transactions-table">
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Descripción</th>
                <th>Categoría</th>
                <th>Monto</th>
              </tr>
            </thead>
            <tbody>
              {summary.recent_transactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td>{formatDate(transaction.date)}</td>
                  <td>{transaction.description}</td>
                  <td>
                    <span className={`category-badge ${getCategoryStyle(transaction.category_name)}`}>
                      {transaction.category_name}
                    </span>
                  </td>
                  <td className={transaction.amount > 0 ? 'positive' : 'negative'}>
                    {formatCurrency(transaction.amount)}
                  </td>
                </tr>
              ))}
              {summary.recent_transactions.length === 0 && (
                <tr>
                  <td colSpan="4" className="no-data">No hay transacciones recientes</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Budget Progress */}
      <div className="budget-progress">
        <h4>Progreso del Presupuesto</h4>
        <div className="budgets-list">
          {budgets.map((budget) => (
            <div key={budget.id} className="budget-item">
              <div className="budget-header">
                <span className="budget-category">{budget.category_name}</span>
                <span className="budget-amount">
                  {formatCurrency(budget.spent)} / {formatCurrency(budget.amount)}
                </span>
              </div>
              <div className="budget-bar">
                <div 
                  className={`budget-fill ${budget.percentage > 100 ? 'over' : budget.percentage > 85 ? 'warning' : ''}`}
                  style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;