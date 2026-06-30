import db from "../database/db.js";
import { paginate } from "../utils/pagination.js";

const REPORTS_TABLE = "user_reports";

function reportsQuery(trx = db) {
  return trx(REPORTS_TABLE);
}

function normalizeReport(report) {
  if (!report) {
    return report;
  }

  return {
    ...report,
    message_log:
      typeof report.message_log === "string"
        ? JSON.parse(report.message_log)
        : report.message_log,
  };
}

export async function createUserReport_model(reportData, trx = db) {
  const payload = {
    ...reportData,
    message_log: JSON.stringify(reportData.message_log),
  };

  const [report] = await reportsQuery(trx).insert(payload).returning("*");
  return normalizeReport(report);
}

export async function listUserReports_model(pagination = {}, trx = db) {
  const result = await paginate(reportsQuery(trx), pagination, (qb) =>
    qb.orderBy("created_at", "desc"),
  );

  return {
    ...result,
    data: result.data.map(normalizeReport),
  };
}