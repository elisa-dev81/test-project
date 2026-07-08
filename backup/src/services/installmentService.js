import api from './api';

const installmentService = {
  // Get all installments with filtering and pagination
  getInstallments: async (params = {}) => {
    try {
      const response = await api.get('/installments', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get installment by ID
  getInstallmentById: async (id) => {
    try {
      const response = await api.get(`/installments/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Pay installment
  payInstallment: async (id, paymentData) => {
    try {
      const response = await api.post(`/installments/${id}/pay`, paymentData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update installment
  updateInstallment: async (id, installmentData) => {
    try {
      const response = await api.put(`/installments/${id}`, installmentData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get overdue installments
  getOverdueInstallments: async () => {
    try {
      const response = await api.get('/installments/overdue');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get installment summary
  getInstallmentSummary: async () => {
    try {
      const response = await api.get('/installments/summary');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get pending installments
  getPendingInstallments: async (params = {}) => {
    try {
      const response = await api.get('/installments', { 
        params: { ...params, status: 'pending' }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get paid installments
  getPaidInstallments: async (params = {}) => {
    try {
      const response = await api.get('/installments', { 
        params: { ...params, status: 'paid' }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get installment status options with translations
  getInstallmentStatuses: () => {
    return [
      { value: 'pending', label: 'در انتظار' },
      { value: 'paid', label: 'پرداخت شده' },
      { value: 'overdue', label: 'معوقه' },
      { value: 'cancelled', label: 'لغو شده' }
    ];
  },

  // Calculate late fee based on days overdue
  calculateLateFee: (dueDate, amount, lateFeeRate = 0.01) => {
    const currentDate = new Date();
    const due = new Date(dueDate);
    
    if (currentDate <= due) {
      return 0; // No late fee if not overdue
    }
    
    const daysOverdue = Math.ceil((currentDate - due) / (1000 * 60 * 60 * 24));
    const lateFee = parseFloat(amount) * lateFeeRate * daysOverdue;
    
    return Math.max(0, lateFee);
  },

  // Check if installment is overdue
  isOverdue: (dueDate) => {
    const currentDate = new Date();
    const due = new Date(dueDate);
    return currentDate > due;
  },

  // Get days until due date (negative if overdue)
  getDaysUntilDue: (dueDate) => {
    const currentDate = new Date();
    const due = new Date(dueDate);
    const diffTime = due - currentDate;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  },

  // Format installment data for display
  formatInstallmentForDisplay: (installment) => {
    const statuses = installmentService.getInstallmentStatuses();
    const statusLabel = statuses.find(status => status.value === installment.status)?.label || installment.status;
    
    const isOverdue = installmentService.isOverdue(installment.due_date);
    const daysUntilDue = installmentService.getDaysUntilDue(installment.due_date);
    
    return {
      ...installment,
      statusLabel,
      isOverdue,
      daysUntilDue,
      formattedAmount: new Intl.NumberFormat('fa-IR').format(installment.amount),
      formattedPaidAmount: new Intl.NumberFormat('fa-IR').format(installment.paid_amount || 0),
      formattedLateFee: new Intl.NumberFormat('fa-IR').format(installment.late_fee || 0),
      formattedDueDate: new Date(installment.due_date).toLocaleDateString('fa-IR'),
      formattedPaidDate: installment.paid_date ? new Date(installment.paid_date).toLocaleDateString('fa-IR') : null
    };
  },

  // Generate installment schedule
  generateInstallmentSchedule: (totalAmount, numberOfInstallments, startDate) => {
    const installmentAmount = totalAmount / numberOfInstallments;
    const schedule = [];
    
    for (let i = 0; i < numberOfInstallments; i++) {
      const dueDate = new Date(startDate);
      dueDate.setMonth(dueDate.getMonth() + i + 1);
      
      schedule.push({
        installment_number: i + 1,
        amount: installmentAmount.toFixed(2),
        due_date: dueDate.toISOString().split('T')[0],
        status: 'pending'
      });
    }
    
    return schedule;
  }
};

export default installmentService;