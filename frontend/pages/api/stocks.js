import { connectToDB } from "../../lib/db";

export default async function handler(req, res) {
  let db;
  try {
    db = await connectToDB();

    if (req.method === "POST") {
      console.time("POST request processing time");

      const { category_name, productName, quantity, price } = req.body;
      if (!category_name || !productName || !quantity || !price) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const parsedQuantity = parseInt(quantity, 10);
      const parsedPrice = parseFloat(price);
      if (parsedQuantity <= 0 || parsedPrice <= 0) {
        return res.status(400).json({ error: "Quantity and price must be positive" });
      }

      const normalizedProductName = productName;

      const [categoryResult] = await db.query(
        "SELECT category_id FROM category WHERE category_name = ? LIMIT 1",
        [category_name.trim()]
      );
      const category = categoryResult[0];
      if (!category) return res.status(400).json({ error: "Category not found" });

      const categoryId = category.category_id;

      const [existingStock] = await db.query(
        "SELECT stock_id, quantity, price_pu FROM stock WHERE category_id = ? AND TRIM(LOWER(item_name)) = TRIM(LOWER(?)) LIMIT 1",
        [categoryId, productName]
      );

      if (existingStock.length > 0) {
        const stock = existingStock[0];
        const stockId = stock.stock_id;
        const oldQuantity = parseInt(stock.quantity);
        const oldPricePerUnit = parseFloat(stock.price_pu);
        const newQuantity = oldQuantity + parsedQuantity;

        const newPricePerUnit = oldPricePerUnit + parsedPrice; // You might want to update this with a weighted average

        await db.query(
          "UPDATE stock SET quantity = ?, price_pu = ? WHERE stock_id = ?",
          [newQuantity, newPricePerUnit, stockId]
        );

        console.timeEnd("POST request processing time");

        return res.status(200).json({ message: "Stock updated successfully" });
      } else {
        const [result] = await db.query(
          "INSERT INTO stock (item_name, category_id, quantity, price_pu) VALUES (?, ?, ?, ?)",
          [normalizedProductName, categoryId, parsedQuantity, parsedPrice]
        );

        console.timeEnd("POST request processing time");

        return res.status(201).json({ message: "Stock added successfully", stockId: result.insertId });
      }
    }

    else if (req.method === "GET") {
      console.time("GET request processing time");

      const {
        count = 'false',
        category_id,
        category_name,
        search,
        limit = 100,
        offset = 0,
        low_stock = 'false',
        low_stock_threshold = 10,
        format = 'default' // 'default' or 'view' for backward compatibility
      } = req.query;

      // ✅ Check if only count is requested
      if (count === "true") {
        let countQuery = "SELECT COUNT(*) as count FROM stock s";
        const countConditions = [];
        const countParams = [];

        if (category_id) {
          countConditions.push('s.category_id = ?');
          countParams.push(category_id);
        }

        if (category_name) {
          countQuery += " JOIN category c ON s.category_id = c.category_id";
          countConditions.push('c.category_name = ?');
          countParams.push(category_name);
        }

        if (search) {
          countConditions.push('s.item_name LIKE ?');
          countParams.push(`%${search}%`);
        }

        if (low_stock === 'true') {
          countConditions.push('s.quantity <= ?');
          countParams.push(parseInt(low_stock_threshold));
        }

        if (countConditions.length > 0) {
          countQuery += ' WHERE ' + countConditions.join(' AND ');
        }

        const [result] = await db.query(countQuery, countParams);
        console.timeEnd("GET request processing time");
        return res.status(200).json({ count: result[0].count });
      }

      // Build main query
      let query = `
        SELECT
          s.stock_id,
          s.item_name,
          s.quantity,
          s.price_pu,
          c.category_name,
          c.category_id,
          s.created_at,
          s.updated_at
      `;

      // Add format-specific fields
      if (format === 'view') {
        query = `
          SELECT
            s.stock_id,
            s.item_name AS productName,
            c.category_name AS categoryName,
            s.quantity,
            s.price_pu AS price
        `;
      }

      query += `
        FROM stock s
        JOIN category c ON s.category_id = c.category_id
      `;

      // Build WHERE conditions
      const conditions = [];
      const params = [];

      if (category_id) {
        conditions.push('s.category_id = ?');
        params.push(category_id);
      }

      if (category_name) {
        conditions.push('c.category_name = ?');
        params.push(category_name);
      }

      if (search) {
        conditions.push('s.item_name LIKE ?');
        params.push(`%${search}%`);
      }

      if (low_stock === 'true') {
        conditions.push('s.quantity <= ?');
        params.push(parseInt(low_stock_threshold));
      }

      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }

      query += ' ORDER BY s.stock_id DESC LIMIT ? OFFSET ?';
      params.push(parseInt(limit), parseInt(offset));

      const [stocks] = await db.query(query, params);

      console.timeEnd("GET request processing time");
      return res.status(200).json({
        success: true,
        data: stocks,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: stocks.length
        }
      });
    }

    else if (req.method === "PUT") {
      // Update stock
      const { stock_id, item_name, category_id, quantity, price_pu } = req.body;

      if (!stock_id) {
        return res.status(400).json({ error: "Stock ID is required" });
      }

      const updates = [];
      const params = [];

      if (item_name) {
        updates.push('item_name = ?');
        params.push(item_name);
      }

      if (category_id) {
        // Validate category exists
        const [categoryCheck] = await db.query('SELECT category_id FROM category WHERE category_id = ?', [category_id]);
        if (categoryCheck.length === 0) {
          return res.status(400).json({ error: 'Category not found' });
        }
        updates.push('category_id = ?');
        params.push(category_id);
      }

      if (quantity !== undefined) {
        updates.push('quantity = ?');
        params.push(parseInt(quantity));
      }

      if (price_pu !== undefined) {
        updates.push('price_pu = ?');
        params.push(parseFloat(price_pu));
      }

      if (updates.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
      }

      updates.push('updated_at = CURRENT_TIMESTAMP');
      params.push(stock_id);

      await db.query(
        `UPDATE stock SET ${updates.join(', ')} WHERE stock_id = ?`,
        params
      );

      return res.status(200).json({
        success: true,
        message: 'Stock updated successfully'
      });
    }

    else if (req.method === "DELETE") {
      // Delete stock
      const { stock_id } = req.query;

      if (!stock_id) {
        return res.status(400).json({ error: "Stock ID is required" });
      }

      // Check if stock is used in inventory_spent
      const [usageCheck] = await db.query(
        'SELECT COUNT(*) as count FROM inventory_spent WHERE stock_id = ?',
        [stock_id]
      );

      if (usageCheck[0].count > 0) {
        return res.status(400).json({
          error: 'Cannot delete stock item that has been used in projects',
          suggestion: 'Consider setting quantity to 0 instead'
        });
      }

      await db.query('DELETE FROM stock WHERE stock_id = ?', [stock_id]);

      return res.status(200).json({
        success: true,
        message: 'Stock deleted successfully'
      });
    }

    else {
      res.setHeader("Allow", ["POST", "GET", "PUT", "DELETE"]);
      return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error("Database error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  } finally {
    if (db) db.release(); // Make sure connection is returned to pool
  }
}