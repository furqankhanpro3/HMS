const Expense = require("../models/expenseModel");

const parseDate = (value) => {
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
};

/**
 * GET /api/expenses
 * Query: page, limit, from, to, category, sourceType, search
 */
const getExpenses = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      from,
      to,
      category,
      sourceType,
      search,
    } = req.query;

    const filter = {};

    if (from || to) {
      filter.date = {};
      const fromDate = parseDate(from);
      const toDate = parseDate(to);
      if (fromDate) filter.date.$gte = fromDate;
      if (toDate) {
        toDate.setHours(23, 59, 59, 999);
        filter.date.$lte = toDate;
      }
    }

    if (category) filter.category = category;
    if (sourceType) filter.sourceType = sourceType;

    if (search?.trim()) {
      filter.$or = [
        { title: { $regex: search.trim(), $options: "i" } },
        { supplier: { $regex: search.trim(), $options: "i" } },
      ];
    }

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [expenses, total] = await Promise.all([
      Expense.find(filter)
        .sort({ date: -1, createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Expense.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: expenses,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error("getExpenses error:", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

const createExpense = async (req, res) => {
  try {
    const { title, category, amount, date, paymentMethod, description } = req.body;

    if (!title?.trim() || !category?.trim() || amount === undefined || amount === null || amount === "") {
      return res.status(400).json({
        success: false,
        message: "title, category, and amount are required.",
      });
    }

    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount < 0) {
      return res.status(400).json({ success: false, message: "amount must be a positive number." });
    }

    const expense = await Expense.create({
      sourceType: "custom",
      title: title.trim(),
      category: category.trim(),
      amount: numericAmount,
      date: date ? new Date(date) : new Date(),
      paymentMethod: paymentMethod?.trim() || "",
      description: description?.trim() || "",
    });

    return res.status(201).json({ success: true, data: expense });
  } catch (error) {
    console.error("createExpense error:", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

const updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const expense = await Expense.findById(id);

    if (!expense) {
      return res.status(404).json({ success: false, message: "Expense not found." });
    }

    if (expense.sourceType === "inventory") {
      return res.status(403).json({
        success: false,
        message: "Inventory-linked expenses cannot be edited. Update the inventory item instead.",
      });
    }

    const { title, category, amount, date, paymentMethod, description } = req.body;

    if (title !== undefined) expense.title = title.trim();
    if (category !== undefined) expense.category = category.trim();
    if (amount !== undefined) {
      const numericAmount = Number(amount);
      if (isNaN(numericAmount) || numericAmount < 0) {
        return res.status(400).json({ success: false, message: "amount must be a positive number." });
      }
      expense.amount = numericAmount;
    }
    if (date !== undefined) expense.date = new Date(date);
    if (paymentMethod !== undefined) expense.paymentMethod = paymentMethod?.trim() || "";
    if (description !== undefined) expense.description = description?.trim() || "";

    await expense.save();

    return res.status(200).json({ success: true, data: expense });
  } catch (error) {
    console.error("updateExpense error:", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const expense = await Expense.findById(id);

    if (!expense) {
      return res.status(404).json({ success: false, message: "Expense not found." });
    }

    if (expense.sourceType === "inventory") {
      return res.status(403).json({
        success: false,
        message: "Inventory-linked expenses cannot be deleted. Delete the inventory item instead.",
      });
    }

    await Expense.findByIdAndDelete(id);

    return res.status(200).json({ success: true, message: "Expense deleted successfully." });
  } catch (error) {
    console.error("deleteExpense error:", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

module.exports = {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
};
