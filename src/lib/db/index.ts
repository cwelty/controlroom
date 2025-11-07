import { sql } from '@vercel/postgres';

export interface Task {
  id: number;
  title: string;
  created_at: string;
  tags: string[];
  template_id: number | null;
  source: string;
  is_public: boolean;
}

export interface Template {
  id: number;
  name: string;
  title_template: string;
  tags: string[];
  hotkey: string | null;
  default_placeholder: string | null;
  sort_order: number;
  created_at: string;
}

export interface CreateTaskData {
  title: string;
  tags?: string[];
  template_id?: number;
  is_public?: boolean;
}

export interface CreateTemplateData {
  name: string;
  title_template: string;
  tags?: string[];
  hotkey?: string;
  default_placeholder?: string;
  sort_order?: number;
}

export interface UpdateTemplateData extends Partial<CreateTemplateData> {
  id: number;
}

// Task operations
export async function createTask(data: CreateTaskData): Promise<Task> {
  const { title, tags = [], template_id = null, is_public = true } = data;
  
  const result = await sql`
    INSERT INTO tasks (title, tags, template_id, is_public)
    VALUES (${title}, ${tags as any}, ${template_id}, ${is_public})
    RETURNING *
  `;
  
  return result.rows[0] as Task;
}

export async function getRecentTasks(limit: number = 20, publicOnly: boolean = false): Promise<Task[]> {
  if (publicOnly) {
    const result = await sql`
      SELECT * FROM tasks 
      WHERE is_public = true 
      ORDER BY created_at DESC 
      LIMIT ${limit}
    `;
    return result.rows as Task[];
  }
  
  const result = await sql`
    SELECT * FROM tasks 
    ORDER BY created_at DESC 
    LIMIT ${limit}
  `;
  return result.rows as Task[];
}

export async function getTasksByMonth(year: number, month: number): Promise<Task[]> {
  const result = await sql`
    SELECT * FROM tasks 
    WHERE is_public = true 
    AND EXTRACT(YEAR FROM created_at) = ${year}
    AND EXTRACT(MONTH FROM created_at) = ${month}
    ORDER BY created_at DESC
  `;
  return result.rows as Task[];
}

export async function deleteTask(id: number): Promise<Task | null> {
  const result = await sql`
    DELETE FROM tasks 
    WHERE id = ${id}
    RETURNING *
  `;
  return result.rows[0] as Task || null;
}

export async function updateTaskVisibility(id: number, is_public: boolean): Promise<Task | null> {
  const result = await sql`
    UPDATE tasks 
    SET is_public = ${is_public}
    WHERE id = ${id}
    RETURNING *
  `;
  return result.rows[0] as Task || null;
}

// Template operations
export async function getTemplates(): Promise<Template[]> {
  const result = await sql`
    SELECT * FROM templates 
    ORDER BY sort_order ASC, created_at ASC
  `;
  return result.rows as Template[];
}

export async function createTemplate(data: CreateTemplateData): Promise<Template> {
  const { name, title_template, tags = [], hotkey = null, default_placeholder = null, sort_order = 0 } = data;
  
  const result = await sql`
    INSERT INTO templates (name, title_template, tags, hotkey, default_placeholder, sort_order)
    VALUES (${name}, ${title_template}, ${tags as any}, ${hotkey}, ${default_placeholder}, ${sort_order})
    RETURNING *
  `;
  
  return result.rows[0] as Template;
}

export async function updateTemplate(data: UpdateTemplateData): Promise<Template | null> {
  const { id, ...updates } = data;
  const fields = [];
  const values = [];
  
  if (updates.name !== undefined) {
    fields.push('name = $' + (fields.length + 2));
    values.push(updates.name);
  }
  if (updates.title_template !== undefined) {
    fields.push('title_template = $' + (fields.length + 2));
    values.push(updates.title_template);
  }
  if (updates.tags !== undefined) {
    fields.push('tags = $' + (fields.length + 2));
    values.push(updates.tags as any);
  }
  if (updates.hotkey !== undefined) {
    fields.push('hotkey = $' + (fields.length + 2));
    values.push(updates.hotkey);
  }
  if (updates.default_placeholder !== undefined) {
    fields.push('default_placeholder = $' + (fields.length + 2));
    values.push(updates.default_placeholder);
  }
  if (updates.sort_order !== undefined) {
    fields.push('sort_order = $' + (fields.length + 2));
    values.push(updates.sort_order);
  }
  
  if (fields.length === 0) return null;
  
  const query = `UPDATE templates SET ${fields.join(', ')} WHERE id = $1 RETURNING *`;
  const result = await sql.query(query, [id, ...values]);
  
  return result.rows[0] as Template || null;
}

export async function deleteTemplate(id: number): Promise<Template | null> {
  const result = await sql`
    DELETE FROM templates 
    WHERE id = ${id}
    RETURNING *
  `;
  return result.rows[0] as Template || null;
}

export async function reorderTemplates(templateIds: number[]): Promise<void> {
  for (let i = 0; i < templateIds.length; i++) {
    await sql`
      UPDATE templates 
      SET sort_order = ${i}
      WHERE id = ${templateIds[i]}
    `;
  }
}