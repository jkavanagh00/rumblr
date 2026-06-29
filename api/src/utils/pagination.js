/**
 * Executes a paginated Knex query and returns data + full pagination metadata.
 *
 * @param {import("knex").QueryBuilder} baseQuery - A Knex QueryBuilder with all
 *   WHERE/JOIN conditions already applied but WITHOUT select/limit/offset/orderBy.
 * @param {{ page?: number, limit?: number }} pagination
 * @param {(qb: import("knex").QueryBuilder) => import("knex").QueryBuilder} [applyOrder]
 *   Optional function to add ORDER BY clauses before executing the data query.
 * @returns {Promise<{ data: object[], pagination: object }>}
 */
export async function paginate(
  baseQuery,
  { page = 1, limit = 20 } = {},
  applyOrder = (qb) => qb,
) {
  const offset = (page - 1) * limit;

  const [countResult] = await baseQuery.clone().count({ total: "*" });
  const total = Number(countResult.total);
  const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

  const data = await applyOrder(baseQuery.clone())
    .select("*")
    .limit(limit)
    .offset(offset);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
}
