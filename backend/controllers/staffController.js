const Staff = require('../models/staffModel');
const StaffLeave = require('../models/staffLeaveModel');
const StaffPayroll = require('../models/staffPayrollModel');
const Expense = require('../models/expenseModel');
const { asyncHandler } = require('../middleware/errorMiddleware');

// ── STAFF CRUD ─────────────────────────────────────────────────────────────

// @desc    Get all staff
// @route   GET /api/staff
// @access  Private/Admin
const getStaff = asyncHandler(async (req, res) => {
  const staff = await Staff.find({});
  res.status(200).json(staff);
});

// @desc    Create a staff member
// @route   POST /api/staff
// @access  Private/Admin
const createStaff = asyncHandler(async (req, res) => {
  const { name, role, contact, email, basicPay, status, joiningDate } = req.body;

  if (!name || !role || !contact || basicPay === undefined) {
    res.status(400);
    throw new Error('Please add name, role, contact, and basic pay');
  }

  const staff = await Staff.create({
    name,
    role,
    contact,
    email: email || '',
    basicPay,
    status: status || 'Active',
    joiningDate: joiningDate || Date.now(),
  });

  res.status(201).json(staff);
});

// @desc    Update a staff member
// @route   PUT /api/staff/:id
// @access  Private/Admin
const updateStaff = asyncHandler(async (req, res) => {
  const staff = await Staff.findById(req.params.id);

  if (!staff) {
    res.status(404);
    throw new Error('Staff member not found');
  }

  const updatedStaff = await Staff.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  res.status(200).json(updatedStaff);
});

// @desc    Delete a staff member
// @route   DELETE /api/staff/:id
// @access  Private/Admin
const deleteStaff = asyncHandler(async (req, res) => {
  const staff = await Staff.findById(req.params.id);

  if (!staff) {
    res.status(404);
    throw new Error('Staff member not found');
  }

  // Clean up associated leaves and payrolls
  await StaffLeave.deleteMany({ staff: req.params.id });
  const payrolls = await StaffPayroll.find({ staff: req.params.id });
  
  // Clean up expenses for paid payrolls
  for (const pr of payrolls) {
    if (pr.expense) {
      await Expense.findByIdAndDelete(pr.expense);
    }
  }
  await StaffPayroll.deleteMany({ staff: req.params.id });

  await staff.deleteOne();

  res.status(200).json({ id: req.params.id, message: 'Staff member removed' });
});


// ── STAFF LEAVES ────────────────────────────────────────────────────────────

// @desc    Get all staff leaves (with optional month/year filter)
// @route   GET /api/staff/leaves?month=January&year=2026
// @access  Private/Admin
const getStaffLeaves = asyncHandler(async (req, res) => {
  const { month, year } = req.query;

  let filter = {};
  if (month && year) {
    // Map month name to numeric (0-indexed)
    const monthIndex = new Date(`${month} 1, ${year}`).getMonth();
    const startDate = new Date(parseInt(year), monthIndex, 1);
    const endDate = new Date(parseInt(year), monthIndex + 1, 0, 23, 59, 59, 999);
    filter = {
      $or: [
        { startDate: { $gte: startDate, $lte: endDate } },
        { endDate: { $gte: startDate, $lte: endDate } },
        { startDate: { $lte: startDate }, endDate: { $gte: endDate } },
      ],
    };
  }

  const leaves = await StaffLeave.find(filter).populate('staff', 'name role contact');
  res.status(200).json(leaves);
});

// @desc    Create a staff leave
// @route   POST /api/staff/leaves
// @access  Private/Admin
const createStaffLeave = asyncHandler(async (req, res) => {
  const { staff: staffId, startDate, endDate, reason, status } = req.body;

  if (!staffId || !startDate || !endDate) {
    res.status(400);
    throw new Error('Please add staff ID, start date, and end date');
  }

  const staff = await Staff.findById(staffId);
  if (!staff) {
    res.status(404);
    throw new Error('Staff member not found');
  }

  const leave = await StaffLeave.create({
    staff: staffId,
    startDate,
    endDate,
    reason: reason || '',
    status: status || 'Approved',
  });

  // Automatically update staff status if leave is approved and active today
  if ((status === 'Approved' || !status)) {
    const today = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (today >= start && today <= end) {
      staff.status = 'On Leave';
      await staff.save();
    }
  }

  const populatedLeave = await StaffLeave.findById(leave._id).populate('staff', 'name role contact');
  res.status(201).json(populatedLeave);
});

// @desc    Delete a staff leave
// @route   DELETE /api/staff/leaves/:id
// @access  Private/Admin
const deleteStaffLeave = asyncHandler(async (req, res) => {
  const leave = await StaffLeave.findById(req.params.id);

  if (!leave) {
    res.status(404);
    throw new Error('Leave record not found');
  }

  // Restore staff status to Active if it was On Leave
  const staff = await Staff.findById(leave.staff);
  if (staff && staff.status === 'On Leave') {
    staff.status = 'Active';
    await staff.save();
  }

  await leave.deleteOne();
  res.status(200).json({ id: req.params.id, message: 'Leave record deleted' });
});


// ── STAFF PAYROLL ───────────────────────────────────────────────────────────

// @desc    Get monthly payroll sheet
// @route   GET /api/staff/payroll
// @access  Private/Admin
const getPayrollSheet = asyncHandler(async (req, res) => {
  const { month, year } = req.query;

  if (!month || !year) {
    res.status(400);
    throw new Error('Please provide month and year query parameters');
  }

  const numericYear = parseInt(year);

  // Find all active/on-leave staff members
  const allStaff = await Staff.find({ status: { $ne: 'Inactive' } });

  // Get existing payroll records for this month & year
  const existingPayrolls = await StaffPayroll.find({ month, year: numericYear }).populate('staff');

  // Find staff IDs that already have payroll records
  const existingStaffIds = new Set(existingPayrolls.map(p => p.staff?._id?.toString() || p.staff?.toString()));

  // Dynamically initialize payroll records for any staff member missing one
  const newPayrolls = [];
  for (const member of allStaff) {
    if (!existingStaffIds.has(member._id.toString())) {
      const createdPr = await StaffPayroll.create({
        staff: member._id,
        month,
        year: numericYear,
        basicPay: member.basicPay,
        allowances: 0,
        deductions: 0,
        netPay: member.basicPay,
        status: 'Pending',
      });
      newPayrolls.push(createdPr);
    }
  }

  // Refetch all payroll entries for this month/year to return a complete list
  const finalPayrolls = await StaffPayroll.find({ month, year: numericYear })
    .populate('staff', 'name role contact status basicPay');

  res.status(200).json(finalPayrolls);
});

// @desc    Update pending payroll allowances/deductions
// @route   PUT /api/staff/payroll/:id
// @access  Private/Admin
const updatePayrollEntry = asyncHandler(async (req, res) => {
  const payroll = await StaffPayroll.findById(req.params.id);

  if (!payroll) {
    res.status(404);
    throw new Error('Payroll record not found');
  }

  if (payroll.status === 'Paid') {
    res.status(400);
    throw new Error('Cannot edit a paid payroll record');
  }

  const allowances = req.body.allowances !== undefined ? Number(req.body.allowances) : payroll.allowances;
  const deductions = req.body.deductions !== undefined ? Number(req.body.deductions) : payroll.deductions;
  const netPay = payroll.basicPay + allowances - deductions;

  payroll.allowances = allowances;
  payroll.deductions = deductions;
  payroll.netPay = netPay;

  await payroll.save();

  const updatedPayroll = await StaffPayroll.findById(payroll._id).populate('staff', 'name role contact');
  res.status(200).json(updatedPayroll);
});

// @desc    Confirm and pay a payroll entry
// @route   POST /api/staff/payroll/:id/pay
// @access  Private/Admin
const payPayrollEntry = asyncHandler(async (req, res) => {
  const { paymentMethod } = req.body;
  const payroll = await StaffPayroll.findById(req.params.id).populate('staff');

  if (!payroll) {
    res.status(404);
    throw new Error('Payroll record not found');
  }

  if (payroll.status === 'Paid') {
    res.status(400);
    throw new Error('Payroll record is already paid');
  }

  // Create Custom Expense
  const expense = await Expense.create({
    sourceType: 'custom',
    title: `Staff Salary - ${payroll.staff.name} (${payroll.month} ${payroll.year})`,
    category: 'Salaries',
    amount: payroll.netPay,
    date: new Date(),
    paymentMethod: paymentMethod || 'Cash',
    description: `Salary disbursement for ${payroll.staff.name} (${payroll.staff.role}) for the month of ${payroll.month} ${payroll.year}. Basic: ${payroll.basicPay}, Allowances: ${payroll.allowances}, Deductions: ${payroll.deductions}.`,
  });

  payroll.status = 'Paid';
  payroll.paidDate = new Date();
  payroll.expense = expense._id;

  await payroll.save();

  res.status(200).json(payroll);
});

// @desc    Delete a payroll entry (resets/removes it)
// @route   DELETE /api/staff/payroll/:id
// @access  Private/Admin
const deletePayrollEntry = asyncHandler(async (req, res) => {
  const payroll = await StaffPayroll.findById(req.params.id);

  if (!payroll) {
    res.status(404);
    throw new Error('Payroll record not found');
  }

  // If paid, clean up the associated expense
  if (payroll.expense) {
    await Expense.findByIdAndDelete(payroll.expense);
  }

  await payroll.deleteOne();
  res.status(200).json({ id: req.params.id, message: 'Payroll record deleted' });
});

module.exports = {
  getStaff,
  createStaff,
  updateStaff,
  deleteStaff,
  getStaffLeaves,
  createStaffLeave,
  deleteStaffLeave,
  getPayrollSheet,
  updatePayrollEntry,
  payPayrollEntry,
  deletePayrollEntry,
};
