//  Reusable pagination helper — extracts page/limit from query params and
// returns a standardized pagination response shape. Used by all list endpoints.

/**
 * Parse pagination params from query string with safe defaults
 * @param {object} query - Express req.query
 * @param {object} options - Default values
 * @returns {{ page: number, limit: number, skip: number }}
 */
export const parsePagination = (query, { defaultLimit = 20, maxLimit = 100 } = {}) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  let limit = parseInt(query.limit) || defaultLimit;

  //  Cap maximum limit to prevent clients from requesting unbounded data
  limit = Math.min(limit, maxLimit);

  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

/**
 * Build a standardized paginated response object
 * @param {Array} data - The actual data items
 * @param {number} total - Total count of items matching the query
 * @param {number} page - Current page number
 * @param {number} limit - Items per page
 * @returns {{ data: Array, pagination: object }}
 */
export const paginatedResponse = (data, total, page, limit) => {
  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1
    }
  };
};
