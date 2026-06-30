const Student = require('../models/studentModel');
const Room = require('../models/roomModel');
const Challan = require('../models/challanModel');
const FeePayment = require('../models/feePaymentModel');
const Income = require('../models/incomeModel');

const MONTH_NAMES = [
  '', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const monthNameToIndex = (name) => {
  if (!name) return -1;
  return MONTH_NAMES.findIndex((m) => m.toLowerCase() === name.trim().toLowerCase());
};

const getPreviousMonths = (startYear, startMonth, endYear, endMonth) => {
  const months = [];
  let year = startYear;
  let month = startMonth;
  while (year < endYear || (year === endYear && month < endMonth)) {
    months.push({ feeYear: year, feeMonth: MONTH_NAMES[month] });
    month += 1;
    if (month > 12) {
      month = 1;
      year += 1;
    }
  }
  return months;
};

const getPreviousMonthDues = async (student, feeYear, feeMonth) => {
  const decidedFee = student.fee || student.room?.boardingFee || 0;
  const admissionDate = student.admissionDate ? new Date(student.admissionDate) : null;
  const selectedIndex = monthNameToIndex(feeMonth);
  const selectedYear = Number(feeYear);
  if (!admissionDate || selectedIndex === -1 || isNaN(selectedYear)) return [];

  const startYear = admissionDate.getFullYear();
  const startMonth = admissionDate.getMonth() + 1; // 1-based
  const previousMonths = getPreviousMonths(startYear, startMonth, selectedYear, selectedIndex);
  if (previousMonths.length === 0) return [];

  const challans = await Challan.find({
    boardingNo: student.boardingNumber,
    feeYear: { $in: [...new Set(previousMonths.map((m) => m.feeYear))] },
  }).lean();

  const challanMap = new Map(challans.map((c) => [`${c.feeMonth}-${c.feeYear}`, c]));

  const dues = [];
  for (const m of previousMonths) {
    const challan = challanMap.get(`${m.feeMonth}-${m.feeYear}`);
    const balance = challan ? challan.balanceAmount : decidedFee;
    if (balance > 0) {
      dues.push({ feeMonth: m.feeMonth, feeYear: m.feeYear, balanceAmount: balance });
    }
  }
  return dues;
};

const buildChallanTitle = (challan) => {
  return `Boarding Fee — ${challan.boarderName} (${challan.feeMonth} ${challan.feeYear})`;
};

const upsertChallanIncome = async (challan) => {
  const title = buildChallanTitle(challan);
  await Income.findOneAndUpdate(
    { challan: challan._id },
    {
      sourceType: 'challan',
      challan: challan._id,
      title,
      category: 'boarding_fee',
      amount: challan.receivedAmount || 0,
      date: challan.receivingDate || new Date(),
      paymentMethod: challan.paymentMethod || '',
      status: challan.status || 'pending',
      description: challan.remarks || '',
    },
    { upsert: true, new: true }
  );
};

// GET /api/fee/search?q=EC-2024-001
const SearchBoardingNo = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q?.trim()) {
      return res.status(400).json({ success: false, message: 'Search query is required' });
    }

    const student = await Student.findOne({
      boardingNumber: { $regex: q.trim(), $options: 'i' },
    })
      .populate('user', 'name contact')
      .populate('room', 'roomNumber boardingFee hostel')
      .lean();

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    return res.status(200).json({ success: true, data: student });
  } catch (error) {
    console.error('SearchBoardingNo error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// GET /api/fee/student/:boardingNo
const getStudentFeeInfo = async (req, res) => {
  try {
    const { boardingNo } = req.params;

    const student = await Student.findOne({ boardingNumber: boardingNo })
      .populate('user', 'name contact')
      .populate('room', 'roomNumber boardingFee hostel')
      .lean();

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const [challans, payments] = await Promise.all([
      Challan.find({ boardingNo }).sort({ feeYear: 1, feeMonth: 1 }).lean(),
      FeePayment.find({ boardingNo }).sort({ receivingDate: -1 }).lean(),
    ]);

    const roomFee = student.room?.boardingFee || 0;
    const decidedFee = student.fee || roomFee || 0;

    const monthlySummary = challans.map((c) => ({
      feeMonth: c.feeMonth,
      feeYear: c.feeYear,
      totalAmount: c.totalAmount,
      receivedAmount: c.receivedAmount,
      balanceAmount: c.balanceAmount,
      status: c.status,
    }));

    return res.status(200).json({
      success: true,
      data: {
        student,
        roomFee,
        decidedFee,
        monthlySummary,
        payments,
      },
    });
  } catch (error) {
    console.error('getStudentFeeInfo error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// GET /api/fee/ledger/:boardingNo
const getFeeLedger = async (req, res) => {
  try {
    const { boardingNo } = req.params;
    const payments = await FeePayment.find({ boardingNo })
      .sort({ receivingDate: -1 })
      .lean();

    return res.status(200).json({ success: true, data: payments });
  } catch (error) {
    console.error('getFeeLedger error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// POST /api/fee/payment
const recordPayment = async (req, res) => {
  try {
    const {
      boardingNo,
      boarderName,
      feeMonth,
      feeYear,
      amount,
      paymentMethod,
      transactionNo,
      walletProvider,
      receivingDate,
      remarks,
    } = req.body;

    if (!boardingNo || !boarderName || !feeMonth || !feeYear || amount === undefined || amount === null || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'boardingNo, boarderName, feeMonth, feeYear, amount, and paymentMethod are required',
      });
    }

    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ success: false, message: 'amount must be a positive number' });
    }

    const monthIndex = monthNameToIndex(feeMonth);
    if (monthIndex === -1) {
      return res.status(400).json({ success: false, message: 'Invalid feeMonth' });
    }

    const year = Number(feeYear);
    if (isNaN(year) || year < 2000) {
      return res.status(400).json({ success: false, message: 'Invalid feeYear' });
    }

    const validMethods = ['cash', 'bank_transfer', 'cheque', 'mobile_wallet'];
    if (!validMethods.includes(paymentMethod)) {
      return res.status(400).json({ success: false, message: 'Invalid paymentMethod' });
    }

    if (['bank_transfer', 'cheque'].includes(paymentMethod) && !transactionNo?.trim()) {
      return res.status(400).json({ success: false, message: 'transactionNo is required' });
    }

    if (paymentMethod === 'mobile_wallet' && (!walletProvider?.trim() || !transactionNo?.trim())) {
      return res.status(400).json({ success: false, message: 'walletProvider and transactionNo are required' });
    }

    const student = await Student.findOne({ boardingNumber: boardingNo })
      .populate('room', 'boardingFee')
      .lean();

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const decidedFee = student.fee || student.room?.boardingFee || 0;

    // Get previous month dues
    const previousDues = await getPreviousMonthDues(student, year, feeMonth);
    const totalArrears = previousDues.reduce((sum, item) => sum + item.balanceAmount, 0);

    let mainChallanRecord = await Challan.findOne({ boardingNo, feeMonth: feeMonth.trim(), feeYear: year });
    const paidForMonth = mainChallanRecord ? mainChallanRecord.receivedAmount : 0;
    const dueForMonth = mainChallanRecord ? mainChallanRecord.balanceAmount : decidedFee;

    if (numericAmount > (dueForMonth + totalArrears)) {
      return res.status(400).json({
        success: false,
        message: `Payment of Rs. ${numericAmount} exceeds total outstanding of Rs. ${dueForMonth + totalArrears}`,
      });
    }

    let remainingAmount = numericAmount;
    const recordedPayments = [];

    // 1. Pay previous months first
    for (const due of previousDues) {
      if (remainingAmount <= 0) break;

      const dueAmount = due.balanceAmount;
      const paymentForThisMonth = Math.min(remainingAmount, dueAmount);
      remainingAmount -= paymentForThisMonth;

      // Find or create challan for this previous month
      let prevChallan = await Challan.findOne({
        boardingNo: boardingNo.trim(),
        feeMonth: due.feeMonth,
        feeYear: due.feeYear,
      });
      if (!prevChallan) {
        prevChallan = new Challan({
          boardingNo: boardingNo.trim(),
          boarderName: boarderName.trim(),
          fatherName: student.fatherName || '',
          contact: student.contact || student.user?.contact || '',
          totalAmount: decidedFee,
          receivedAmount: 0,
          paymentMethod,
          feeMonth: due.feeMonth,
          feeYear: due.feeYear,
          receivingDate: receivingDate ? new Date(receivingDate) : new Date(),
          remarks: `Arrears payment. ${remarks || ''}`.trim(),
        });
      } else {
        prevChallan.remarks = `Arrears payment. ${prevChallan.remarks || ''}`.trim();
      }

      prevChallan.receivedAmount += paymentForThisMonth;
      prevChallan.paymentMethod = paymentMethod;
      if (transactionNo !== undefined) prevChallan.transactionNo = transactionNo?.trim() || null;
      if (walletProvider !== undefined) prevChallan.walletProvider = paymentMethod === 'mobile_wallet' ? walletProvider.trim() : null;
      await prevChallan.save();
      await upsertChallanIncome(prevChallan);

      // Create FeePayment record for this previous month
      const p = await FeePayment.create({
        boardingNo: boardingNo.trim(),
        boarderName: boarderName.trim(),
        feeMonth: due.feeMonth,
        feeYear: due.feeYear,
        amount: paymentForThisMonth,
        paymentMethod,
        transactionNo: transactionNo?.trim() || null,
        walletProvider: paymentMethod === 'mobile_wallet' ? walletProvider.trim() : null,
        receivingDate: receivingDate ? new Date(receivingDate) : new Date(),
        remarks: `Arrears payment from ${feeMonth} ${feeYear}. ${remarks || ''}`.trim(),
      });
      recordedPayments.push(p);
    }

    // 2. Pay selected month with whatever is left
    let mainPaymentRecord = null;
    if (remainingAmount > 0) {
      if (!mainChallanRecord) {
        mainChallanRecord = new Challan({
          boardingNo: boardingNo.trim(),
          boarderName: boarderName.trim(),
          fatherName: student.fatherName || '',
          contact: student.contact || student.user?.contact || '',
          totalAmount: decidedFee,
          receivedAmount: 0,
          paymentMethod,
          feeMonth: feeMonth.trim(),
          feeYear: year,
          receivingDate: receivingDate ? new Date(receivingDate) : new Date(),
          remarks: remarks?.trim() || '',
        });
      }

      mainChallanRecord.receivedAmount += remainingAmount;
      mainChallanRecord.paymentMethod = paymentMethod;
      if (transactionNo !== undefined) mainChallanRecord.transactionNo = transactionNo?.trim() || null;
      if (walletProvider !== undefined) mainChallanRecord.walletProvider = paymentMethod === 'mobile_wallet' ? walletProvider.trim() : null;
      if (remarks !== undefined) mainChallanRecord.remarks = remarks.trim();
      await mainChallanRecord.save();
      await upsertChallanIncome(mainChallanRecord);

      mainPaymentRecord = await FeePayment.create({
        boardingNo: boardingNo.trim(),
        boarderName: boarderName.trim(),
        feeMonth: feeMonth.trim(),
        feeYear: year,
        amount: remainingAmount,
        paymentMethod,
        transactionNo: transactionNo?.trim() || null,
        walletProvider: paymentMethod === 'mobile_wallet' ? walletProvider.trim() : null,
        receivingDate: receivingDate ? new Date(receivingDate) : new Date(),
        remarks: remarks?.trim() || '',
      });
      recordedPayments.push(mainPaymentRecord);
    } else {
      // Ensure July/current month challan exists even if 0 amount was credited to it
      if (!mainChallanRecord) {
        mainChallanRecord = new Challan({
          boardingNo: boardingNo.trim(),
          boarderName: boarderName.trim(),
          fatherName: student.fatherName || '',
          contact: student.contact || student.user?.contact || '',
          totalAmount: decidedFee,
          receivedAmount: 0,
          paymentMethod,
          feeMonth: feeMonth.trim(),
          feeYear: year,
          receivingDate: receivingDate ? new Date(receivingDate) : new Date(),
          remarks: remarks?.trim() || '',
        });
        await mainChallanRecord.save();
        await upsertChallanIncome(mainChallanRecord);
      }
    }

    return res.status(201).json({
      success: true,
      message: 'Payment recorded successfully',
      data: {
        payment: mainPaymentRecord || recordedPayments[recordedPayments.length - 1],
        challan: mainChallanRecord,
        allPayments: recordedPayments,
      },
    });
  } catch (error) {
    console.error('recordPayment error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = {
  SearchBoardingNo,
  getStudentFeeInfo,
  getFeeLedger,
  recordPayment,
};
