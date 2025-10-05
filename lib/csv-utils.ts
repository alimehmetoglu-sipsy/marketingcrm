/**
 * CSV Utility Functions for Lead and Investor Import/Export
 */

import { Prisma } from "@prisma/client";

// Types
export interface CSVField {
  name: string;
  label: string;
  type: string;
  is_required: boolean;
}

export interface ParsedCSVRow {
  [key: string]: string | null;
}

export interface CSVValidationError {
  row: number;
  field: string;
  message: string;
}

export interface ImportResult {
  success: boolean;
  totalRows: number;
  successCount: number;
  errorCount: number;
  errors: CSVValidationError[];
}

/**
 * Convert array of objects to CSV string
 */
export function arrayToCSV(data: any[], headers: string[]): string {
  if (data.length === 0) {
    return headers.join(",") + "\n";
  }

  // Create header row
  const headerRow = headers.map(escapeCSVValue).join(",");

  // Create data rows
  const dataRows = data.map((row) => {
    return headers
      .map((header) => {
        const value = row[header];
        return escapeCSVValue(value);
      })
      .join(",");
  });

  return [headerRow, ...dataRows].join("\n");
}

/**
 * Parse CSV string to array of objects
 */
export function parseCSV(csvContent: string): ParsedCSVRow[] {
  const lines = csvContent.split("\n").filter((line) => line.trim() !== "");

  if (lines.length === 0) {
    return [];
  }

  // Parse headers
  const headers = parseCSVLine(lines[0]);

  // Parse data rows
  const rows: ParsedCSVRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const row: ParsedCSVRow = {};

    headers.forEach((header, index) => {
      row[header] = values[index] || null;
    });

    rows.push(row);
  }

  return rows;
}

/**
 * Parse a single CSV line handling quoted values
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      // End of field
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  // Add last field
  result.push(current.trim());

  return result;
}

/**
 * Escape CSV value (handle commas, quotes, newlines)
 */
function escapeCSVValue(value: any): string {
  if (value === null || value === undefined) {
    return "";
  }

  let stringValue = String(value);

  // Check if value needs to be quoted
  if (
    stringValue.includes(",") ||
    stringValue.includes('"') ||
    stringValue.includes("\n") ||
    stringValue.includes("\r")
  ) {
    // Escape quotes by doubling them
    stringValue = stringValue.replace(/"/g, '""');
    // Wrap in quotes
    return `"${stringValue}"`;
  }

  return stringValue;
}

/**
 * Generate CSV headers from static and dynamic fields
 */
export function generateHeaders(
  staticFields: string[],
  dynamicFields: CSVField[]
): string[] {
  return [...staticFields, ...dynamicFields.map((f) => f.label)];
}

/**
 * Validate CSV headers against expected fields
 */
export function validateHeaders(
  csvHeaders: string[],
  expectedHeaders: string[]
): { valid: boolean; missing: string[]; extra: string[] } {
  const missing = expectedHeaders.filter((h) => !csvHeaders.includes(h));
  const extra = csvHeaders.filter((h) => !expectedHeaders.includes(h));

  return {
    valid: missing.length === 0,
    missing,
    extra,
  };
}

/**
 * Map dynamic field label to field name
 */
export function mapLabelToFieldName(
  label: string,
  fields: CSVField[]
): string | null {
  const field = fields.find((f) => f.label === label);
  return field ? field.name : null;
}

/**
 * Validate field value based on type
 */
export function validateFieldValue(
  value: string | null,
  field: CSVField
): { valid: boolean; error?: string } {
  // Check required fields
  if (field.is_required && (!value || value.trim() === "")) {
    return { valid: false, error: `${field.label} is required` };
  }

  if (!value || value.trim() === "") {
    return { valid: true };
  }

  // Type-specific validation
  switch (field.type) {
    case "email":
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return { valid: false, error: `Invalid email format: ${value}` };
      }
      break;

    case "phone":
      // Basic phone validation (can be enhanced)
      const phoneRegex = /^\+?[0-9\s\-()]+$/;
      if (!phoneRegex.test(value)) {
        return { valid: false, error: `Invalid phone format: ${value}` };
      }
      break;

    case "url":
      try {
        new URL(value);
      } catch {
        return { valid: false, error: `Invalid URL format: ${value}` };
      }
      break;

    case "number":
      if (isNaN(Number(value))) {
        return { valid: false, error: `Invalid number: ${value}` };
      }
      break;

    case "date":
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        return { valid: false, error: `Invalid date format: ${value}` };
      }
      break;
  }

  return { valid: true };
}

/**
 * Format value based on field type for CSV export
 */
export function formatValueForCSV(value: any, type: string): string {
  if (value === null || value === undefined) {
    return "";
  }

  switch (type) {
    case "multiselect":
    case "multiselect_dropdown":
      // Parse JSON array and join with semicolons
      try {
        const parsed = typeof value === "string" ? JSON.parse(value) : value;
        return Array.isArray(parsed) ? parsed.join("; ") : String(value);
      } catch {
        return String(value);
      }

    case "date":
      // Format date as YYYY-MM-DD
      if (value instanceof Date) {
        return value.toISOString().split("T")[0];
      }
      return String(value);

    default:
      return String(value);
  }
}

/**
 * Parse value from CSV based on field type
 */
export function parseValueFromCSV(value: string | null, type: string): any {
  if (!value || value.trim() === "") {
    return null;
  }

  switch (type) {
    case "multiselect":
    case "multiselect_dropdown":
      // Split by semicolons and return array
      return value.split(";").map((v) => v.trim()).filter(Boolean);

    case "number":
      return Number(value);

    case "date":
      return new Date(value);

    default:
      return value;
  }
}

/**
 * Create a download trigger for CSV file
 */
export function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
