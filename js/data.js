/**
 * Wallet Tracker - Data Module
 * Manejo de datos, almacenamiento local y valores iniciales
 */

// ============================================
// Constantes de Configuración
// ============================================

const STORAGE_KEYS = {
  TRANSACTIONS: 'wallet-tracker-transactions',
  BUDGETS: 'wallet-tracker-budgets',
  CATEGORIES: 'wallet-tracker-categories',
  RULES: 'wallet-tracker-rules',
  SETTINGS: 'wallet-tracker-settings'
};

const DEFAULT_CATEGORIES = {
  income: ['Salario', 'Trabajo Freelance', 'Inversiones', 'Otros Ingresos'],
  expense: ['Alimentación', 'Transporte', 'Entretenimiento', 'Vivienda', 'Servicios', 'Salud', 'Educación', 'Ropa', 'Regalos', 'Otros']
};

const DEFAULT_SETTINGS = {
  currency: 'USD',
  startDayOfMonth: '1',
  notifications: true,
  theme: 'light'
};

const DEFAULT_DASHBOARD_DATA = {
  totalIncome: 3250.75,
  totalExpenses: 1875.43,
  balance: 1375.32,
  incomeTrend: 12.5,
  expensesTrend: 8.3,
  budgetTotal: 2500,
  recentTransactions: [],
  budgets: []
};

const DEFAULT_TRANSACTIONS = [
  { id: 1, date: '2025-04-10', description: 'Depósito Salario', category: 'Salario', amount: 3000, type: 'income' },
  { id: 2, date: '2025-04-09', description: 'Supermercado', category: 'Alimentación', amount: -125.45, type: 'expense' },
  { id: 3, date: '2025-04-08', description: 'Netflix', category: 'Entretenimiento', amount: -15.99, type: 'expense' },
  { id: 4, date: '2025-04-06', description: 'Transferencia recibida', category: 'Otros Ingresos', amount: 250.75, type: 'income' },
  { id: 5, date: '2025-04-05', description: 'Restaurante', category: 'Alimentación', amount: -45.50, type: 'expense' },
  { id: 6, date: '2025-04-04', description: 'Pago servicios', category: 'Servicios', amount: -120, type: 'expense' },
  { id: 7, date: '2025-04-02', description: 'Freelance', category: 'Trabajo Freelance', amount: 400, type: 'income' },
  { id: 8, date: '2025-04-01', description: 'Alquiler', category: 'Vivienda', amount: -800, type: 'expense' }
];

const DEFAULT_BUDGETS = [
  { id: 1, category: 'Alimentación', amount: 500, spent: 325.45, period: 'monthly', description: 'Gastos de comida y víveres' },
  { id: 2, category: 'Transporte', amount: 200, spent: 150.25, period: 'monthly', description: 'Gasolina y transporte público' },
  { id: 3, category: 'Entretenimiento', amount: 150, spent: 95.99, period: 'monthly', description: 'Streaming, cine y ocio' },
  { id: 4, category: 'Vivienda', amount: 800, spent: 800, period: 'monthly', description: 'Alquiler y servicios' },
  { id: 5, category: 'Servicios', amount: 150, spent: 120, period: 'monthly', description: 'Internet, luz, agua' }
];

const DEFAULT_RULES = [
  { id: 1, keyword: 'Netflix', type: 'expense', category: 'Entretenimiento' },
  { id: 2, keyword: 'Supermercado', type: 'expense', category: 'Alimentación' },
  { id: 3, keyword: 'Salario', type: 'income', category: 'Salario' }
];

// ============================================
// Funciones de Almacenamiento Local
// ============================================

const DataManager = {
  /**
   * Cargar datos desde localStorage
   */
  load(key, defaultValue) {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch (error) {
      console.error(`Error loading data from ${key}:`, error);
      return defaultValue;
    }
  },

  /**
   * Guardar datos en localStorage
   */
  save(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error(`Error saving data to ${key}:`, error);
      return false;
    }
  },

  /**
   * Eliminar datos de localStorage
   */
  remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing data from ${key}:`, error);
      return false;
    }
  },

  /**
   * Cargar todas las transacciones
   */
  getTransactions() {
    return this.load(STORAGE_KEYS.TRANSACTIONS, DEFAULT_TRANSACTIONS);
  },

  /**
   * Guardar transacciones
   */
  saveTransactions(transactions) {
    return this.save(STORAGE_KEYS.TRANSACTIONS, transactions);
  },

  /**
   * Cargar presupuestos
   */
  getBudgets() {
    return this.load(STORAGE_KEYS.BUDGETS, DEFAULT_BUDGETS);
  },

  /**
   * Guardar presupuestos
   */
  saveBudgets(budgets) {
    return this.save(STORAGE_KEYS.BUDGETS, budgets);
  },

  /**
   * Cargar categorías
   */
  getCategories() {
    return this.load(STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES);
  },

  /**
   * Guardar categorías
   */
  saveCategories(categories) {
    return this.save(STORAGE_KEYS.CATEGORIES, categories);
  },

  /**
   * Cargar reglas
   */
  getRules() {
    return this.load(STORAGE_KEYS.RULES, DEFAULT_RULES);
  },

  /**
   * Guardar reglas
   */
  saveRules(rules) {
    return this.save(STORAGE_KEYS.RULES, rules);
  },

  /**
   * Cargar configuración
   */
  getSettings() {
    return this.load(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
  },

  /**
   * Guardar configuración
   */
  saveSettings(settings) {
    return this.save(STORAGE_KEYS.SETTINGS, settings);
  },

  /**
   * Cargar datos del dashboard
   */
  getDashboardData(transactions, budgets) {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    // Filtrar transacciones del mes actual
    const monthTransactions = transactions.filter(t => 
      new Date(t.date) >= startOfMonth
    );
    
    // Calcular totales
    const totalIncome = monthTransactions
      .filter(t => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = Math.abs(monthTransactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + t.amount, 0));
    
    // Obtener transacciones recientes
    const recentTransactions = [...transactions]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
    
    // Calcular gastos por categoría para el presupuesto
    const budgetsWithSpent = budgets.map(budget => {
      const spent = Math.abs(monthTransactions
        .filter(t => t.type === 'expense' && t.category === budget.category)
        .reduce((sum, t) => sum + t.amount, 0));
      
      return { ...budget, spent };
    });
    
    return {
      totalIncome,
      totalExpenses,
      balance: totalIncome - totalExpenses,
      incomeTrend: 12.5,
      expensesTrend: 8.3,
      budgetTotal: budgetsWithSpent.reduce((sum, b) => sum + b.amount, 0),
      recentTransactions,
      budgets: budgetsWithSpent.slice(0, 3)
    };
  },

  /**
   * Limpiar todos los datos
   */
  clearAll() {
    Object.values(STORAGE_KEYS).forEach(key => {
      this.remove(key);
    });
  }
};

// ============================================
// Funciones Helper de Formato
// ============================================

const FormatHelper = {
  /**
   * Formatear número con decimales
   */
  formatNumber(value) {
    return parseFloat(value).toLocaleString('es-ES', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  },

  /**
   * Formatear moneda
   */
  formatCurrency(value) {
    const absValue = Math.abs(value);
    return (value < 0 ? '-$' : '$') + this.formatNumber(absValue);
  },

  /**
   * Formatear fecha
   */
  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  },

  /**
   * Obtener estilo de categoría
   */
  getCategoryStyle(category) {
    const categoryColors = {
      'Alimentación': 'bg-green-100 text-green-800',
      'Transporte': 'bg-blue-100 text-blue-800',
      'Entretenimiento': 'bg-purple-100 text-purple-800',
      'Vivienda': 'bg-orange-100 text-orange-800',
      'Servicios': 'bg-pink-100 text-pink-800',
      'Salud': 'bg-red-100 text-red-800',
      'Educación': 'bg-yellow-100 text-yellow-800',
      'Ropa': 'bg-indigo-100 text-indigo-800',
      'Regalos': 'bg-cyan-100 text-cyan-800',
      'Salario': 'bg-emerald-100 text-emerald-800',
      'Trabajo Freelance': 'bg-teal-100 text-teal-800',
      'Inversiones': 'bg-lime-100 text-lime-800',
      'Otros Ingresos': 'bg-amber-100 text-amber-800',
      'Otros': 'bg-gray-100 text-gray-800'
    };
    
    return categoryColors[category] || 'bg-gray-100 text-gray-800';
  },

  /**
   * Obtener color de progreso de presupuesto
   */
  getBudgetProgressColorClass(spent, amount) {
    const percentage = (spent / amount) * 100;
    
    if (percentage > 100) return 'bg-red-500';
    if (percentage > 85) return 'bg-yellow-500';
    return 'bg-primary-500';
  },

  /**
   * Obtener clase de porcentaje de presupuesto
   */
  getBudgetPercentClass(spent, amount) {
    const percentage = (spent / amount) * 100;
    
    if (percentage > 100) return 'text-red-600';
    if (percentage > 85) return 'text-yellow-600';
    return 'text-gray-700';
  },

  /**
   * Obtener etiqueta de período
   */
  getPeriodLabel(period) {
    const periodLabels = {
      'monthly': 'Presupuesto Mensual',
      'weekly': 'Presupuesto Semanal',
      'annual': 'Presupuesto Anual'
    };
    
    return periodLabels[period] || 'Presupuesto';
  }
};

// ============================================
// Exportar para uso global
// ============================================

window.DataManager = DataManager;
window.FormatHelper = FormatHelper;
window.STORAGE_KEYS = STORAGE_KEYS;
window.DEFAULT_CATEGORIES = DEFAULT_CATEGORIES;
window.DEFAULT_SETTINGS = DEFAULT_SETTINGS;