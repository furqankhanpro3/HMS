import React, { useState, useEffect } from 'react';
import { 
  Users, Plus, Edit, Trash2, Loader2, Search, Briefcase, Calendar, 
  Banknote, Phone, Mail, CalendarDays, CheckCircle2, AlertCircle, HelpCircle, Save, Check
} from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useHostel } from '@/context/useHostel';
import { toast } from 'sonner';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June', 
  'July', 'August', 'September', 'October', 'November', 'December'
];

const YEARS = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 2 + i);

// ── Separate component so hooks are not called inside .map() ──
const PayrollRow = ({ pr, onUpdate, onPay, onDelete }) => {
  const [allowanceVal, setAllowanceVal] = useState(pr.allowances || 0);
  const [deductionVal, setDeductionVal] = useState(pr.deductions || 0);
  const isPaid = pr.status === 'Paid';

  return (
    <TableRow className="border-b border-border transition-colors hover:bg-muted/20">
      <TableCell className="border-r border-border px-4 py-2">
        <div className="min-w-[150px]">
          <span className="font-medium text-[11px] block leading-tight text-foreground">{pr.staff?.name || 'Deleted Staff'}</span>
          <span className="text-[10px] text-muted-foreground mt-0.5 block">{pr.staff?.role || '—'} ({pr.staff?.status})</span>
        </div>
      </TableCell>
      <TableCell className="border-r border-border px-4 py-2 text-[11px] font-medium text-foreground">Rs. {pr.basicPay?.toLocaleString()}</TableCell>
      <TableCell className="border-r border-border px-4 py-2">
        {isPaid ? (
          <span className="text-[11px] text-muted-foreground">Rs. {pr.allowances?.toLocaleString()}</span>
        ) : (
          <Input
            type="number"
            value={allowanceVal}
            onChange={(e) => setAllowanceVal(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-20 h-7 text-[11px]"
          />
        )}
      </TableCell>
      <TableCell className="border-r border-border px-4 py-2">
        {isPaid ? (
          <span className="text-[11px] text-muted-foreground">Rs. {pr.deductions?.toLocaleString()}</span>
        ) : (
          <Input
            type="number"
            value={deductionVal}
            onChange={(e) => setDeductionVal(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-20 h-7 text-[11px]"
          />
        )}
      </TableCell>
      <TableCell className="border-r border-border px-4 py-2 text-[11px] font-bold text-foreground">
        Rs. {isPaid ? pr.netPay?.toLocaleString() : (pr.basicPay + allowanceVal - deductionVal).toLocaleString()}
      </TableCell>
      <TableCell className="border-r border-border px-4 py-2">
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
          isPaid ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'
        }`}>
          {pr.status}
        </span>
        {isPaid && pr.paidDate && (
          <span className="text-[9px] text-muted-foreground block mt-1">Paid: {new Date(pr.paidDate).toLocaleDateString()}</span>
        )}
      </TableCell>
      <TableCell className="px-4 py-2 text-right">
        <div className="flex justify-end items-center gap-1.5">
          {!isPaid && (
            <>
              <Button
                onClick={() => onUpdate(pr._id || pr.id, allowanceVal, deductionVal)}
                variant="outline"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-foreground"
                title="Save allowance/deductions"
              >
                <Save className="h-3.5 w-3.5" />
              </Button>
              <Button
                onClick={() => onPay(pr)}
                size="sm"
                className="h-7 text-[10px] px-2.5 bg-success hover:bg-success-hover text-white font-medium"
              >
                Disburse
              </Button>
            </>
          )}
          <Button
            onClick={() => onDelete(pr._id || pr.id)}
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-destructive"
            title="Delete/Reset Payroll Entry"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};

const StaffManagement = () => {
  const {
    getAllStaff,
    createStaff,
    updateStaff,
    deleteStaff,
    getStaffLeaves,
    createStaffLeave,
    deleteStaffLeave,
    getPayrollSheet,
    updatePayrollEntry,
    payPayrollEntry,
    deletePayrollEntry
  } = useHostel();

  // Local State
  const [activeTab, setActiveTab] = useState('profile');
  const [staffList, setStaffList] = useState([]);
  const [leaveList, setLeaveList] = useState([]);
  const [payrollList, setPayrollList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters / Selections
  const [searchTerm, setSearchTerm] = useState('');
  const [payrollMonth, setPayrollMonth] = useState(MONTHS[new Date().getMonth()]);
  const [payrollYear, setPayrollYear] = useState(new Date().getFullYear());
  const [leaveMonth, setLeaveMonth] = useState(MONTHS[new Date().getMonth()]);
  const [leaveYear, setLeaveYear] = useState(new Date().getFullYear());

  // Dialog Control
  const [isStaffDialogOpen, setIsStaffDialogOpen] = useState(false);
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false);
  const [isPayDialogOpen, setIsPayDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form States
  const [editingStaff, setEditingStaff] = useState(null);
  const [staffFormData, setStaffFormData] = useState({
    name: '',
    role: '',
    contact: '',
    email: '',
    basicPay: '',
    status: 'Active',
    joiningDate: new Date().toISOString().split('T')[0],
  });

  const [leaveFormData, setLeaveFormData] = useState({
    staffId: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    reason: '',
    status: 'Approved',
  });

  const [selectedPayroll, setSelectedPayroll] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('Cash');

  // Load Data
  const loadStaffData = async () => {
    setLoading(true);
    const data = await getAllStaff();
    setStaffList(data);
    setLoading(false);
  };

  const loadLeaveData = async () => {
    setLoading(true);
    const data = await getStaffLeaves(leaveMonth, leaveYear);
    setLeaveList(data);
    setLoading(false);
  };

  const loadPayrollData = async () => {
    setLoading(true);
    const data = await getPayrollSheet(payrollMonth, payrollYear);
    setPayrollList(data);
    setLoading(false);
  };

  useEffect(() => {
    if (activeTab === 'profile') {
      loadStaffData();
    } else if (activeTab === 'leaves') {
      loadLeaveData();
      loadStaffData(); // needed for select dropdown
    } else if (activeTab === 'payroll') {
      loadPayrollData();
    }
  }, [activeTab, payrollMonth, payrollYear, leaveMonth, leaveYear]);

  // Handlers - Staff CRUD
  const handleStaffSubmit = async (e) => {
    e.preventDefault();
    if (!staffFormData.name || !staffFormData.role || !staffFormData.contact || !staffFormData.basicPay) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    let result;
    if (editingStaff) {
      result = await updateStaff(editingStaff._id || editingStaff.id, staffFormData);
    } else {
      result = await createStaff(staffFormData);
    }

    setIsSubmitting(false);
    if (result.success) {
      toast.success(editingStaff ? 'Staff profile updated' : 'Staff member registered successfully');
      setIsStaffDialogOpen(false);
      loadStaffData();
    }
  };

  const handleEditStaff = (staff) => {
    setEditingStaff(staff);
    setStaffFormData({
      name: staff.name,
      role: staff.role,
      contact: staff.contact,
      email: staff.email || '',
      basicPay: staff.basicPay,
      status: staff.status || 'Active',
      joiningDate: staff.joiningDate ? new Date(staff.joiningDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    });
    setIsStaffDialogOpen(true);
  };

  const handleDeleteStaff = async (id) => {
    if (window.confirm('Are you sure you want to remove this staff member? All related leaves and payroll entries will also be permanently deleted.')) {
      const result = await deleteStaff(id);
      if (result.success) {
        toast.success('Staff member removed successfully');
        loadStaffData();
      }
    }
  };

  // Handlers - Leaves
  const handleLeaveSubmit = async (e) => {
    e.preventDefault();
    if (!leaveFormData.staffId || !leaveFormData.startDate || !leaveFormData.endDate) {
      toast.error('Please specify the staff member and leave dates');
      return;
    }

    setIsSubmitting(true);
    const result = await createStaffLeave({
      staff: leaveFormData.staffId,
      startDate: leaveFormData.startDate,
      endDate: leaveFormData.endDate,
      reason: leaveFormData.reason,
      status: leaveFormData.status,
    });
    setIsSubmitting(false);

    if (result.success) {
      toast.success('Leave application logged successfully');
      setIsLeaveDialogOpen(false);
      loadLeaveData();
    }
  };

  const handleDeleteLeave = async (id) => {
    if (window.confirm('Are you sure you want to delete this leave record?')) {
      const result = await deleteStaffLeave(id);
      if (result.success) {
        toast.success('Leave record deleted');
        loadLeaveData();
      }
    }
  };

  // Handlers - Payroll Inline Updates
  const handlePayrollUpdate = async (id, allowances, deductions) => {
    const result = await updatePayrollEntry(id, { allowances, deductions });
    if (result.success) {
      toast.success('Payroll inputs updated');
      loadPayrollData();
    }
  };

  // Handlers - Payroll Pay Process
  const handlePayClick = (payroll) => {
    setSelectedPayroll(payroll);
    setPaymentMethod('Cash');
    setIsPayDialogOpen(true);
  };

  const handlePayConfirm = async () => {
    if (!selectedPayroll) return;
    setIsSubmitting(true);
    const result = await payPayrollEntry(selectedPayroll._id || selectedPayroll.id, { paymentMethod });
    setIsSubmitting(false);
    
    if (result.success) {
      toast.success(`Salary successfully disbursed to ${selectedPayroll.staff?.name}`);
      setIsPayDialogOpen(false);
      loadPayrollData();
    }
  };

  const handleDeletePayroll = async (id) => {
    if (window.confirm('Are you sure you want to reset/remove this payroll record? Associated custom expense entry will also be deleted.')) {
      const result = await deletePayrollEntry(id);
      if (result.success) {
        toast.success('Payroll entry removed');
        loadPayrollData();
      }
    }
  };

  // Filtering staff list
  const filteredStaff = staffList.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.contact.includes(searchTerm)
  );

  return (
    <MainLayout>
      {/* Page Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Staff Management</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Manage hostel staff profiles, log leave requests, and process monthly payroll.
          </p>
        </div>
        <div className="flex gap-2">
          {activeTab === 'profile' && (
            <Button 
              onClick={() => {
                setEditingStaff(null);
                setStaffFormData({
                  name: '',
                  role: '',
                  contact: '',
                  email: '',
                  basicPay: '',
                  status: 'Active',
                  joiningDate: new Date().toISOString().split('T')[0],
                });
                setIsStaffDialogOpen(true);
              }}
              size="sm"
            >
              <Plus className="mr-1.5 h-4 w-4" /> Add Staff Profile
            </Button>
          )}
          {activeTab === 'leaves' && (
            <Button 
              onClick={() => {
                setLeaveFormData({
                  staffId: staffList.length > 0 ? staffList[0]._id : '',
                  startDate: new Date().toISOString().split('T')[0],
                  endDate: new Date().toISOString().split('T')[0],
                  reason: '',
                  status: 'Approved',
                });
                setIsLeaveDialogOpen(true);
              }}
              variant="outline"
              size="sm"
            >
              <Calendar className="mr-1.5 h-4 w-4" /> Log Leave Request
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-muted/50 h-9 p-1 rounded-lg">
          <TabsTrigger value="profile" className="text-xs h-7 gap-1.5">
            <Briefcase className="h-3.5 w-3.5" /> Staff Profiles
          </TabsTrigger>
          <TabsTrigger value="leaves" className="text-xs h-7 gap-1.5">
            <CalendarDays className="h-3.5 w-3.5" /> Leaves Register
          </TabsTrigger>
          <TabsTrigger value="payroll" className="text-xs h-7 gap-1.5">
            <Banknote className="h-3.5 w-3.5" /> Payroll Ledger
          </TabsTrigger>
        </TabsList>

        {/* ── PROFILE TAB ── */}
        <TabsContent value="profile" className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search staff by name or job role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 text-xs h-8"
              />
            </div>
            <div className="text-[11px] text-muted-foreground font-medium">
              Total Staff: {staffList.length} members
            </div>
          </div>

          {loading ? (
            <div className="flex h-32 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary opacity-50" />
            </div>
          ) : filteredStaff.length === 0 ? (
            <Card className="border-dashed border-2 py-12 flex flex-col items-center justify-center text-center">
              <Briefcase className="h-10 w-10 text-muted-foreground/35 mb-2" />
              <CardTitle className="text-sm font-semibold">No Staff Registered</CardTitle>
              <CardDescription className="text-xs mt-1">Register cleaners, wardens, cooks, or other staff members.</CardDescription>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredStaff.map((staff) => (
                <Card key={staff._id || staff.id} className="border border-border/80 hover:shadow-md transition-all duration-200">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                          {staff.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <CardTitle className="text-[13px] font-bold leading-tight">{staff.name}</CardTitle>
                          <CardDescription className="text-[11px] font-medium text-primary mt-0.5">{staff.role}</CardDescription>
                        </div>
                      </div>
                      <Badge className={`text-[9px] px-2 py-0.5 rounded ${
                        staff.status === 'Active' ? 'bg-success/15 text-success hover:bg-success/20' : 
                        'bg-slate-500/15 text-slate-600 hover:bg-slate-500/20'
                      }`} variant="outline">
                        {staff.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-2 text-xs space-y-3">
                    <div className="space-y-1.5 text-muted-foreground bg-muted/20 p-2.5 rounded-lg border border-border/40">
                      <div className="flex items-center gap-2">
                        <Phone className="h-3 w-3 shrink-0" />
                        <span>{staff.contact}</span>
                      </div>
                      {staff.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-3 w-3 shrink-0 truncate" />
                          <span className="truncate">{staff.email}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <CalendarDays className="h-3 w-3 shrink-0" />
                        <span>Joined: {new Date(staff.joiningDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-border/40">
                      <div>
                        <span className="text-[10px] text-muted-foreground uppercase font-medium">Basic Pay</span>
                        <p className="text-xs font-bold text-foreground">Rs. {staff.basicPay?.toLocaleString()}</p>
                      </div>
                      <div className="flex gap-1">
                        <Button 
                          onClick={() => handleEditStaff(staff)} 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7 text-muted-foreground hover:text-primary"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button 
                          onClick={() => handleDeleteStaff(staff._id || staff.id)} 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ── LEAVES REGISTER TAB ── */}
        <TabsContent value="leaves" className="space-y-4">
          <div className="flex flex-wrap items-center gap-3 bg-muted/20 p-3 rounded-lg border border-border/40">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground">Filter Month:</span>
              <Select value={leaveMonth} onValueChange={setLeaveMonth}>
                <SelectTrigger className="w-32 h-8 text-xs bg-card">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground">Filter Year:</span>
              <Select value={leaveYear.toString()} onValueChange={(val) => setLeaveYear(parseInt(val))}>
                <SelectTrigger className="w-24 h-8 text-xs bg-card">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {YEARS.map(y => <SelectItem key={y} value={y.toString()}>{y}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="ml-auto text-[10px] text-muted-foreground font-medium">
              Showing leave records for {leaveMonth} {leaveYear}.
            </div>
          </div>

          {loading ? (
            <div className="flex h-32 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary opacity-50" />
            </div>
          ) : leaveList.length === 0 ? (
            <Card className="border-dashed border-2 py-12 flex flex-col items-center justify-center text-center">
              <Calendar className="h-10 w-10 text-muted-foreground/35 mb-2" />
              <CardTitle className="text-sm font-semibold">No Leave Records</CardTitle>
              <CardDescription className="text-xs mt-1">Leaves registered for staff members will show up here.</CardDescription>
            </Card>
          ) : (
            <div className="overflow-x-auto animate-slide-up" style={{ animationDelay: '100ms' }}>
              <Table className="w-full border-collapse border border-border">
                <TableHeader>
                  <TableRow className="border-b border-border bg-muted/20">
                    <TableHead className="border-r border-border px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-foreground">Staff Member</TableHead>
                    <TableHead className="border-r border-border px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-foreground">Role</TableHead>
                    <TableHead className="border-r border-border px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-foreground">Start Date</TableHead>
                    <TableHead className="border-r border-border px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-foreground">End Date</TableHead>
                    <TableHead className="border-r border-border px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-foreground">Reason</TableHead>
                    <TableHead className="border-r border-border px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-foreground">Status</TableHead>
                    <TableHead className="px-4 py-2.5 text-right text-[10px] font-semibold uppercase tracking-wider text-foreground">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaveList.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center border-b border-border">
                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                          <Calendar className="h-8 w-8 mb-1 opacity-20" />
                          <p className="text-xs">No leave records found</p>
                          <p className="text-[11px]">Log a leave request to get started</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                  leaveList.map((leave) => (
                    <TableRow key={leave._id || leave.id} className="border-b border-border transition-colors hover:bg-muted/20">
                      <TableCell className="border-r border-border px-4 py-2 text-[11px] font-medium text-foreground">{leave.staff?.name || 'Deleted Staff'}</TableCell>
                      <TableCell className="border-r border-border px-4 py-2 text-[11px] text-muted-foreground">{leave.staff?.role || '—'}</TableCell>
                      <TableCell className="border-r border-border px-4 py-2 text-[11px] text-muted-foreground">{new Date(leave.startDate).toLocaleDateString()}</TableCell>
                      <TableCell className="border-r border-border px-4 py-2 text-[11px] text-muted-foreground">{new Date(leave.endDate).toLocaleDateString()}</TableCell>
                      <TableCell className="border-r border-border px-4 py-2 text-[11px] text-muted-foreground max-w-xs truncate" title={leave.reason}>{leave.reason || '—'}</TableCell>
                      <TableCell className="border-r border-border px-4 py-2">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                          leave.status === 'Approved' ? 'bg-green-50 text-green-700' :
                          leave.status === 'Pending' ? 'bg-yellow-50 text-yellow-700' :
                          'bg-red-50 text-red-700'
                        }`}>
                          {leave.status}
                        </span>
                      </TableCell>
                      <TableCell className="px-4 py-2 text-right">
                        <Button
                          onClick={() => handleDeleteLeave(leave._id || leave.id)}
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        {/* ── PAYROLL LEDGER TAB ── */}
        <TabsContent value="payroll" className="space-y-4">
          <div className="flex flex-wrap items-center gap-3 bg-muted/20 p-3 rounded-lg border border-border/40">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground">Select Month:</span>
              <Select value={payrollMonth} onValueChange={setPayrollMonth}>
                <SelectTrigger className="w-32 h-8 text-xs bg-card">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground">Select Year:</span>
              <Select value={payrollYear.toString()} onValueChange={(val) => setPayrollYear(parseInt(val))}>
                <SelectTrigger className="w-24 h-8 text-xs bg-card">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {YEARS.map(y => <SelectItem key={y} value={y.toString()}>{y}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="ml-auto text-[10px] text-muted-foreground font-medium">
              Automatically logs paid salaries into custom Expenses.
            </div>
          </div>

          {loading ? (
            <div className="flex h-32 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary opacity-50" />
            </div>
          ) : payrollList.length === 0 ? (
            <Card className="border-dashed border-2 py-12 flex flex-col items-center justify-center text-center">
              <AlertCircle className="h-10 w-10 text-muted-foreground/35 mb-2" />
              <CardTitle className="text-sm font-semibold">No Payroll Entries Available</CardTitle>
              <CardDescription className="text-xs mt-1">Make sure you have Active or On Leave staff members registered.</CardDescription>
            </Card>
          ) : (
            <div className="overflow-x-auto animate-slide-up" style={{ animationDelay: '100ms' }}>
              <Table className="w-full border-collapse border border-border">
                <TableHeader>
                  <TableRow className="border-b border-border bg-muted/20">
                    <TableHead className="border-r border-border px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-foreground">Staff Details</TableHead>
                    <TableHead className="border-r border-border px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-foreground">Basic Pay</TableHead>
                    <TableHead className="border-r border-border px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-foreground">Allowances</TableHead>
                    <TableHead className="border-r border-border px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-foreground">Deductions</TableHead>
                    <TableHead className="border-r border-border px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-foreground">Net Salary</TableHead>
                    <TableHead className="border-r border-border px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-foreground">Status</TableHead>
                    <TableHead className="px-4 py-2.5 text-right text-[10px] font-semibold uppercase tracking-wider text-foreground">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payrollList.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center border-b border-border">
                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                          <AlertCircle className="h-8 w-8 mb-1 opacity-20" />
                          <p className="text-xs">No payroll entries available</p>
                          <p className="text-[11px]">Register active staff members to get started</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                  payrollList.map((pr) => (
                    <PayrollRow
                      key={pr._id || pr.id}
                      pr={pr}
                      onUpdate={handlePayrollUpdate}
                      onPay={handlePayClick}
                      onDelete={handleDeletePayroll}
                    />
                  ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* ── DIALOGS ── */}

      {/* Add/Edit Staff Dialog */}
      <Dialog open={isStaffDialogOpen} onOpenChange={setIsStaffDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="font-display text-lg">
              {editingStaff ? 'Edit Staff Profile' : 'Register New Staff Member'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={staffSubmit => handleStaffSubmit(staffSubmit)} className="space-y-4 mt-2">
            <div>
              <Label htmlFor="staff-name" className="text-xs font-semibold">Full Name *</Label>
              <Input
                id="staff-name"
                value={staffFormData.name}
                onChange={(e) => setStaffFormData({ ...staffFormData, name: e.target.value })}
                placeholder="Enter full name"
                className="text-xs mt-1"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="staff-role" className="text-xs font-semibold">Job Role / Designation *</Label>
                <Input
                  id="staff-role"
                  value={staffFormData.role}
                  onChange={(e) => setStaffFormData({ ...staffFormData, role: e.target.value })}
                  placeholder="e.g. Cook, Warden, Sweeper"
                  className="text-xs mt-1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="staff-status" className="text-xs font-semibold">Status *</Label>
                <Select
                  value={staffFormData.status}
                  onValueChange={(val) => setStaffFormData({ ...staffFormData, status: val })}
                >
                  <SelectTrigger id="staff-status" className="text-xs mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="staff-contact" className="text-xs font-semibold">Contact Number *</Label>
                <Input
                  id="staff-contact"
                  value={staffFormData.contact}
                  onChange={(e) => setStaffFormData({ ...staffFormData, contact: e.target.value })}
                  placeholder="Phone number"
                  className="text-xs mt-1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="staff-email" className="text-xs font-semibold">Email (Optional)</Label>
                <Input
                  id="staff-email"
                  type="email"
                  value={staffFormData.email}
                  onChange={(e) => setStaffFormData({ ...staffFormData, email: e.target.value })}
                  placeholder="email@example.com"
                  className="text-xs mt-1"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="staff-pay" className="text-xs font-semibold">Basic monthly pay *</Label>
                <Input
                  id="staff-pay"
                  type="number"
                  value={staffFormData.basicPay}
                  onChange={(e) => setStaffFormData({ ...staffFormData, basicPay: parseFloat(e.target.value) || '' })}
                  placeholder="Amount in Rs."
                  className="text-xs mt-1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="staff-date" className="text-xs font-semibold">Joining Date *</Label>
                <Input
                  id="staff-date"
                  type="date"
                  value={staffFormData.joiningDate}
                  onChange={(e) => setStaffFormData({ ...staffFormData, joiningDate: e.target.value })}
                  className="text-xs mt-1"
                  required
                />
              </div>
            </div>
            <div className="flex justify-end gap-2.5 pt-3 border-t border-border/40">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsStaffDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : editingStaff ? 'Save Changes' : 'Register Staff'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Log Leave Dialog */}
      <Dialog open={isLeaveDialogOpen} onOpenChange={setIsLeaveDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="font-display text-lg">Log Staff Leave Record</DialogTitle>
          </DialogHeader>
          <form onSubmit={leaveSubmit => handleLeaveSubmit(leaveSubmit)} className="space-y-4 mt-2">
            <div>
              <Label htmlFor="leave-staff" className="text-xs font-semibold">Select Staff Member *</Label>
              <Select
                value={leaveFormData.staffId}
                onValueChange={(val) => setLeaveFormData({ ...leaveFormData, staffId: val })}
              >
                <SelectTrigger id="leave-staff" className="text-xs mt-1">
                  <SelectValue placeholder="Choose employee..." />
                </SelectTrigger>
                <SelectContent>
                  {staffList.filter(s => s.status !== 'Inactive').map(s => (
                    <SelectItem key={s._id || s.id} value={s._id || s.id}>{s.name} ({s.role})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="leave-start" className="text-xs font-semibold">Start Date *</Label>
                <Input
                  id="leave-start"
                  type="date"
                  value={leaveFormData.startDate}
                  onChange={(e) => setLeaveFormData({ ...leaveFormData, startDate: e.target.value })}
                  className="text-xs mt-1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="leave-end" className="text-xs font-semibold">End Date *</Label>
                <Input
                  id="leave-end"
                  type="date"
                  value={leaveFormData.endDate}
                  onChange={(e) => setLeaveFormData({ ...leaveFormData, endDate: e.target.value })}
                  className="text-xs mt-1"
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="leave-reason" className="text-xs font-semibold">Reason for leave</Label>
              <Input
                id="leave-reason"
                value={leaveFormData.reason}
                onChange={(e) => setLeaveFormData({ ...leaveFormData, reason: e.target.value })}
                placeholder="Reason details"
                className="text-xs mt-1"
              />
            </div>
            <div className="flex justify-end gap-2.5 pt-3 border-t border-border/40">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsLeaveDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Log Leave'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirm Payroll Payment Dialog */}
      <Dialog open={isPayDialogOpen} onOpenChange={setIsPayDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="font-display text-lg">Disburse Salary Payment</DialogTitle>
          </DialogHeader>
          {selectedPayroll && (
            <div className="space-y-4 mt-2">
              <div className="bg-muted/30 border border-border/60 p-3.5 rounded-lg space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Employee:</span>
                  <span className="font-bold text-foreground">{selectedPayroll.staff?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Designation:</span>
                  <span className="font-medium text-foreground">{selectedPayroll.staff?.role}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Salary Period:</span>
                  <span className="font-medium text-foreground">{selectedPayroll.month} {selectedPayroll.year}</span>
                </div>
                <div className="border-t border-border/40 my-1.5 pt-1.5 flex justify-between font-bold text-sm">
                  <span>Net Disbursement:</span>
                  <span className="text-primary">Rs. {selectedPayroll.netPay?.toLocaleString()}</span>
                </div>
              </div>

              <div>
                <Label htmlFor="pay-method" className="text-xs font-semibold">Payment Method *</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger id="pay-method" className="text-xs mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                    <SelectItem value="Cheque">Cheque</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-border/40">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsPayDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handlePayConfirm} size="sm" className="bg-success hover:bg-success-hover text-white" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Disburse & Log Expense'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default StaffManagement;
