const Inventory = require("../models/InventoryModel");
const Expense = require("../models/expenseModel");

const buildInventoryTitle = (item) => {
  if (item.messItem) return `${item.messItem.replace(/_/g, " ")} (${item.category})`;
  if (item.itemType) return `${item.itemType.replace(/_/g, " ")} (${item.category})`;
  return item.category || "Inventory Purchase";
};

const upsertInventoryExpense = async (inventoryItem) => {
  const title = buildInventoryTitle(inventoryItem);
  const expenseData = {
    sourceType: "inventory",
    inventory: inventoryItem._id,
    title,
    category: inventoryItem.category,
    amount: inventoryItem.totalPrice || 0,
    date: inventoryItem.purchase_date || new Date(),
    supplier: inventoryItem.supplier,
    description: inventoryItem.description || "",
  };

  await Expense.findOneAndUpdate(
    { inventory: inventoryItem._id },
    expenseData,
    { upsert: true, new: true }
  );
};

const addInventory = async (req, res) => {
  try {
    const {
      supplier,
      location,
      unitPrice,
      quantity,
      discount,
      category,
      condition,
      itemType,
      messSubCategory,
      messItem,
      purchase_date,
      unit,
      description,
    } = req.body;

    const newInventoryItem = new Inventory({
      supplier,
      location,
      unitPrice,
      quantity,
      discount,
      category,
      condition,
      itemType,
      messSubCategory,
      messItem,
      purchase_date,
      unit,
      description,
    });

    const savedItem = await newInventoryItem.save();

    // Mirror as expense
    await upsertInventoryExpense(savedItem);

    res.status(201).json({ success: true, data: savedItem });
  } catch (error) {
    console.error("❌ Error adding inventory item:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to add inventory item" });
  }
};

const getAllInventory = async (req, res) => {
  try {
    const inventoryItems = await Inventory.find();
    res.status(200).json({ success: true, data: inventoryItems });
  } catch (error) {
    console.error("❌ Error fetching inventory items:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch inventory items" });
  }
};

const getFilteredInventory = async (req, res) => {
  try {
    const { category, purchase_date } = req.query;

    // At least one filter must be provided
    if (!category && !purchase_date) {
      return res.status(400).json({
        success: false,
        message: "At least one filter (category or purchase_date) is required",
      });
    }

    // Build query dynamically
    const query = {};

    if (category) {
      query.category = category;
    }

    if (purchase_date) {
      // purchase_date comes as "YYYY-MM-DD" string from the date input
      const start = new Date(purchase_date);
      start.setHours(0, 0, 0, 0);

      const end = new Date(purchase_date);
      end.setHours(23, 59, 59, 999);

      query.purchase_date = { $gte: start, $lte: end };
    }

    const items = await Inventory.find(query).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: items.length,
      data: items,
    });
  } catch (error) {
    console.error("Error fetching filtered inventory:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const updateInventory = async (req, res) => {
  try {
    const inventoryitem = await Inventory.findById(req.params.id);
    if (!inventoryitem) {
      console.log("inventoryitem not found:", req.params.id);
      res.status(404);
      throw new Error("inventoryitem not found");
    }

    const {
      supplier,
      location,
      unitPrice,
      quantity,
      discount,
      category,
      condition,
      itemType,
      messSubCategory,
      messItem,
      purchase_date,
      unit,
      description,
    } = req.body;

    // Update fields only if provided in request body
    inventoryitem.supplier = supplier ?? inventoryitem.supplier;
    inventoryitem.location = location ?? inventoryitem.location;
    inventoryitem.unitPrice = unitPrice ?? inventoryitem.unitPrice;
    inventoryitem.quantity = quantity ?? inventoryitem.quantity;
    inventoryitem.discount = discount ?? inventoryitem.discount;
    inventoryitem.category = category ?? inventoryitem.category;
    inventoryitem.condition = condition ?? inventoryitem.condition;
    inventoryitem.itemType = itemType ?? inventoryitem.itemType;
    inventoryitem.messSubCategory =
      messSubCategory ?? inventoryitem.messSubCategory;
    inventoryitem.messItem = messItem ?? inventoryitem.messItem;
    inventoryitem.purchase_date = purchase_date ?? inventoryitem.purchase_date;
    inventoryitem.unit = unit ?? inventoryitem.unit;
    inventoryitem.description = description ?? inventoryitem.description;

    await inventoryitem.save();

    // Sync mirrored expense
    await upsertInventoryExpense(inventoryitem);

    res.status(200).json({
      success: true,
      message: "Inventory item updated successfully",
      data: inventoryitem,
    });
  } catch (error) {
    console.error(" Error updating inventory item:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to update inventory item" });
  }
};

const deleteInventory = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id);
    const deletedItem = await Inventory.findByIdAndDelete(id);

    if (!deletedItem) {
      console.log("not deleting console log");
      return res
        .status(404)
        .json({ success: false, message: "Inventory item not found" });
    }

    // Remove mirrored expense
    await Expense.deleteOne({ inventory: id });

    res.status(200).json({
      success: true,
      message: "Inventory item deleted successfully",
      data: deletedItem,
    });
  } catch (error) {
    console.error("❌ Error deleting inventory item:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to delete inventory item" });
  }
};

module.exports = {
  addInventory,
  getAllInventory,
  getFilteredInventory,
  updateInventory,
  deleteInventory,
};
