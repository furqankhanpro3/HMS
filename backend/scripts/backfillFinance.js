const mongoose = require('mongoose');
const Inventory = require('../models/InventoryModel');
const Challan = require('../models/challanModel');
const Expense = require('../models/expenseModel');
const Income = require('../models/incomeModel');
const connectDB = require('../config/db');

require('dotenv').config();

const buildInventoryTitle = (item) => {
  if (item.messItem) return `${item.messItem.replace(/_/g, ' ')} (${item.category})`;
  if (item.itemType) return `${item.itemType.replace(/_/g, ' ')} (${item.category})`;
  return item.category || 'Inventory Purchase';
};

const buildChallanTitle = (challan) => {
  return `Boarding Fee — ${challan.boarderName} (${challan.feeMonth} ${challan.feeYear})`;
};

const backfill = async () => {
  try {
    await connectDB();

    // Backfill expenses from inventory
    const inventoryItems = await Inventory.find();
    console.log(`Found ${inventoryItems.length} inventory items to backfill`);

    for (const item of inventoryItems) {
      await Expense.findOneAndUpdate(
        { inventory: item._id },
        {
          sourceType: 'inventory',
          inventory: item._id,
          title: buildInventoryTitle(item),
          category: item.category,
          amount: item.totalPrice || 0,
          date: item.purchase_date || new Date(),
          supplier: item.supplier,
          description: item.description || '',
        },
        { upsert: true, new: true }
      );
    }

    // Backfill income from challans
    const challans = await Challan.find();
    console.log(`Found ${challans.length} challans to backfill`);

    for (const challan of challans) {
      await Income.findOneAndUpdate(
        { challan: challan._id },
        {
          sourceType: 'challan',
          challan: challan._id,
          title: buildChallanTitle(challan),
          category: 'boarding_fee',
          amount: challan.receivedAmount || 0,
          date: challan.receivingDate || new Date(),
          paymentMethod: challan.paymentMethod || '',
          status: challan.status || 'pending',
          description: challan.remarks || '',
        },
        { upsert: true, new: true }
      );
    }

    console.log('Backfill completed successfully');
    process.exit();
  } catch (error) {
    console.error('Backfill failed:', error);
    process.exit(1);
  }
};

backfill();
