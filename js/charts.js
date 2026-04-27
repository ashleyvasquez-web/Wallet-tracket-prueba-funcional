/**
 * Wallet Tracker - Charts Module
 * Configuración y gestión de gráficos con Chart.js
 */

// ============================================
// Instancias de Gráficos
// ============================================

let expensesByCategoryChart = null;
let incomeVsExpensesChart = null;

// ============================================
// Colores para Gráficos
// ============================================

const CHART_COLORS = {
  backgroundColor: [
    'rgba(34, 197, 94, 0.7)',   // Green
    'rgba(59, 130, 246, 0.7)',  // Blue
    'rgba(139, 92, 246, 0.7)',  // Purple
    'rgba(249, 115, 22, 0.7)',  // Orange
    'rgba(236, 72, 153, 0.7)',  // Pink
    'rgba(156, 163, 175, 0.7)', // Gray
    'rgba(234, 179, 8, 0.7)',   // Yellow
    'rgba(20, 184, 166, 0.7)',  // Teal
    'rgba(132, 204, 22, 0.7)',  // Lime
    'rgba(99, 102, 241, 0.7)'   // Indigo
  ],
  borderColor: [
    'rgb(34, 197, 94)',
    'rgb(59, 130, 246)',
    'rgb(139, 92, 246)',
    'rgb(249, 115, 22)',
    'rgb(236, 72, 153)',
    'rgb(156, 163, 175)',
    'rgb(234, 179, 8)',
    'rgb(20, 184, 166)',
    'rgb(132, 204, 22)',
    'rgb(99, 102, 241)'
  ]
};

// ============================================
// Configuración de Gráficos
// ============================================

const ChartManager = {
  /**
   * Inicializar todos los gráficos
   */
  init(period = 'month') {
    this.initExpensesByCategoryChart();
    this.initIncomeVsExpensesChart(period);
  },

  /**
   * Inicializar gráfico de gastos por categoría
   */
  initExpensesByCategoryChart() {
    const canvas = document.getElementById('expensesByCategoryChart');
    if (!canvas) return;

    // Destruir gráfico existente si hay uno
    if (expensesByCategoryChart) {
      expensesByCategoryChart.destroy();
    }

    // Datos de ejemplo para el gráfico
    const data = {
      labels: ['Alimentación', 'Transporte', 'Entretenimiento', 'Vivienda', 'Servicios', 'Otros'],
      datasets: [{
        data: [325.45, 150.25, 95.99, 800, 120, 383.74],
        backgroundColor: CHART_COLORS.backgroundColor,
        borderColor: CHART_COLORS.borderColor,
        borderWidth: 1,
        hoverOffset: 4
      }]
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            usePointStyle: true,
            padding: 20,
            font: {
              size: 12
            }
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const value = context.raw;
              return ` $${FormatHelper.formatNumber(value)}`;
            }
          }
        }
      }
    };

    expensesByCategoryChart = new Chart(canvas, {
      type: 'doughnut',
      data: data,
      options: options
    });
  },

  /**
   * Inicializar gráfico de ingresos vs gastos
   */
  initIncomeVsExpensesChart(period = 'month') {
    const canvas = document.getElementById('incomeVsExpensesChart');
    if (!canvas) return;

    // Destruir gráfico existente si hay uno
    if (incomeVsExpensesChart) {
      incomeVsExpensesChart.destroy();
    }

    // Generar datos según el período
    let labels = [];
    let incomeData = [];
    let expensesData = [];

    if (period === 'week') {
      labels = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
      incomeData = [0, 400, 0, 0, 0, 850.25, 0];
      expensesData = [120, 45.50, 0, 15.99, 125.45, 210.36, 158];
    } else if (period === 'month') {
      labels = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'];
      incomeData = [400, 250.75, 2600, 0];
      expensesData = [965.50, 187.44, 482.49, 240];
    } else if (period === 'year') {
      labels = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      incomeData = [3200, 3200, 3450, 3250.75, 3300, 3500, 3300, 3300, 3200, 3300, 3250, 3000];
      expensesData = [2100, 2300, 2150, 1875.43, 2200, 2650, 2400, 2350, 2700, 2500, 2250, 2290];
    }

    const data = {
      labels: labels,
      datasets: [
        {
          label: 'Ingresos',
          data: incomeData,
          borderColor: 'rgb(34, 197, 94)',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          fill: true,
          tension: 0.3
        },
        {
          label: 'Gastos',
          data: expensesData,
          borderColor: 'rgb(239, 68, 68)',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          fill: true,
          tension: 0.3
        }
      ]
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return '$' + value;
            }
          }
        }
      },
      plugins: {
        legend: {
          position: 'bottom'
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const value = context.raw;
              return ` ${context.dataset.label}: $${FormatHelper.formatNumber(value)}`;
            }
          }
        }
      }
    };

    incomeVsExpensesChart = new Chart(canvas, {
      type: 'line',
      data: data,
      options: options
    });
  },

  /**
   * Actualizar gráfico de ingresos vs gastos con nuevo período
   */
  updatePeriod(period) {
    this.initIncomeVsExpensesChart(period);
  },

  /**
   * Actualizar datos del gráfico de gastos por categoría
   */
  updateExpensesByCategory(transactions) {
    if (!expensesByCategoryChart) return;

    // Calcular gastos por categoría
    const expensesByCategory = {};
    
    transactions
      .filter(t => t.amount < 0)
      .forEach(t => {
        const category = t.category;
        if (!expensesByCategory[category]) {
          expensesByCategory[category] = 0;
        }
        expensesByCategory[category] += Math.abs(t.amount);
      });

    // Actualizar datos del gráfico
    expensesByCategoryChart.data.labels = Object.keys(expensesByCategory);
    expensesByCategoryChart.data.datasets[0].data = Object.values(expensesByCategory);
    expensesByCategoryChart.update();
  },

  /**
   * Destruir todos los gráficos
   */
  destroy() {
    if (expensesByCategoryChart) {
      expensesByCategoryChart.destroy();
      expensesByCategoryChart = null;
    }
    if (incomeVsExpensesChart) {
      incomeVsExpensesChart.destroy();
      incomeVsExpensesChart = null;
    }
  }
};

// ============================================
// Exportar para uso global
// ============================================

window.ChartManager = ChartManager;
window.CHART_COLORS = CHART_COLORS;