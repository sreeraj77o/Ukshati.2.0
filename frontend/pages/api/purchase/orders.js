import { authenticate } from '../../../lib/auth';
import { getConnection } from '../../../lib/db';

// Validation helper functions
function validatePurchaseOrderData(data) {
  const errors = [];

  if (!data.vendor_id) {
    errors.push('Vendor is required');
  }

  if (!data.project_id) {
    errors.push('Project is required');
  }

  if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
    errors.push('At least one item is required');
  }

  if (data.items) {
    data.items.forEach((item, index) => {
      if (!item.item_name || item.item_name.trim() === '') {
        errors.push(`Item ${index + 1}: Item name is required`);
      }
      if (!item.quantity || item.quantity <= 0) {
        errors.push(`Item ${index + 1}: Valid quantity is required`);
      }
      if (!item.unit_price || item.unit_price < 0) {
        errors.push(`Item ${index + 1}: Valid unit price is required`);
      }
    });
  }

  if (!data.total_amount || data.total_amount <= 0) {
    errors.push('Valid total amount is required');
  }

  return errors;
}

export default async function handler(req, res) {
  console.log('=== PURCHASE ORDER API CALLED ===');
  console.log('Method:', req.method);
  console.log('Environment variables:');
  console.log('- DB_HOST:', process.env.DB_HOST);
  console.log('- DB_USER:', process.env.DB_USER);
  console.log('- DB_NAME:', process.env.DB_NAME);
  console.log('- DB_PORT:', process.env.DB_PORT);

  // Authenticate user using JWT token
  let user;
  try {
    user = await authenticate(req);
    console.log('✅ Authentication successful for user:', user.userId);
  } catch (error) {
    console.error('❌ Authentication error:', error.message);
    return res.status(401).json({ error: 'Unauthorized' });
  }

  let db = null;

  try {
    console.log('Attempting to connect to database...');
    db = await getConnection();
    console.log('✅ Database connection established for purchase orders API');

    // Test database connection
    console.log('Testing database connection...');
    await db.execute('SELECT 1');
    console.log('✅ Database connection test successful');
    switch (req.method) {
      case 'GET':
        // Get all purchase orders or filter by ID
        if (req.query.id) {
          // Try with new table structure first
          let order = [];
          try {
            [order] = await db.execute(
              `SELECT po.*, po.count(*) as orders_count, p.name as project_name, v.name as vendor_name,
                      e.name as created_by_name
               FROM purchase_orders po
               JOIN projects p ON po.project_id = p.id
               JOIN vendors v ON po.vendor_id = v.id
               JOIN employees e ON po.created_by = e.id
               WHERE po.id = ?`,
              [req.query.id]
            );
          } catch (error) {
            console.log(
              'New table structure failed, trying old table structure:',
              error.message
            );
            // Fallback to old table structure
            try {
              [order] = await db.execute(
                `SELECT po.*, p.pname as project_name, v.name as vendor_name,
                        e.name as created_by_name
                 FROM purchase_orders po
                 JOIN project p ON po.project_id = p.pid
                 JOIN vendors v ON po.vendor_id = v.id
                 JOIN employee e ON po.created_by = e.id
                 WHERE po.id = ?`,
                [req.query.id]
              );
            } catch (fallbackError) {
              console.log(
                'Both table structures failed:',
                fallbackError.message
              );
              return res.status(500).json({ error: 'Database schema issue' });
            }
          }

          if (order.length === 0) {
            return res.status(404).json({ error: 'Purchase order not found' });
          }

          const [items] = await db.execute(
            `SELECT * FROM po_items WHERE po_id = ?`,
            [req.query.id]
          );

          return res.status(200).json({
            order: order[0],
            items,
          });
        } else {
          // Try with new table structure first
          let orders = [];
          try {
            [orders] = await db.execute(
              `SELECT po.*, p.name as project_name, v.name as vendor_name
               FROM purchase_orders po
               JOIN projects p ON po.project_id = p.id
               JOIN vendors v ON po.vendor_id = v.id
               ORDER BY po.created_at DESC`
            );
          } catch (error) {
            console.log(
              'New table structure failed for orders list, trying old table structure:',
              error.message
            );
            // Fallback to old table structure
            try {
              [orders] = await db.execute(
                `SELECT po.*, p.pname as project_name, v.name as vendor_name
                 FROM purchase_orders po
                 JOIN project p ON po.project_id = p.pid
                 JOIN vendors v ON po.vendor_id = v.id
                 ORDER BY po.created_at DESC`
              );
            } catch (fallbackError) {
              console.log(
                'Both table structures failed for orders list:',
                fallbackError.message
              );
              return res.status(500).json({ error: 'Database schema issue' });
            }
          }

          return res.status(200).json(orders);
        }

      case 'POST':
        // Create new purchase order
        const {
          requisition_id,
          vendor_id,
          project_id,
          items,
          expected_delivery_date,
          shipping_address,
          payment_terms,
          subtotal,
          tax_amount,
          total_amount,
          notes,
        } = req.body;

        console.log('Creating purchase order with data:', {
          vendor_id,
          project_id,
          items_count: items?.length,
          total_amount,
          user_id: user.userId,
        });

        // Add detailed logging for debugging
        console.log('Full request body:', JSON.stringify(req.body, null, 2));

        // Verify user exists in the employees table (since foreign key references employees table)
        let actualUserId = user.userId;

        try {
          // Check if user exists in employees table first (new structure)
          let userCheck = [];
          try {
            [userCheck] = await db.execute(
              'SELECT id FROM employees WHERE id = ?',
              [user.userId]
            );
          } catch (error) {
            console.log(
              'New employees table not available, checking old employee table'
            );
          }

          // If not found in new table, check old employee table
          if (userCheck.length === 0) {
            try {
              [userCheck] = await db.execute(
                'SELECT id FROM employee WHERE id = ?',
                [user.userId]
              );
            } catch (error) {
              console.log(
                'Old employee table also not available:',
                error.message
              );
            }
          }

          if (userCheck.length > 0) {
            console.log(
              'User found in employee/employees table with ID:',
              user.userId
            );
            actualUserId = user.userId;
          } else {
            console.log(
              'User not found in either employees or employee table:',
              user.userId
            );
            return res.status(400).json({
              error: 'Invalid user - user not found in employee database',
            });
          }
        } catch (error) {
          console.log('Error checking employee tables:', error.message);
          return res
            .status(500)
            .json({ error: 'Database error while verifying user' });
        }

        // Validate input data
        const validationErrors = validatePurchaseOrderData(req.body);
        if (validationErrors.length > 0) {
          console.log('Validation errors:', validationErrors);
          return res.status(400).json({
            error: 'Validation failed',
            details: validationErrors,
          });
        }

        // Verify vendor exists
        const [vendorCheck] = await db.execute(
          'SELECT id FROM vendors WHERE id = ? AND status = "active"',
          [vendor_id]
        );

        if (vendorCheck.length === 0) {
          console.log('Vendor not found or inactive:', vendor_id);
          return res.status(400).json({ error: 'Invalid or inactive vendor' });
        }

        // Verify project exists (prioritize new projects table since foreign key references it)
        let projectCheck = [];
        let usingNewProjectsTable = false;

        try {
          // Try new projects table first (this is what the foreign key references)
          [projectCheck] = await db.execute(
            'SELECT id FROM projects WHERE id = ?',
            [project_id]
          );

          if (projectCheck.length > 0) {
            console.log('Project found in projects table with ID:', project_id);
            usingNewProjectsTable = true;
          }
        } catch (error) {
          console.log(
            'New projects table not available, checking old project table:',
            error.message
          );
        }

        // If not found in new table, check old project table as fallback
        if (projectCheck.length === 0) {
          try {
            [projectCheck] = await db.execute(
              'SELECT pid as id FROM project WHERE pid = ?',
              [project_id]
            );

            if (projectCheck.length > 0) {
              console.log(
                'Project found in old project table with ID:',
                project_id
              );
              console.warn(
                'Warning: Using old project table but purchase_orders foreign key references projects table'
              );
              console.warn(
                'This may cause foreign key constraint violations during insertion'
              );
            }
          } catch (error) {
            console.log('Old project table also not available:', error.message);
          }
        }

        if (projectCheck.length === 0) {
          console.log(
            'Project not found in either projects or project table:',
            project_id
          );
          return res
            .status(400)
            .json({ error: 'Invalid project - project not found' });
        }

        // If using old project table, warn about potential issues
        if (!usingNewProjectsTable) {
          console.warn(
            'Purchase order creation may fail due to foreign key constraint mismatch'
          );
        }

        // Generate PO number (PO-YYYYMMDD-XXX)
        const date = new Date();
        const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');

        const [lastPO] = await db.execute(
          `SELECT po_number FROM purchase_orders
           WHERE po_number LIKE ?
           ORDER BY id DESC LIMIT 1`,
          [`PO-${dateStr}-%`]
        );

        let poNumber;
        if (lastPO.length === 0) {
          poNumber = `PO-${dateStr}-001`;
        } else {
          const lastNum = parseInt(lastPO[0].po_number.split('-')[2]);
          poNumber = `PO-${dateStr}-${(lastNum + 1).toString().padStart(3, '0')}`;
        }

        console.log('Generated PO number:', poNumber);

        // Start transaction
        console.log('🔄 Starting database transaction...');
        await db.beginTransaction();
        console.log('✅ Transaction started successfully');

        try {
          // Log all the values being inserted for debugging
          const insertValues = [
            poNumber,
            requisition_id || null,
            vendor_id,
            project_id,
            actualUserId,
            expected_delivery_date,
            shipping_address,
            payment_terms,
            subtotal,
            tax_amount || 0,
            total_amount,
            notes || null,
          ];

          console.log('Inserting purchase order with values:', {
            po_number: poNumber,
            requisition_id: requisition_id || null,
            vendor_id: vendor_id,
            project_id: project_id,
            created_by: actualUserId,
            expected_delivery_date: expected_delivery_date,
            shipping_address: shipping_address,
            payment_terms: payment_terms,
            subtotal: subtotal,
            tax_amount: tax_amount || 0,
            total_amount: total_amount,
            notes: notes || null,
          });

          console.log('🔄 Executing purchase order insertion...');
          const [result] = await db.execute(
            `INSERT INTO purchase_orders
             (po_number, requisition_id, vendor_id, project_id, created_by
             , expected_delivery_date, shipping_address,
              payment_terms, subtotal, tax_amount, total_amount, notes, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft')`,
            insertValues
          );

          const poId = result.insertId;
          console.log('✅ Purchase order created successfully with ID:', poId);
          console.log('✅ Insert result:', result);

          // Insert items
          console.log(`🔄 Inserting ${items.length} items...`);
          for (const [index, item] of items.entries()) {
            console.log(`🔄 Inserting item ${index + 1}:`, item.item_name);
            const itemResult = await db.execute(
              `INSERT INTO po_items
               (po_id, requisition_item_id, item_name, description,
                quantity, unit_price, unit, total_price, stock_id)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                poId,
                item.requisition_item_id || null,
                item.item_name,
                item.description || null,
                item.quantity,
                item.unit_price,
                item.unit || 'pcs',
                item.quantity * item.unit_price,
                item.stock_id || null,
              ]
            );
            console.log(
              `✅ Item ${index + 1} inserted with ID:`,
              itemResult[0].insertId
            );
          }

          console.log(
            `✅ Successfully inserted ${items.length} items for PO ${poId}`
          );

          // If created from requisition, update requisition status
          if (requisition_id) {
            console.log('Updating requisition status:', requisition_id);
            await db.execute(
              `UPDATE purchase_requisitions SET status = 'converted' WHERE id = ?`,
              [requisition_id]
            );
          }

          console.log('🔄 Committing transaction...');
          await db.commit();
          console.log(
            '✅ Transaction committed successfully - Purchase order saved to database!'
          );

          console.log('🎉 Purchase order creation completed successfully!');
          console.log('📊 Final result:', {
            id: poId,
            po_number: poNumber,
            items_count: items.length,
          });

          return res.status(201).json({
            success: true,
            id: poId,
            po_number: poNumber,
            message: 'Purchase order created successfully',
          });
        } catch (insertError) {
          console.error('Error during purchase order creation:', insertError);
          await db.rollback();
          console.log('Transaction rolled back');
          throw insertError;
        }
      case 'PUT':
        // Update existing purchase order
        const orderId = req.query.id;
        if (!orderId) {
          return res
            .status(400)
            .json({ error: 'Order ID is required for update' });
        }

        const {
          vendor_id: updateVendorId,
          project_id: updateProjectId,
          items: updateItems,
          expected_delivery_date: updateExpectedDeliveryDate,
          shipping_address: updateShippingAddress,
          payment_terms: updatePaymentTerms,
          subtotal: updateSubtotal,
          tax_amount: updateTaxAmount,
          total_amount: updateTotalAmount,
          notes: updateNotes,
        } = req.body;

        console.log('Updating purchase order with ID:', orderId);
        console.log('Update data:', {
          vendor_id: updateVendorId,
          project_id: updateProjectId,
          items_count: updateItems?.length,
          total_amount: updateTotalAmount,
        });

        // Validate required fields
        if (
          !updateVendorId ||
          !updateProjectId ||
          !updateItems ||
          updateItems.length === 0
        ) {
          return res.status(400).json({
            error:
              'Missing required fields: vendor_id, project_id, and items are required',
          });
        }

        // Validate items
        for (let i = 0; i < updateItems.length; i++) {
          const item = updateItems[i];
          if (!item.item_name || !item.quantity || !item.unit_price) {
            return res.status(400).json({
              error: `Item ${i + 1} is missing required fields: item_name, quantity, and unit_price are required`,
            });
          }
        }

        // User is already authenticated via JWT token, so allow the update
        console.log('Authenticated user updating purchase order:', user.userId);

        // Start transaction for update
        await db.beginTransaction();
        console.log('Transaction started for update');

        try {
          // Check if purchase order exists
          const [existingOrder] = await db.execute(
            'SELECT * FROM purchase_orders WHERE id = ?',
            [orderId]
          );

          if (existingOrder.length === 0) {
            await db.rollback();
            return res.status(404).json({ error: 'Purchase order not found' });
          }

          // Update purchase order
          await db.execute(
            `UPDATE purchase_orders SET
             vendor_id = ?, project_id = ?, expected_delivery_date = ?,
             shipping_address = ?, payment_terms = ?, subtotal = ?,
             tax_amount = ?, total_amount = ?, notes = ?,
             updated_at = CURRENT_TIMESTAMP
             WHERE id = ?`,
            [
              updateVendorId,
              updateProjectId,
              updateExpectedDeliveryDate,
              updateShippingAddress,
              updatePaymentTerms,
              updateSubtotal,
              updateTaxAmount || 0,
              updateTotalAmount,
              updateNotes || null,
              orderId,
            ]
          );

          console.log(' Purchase order updated successfully');

          // Delete existing items
          await db.execute('DELETE FROM po_items WHERE po_id = ?', [orderId]);
          console.log(' Existing items deleted');

          // Insert updated items
          for (const item of updateItems) {
            const totalPrice = Number(item.quantity) * Number(item.unit_price);
            await db.execute(
              `INSERT INTO po_items
               (po_id, item_name, description, quantity, unit, unit_price, total_price)
               VALUES (?, ?, ?, ?, ?, ?, ?)`,
              [
                orderId,
                item.item_name,
                item.description || null,
                Number(item.quantity),
                item.unit || 'pcs',
                Number(item.unit_price),
                totalPrice,
              ]
            );
          }

          console.log(' Updated items inserted successfully');

          // Commit transaction
          await db.commit();
          console.log(' Transaction committed successfully');

          return res.status(200).json({
            success: true,
            id: orderId,
            po_number: existingOrder[0].po_number,
            message: 'Purchase order updated successfully',
          });
        } catch (updateError) {
          console.error('Error during purchase order update:', updateError);
          await db.rollback();
          console.log('Transaction rolled back');
          throw updateError;
        }

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Purchase orders API error:', error);

    // Rollback transaction if it exists and is active
    if (db) {
      try {
        // Attempt to rollback any active transaction
        await db.rollback();
        console.log('Transaction rolled back due to error');
      } catch (rollbackError) {
        // Rollback might fail if no transaction is active, which is fine
        console.log(
          'Rollback attempted (may not have been in transaction):',
          rollbackError.message
        );
      }
    }

    // Return appropriate error response based on error type
    let statusCode = 500;
    let errorMessage = 'Database operation failed';

    if (error.code === 'ER_NO_SUCH_TABLE') {
      statusCode = 500;
      errorMessage = 'Database schema issue - table not found';
    } else if (error.code === 'ER_DUP_ENTRY') {
      statusCode = 409;
      errorMessage =
        'Duplicate entry - this purchase order number already exists';
    } else if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      statusCode = 400;
      errorMessage =
        'Invalid reference - vendor, project, or employee not found';
    } else if (error.code === 'ER_BAD_FIELD_ERROR') {
      statusCode = 500;
      errorMessage = 'Database schema issue - field not found';
    }

    return res.status(statusCode).json({
      error: errorMessage,
      message: error.message,
      code: error.code || 'UNKNOWN_ERROR',
    });
  } finally {
    // Always release the database connection
    if (db) {
      try {
        db.release();
        console.log('Database connection released');
      } catch (releaseError) {
        console.error('Error releasing database connection:', releaseError);
      }
    }
  }
}
