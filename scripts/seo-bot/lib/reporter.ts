/**
 * Reporter
 * Script sonuçlarını JSON/CSV olarak raporlar
 */
import * as fs from "fs";
import * as path from "path";

const REPORTS_DIR = path.resolve(__dirname, "../reports");

function ensureReportsDir(): void {
  if (!fs.existsSync(REPORTS_DIR)) {
    fs.mkdirSync(REPORTS_DIR, { recursive: true });
  }
}

function getTimestamp(): string {
  return new Date().toISOString().slice(0, 10);
}

export function saveReport(name: string, data: unknown): string {
  ensureReportsDir();
  const fileName = `${name}-${getTimestamp()}.json`;
  const filePath = path.join(REPORTS_DIR, fileName);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  console.log(`\n📄 Rapor kaydedildi: ${filePath}`);
  return filePath;
}

export function saveBackup(name: string, data: unknown): string {
  ensureReportsDir();
  const fileName = `backup-${name}-${getTimestamp()}.json`;
  const filePath = path.join(REPORTS_DIR, fileName);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  console.log(`💾 Backup kaydedildi: ${filePath}`);
  return filePath;
}

export function saveCsv(name: string, headers: string[], rows: string[][]): string {
  ensureReportsDir();
  const fileName = `${name}-${getTimestamp()}.csv`;
  const filePath = path.join(REPORTS_DIR, fileName);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
    ),
  ].join("\n");

  fs.writeFileSync(filePath, csvContent, "utf-8");
  console.log(`📄 CSV kaydedildi: ${filePath}`);
  return filePath;
}

export function printSummary(title: string, items: { label: string; value: string | number }[]): void {
  console.log(`\n${"═".repeat(60)}`);
  console.log(`  ${title}`);
  console.log(`${"═".repeat(60)}`);
  for (const item of items) {
    console.log(`  ${item.label.padEnd(35)} ${item.value}`);
  }
  console.log(`${"═".repeat(60)}\n`);
}
