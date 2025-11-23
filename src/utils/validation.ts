export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): boolean => {
  // At least 8 characters, one uppercase, one lowercase, one number
  return password.length >= 8 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /\d/.test(password);
};

export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

export const formatPrice = (price: number | undefined | null): string => {
  // Handle undefined, null, or NaN
  if (price === undefined || price === null || isNaN(Number(price))) {
    return '₺0,00';
  }
  
  const numPrice = typeof price === 'string' ? parseFloat(price) : Number(price);
  
  if (isNaN(numPrice)) {
    return '₺0,00';
  }
  
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
  }).format(numPrice);
};

export const formatDate = (date: string | Date | undefined | null): string => {
  if (!date) {
    return 'Tarih belirtilmemiş';
  }
  
  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    
    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return 'Geçersiz tarih';
    }
    
    return new Intl.DateTimeFormat('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(dateObj);
  } catch (error) {
    console.error('Date formatting error:', error, date);
    return 'Geçersiz tarih';
  }
};

export const calculateDays = (startDate: string | Date, endDate: string | Date): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

