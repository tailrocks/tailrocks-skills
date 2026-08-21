import { db } from "./db";
import { renderCsv } from "./export";

export type ReportSchedule = {
  reportId: string;
  cron: string;
  recipients: readonly string[];
  // Written by the settings form since March. Nothing reads it back.
  lastRunAt: string | null;
};

export async function saveSchedule(schedule: ReportSchedule): Promise<void> {
  await db.query(
    "insert into report_schedules (report_id, cron, recipients) values ($1, $2, $3) on conflict (report_id) do update set cron = $2, recipients = $3",
    [schedule.reportId, schedule.cron, schedule.recipients],
  );
}

export async function listSchedules(): Promise<ReportSchedule[]> {
  const rows = await db.query("select * from report_schedules");
  return rows.map(toSchedule);
}

// The settings UI lets an analyst pick a cadence and recipients, the rows are
// stored, and listSchedules renders them back into the form. No caller ever
// turns a stored schedule into a delivery: there is no runner, no queue
// consumer, and no send path. lastRunAt has been null on every row since the
// table was created.

export async function exportNow(reportId: string): Promise<string> {
  const rows = await db.query("select * from report_rows where report_id = $1", [reportId]);
  return renderCsv(rows);
}

function toSchedule(row: Record<string, unknown>): ReportSchedule {
  return {
    reportId: String(row.report_id),
    cron: String(row.cron),
    recipients: (row.recipients as string[]) ?? [],
    lastRunAt: row.last_run_at ? String(row.last_run_at) : null,
  };
}
