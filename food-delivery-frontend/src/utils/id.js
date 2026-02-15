const UUID_V4_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const isUuid = (value) => UUID_V4_PATTERN.test(String(value || '').trim());

export const ensureFrontendId = (entity, candidates = ['id', 'public_id', 'uuid']) => {
  if (!entity || typeof entity !== 'object') {
    return null;
  }

  const key = candidates.find((candidate) => entity[candidate] !== undefined && entity[candidate] !== null);
  return key ? String(entity[key]) : null;
};

export const mapEntityIds = (entity, options = {}) => {
  if (!entity || typeof entity !== 'object') {
    return entity;
  }

  const { idField = 'id', candidates = ['id', 'public_id', 'uuid'], keepOriginal = true } = options;
  const mapped = { ...entity };
  const frontendId = ensureFrontendId(mapped, candidates);

  if (frontendId) {
    mapped[idField] = frontendId;
  }

  if (!keepOriginal) {
    candidates.forEach((candidate) => {
      if (candidate !== idField) {
        delete mapped[candidate];
      }
    });
  }

  return mapped;
};

export const mapEntityCollectionIds = (rows, options = {}) =>
  Array.isArray(rows) ? rows.map((row) => mapEntityIds(row, options)) : [];

export const createEntityMapById = (rows, options = {}) =>
  mapEntityCollectionIds(rows, options).reduce((accumulator, row) => {
    if (row?.id) {
      accumulator[row.id] = row;
    }
    return accumulator;
  }, {});

