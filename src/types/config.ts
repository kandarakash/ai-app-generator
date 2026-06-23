import { z } from "zod";

// Validation Schema for Field Config
export const FieldConfigSchema = z.object({
  name: z.string().min(1, "Field name is required"),
  type: z.enum(["string", "number", "boolean", "date", "enum", "email", "textarea"]),
  required: z.boolean().optional().default(false),
  default: z.any().optional(),
  options: z.array(z.string()).optional(), // for enum type
  label: z.string().optional(),
  validation: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
    pattern: z.string().optional(),
  }).optional(),
});

export type FieldConfig = z.infer<typeof FieldConfigSchema>;

// Validation Schema for Table Config
export const TableConfigSchema = z.object({
  name: z.string().min(1, "Table name is required"),
  fields: z.array(FieldConfigSchema).min(1, "Table must have at least one field"),
  displayField: z.string().optional(), // Field to use as display name
});

export type TableConfig = z.infer<typeof TableConfigSchema>;

// Validation Schema for Component Config
export const ComponentConfigSchema = z.object({
  id: z.string().min(1, "Component ID is required"),
  type: z.enum([
    "text",
    "number",
    "email",
    "select",
    "date",
    "boolean",
    "textarea",
    "table",
    "card",
    "stats",
    "chart",
    "form",
    "unknown" // for graceful handling
  ]),
  name: z.string().min(1, "Component name is required"),
  label: z.string().optional(),
  required: z.boolean().optional().default(false),
  table: z.string().optional(), // Which table to bind to
  fields: z.array(z.string()).optional(), // Which fields to display
  config: z.record(z.any()).optional(), // Extra config for specific component types
  position: z.object({
    row: z.number().optional(),
    col: z.number().optional(),
    span: z.number().optional(),
  }).optional(),
});

export type ComponentConfig = z.infer<typeof ComponentConfigSchema>;

// Validation Schema for Page Config
export const PageConfigSchema = z.object({
  id: z.string().min(1, "Page ID is required"),
  name: z.string().min(1, "Page name is required"),
  route: z.string().min(1, "Route is required"),
  layout: z.enum(["form", "table", "dashboard", "detail"]).optional().default("dashboard"),
  components: z.array(ComponentConfigSchema),
  table: z.string().optional(), // Primary table for this page
});

export type PageConfig = z.infer<typeof PageConfigSchema>;

// Validation Schema for API Config
export const ApiConfigSchema = z.object({
  path: z.string().min(1, "API path is required"),
  method: z.enum(["GET", "POST", "PUT", "DELETE"]),
  table: z.string(),
  action: z.enum(["list", "create", "update", "delete", "get"]),
  validation: z.boolean().optional().default(true),
});

export type ApiConfig = z.infer<typeof ApiConfigSchema>;

// Main App Config Schema
export const AppConfigSchema = z.object({
  name: z.string().min(1, "App name is required"),
  description: z.string().optional(),
  version: z.string().optional().default("1.0.0"),
  pages: z.array(PageConfigSchema).min(1, "App must have at least one page"),
  database: z.array(TableConfigSchema).min(1, "App must have at least one table"),
  apis: z.array(ApiConfigSchema).optional(),
  settings: z.object({
    theme: z.enum(["light", "dark", "system"]).optional().default("light"),
    primaryColor: z.string().optional(),
    requireAuth: z.boolean().optional().default(true),
  }).optional(),
});

export type AppConfig = z.infer<typeof AppConfigSchema>;

// Safe config parser that never throws
export function parseConfig(config: unknown): { 
  success: boolean; 
  data?: AppConfig; 
  errors?: string[] 
} {
  try {
    const result = AppConfigSchema.safeParse(config);
    if (result.success) {
      return { success: true, data: result.data };
    }
    return { 
      success: false, 
      errors: result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`) 
    };
  } catch (error) {
    return { 
      success: false, 
      errors: [(error as Error).message] 
    };
  }
}

// Normalize config - fills in defaults and handles missing fields gracefully
export function normalizeConfig(config: Partial<AppConfig>): AppConfig {
  const defaultConfig: AppConfig = {
    name: config.name || "Untitled App",
    description: config.description || "",
    version: config.version || "1.0.0",
    pages: (config.pages || []).map(page => ({
      ...page,
      layout: page.layout || "dashboard",
      components: (page.components || []).map(comp => ({
        ...comp,
        type: comp.type || "unknown",
        label: comp.label || comp.name,
        required: comp.required ?? false,
      })),
    })),
    database: (config.database || []).map(table => ({
      ...table,
      fields: (table.fields || []).map(field => ({
        ...field,
        label: field.label || field.name,
        required: field.required ?? false,
      })),
    })),
    apis: config.apis || [],
    settings: {
      theme: config.settings?.theme || "light",
      requireAuth: config.settings?.requireAuth ?? true,
      ...config.settings,
    },
  };

  return defaultConfig;
}

// Validate record against table schema
export function validateRecord(
  record: Record<string, unknown>, 
  table: TableConfig
): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  
  for (const field of table.fields) {
    const value = record[field.name];
    
    if (field.required && (value === undefined || value === null || value === "")) {
      errors[field.name] = `${field.label || field.name} is required`;
      continue;
    }

    if (value !== undefined && value !== null) {
      switch (field.type) {
        case "number":
          if (typeof value !== "number" && isNaN(Number(value))) {
            errors[field.name] = `${field.label || field.name} must be a number`;
          }
          break;
        case "email":
          if (typeof value !== "string" || !value.includes("@")) {
            errors[field.name] = `${field.label || field.name} must be a valid email`;
          }
          break;
        case "date":
          if (isNaN(Date.parse(String(value)))) {
            errors[field.name] = `${field.label || field.name} must be a valid date`;
          }
          break;
        case "boolean":
          if (typeof value !== "boolean" && value !== "true" && value !== "false") {
            errors[field.name] = `${field.label || field.name} must be true or false`;
          }
          break;
        case "enum":
          if (field.options && !field.options.includes(String(value))) {
            errors[field.name] = `${field.label || field.name} must be one of: ${field.options.join(", ")}`;
          }
          break;
      }

      if (field.validation) {
        if (field.validation.min !== undefined && Number(value) < field.validation.min) {
          errors[field.name] = `${field.label || field.name} must be at least ${field.validation.min}`;
        }
        if (field.validation.max !== undefined && Number(value) > field.validation.max) {
          errors[field.name] = `${field.label || field.name} must be at most ${field.validation.max}`;
        }
        if (field.validation.pattern && typeof value === "string") {
          const regex = new RegExp(field.validation.pattern);
          if (!regex.test(value)) {
            errors[field.name] = `${field.label || field.name} format is invalid`;
          }
        }
      }
    }
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

// Convert value to correct type based on field config
export function coerceValue(value: unknown, fieldType: string): unknown {
  if (value === null || value === undefined) return value;
  
  switch (fieldType) {
    case "number":
      const num = Number(value);
      return isNaN(num) ? 0 : num;
    case "boolean":
      if (typeof value === "boolean") return value;
      return value === "true" || value === true || value === 1 || value === "1";
    case "date":
      const date = new Date(value as string);
      return isNaN(date.getTime()) ? null : date.toISOString();
    default:
      return String(value);
  }
}
