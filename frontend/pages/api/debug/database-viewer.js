import { getConnection } from '@/lib/db';

export default async function handler(req, res) {
  let db;
  
  try {
    db = await getConnection();
    
    // Get all purchase orders with related data
    const [orders] = await db.execute(`
      SELECT 
        po.id,
        po.po_number,
        po.vendor_id,
        po.project_id,
        po.created_by,
        po.order_date,
        po.total_amount,
        po.status,
        po.created_at,
        v.name as vendor_name,
        COUNT(poi.id) as item_count
      FROM purchase_orders po
      LEFT JOIN vendors v ON po.vendor_id = v.id
      LEFT JOIN po_items poi ON po.id = poi.po_id
      GROUP BY po.id
      ORDER BY po.created_at DESC
    `);
    
    // Get all items
    const [items] = await db.execute(`
      SELECT 
        poi.*,
        po.po_number
      FROM po_items poi
      JOIN purchase_orders po ON poi.po_id = po.id
      ORDER BY poi.po_id, poi.id
    `);
    
    // Get database statistics
    const [stats] = await db.execute(`
      SELECT 
        (SELECT COUNT(*) FROM purchase_orders) as total_purchase_orders,
        (SELECT COUNT(*) FROM po_items) as total_items,
        (SELECT COUNT(*) FROM vendors WHERE status = 'active') as active_vendors,
        (SELECT COUNT(*) FROM projects) as total_projects,
        (SELECT COUNT(*) FROM employees) as total_employees
    `);
    
    return res.status(200).json({
      success: true,
      data: {
        purchase_orders: orders,
        items: items,
        statistics: stats[0],
        message: orders.length > 0 ? 
          `Found ${orders.length} purchase orders in database` : 
          'No purchase orders found in database'
      }
    });
    
  } catch (error) {
    console.error('Database viewer error:', error);
    return res.status(500).json({
      error: 'Database error',
      message: error.message
    });
  } finally {
    if (db) {
      db.release();
    }
  }
}
