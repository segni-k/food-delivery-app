export const normalizeApiError = (error, fallbackMessage = 'Request failed.') => {
  if (!error) {
    return {
      status: -1,
      message: fallbackMessage,
      errors: [],
      raw: null,
    };
  }

  if (typeof error === 'string') {
    return {
      status: -1,
      message: error,
      errors: [],
      raw: error,
    };
  }

  const status = Number.isFinite(error.status) ? error.status : -1;
  const message = error.message || fallbackMessage;
  const errors = Array.isArray(error.errors)
    ? error.errors
    : error.errors && typeof error.errors === 'object'
      ? Object.values(error.errors).flat()
      : [];

  return {
    status,
    message,
    errors,
    raw: error.raw || error,
  };
};

export const getErrorMessage = (error, fallbackMessage = 'Something went wrong.') =>
  normalizeApiError(error, fallbackMessage).message;

