/**
 * Wallet Tracker - Main Application
 * Lógica principal de la aplicación usando Alpine.js
 */

document.addEventListener('alpine:init', () => {
  Alpine.data('app', () => ({
    // ============================================
    // Estado Inicial
    // ============================================
    
    currentPage: 'dashboard',
    mobileSidebarOpen: false,
    period: 'month',
    
    settings: { ...DEFAULT_SETTINGS },
    
    // Navegación
    navItems: [
      { id: 'dashboard', name: 'Panel Principal', icon: 'fa-chart-pie' },
      { id: 'transactions', name: 'Transacciones', icon: 'fa-right-left' },
      { id: 'budgets', name: 'Presupuestos', icon: 'fa-sack-dollar' },
      { id: 'categories', name: 'Categorías y Reglas', icon: 'fa-tags' },
      { id: 'settings', name: 'Configuración', icon: 'fa-gear' }
    ],
    
    // Datos del dashboard
    dashboardData: { ...DEFAULT_DASHBOARD_DATA },
    
    // Transacciones
    transactions: [],
    
    transactionForm: {
      id: null,
      date: '',
      description: '',
      category: '',
      amount: '',
      type: 'expense'
    },
    
    editingTransaction: false,
    
    transactionsFilter: {
      dateRange: 'all',
      type: 'all',
      search: ''
    },
    
    // Presupuestos
    budgets: [],
    
    budgetForm: {
      id: null,
      category: '',
      amount: '',
      period: 'monthly',
      description: ''
    },
    
    editingBudget: false,
    
    // Categorías
    categories: { ...DEFAULT_CATEGORIES },
    
    categoryForm: {
      type: 'expense',
      name: ''
    },
    
    // Reglas
    rules: [],
    
    ruleForm: {
      id: null,
      keyword: '',
      type: 'expense',
      category: ''
    },
    
    editingRule: false,
    
    // ============================================
    // Inicialización
    // ============================================
    
    init() {
      // Cargar datos desde localStorage
      this.loadDataFromLocalStorage();
      
      // Establecer fecha actual en el formulario
      this.transactionForm.date = new Date().toISOString().split('T')[0];
      
      // Establecer categoría por defecto
      this.ruleForm.category = this.categories.expense[0] || '';
      this.budgetForm.category = this.categories.expense[0] || '';
      
      // Inicializar gráficos después de que el DOM esté listo
      this.$nextTick(() => {
        ChartManager.init(this.period);
      });
      
      // Observar cambios de página para reinitialize gráficos
      this.$watch('currentPage', (value) => {
        if (value === 'dashboard') {
          this.$nextTick(() => {
            ChartManager.init(this.period);
          });
        }
      });
    },
    
    // ============================================
    // Carga de Datos
    // ============================================
    
    loadDataFromLocalStorage() {
      // Cargar transacciones
      this.transactions = DataManager.getTransactions();
      
      // Cargar presupuestos
      this.budgets = DataManager.getBudgets();
      
      // Cargar categorías
      this.categories = DataManager.getCategories();
      
      // Cargar reglas
      this.rules = DataManager.getRules();
      
      // Cargar configuración
      this.settings = DataManager.getSettings();
      
      // Actualizar datos del dashboard
      this.updateDashboardData();
    },
    
    updateDashboardData() {
      this.dashboardData = DataManager.getDashboardData(this.transactions, this.budgets);
    },
    
    // ============================================
    // Métodos del Dashboard
    // ============================================
    
    setPeriod(newPeriod) {
      this.period = newPeriod;
      
      // Actualizar datos del dashboard según el período
      if (newPeriod === 'week') {
        this.dashboardData.totalIncome = 1250.25;
        this.dashboardData.totalExpenses = 675.30;
        this.dashboardData.balance = this.dashboardData.totalIncome - this.dashboardData.totalExpenses;
        this.dashboardData.incomeTrend = 5.2;
        this.dashboardData.expensesTrend = -2.8;
      } else if (newPeriod === 'month') {
        this.dashboardData.totalIncome = 3250.75;
        this.dashboardData.totalExpenses = 1875.43;
        this.dashboardData.balance = this.dashboardData.totalIncome - this.dashboardData.totalExpenses;
        this.dashboardData.incomeTrend = 12.5;
        this.dashboardData.expensesTrend = 8.3;
      } else if (newPeriod === 'year') {
        this.dashboardData.totalIncome = 39250.50;
        this.dashboardData.totalExpenses = 28765.25;
        this.dashboardData.balance = this.dashboardData.totalIncome - this.dashboardData.totalExpenses;
        this.dashboardData.incomeTrend = 18.7;
        this.dashboardData.expensesTrend = 15.2;
      }
      
      // Reinitialize gráficos
      this.$nextTick(() => {
        ChartManager.updatePeriod(newPeriod);
      });
    },
    
    calculateBudgetPercentage() {
      if (this.dashboardData.budgetTotal === 0) return 0;
      return Math.round((this.dashboardData.totalExpenses / this.dashboardData.budgetTotal) * 100);
    },
    
    // ============================================
    // Métodos de Formato (delegados a FormatHelper)
    // ============================================
    
    formatNumber(value) {
      return FormatHelper.formatNumber(value);
    },
    
    formatCurrency(value) {
      return FormatHelper.formatCurrency(value);
    },
    
    formatDate(dateString) {
      return FormatHelper.formatDate(dateString);
    },
    
    getCategoryStyle(category) {
      return FormatHelper.getCategoryStyle(category);
    },
    
    getBudgetProgressColorClass(spent, amount) {
      return FormatHelper.getBudgetProgressColorClass(spent, amount);
    },
    
    getBudgetPercentClass(spent, amount) {
      return FormatHelper.getBudgetPercentClass(spent, amount);
    },
    
    getPeriodLabel(period) {
      return FormatHelper.getPeriodLabel(period);
    },
    
    // ============================================
    // Métodos de Transacciones
    // ============================================
    
    get filteredTransactions() {
      let filtered = [...this.transactions];
      
      // Filtrar por tipo
      if (this.transactionsFilter.type !== 'all') {
        filtered = filtered.filter(t => {
          return this.transactionsFilter.type === 'income' ? t.amount > 0 : t.amount < 0;
        });
      }
      
      // Filtrar por rango de fecha
      if (this.transactionsFilter.dateRange !== 'all') {
        const today = new Date();
        const startDate = new Date();
        
        if (this.transactionsFilter.dateRange === 'today') {
          startDate.setHours(0, 0, 0, 0);
        } else if (this.transactionsFilter.dateRange === 'week') {
          startDate.setDate(today.getDate() - 7);
        } else if (this.transactionsFilter.dateRange === 'month') {
          startDate.setMonth(today.getMonth() - 1);
        } else if (this.transactionsFilter.dateRange === 'year') {
          startDate.setFullYear(today.getFullYear() - 1);
        }
        
        filtered = filtered.filter(t => new Date(t.date) >= startDate);
      }
      
      // Filtrar por término de búsqueda
      if (this.transactionsFilter.search) {
        const searchTerm = this.transactionsFilter.search.toLowerCase();
        filtered = filtered.filter(t => 
          t.description.toLowerCase().includes(searchTerm) || 
          t.category.toLowerCase().includes(searchTerm)
        );
      }
      
      // Ordenar por fecha (más reciente primero)
      return filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    },
    
    saveTransaction() {
      const amount = parseFloat(this.transactionForm.amount);
      const finalAmount = this.transactionForm.type === 'expense' ? -Math.abs(amount) : Math.abs(amount);
      
      if (this.editingTransaction) {
        const index = this.transactions.findIndex(t => t.id === this.transactionForm.id);
        if (index !== -1) {
          this.transactions[index] = {
            ...this.transactionForm,
            amount: finalAmount
          };
        }
      } else {
        const newTransaction = {
          id: Date.now(),
          date: this.transactionForm.date,
          description: this.transactionForm.description,
          category: this.transactionForm.category,
          amount: finalAmount,
          type: this.transactionForm.type
        };
        
        this.transactions.push(newTransaction);
      }
      
      // Guardar en localStorage
      DataManager.saveTransactions(this.transactions);
      
      // Actualizar formulario
      this.resetTransactionForm();
      
      // Actualizar datos del dashboard
      this.updateDashboardData();
    },
    
    resetTransactionForm() {
      this.transactionForm = {
        id: null,
        date: new Date().toISOString().split('T')[0],
        description: '',
        category: '',
        amount: '',
        type: 'expense'
      };
      this.editingTransaction = false;
    },
    
    editTransaction(transaction) {
      this.transactionForm = {
        id: transaction.id,
        date: transaction.date,
        description: transaction.description,
        category: transaction.category,
        amount: Math.abs(transaction.amount).toString(),
        type: transaction.amount > 0 ? 'income' : 'expense'
      };
      this.editingTransaction = true;
      
      // Desplazar al formulario
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    },
    
    deleteTransaction(id) {
      if (confirm('¿Estás seguro de que quieres eliminar esta transacción?')) {
        this.transactions = this.transactions.filter(t => t.id !== id);
        
        // Guardar en localStorage
        DataManager.saveTransactions(this.transactions);
        
        // Actualizar datos del dashboard
        this.updateDashboardData();
      }
    },
    
    // ============================================
    // Métodos de Presupuestos
    // ============================================
    
    saveBudget() {
      if (this.editingBudget) {
        const index = this.budgets.findIndex(b => b.id === this.budgetForm.id);
        if (index !== -1) {
          this.budgets[index] = {
            ...this.budgetForm,
            amount: parseFloat(this.budgetForm.amount)
          };
        }
      } else {
        const newBudget = {
          id: Date.now(),
          category: this.budgetForm.category,
          amount: parseFloat(this.budgetForm.amount),
          spent: 0,
          period: this.budgetForm.period,
          description: this.budgetForm.description
        };
        
        this.budgets.push(newBudget);
      }
      
      // Guardar en localStorage
      DataManager.saveBudgets(this.budgets);
      
      // Actualizar presupuestos del dashboard
      this.dashboardData.budgets = this.budgets.slice(0, 3);
      
      // Resetear formulario
      this.resetBudgetForm();
    },
    
    resetBudgetForm() {
      this.budgetForm = {
        id: null,
        category: this.categories.expense[0] || '',
        amount: '',
        period: 'monthly',
        description: ''
      };
      this.editingBudget = false;
    },
    
    editBudget(budget) {
      this.budgetForm = {
        id: budget.id,
        category: budget.category,
        amount: budget.amount.toString(),
        period: budget.period,
        description: budget.description
      };
      this.editingBudget = true;
      
      // Desplazar al formulario
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    },
    
    deleteBudget(id) {
      if (confirm('¿Estás seguro de que quieres eliminar este presupuesto?')) {
        this.budgets = this.budgets.filter(b => b.id !== id);
        
        // Guardar en localStorage
        DataManager.saveBudgets(this.budgets);
        
        // Actualizar presupuestos del dashboard
        this.dashboardData.budgets = this.budgets.slice(0, 3);
      }
    },
    
    // ============================================
    // Métodos de Categorías
    // ============================================
    
    addCategory() {
      if (!this.categoryForm.name) return;
      
      const categoryName = this.categoryForm.name.trim();
      const categoryType = this.categoryForm.type;
      
      // Verificar si la categoría ya existe
      if (!this.categories[categoryType].includes(categoryName)) {
        this.categories[categoryType].push(categoryName);
        
        // Guardar en localStorage
        DataManager.saveCategories(this.categories);
        
        // Resetear formulario
        this.categoryForm.name = '';
      }
    },
    
    removeCategory(type, categoryName) {
      if (confirm(`¿Estás seguro de que quieres eliminar la categoría "${categoryName}"?`)) {
        this.categories[type] = this.categories[type].filter(c => c !== categoryName);
        
        // Guardar en localStorage
        DataManager.saveCategories(this.categories);
      }
    },
    
    // ============================================
    // Métodos de Reglas
    // ============================================
    
    addRule() {
      if (this.editingRule) {
        const index = this.rules.findIndex(r => r.id === this.ruleForm.id);
        if (index !== -1) {
          this.rules[index] = { ...this.ruleForm };
        }
      } else {
        const newRule = {
          id: Date.now(),
          keyword: this.ruleForm.keyword,
          type: this.ruleForm.type,
          category: this.ruleForm.category
        };
        
        this.rules.push(newRule);
      }
      
      // Guardar en localStorage
      DataManager.saveRules(this.rules);
      
      // Resetear formulario
      this.resetRuleForm();
    },
    
    resetRuleForm() {
      this.ruleForm = {
        id: null,
        keyword: '',
        type: 'expense',
        category: this.categories.expense[0] || ''
      };
      this.editingRule = false;
    },
    
    editRule(rule) {
      this.ruleForm = {
        id: rule.id,
        keyword: rule.keyword,
        type: rule.type,
        category: rule.category
      };
      this.editingRule = true;
    },
    
    deleteRule(id) {
      if (confirm('¿Estás seguro de que quieres eliminar esta regla?')) {
        this.rules = this.rules.filter(r => r.id !== id);
        
        // Guardar en localStorage
        DataManager.saveRules(this.rules);
      }
    },
    
    // ============================================
    // Métodos de Configuración
    // ============================================
    
    saveSettings() {
      // Guardar en localStorage
      DataManager.saveSettings(this.settings);
      
      alert('Configuración guardada correctamente');
    },
    
    clearAllData() {
      if (confirm('¿Estás seguro de que quieres borrar todos tus datos? Esta acción no se puede deshacer.')) {
        if (confirm('¿REALMENTE estás seguro? Todos tus datos serán eliminados permanentemente.')) {
          // Limpiar todos los datos
          DataManager.clearAll();
          
          // Resetear datos
          this.transactions = [];
          this.budgets = [];
          this.dashboardData.recentTransactions = [];
          this.dashboardData.budgets = [];
          
          // Mantener categorías por defecto
          this.categories = { ...DEFAULT_CATEGORIES };
          
          this.rules = [];
          
          alert('Todos los datos han sido borrados');
        }
      }
    }
  }));
});