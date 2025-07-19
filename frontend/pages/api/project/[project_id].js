import { connectToDB } from '@/lib/db';

export default async function handler(req, res) {
  let db;

  try {
    db = await connectToDB();
    const { id } = req.query; // Get project ID if provided

    if (req.method === 'GET') {
      if (id) {
        // Fetch a single project by ID
        const [project] = await db.query(
          `SELECT p.*, c.cname 
           FROM project p
           LEFT JOIN customer c ON p.cid = c.cid
           WHERE p.pid = ?`,
          [id]
        );

        if (project.length === 0) {
          return res.status(404).json({ error: 'Project not found' });
        }

        return res.status(200).json(project[0]); // Return single project
      } else {
        // Fetch all projects
        const [projects] = await db.query(
          `SELECT p.*, c.cname 
           FROM project p
           LEFT JOIN customer c ON p.cid = c.cid
           ORDER BY p.start_date DESC`
        );

        return res.status(200).json(projects);
      }
    }

    if (req.method === 'POST') {
      const { pname, start_date, end_date, status, cid } = req.body;

      if (!pname || !start_date || !end_date || !cid) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const [result] = await db.query(
        `INSERT INTO project (pname, start_date, end_date, status, cid)
         VALUES (?, ?, ?, ?, ?)`,
        [pname, start_date, end_date, status || 'Pending', cid]
      );

      const [newProject] = await db.query(
        `SELECT p.*, c.cname 
         FROM project p
         LEFT JOIN customer c ON p.cid = c.cid
         WHERE p.pid = ?`,
        [result.insertId]
      );

      return res.status(201).json(newProject[0]);
    }

    if (req.method === 'PUT') {
      if (!id) {
        return res.status(400).json({ error: 'Project ID is required' });
      }

      const updates = [];
      const params = [];

      Object.entries(req.body).forEach(([key, value]) => {
        if (
          ['pname', 'start_date', 'end_date', 'status', 'cid'].includes(key) &&
          value !== undefined
        ) {
          updates.push(`${key} = ?`);
          params.push(value);
        }
      });

      if (updates.length === 0) {
        return res.status(400).json({ error: 'No valid fields to update' });
      }

      params.push(id);
      await db.query(
        `UPDATE project SET ${updates.join(', ')} WHERE pid = ?`,
        params
      );

      const [updatedProject] = await db.query(
        `SELECT p.*, c.cname 
         FROM project p
         LEFT JOIN customer c ON p.cid = c.cid
         WHERE p.pid = ?`,
        [id]
      );

      return res.status(200).json(updatedProject[0]);
    }

    if (req.method === 'DELETE') {
      if (!id) {
        return res.status(400).json({ error: 'Project ID is required' });
      }

      await db.query('DELETE FROM project WHERE pid = ?', [id]);
      return res
        .status(200)
        .json({ success: true, message: 'Project deleted' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    if (db) db.release(); // Ensure DB connection is released
  }
}
