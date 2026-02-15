export const formatPrice = (value, options = {}) => {
  const {
    currency = 'USD',
    locale = 'en-US',
    minimumFractionDigits,
    maximumFractionDigits,
  } = options;

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(Number(value || 0));
};

export const formatDate = (value, options = {}) => {
  if (!value) {
    return '';
  }

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const { locale = 'en-US', preset = 'medium', ...rest } = options;
  const presetMap = {
    short: { dateStyle: 'short', timeStyle: 'short' },
    medium: { dateStyle: 'medium', timeStyle: 'short' },
    long: { dateStyle: 'long', timeStyle: 'short' },
    dateOnly: { dateStyle: 'medium' },
    timeOnly: { timeStyle: 'short' },
  };

  return new Intl.DateTimeFormat(locale, {
    ...(presetMap[preset] || presetMap.medium),
    ...rest,
  }).format(date);
};

