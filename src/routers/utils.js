import express from 'express';
import { localities, presentations, productTypes } from '../constants.js';
import auth from '../middlewares/auth.js';
import Customer from '../models/customer.js';
import logger from '../utils/logger.js';
import { toTitleCase } from '../utils.js';

const utilsRouter = express.Router();

// Get Localities
utilsRouter.get('/localities', (req, res) => {
  res.status(200).send(localities);
});

// Get Presentations
utilsRouter.get('/presentations', (req, res) => {
  res.status(200).send(presentations);
});

// Get Product types
utilsRouter.get('/productTypes', (req, res) => {
  res.status(200).send(productTypes);
});

// Helper function to parse CSV content
function parseCSV(csvContent) {
  const lines = csvContent.split(/\r?\n/);
  const values = [];
  
  for (const line of lines) {
    if (!line.trim()) continue; // Skip empty lines
    
    // Simple CSV parsing - handles quoted fields
    const row = [];
    let currentField = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          // Escaped quote
          currentField += '"';
          i++;
        } else {
          // Toggle quote state
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        // End of field
        row.push(currentField.trim());
        currentField = '';
      } else {
        currentField += char;
      }
    }
    
    // Add the last field
    row.push(currentField.trim());
    values.push(row);
  }
  
  return values;
}

utilsRouter.post(
  '/uploadCustomers',
  auth,
  express.raw({ type: '*/*', limit: '5mb' }),
  async (req, res) => {
    try {
      if (!req.body || req.body.length === 0) {
        return res.status(400).send({ error: 'No file uploaded' });
      }

      // Parse CSV file content from binary body
      const csvContent = req.body.toString('utf-8');
      const values = parseCSV(csvContent);

      let number = 0;
      for (let index = 0; index < values.length; index++) {
        try {
          if (!values[index][0] || values[index][0] === 'Fecha') {
            logger.info({ index, userId: req.user._id }, 'Skipping empty or header row');
            continue;
          }
          const customerToSend = { user: req.user._id };
          if (values[index][1]) {
            customerToSend.storeName = toTitleCase(values[index][1]);
          }
          if (values[index][2]) {
            customerToSend.idNumber = values[index][2];
          }
          if (values[index][3]) {
            customerToSend.name = toTitleCase(values[index][3]);
          }
          if (values[index][4]) {
            customerToSend.address = values[index][4];
          }
          customerToSend.phoneNumber = values[index][5]
            ? values[index][5]
            : '0000000000';
          if (values[index][6]) {
            customerToSend.email = values[index][6];
          }
          if (values[index][7]) {
            customerToSend.town = values[index][7];
          }

          // Validate that customer name doesn't already exist for this user
          if (customerToSend.name) {
            const existingCustomer = await Customer.findOne({
              storeName: customerToSend.storeName,
              user: req.user._id,
            });
            if (existingCustomer) {
              logger.info(
                { name: customerToSend.name, index, userId: req.user._id },
                'Skipping duplicate customer name'
              );
              continue;
            }
          }

          const customer = new Customer(customerToSend);
          await customer.save();
          number++;
        } catch (e) {
          logger.error({ error: e, index, userId: req.user._id }, 'Error saving customer');
        }
      }
      res.status(200).send(`Se guardaron ${number} nuevos clientes`);
    } catch (error) {
      logger.error({ error, userId: req.user._id }, 'Error processing CSV file');
      res.status(400).send({ error: error.message || 'Error processing CSV file' });
    }
  }
);

export default utilsRouter;
