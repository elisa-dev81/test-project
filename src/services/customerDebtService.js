import api from './api';
import transactionService from './transactionService';
import installmentService from './installmentService';

const customerDebtService = {
  // Get all customer debts with detailed information
  getCustomerDebts: async (params = {}) => {
    try {
      // Get all unpaid and partial transactions
      const salesResponse = await transactionService.getSales();
      const salesData = salesResponse.data?.transactions || [];
      
      // Group by customer and calculate debt
      const customerDebts = {};
      
      salesData.forEach(transaction => {
        const customerKey = `${transaction.customer_name}_${transaction.customer_phone || ''}`;
        
        if (!customerDebts[customerKey]) {
          customerDebts[customerKey] = {
            customer_name: transaction.customer_name,
            customer_phone: transaction.customer_phone || '',
            total_debt: 0,
            total_paid: 0,
            remaining_amount: 0,
            transaction_count: 0,
            last_transaction_date: null,
            transactions: [],
            installments: []
          };
        }
        
        const customer = customerDebts[customerKey];
        
        // Add transaction details
        const remainingAmount = parseFloat(transaction.remaining_amount || 0);
        const paidAmount = parseFloat(transaction.paid_amount || 0);
        const totalAmount = parseFloat(transaction.total_amount || 0);
        
        // Include transactions that are unpaid or have remaining amount
        const isUnpaidTransaction = transaction.payment_method === 'unpaid';
        const hasRemainingAmount = remainingAmount > 0;
        const isNotCompleted = transaction.payment_status !== 'completed';
        
        if (isUnpaidTransaction || hasRemainingAmount || isNotCompleted) {
          customer.total_debt += totalAmount;
          customer.total_paid += paidAmount;
          
          // If transaction is marked as unpaid but has no remaining amount, 
          // set remaining amount to total amount
          // Also ensure remaining amount is never negative
          const actualRemainingAmount = isUnpaidTransaction && remainingAmount === 0 
            ? totalAmount 
            : Math.max(0, remainingAmount);
          
          customer.remaining_amount += actualRemainingAmount;
          customer.transaction_count++;
          customer.transactions.push({
            id: transaction.id,
            transaction_number: transaction.transaction_number,
            transaction_date: transaction.transaction_date,
            total_amount: totalAmount,
            paid_amount: paidAmount,
            remaining_amount: actualRemainingAmount,
            payment_status: transaction.payment_status,
            payment_method: transaction.payment_method,
            items: transaction.items || []
          });
          
          // Update last transaction date
          const transactionDate = new Date(transaction.transaction_date);
          if (!customer.last_transaction_date || transactionDate > new Date(customer.last_transaction_date)) {
            customer.last_transaction_date = transaction.transaction_date;
          }
        }
      });
      
      // Convert to array and filter customers with debt or unpaid transactions
      const debtList = Object.values(customerDebts)
        .filter(customer => 
          customer.remaining_amount > 0 || 
          customer.transactions.some(t => t.payment_method === 'unpaid')
        )
        .sort((a, b) => b.remaining_amount - a.remaining_amount);
      
      return {
        success: true,
        data: debtList
      };
      
    } catch (error) {
      throw error;
    }
  },

  // Get customer debt summary statistics
  getDebtSummary: async () => {
    try {
      // Get all sales transactions to analyze unpaid ones specifically
      const salesResponse = await transactionService.getSales();
      const salesData = salesResponse.data?.transactions || [];
      
      // Filter unpaid transactions (payment_method = 'unpaid')
      const unpaidTransactions = salesData.filter(transaction => 
        transaction.payment_method === 'unpaid'
      );
      
      // Calculate total amount from unpaid transactions
      const totalUnpaidAmount = unpaidTransactions.reduce((sum, transaction) => {
        const totalAmount = parseFloat(transaction.total_amount || 0);
        const remainingAmount = parseFloat(transaction.remaining_amount || 0);
        // If it's unpaid but has no remaining amount, use total amount
        const actualAmount = transaction.payment_method === 'unpaid' && remainingAmount === 0 
          ? totalAmount 
          : remainingAmount || totalAmount;
        return sum + actualAmount;
      }, 0);
      
      // Count unique customers with unpaid transactions
      const uniqueUnpaidCustomers = new Set();
      unpaidTransactions.forEach(transaction => {
        const customerKey = `${transaction.customer_name}_${transaction.customer_phone || ''}`;
        uniqueUnpaidCustomers.add(customerKey);
      });
      
      // Get debt response for other calculations
      const debtResponse = await customerDebtService.getCustomerDebts();
      const customers = debtResponse.data;
      
      const summary = {
        total_customers_with_debt: uniqueUnpaidCustomers.size, // Count of customers with unpaid transactions
        total_debt_amount: totalUnpaidAmount, // Total amount from unpaid transactions
        total_paid_amount: customers.reduce((sum, customer) => sum + customer.total_paid, 0),
        total_transaction_amount: customers.reduce((sum, customer) => sum + customer.total_debt, 0),
        total_unpaid_transactions: unpaidTransactions.length, // Number of unpaid transactions
        average_debt_per_customer: 0,
        highest_debt: 0,
        lowest_debt: 0,
        customers_with_overdue: 0
      };
      
      if (uniqueUnpaidCustomers.size > 0) {
        summary.average_debt_per_customer = totalUnpaidAmount / uniqueUnpaidCustomers.size;
        
        // Calculate highest and lowest debt from unpaid transactions per customer
        const customerUnpaidAmounts = {};
        unpaidTransactions.forEach(transaction => {
          const customerKey = `${transaction.customer_name}_${transaction.customer_phone || ''}`;
          if (!customerUnpaidAmounts[customerKey]) {
            customerUnpaidAmounts[customerKey] = 0;
          }
          customerUnpaidAmounts[customerKey] += parseFloat(transaction.total_amount || 0);
        });
        
        const unpaidAmountsArray = Object.values(customerUnpaidAmounts);
        summary.highest_debt = Math.max(...unpaidAmountsArray);
        summary.lowest_debt = Math.min(...unpaidAmountsArray);
        
        // Check for overdue installments
        try {
          const installmentsResponse = await installmentService.getOverdueInstallments();
          const overdueInstallments = installmentsResponse.data || [];
          
          const customersWithOverdue = new Set();
          overdueInstallments.forEach(installment => {
            if (installment.transaction && installment.transaction.customer_name) {
              customersWithOverdue.add(installment.transaction.customer_name);
            }
          });
          
          summary.customers_with_overdue = customersWithOverdue.size;
        } catch (installmentError) {
          console.warn('Could not fetch overdue installments:', installmentError);
          summary.customers_with_overdue = 0;
        }
      }
      
      return {
        success: true,
        data: summary
      };
      
    } catch (error) {
      throw error;
    }
  },

  // Get customer installments
  getCustomerInstallments: async (customerName, customerPhone = '') => {
    try {
      const response = await api.get('/installments', {
        params: {
          customer_name: customerName,
          customer_phone: customerPhone
        }
      });
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Pay customer debt (full or partial)
  payCustomerDebt: async (transactionId, paymentData) => {
    try {
      const response = await api.post(`/transactions/${transactionId}/pay`, paymentData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create installment plan for a transaction
  createInstallmentPlan: async (transactionId, installmentData) => {
    try {
      const response = await api.post(`/transactions/${transactionId}/installments`, installmentData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get payment history for a customer
  getCustomerPaymentHistory: async (customerName, customerPhone = '') => {
    try {
      const response = await api.get('/payments/history', {
        params: {
          customer_name: customerName,
          customer_phone: customerPhone
        }
      });
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Calculate debt aging (how long debt has been outstanding)
  calculateDebtAging: (transactions) => {
    const today = new Date();
    const aging = {
      current: 0,      // 0-30 days
      aging_30: 0,     // 31-60 days
      aging_60: 0,     // 61-90 days
      aging_90_plus: 0 // 90+ days
    };
    
    transactions.forEach(transaction => {
      const transactionDate = new Date(transaction.transaction_date);
      const daysDiff = Math.floor((today - transactionDate) / (1000 * 60 * 60 * 24));
      const remainingAmount = parseFloat(transaction.remaining_amount || 0);
      
      if (daysDiff <= 30) {
        aging.current += remainingAmount;
      } else if (daysDiff <= 60) {
        aging.aging_30 += remainingAmount;
      } else if (daysDiff <= 90) {
        aging.aging_60 += remainingAmount;
      } else {
        aging.aging_90_plus += remainingAmount;
      }
    });
    
    return aging;
  },

  // Format customer debt data for display
  formatCustomerDebtForDisplay: (customer) => {
    const aging = customerDebtService.calculateDebtAging(customer.transactions);
    
    return {
      ...customer,
      formatted_total_debt: new Intl.NumberFormat('fa-IR').format(customer.total_debt),
      formatted_total_paid: new Intl.NumberFormat('fa-IR').format(customer.total_paid),
      formatted_remaining_amount: new Intl.NumberFormat('fa-IR').format(customer.remaining_amount),
      formatted_last_transaction_date: customer.last_transaction_date ? 
        new Date(customer.last_transaction_date).toLocaleDateString('fa-IR') : null,
      debt_aging: aging,
      payment_percentage: customer.total_debt > 0 ? 
        ((customer.total_paid / customer.total_debt) * 100).toFixed(1) : 0
    };
  },

  // Get overdue customers
  getOverdueCustomers: async () => {
    try {
      const overdueInstallments = await installmentService.getOverdueInstallments();
      const installments = overdueInstallments.data || [];
      
      // Group by customer
      const overdueCustomers = {};
      
      installments.forEach(installment => {
        if (installment.transaction) {
          const customerKey = `${installment.transaction.customer_name}_${installment.transaction.customer_phone || ''}`;
          
          if (!overdueCustomers[customerKey]) {
            overdueCustomers[customerKey] = {
              customer_name: installment.transaction.customer_name,
              customer_phone: installment.transaction.customer_phone || '',
              overdue_amount: 0,
              overdue_count: 0,
              oldest_overdue_date: null,
              installments: []
            };
          }
          
          const customer = overdueCustomers[customerKey];
          customer.overdue_amount += parseFloat(installment.amount || 0);
          customer.overdue_count++;
          customer.installments.push(installment);
          
          // Track oldest overdue date
          const dueDate = new Date(installment.due_date);
          if (!customer.oldest_overdue_date || dueDate < new Date(customer.oldest_overdue_date)) {
            customer.oldest_overdue_date = installment.due_date;
          }
        }
      });
      
      return {
        success: true,
        data: Object.values(overdueCustomers)
      };
      
    } catch (error) {
      throw error;
    }
  },

  // Search customers by name or phone
  searchCustomers: async (searchTerm) => {
    try {
      const debtResponse = await customerDebtService.getCustomerDebts();
      const customers = debtResponse.data;
      
      if (!searchTerm) return { success: true, data: customers };
      
      const filteredCustomers = customers.filter(customer => 
        customer.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (customer.customer_phone && customer.customer_phone.includes(searchTerm))
      );
      
      return {
        success: true,
        data: filteredCustomers
      };
      
    } catch (error) {
      throw error;
    }
  }
};

export default customerDebtService;
