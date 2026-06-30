const Challan = require("../models/challanModel");
const Income = require("../models/incomeModel");
const Student = require("../models/studentModel");
const mongoose = require("mongoose");

// ─── Helpers ────────────────────────────────────────────────────────────────

// Index 0 unused so month number maps directly: MONTH_NAMES[1] === "January"
const MONTH_NAMES = [
  "", "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// "January" → 1 | "january" → 1 | unknown → -1
const monthNameToIndex = (name) => {
  if (!name) return -1;
  return MONTH_NAMES.findIndex(
    (m) => m.toLowerCase() === name.trim().toLowerCase()
  );
};

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const currentYear = () => new Date().getFullYear();

const buildChallanTitle = (challan) => {
  return `Boarding Fee — ${challan.boarderName} (${challan.feeMonth} ${challan.feeYear})`;
};

const upsertChallanIncome = async (challan) => {
  const title = buildChallanTitle(challan);
  const incomeData = {
    sourceType: "challan",
    challan: challan._id,
    title,
    category: "boarding_fee",
    amount: challan.receivedAmount || 0,
    date: challan.receivingDate || new Date(),
    paymentMethod: challan.paymentMethod || "",
    status: challan.status || "pending",
    description: challan.remarks || "",
  };

  await Income.findOneAndUpdate(
    { challan: challan._id },
    incomeData,
    { upsert: true, new: true }
  );
};

// ─── CREATE Challan ──────────────────────────────────────────────────────────

/**
 * POST /api/challans
 * Creates a new fee challan after full validation.
 */
const createChallan = async (req, res) => {
  try {
    const {
      boardingNo, boarderName, fatherName, contact,
      totalAmount, receivedAmount, paymentMethod, transactionNo, walletProvider,
      feeMonth, feeYear, receivingDate, dueDate, remarks,
    } = req.body;

    // ── Required field checks ──────────────────────────────────────────────
    const requiredFields = {
      boardingNo, boarderName, fatherName, contact,
      totalAmount, receivedAmount, paymentMethod, feeMonth, feeYear,
    };

    const missing = Object.entries(requiredFields)
      .filter(([, v]) => v === undefined || v === null || v === "")
      .map(([k]) => k);

    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missing.join(", ")}`,
      });
    }

    // ── Amount checks ──────────────────────────────────────────────────────
    const total = Number(totalAmount);
    const received = Number(receivedAmount);

    if (isNaN(total) || total <= 0) {
      return res.status(400).json({ success: false, message: "totalAmount must be a positive number." });
    }
    if (isNaN(received) || received < 0) {
      return res.status(400).json({ success: false, message: "receivedAmount must be zero or a positive number." });
    }
    if (received > total) {
      return res.status(400).json({ success: false, message: "receivedAmount cannot exceed totalAmount." });
    }

    // ── feeMonth: must be a valid month name string ────────────────────────
    const monthIndex = monthNameToIndex(feeMonth); // e.g. "January" → 1
    if (monthIndex === -1) {
      return res.status(400).json({
        success: false,
        message: `feeMonth must be a valid month name (e.g. "January"). Received: "${feeMonth}".`,
      });
    }

    // ── feeYear: numeric, reasonable range ────────────────────────────────
    const year = Number(feeYear);
    if (isNaN(year) || year < 2000 || year > currentYear() + 1) {
      return res.status(400).json({
        success: false,
        message: `feeYear must be between 2000 and ${currentYear() + 1}.`,
      });
    }

    // ── Payment method check ───────────────────────────────────────────────
    const validMethods = ["cash", "bank_transfer", "cheque", "mobile_wallet"];
    if (!validMethods.includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: `paymentMethod must be one of: ${validMethods.join(", ")}.`,
      });
    }

    // ── Conditional payment field validation ───────────────────────────────
    if (["bank_transfer", "cheque"].includes(paymentMethod) && !transactionNo?.trim()) {
      return res.status(400).json({
        success: false,
        message: "transactionNo is required for bank transfer and cheque payments.",
      });
    }

    if (paymentMethod === "mobile_wallet") {
      if (!walletProvider?.trim()) {
        return res.status(400).json({
          success: false,
          message: "walletProvider is required for mobile wallet payments (e.g. EasyPaisa, JazzCash).",
        });
      }
      if (!transactionNo?.trim()) {
        return res.status(400).json({
          success: false,
          message: "transactionNo is required for mobile wallet payments.",
        });
      }
    }

    // ── Date checks ────────────────────────────────────────────────────────
    const parsedReceivingDate = receivingDate ? new Date(receivingDate) : new Date();
    const parsedDueDate = dueDate ? new Date(dueDate) : null;

    if (isNaN(parsedReceivingDate.getTime())) {
      return res.status(400).json({ success: false, message: "receivingDate is not a valid date." });
    }
    if (parsedDueDate && isNaN(parsedDueDate.getTime())) {
      return res.status(400).json({ success: false, message: "dueDate is not a valid date." });
    }

    // ── Future fee period check (allow max 1 month ahead) ─────────────────
    const now = new Date();
    const feeDate = new Date(year, monthIndex - 1); // monthIndex is 1-based
    const maxAllowed = new Date(now.getFullYear(), now.getMonth() + 1);
    if (feeDate > maxAllowed) {
      return res.status(400).json({
        success: false,
        message: `Cannot create a challan for a future fee period (${feeMonth} ${year}).`,
      });
    }

    // ── Duplicate check ────────────────────────────────────────────────────
    const duplicate = await Challan.findOne({
      boardingNo: boardingNo.trim(),
      feeMonth: feeMonth.trim(), // string query e.g. "January"
      feeYear: year,
    });

    if (duplicate) {
      return res.status(409).json({
        success: false,
        message: `A challan for boarding no. "${boardingNo}" already exists for ${feeMonth} ${year}.`,
        existingChallanId: duplicate._id,
      });
    }

    // ── Create ─────────────────────────────────────────────────────────────
    const challan = await Challan.create({
      boardingNo: boardingNo.trim(),
      boarderName: boarderName.trim(),
      fatherName: fatherName.trim(),
      contact: contact.trim(),
      totalAmount: total,
      receivedAmount: received,
      paymentMethod,
      transactionNo: transactionNo?.trim() || null,
      walletProvider: paymentMethod === "mobile_wallet" ? walletProvider.trim() : null,
      feeMonth: feeMonth.trim(),  // stored as string e.g. "January"
      feeYear: year,
      receivingDate: parsedReceivingDate,
      dueDate: parsedDueDate,
      remarks: remarks?.trim() || "",
    });

    // Mirror as income
    await upsertChallanIncome(challan);

    return res.status(201).json({
      success: true,
      message: "Challan created successfully.",
      data: challan,
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "A challan for this boarder and fee period already exists.",
      });
    }
    console.error("createChallan error:", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// ─── GET ALL Challans ────────────────────────────────────────────────────────

/**
 * GET /api/challans
 * Supports filters: boardingNo, feeMonth, feeYear, status, paymentMethod
 * Supports pagination: page, limit
 * Supports sorting: sortBy, order (asc/desc)
 */
const getAllChallans = async (req, res) => {
  try {
    const {
      boardingNo, boarderName, feeMonth, feeYear, status, paymentMethod,
      page = 1, limit = 20,
      sortBy = "createdAt", order = "desc",
    } = req.query;

    const filter = {};
    if (boardingNo)    filter.boardingNo = { $regex: boardingNo.trim(), $options: "i" };
    if (boarderName)   filter.boarderName = { $regex: boarderName.trim(), $options: "i" };
    if (feeMonth)      filter.feeMonth = feeMonth.trim();  // string match e.g. "January"
    if (feeYear)       filter.feeYear = Number(feeYear);
    if (status)        filter.status = status;
    if (paymentMethod) filter.paymentMethod = paymentMethod;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;
    const sortOrder = order === "asc" ? 1 : -1;

    const [challans, total] = await Promise.all([
      Challan.find(filter)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Challan.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: challans,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });

  } catch (error) {
    console.error("getAllChallans error:", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// ─── GET MY Challans ─────────────────────────────────────────────────────────

/**
 * GET /api/challans/me
 * Returns challans for the logged-in student based on boarding number.
 */
const getMyChallans = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user._id });

    if (!student) {
      return res.status(404).json({ success: false, message: "Student profile not found." });
    }

    const challans = await Challan.find({ boardingNo: student.boardingNumber })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({ success: true, data: challans });

  } catch (error) {
    console.error("getMyChallans error:", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// ─── GET SINGLE Challan ──────────────────────────────────────────────────────

/**
 * GET /api/challans/:id
 */
const getChallanById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid challan ID." });
    }

    const challan = await Challan.findById(id).lean();

    if (!challan) {
      return res.status(404).json({ success: false, message: "Challan not found." });
    }

    return res.status(200).json({ success: true, data: challan });

  } catch (error) {
    console.error("getChallanById error:", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// ─── UPDATE Challan ──────────────────────────────────────────────────────────

/**
 * PUT /api/challans/:id
 * Allows updating receivedAmount, remarks, dueDate, transactionNo, walletProvider.
 * Prevents editing of paid challans.
 */
const updateChallan = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid challan ID." });
    }

    const challan = await Challan.findById(id);
    if (!challan) {
      return res.status(404).json({ success: false, message: "Challan not found." });
    }

    // ── Guard: fully paid challans are locked ──────────────────────────────
    if (challan.status === "paid") {
      return res.status(403).json({
        success: false,
        message: "Paid challans cannot be modified. Contact an administrator.",
      });
    }

    const { receivedAmount, transactionNo, walletProvider, dueDate, remarks } = req.body;

    // ── Validate receivedAmount if provided ────────────────────────────────
    if (receivedAmount !== undefined) {
      const received = Number(receivedAmount);
      if (isNaN(received) || received < 0) {
        return res.status(400).json({ success: false, message: "receivedAmount must be zero or a positive number." });
      }
      if (received > challan.totalAmount) {
        return res.status(400).json({
          success: false,
          message: `receivedAmount (${received}) cannot exceed totalAmount (${challan.totalAmount}).`,
        });
      }
      challan.receivedAmount = received;
    }

    if (transactionNo !== undefined) challan.transactionNo = transactionNo?.trim() || null;
    if (walletProvider !== undefined) {
      challan.walletProvider = challan.paymentMethod === "mobile_wallet"
        ? walletProvider?.trim() || null
        : null;
    }
    if (remarks !== undefined) challan.remarks = remarks.trim();
    if (dueDate !== undefined) {
      const parsed = new Date(dueDate);
      if (isNaN(parsed.getTime())) {
        return res.status(400).json({ success: false, message: "dueDate is not a valid date." });
      }
      challan.dueDate = parsed;
    }

    await challan.save(); // triggers pre-save hook to recompute balance & status

    // Sync mirrored income
    await upsertChallanIncome(challan);

    return res.status(200).json({
      success: true,
      message: "Challan updated successfully.",
      data: challan,
    });

  } catch (error) {
    console.error("updateChallan error:", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// ─── DELETE Challan ──────────────────────────────────────────────────────────

/**
 * DELETE /api/challans/:id
 * Only pending/partial challans can be deleted.
 */
const deleteChallan = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid challan ID." });
    }

    const challan = await Challan.findById(id);
    if (!challan) {
      return res.status(404).json({ success: false, message: "Challan not found." });
    }

    if (challan.status === "paid") {
      return res.status(403).json({
        success: false,
        message: "Paid challans cannot be deleted. Contact an administrator.",
      });
    }

    await Challan.findByIdAndDelete(id);

    // Remove mirrored income
    await Income.deleteOne({ challan: id });

    return res.status(200).json({
      success: true,
      message: "Challan deleted successfully.",
    });

  } catch (error) {
    console.error("deleteChallan error:", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// ─── GET SUMMARY (dashboard stats) ──────────────────────────────────────────

/**
 * GET /api/challans/summary?feeMonth=January&feeYear=2025
 * Returns total collected, pending balance, counts by status.
 */
const getChallanSummary = async (req, res) => {
  try {
    const { feeMonth, feeYear } = req.query;
    const match = {};
    if (feeMonth) match.feeMonth = feeMonth.trim(); // string match
    if (feeYear)  match.feeYear = Number(feeYear);

    const summary = await Challan.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalAmount: { $sum: "$totalAmount" },
          receivedAmount: { $sum: "$receivedAmount" },
          balanceAmount: { $sum: "$balanceAmount" },
        },
      },
    ]);

    const result = { paid: null, partial: null, pending: null };
    summary.forEach((s) => { result[s._id] = s; });

    return res.status(200).json({ success: true, data: result });

  } catch (error) {
    console.error("getChallanSummary error:", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// ─── Exports ─────────────────────────────────────────────────────────────────

module.exports = {
  createChallan,
  getAllChallans,
  getMyChallans,
  getChallanById,
  updateChallan,
  deleteChallan,
  getChallanSummary,
};
