const MAX_LIMIT = 100;

// Parse ?page and ?limit into safe positive integers.
// Negative/zero/garbage values previously produced a negative skip() and a 500.
export const parsePagination = (query, defaultLimit) => {
  const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
  const limit = Math.min(
    MAX_LIMIT,
    Math.max(1, Number.parseInt(query.limit, 10) || defaultLimit)
  );
  return { page, limit, skip: (page - 1) * limit };
};

export const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
