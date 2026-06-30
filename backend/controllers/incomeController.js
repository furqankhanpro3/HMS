const Income = require("../models/incomeModel");

const parseDate = (value) => {
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
};

/**
 * GET /api/income
 * Query: page, limit, from, to, category, paymentMethod, status, sourceType, search
 */
const getIncomes = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      from,
      to,
      category,
      paymentMethod,
      status,
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
    if (paymentMethod) filter.paymentMethod = paymentMethod;
    if (status) filter.status = status;
    if (sourceType) filter.sourceType = sourceType;

    if (search?.trim()) {
      filter.title = { $regex: search.trim(), $options: "i" };
    }

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [incomes, total] = await Promise.all([
      Income.find(filter)
        .sort({ date: -1, createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Income.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: incomes,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error("getIncomes error:", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

const createIncome = async (req, res) => {
  try {
    const { title, category, amount, date, paymentMethod, status, description } = req.body;

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

    const income = await Income.create({
      sourceType: "custom",
      title: title.trim(),
      category: category.trim(),
      amount: numericAmount,
      date: date ? new Date(date) : new Date(),
      paymentMethod: paymentMethod?.trim() || "",
      status: status || "paid",
      description: description?.trim() || "",
    });

    return res.status(201).json({ success: true, data: income });
  } catch (error) {
    console.error("createIncome error:", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

const updateIncome = async (req, res) => {
  try {
    const { id } = req.params;
    const income = await Income.findById(id);

    if (!income) {
      return res.status(404).json({ success: false, message: "Income not found." });
    }

    if (income.sourceType === "challan") {
      return res.status(403).json({
        success: false,
        message: "Challan-linked income cannot be edited. Update the challan instead.",
      });
    }

    const { title, category, amount, date, paymentMethod, status, description } = req.body;

    if (title !== undefined) income.title = title.trim();
    if (category !== undefined) income.category = category.trim();
    if (amount !== undefined) {
      const numericAmount = Number(amount);
      if (isNaN(numericAmount) || numericAmount < 0) {
        return res.status(400).json({ success: false, message: "amount must be a positive number." });
      }
      income.amount = numericAmount;
    }
    if (date !== undefined) income.date = new Date(date);
    if (paymentMethod !== undefined) income.paymentMethod = paymentMethod?.trim() || "";
    if (status !== undefined) income.status = status;
    if (description !== undefined) income.description = description?.trim() || "";

    await income.save();

    return res.status(200).json({ success: true, data: income });
  } catch (error) {
    console.error("updateIncome error:", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

const deleteIncome = async (req, res) => {
  try {
    const { id } = req.params;
    const income = await Income.findById(id);

    if (!income) {
      return res.status(404).json({ success: false, message: "Income not found." });
    }

    if (income.sourceType === "challan") {
      return res.status(403).json({
        success: false,
        message: "Challan-linked income cannot be deleted. Delete the challan instead.",
      });
    }

    await Income.findByIdAndDelete(id);

    return res.status(200).json({ success: true, message: "Income deleted successfully." });
  } catch (error) {
    console.error("deleteIncome error:", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

module.exports = {
  getIncomes,
  createIncome,
  updateIncome,
  deleteIncome,
};
