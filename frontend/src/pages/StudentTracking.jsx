import React, { useState, useMemo } from 'react';
import { Search, Eye, User, Phone, BookOpen, DollarSign, AlertTriangle, Receipt, Home, Users, Calendar, Mail, Briefcase } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useHostel } from '@/context/useHostel';

const StudentTracking = () => {
  const { students, hostels, challans } = useHostel();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHostel, setSelectedHostel] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isStudentDialogOpen, setIsStudentDialogOpen] = useState(false);

  const challanList = useMemo(() => Array.isArray(challans) ? challans : [], [challans]);

  // Build a map: boardingNumber → outstanding balance
  const studentFeeMap = useMemo(() => {
    const map = {};
    challanList.forEach(c => {
      const key = c.boardingNo;
      if (!map[key]) map[key] = { outstanding: 0, paid: 0, total: 0 };
      map[key].outstanding += (c.balanceAmount || 0);
      map[key].paid += (c.receivedAmount || 0);
      map[key].total += (c.totalAmount || 0);
    });
    return map;
  }, [challanList]);

  // Overview stats
  const totalOutstanding = challanList.reduce((sum, c) => sum + (c.balanceAmount || 0), 0);
  const defaulterBoardingNos = new Set(
    challanList
      .filter(c => c.status === 'pending' || c.status === 'partial')
      .map(c => c.boardingNo)
  );
  const defaultersCount = defaulterBoardingNos.size;

  const filteredStudents = students.filter((s) => {
    const studentName = s.user?.name || s.name || '';
    const matchesSearch =
      studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.collegeNumber || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.boardingNumber || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesHostel = selectedHostel === 'all' || (s.room?.hostel?.name || s.hostelName) === selectedHostel;
    return matchesSearch && matchesHostel;
  });

  const handleViewStudent = (student) => {
    setSelectedStudent(student);
    setIsStudentDialogOpen(true);
  };

  const totalStudents = students.length;

  // Get challans for selected student
  const selectedStudentChallans = useMemo(() => {
    if (!selectedStudent) return [];
    const boardingNo = selectedStudent.boardingNumber;
    if (!boardingNo) return [];
    return challanList
      .filter(c => c.boardingNo === boardingNo)
      .sort((a, b) => {
        // Sort by year then month
        if (b.feeYear !== a.feeYear) return b.feeYear - a.feeYear;
        const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
        return months.indexOf(b.feeMonth) - months.indexOf(a.feeMonth);
      });
  }, [selectedStudent, challanList]);

  const selectedStudentOutstanding = selectedStudentChallans.reduce((sum, c) => sum + (c.balanceAmount || 0), 0);
  const selectedStudentPaid = selectedStudentChallans.reduce((sum, c) => sum + (c.receivedAmount || 0), 0);
  const selectedStudentMonthlyFee = selectedStudent?.fee || (selectedStudentChallans.length > 0 ? selectedStudentChallans[0].totalAmount : 0);

  // Find roommates for selected student
  const selectedStudentRoommates = useMemo(() => {
    if (!selectedStudent?.room) return [];
    const roomId = selectedStudent.room?._id || selectedStudent.room;
    return students.filter(s => {
      const sId = s._id || s.id;
      const selId = selectedStudent._id || selectedStudent.id;
      if (sId === selId) return false;
      const sRoomId = s.room?._id || s.room;
      return sRoomId && sRoomId === roomId;
    });
  }, [selectedStudent, students]);

  const hostelNames = [...new Set(students.map(s => s.room?.hostel?.name || s.hostelName).filter(Boolean))];

  return (
    <MainLayout>
      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <h1 className="font-display text-3xl font-bold text-foreground">Student Tracking</h1>
        <p className="mt-2 text-muted-foreground">
          View records for all students in the hostel
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 gap-4 mb-6 sm:grid-cols-4 animate-slide-up">
        {[
          { label: 'Total Students', value: totalStudents, icon: Users, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/30' },
          { label: 'Defaulters', value: defaultersCount, icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-950/30' },
          { label: 'Total Outstanding', value: `Rs. ${totalOutstanding.toLocaleString()}`, icon: DollarSign, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-950/30' },
          { label: 'Hostels', value: hostelNames.length, icon: Home, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-950/30' },
        ].map((stat) => (
          <Card key={stat.label} className="border border-border">
            <CardContent className="p-4">
              <div className={`inline-flex p-2 rounded-lg ${stat.bg} mb-2`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
              <p className="text-xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6 animate-slide-up" style={{ animationDelay: '50ms' }}>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, boarding number or college number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 text-[12px] h-9"
          />
        </div>
        <Select value={selectedHostel} onValueChange={setSelectedHostel}>
          <SelectTrigger className="w-full sm:w-48 h-9 text-[12px]">
            <SelectValue placeholder="Filter by hostel" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Hostels</SelectItem>
            {hostelNames.map((name) => (
              <SelectItem key={name} value={name}>{name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <p className="text-[11px] text-muted-foreground mb-4">
        Showing {filteredStudents.length} of {totalStudents} students
      </p>

      {/* Students Grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 animate-slide-up" style={{ animationDelay: '100ms' }}>
        {filteredStudents.length === 0 ? (
          <div className="col-span-full py-16 text-center text-muted-foreground">
            <Users className="mx-auto h-10 w-10 mb-3 opacity-20" />
            <p className="text-sm">No students match your search</p>
          </div>
        ) : (
          filteredStudents.map((student) => {
            const feeData = studentFeeMap[student.boardingNumber] || {};
            const outstanding = feeData.outstanding || 0;
            const isDefaulter = defaulterBoardingNos.has(student.boardingNumber);
            return (
              <Card
                key={student._id || student.id}
                className="cursor-pointer border border-border hover:border-primary/50 hover:shadow-md transition-all duration-200 group"
                onClick={() => handleViewStudent(student)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[12px] font-bold text-primary">
                        {(student.user?.name || student.name || '?').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <CardTitle className="text-[13px] font-semibold leading-tight">{student.user?.name || student.name}</CardTitle>
                        <CardDescription className="text-[11px]">{student.boardingNumber || student.collegeNumber}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {isDefaulter && (
                        <span style={{
                          fontSize: '9px',
                          fontWeight: 600,
                          padding: '2px 7px',
                          borderRadius: '10px',
                          backgroundColor: '#FEE2E2',
                          color: '#DC2626'
                        }}>
                          Defaulter
                        </span>
                      )}
                      <Eye className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-muted-foreground">Hostel:</span>
                      <p className="font-medium truncate">{student.room?.hostel?.name || student.hostelName || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Room:</span>
                      <p className="font-medium">{student.room?.roomNumber || student.roomNumber || 'Unassigned'}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Monthly Fee:</span>
                      <p className="font-medium">Rs. {(student.fee || 0).toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Outstanding:</span>
                      <p className={`font-medium ${outstanding > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        Rs. {outstanding.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Student Detail Dialog — Tabbed */}
      <Dialog open={isStudentDialogOpen} onOpenChange={setIsStudentDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[88vh] overflow-hidden flex flex-col p-0">
          {selectedStudent && (
            <>
              {/* Dialog Header */}
              <div className="flex items-center gap-3 p-5 pb-3 border-b border-border">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-base font-bold text-primary">
                  {(selectedStudent.user?.name || selectedStudent.name || '?').charAt(0).toUpperCase()}
                </div>
                <div>
                  <DialogTitle className="font-display text-lg leading-tight">
                    {selectedStudent.user?.name || selectedStudent.name}
                  </DialogTitle>
                  <DialogDescription className="text-[11px] mt-0.5">
                    {selectedStudent.boardingNumber && <span className="mr-2">#{selectedStudent.boardingNumber}</span>}
                    {selectedStudent.room?.hostel?.name || selectedStudent.hostelName || ''}
                    {selectedStudent.room?.roomNumber ? ` • Room ${selectedStudent.room.roomNumber}` : ''}
                  </DialogDescription>
                </div>
                <div className="ml-auto flex gap-1.5">
                  {defaulterBoardingNos.has(selectedStudent.boardingNumber) && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200">
                      Defaulter
                    </span>
                  )}
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700 border border-green-200 capitalize">
                    {selectedStudent.status || 'Active'}
                  </span>
                </div>
              </div>

              {/* Tabs */}
              <Tabs defaultValue="profile" className="flex flex-col flex-1 overflow-hidden">
                <TabsList className="mx-5 mt-3 mb-0 h-9 self-start bg-muted/50 rounded-lg">
                  <TabsTrigger value="profile" className="text-[11px] h-7 px-3 gap-1.5">
                    <User className="h-3 w-3" /> Profile
                  </TabsTrigger>
                  <TabsTrigger value="room" className="text-[11px] h-7 px-3 gap-1.5">
                    <Home className="h-3 w-3" /> Room
                  </TabsTrigger>
                  <TabsTrigger value="fee" className="text-[11px] h-7 px-3 gap-1.5">
                    <Receipt className="h-3 w-3" /> Fee Ledger
                  </TabsTrigger>
                </TabsList>

                {/* ── Profile Tab ── */}
                <TabsContent value="profile" className="flex-1 overflow-y-auto m-0 px-5 pb-5 pt-4">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: 'Full Name', value: selectedStudent.user?.name || selectedStudent.name, icon: User },
                        { label: 'Father Name', value: selectedStudent.fatherName, icon: User },
                        { label: 'Contact', value: selectedStudent.contact || selectedStudent.contactNumber, icon: Phone },
                        { label: 'Parent Contact', value: selectedStudent.parentContact, icon: Phone },
                        { label: 'Email', value: selectedStudent.user?.email || selectedStudent.email, icon: Mail },
                        { label: 'Occupation', value: selectedStudent.occupation || selectedStudent.occupationOther, icon: Briefcase },
                        { label: 'Boarding No.', value: selectedStudent.boardingNumber, icon: BookOpen },
                        { label: 'College No.', value: selectedStudent.collegeNumber || selectedStudent.registrationNumber, icon: BookOpen },
                        { label: 'Admission Date', value: selectedStudent.admissionDate ? new Date(selectedStudent.admissionDate).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A', icon: Calendar },
                        { label: 'Status', value: selectedStudent.status || 'Active', icon: User },
                      ].map(({ label, value, icon: Icon }) => (
                        <div key={label} className="flex items-start gap-2 p-2.5 rounded-lg bg-muted/30 border border-border/50">
                          <Icon className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">{label}</p>
                            <p className="text-[12px] font-medium text-foreground truncate mt-0.5">{value || '—'}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                {/* ── Room Tab ── */}
                <TabsContent value="room" className="flex-1 overflow-y-auto m-0 px-5 pb-5 pt-4">
                  <div className="space-y-4">
                    {/* Room Details */}
                    <div>
                      <h3 className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-2">Room Details</h3>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { label: 'Hostel', value: selectedStudent.room?.hostel?.name || selectedStudent.hostelName },
                          { label: 'Room Number', value: selectedStudent.room?.roomNumber || selectedStudent.roomNumber || 'Not assigned' },
                          { label: 'Floor', value: selectedStudent.room?.floor },
                          { label: 'Seat Type', value: selectedStudent.room?.seatType },
                          { label: 'Capacity', value: selectedStudent.room?.capacity },
                          { label: 'Occupants', value: selectedStudent.room?.currentOccupants != null ? `${selectedStudent.room.currentOccupants} / ${selectedStudent.room.capacity || '?'}` : 'N/A' },
                          { label: 'Boarding Fee', value: selectedStudent.room?.boardingFee != null ? `Rs. ${selectedStudent.room.boardingFee.toLocaleString()}` : 'N/A' },
                          { label: 'Status', value: selectedStudent.room?.status },
                        ].map(({ label, value }) => (
                          <div key={label} className="p-2.5 rounded-lg bg-muted/30 border border-border/50">
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">{label}</p>
                            <p className="text-[12px] font-semibold text-foreground mt-0.5">{value || '—'}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Roommates */}
                    <div>
                      <h3 className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-2">
                        Roommates ({selectedStudentRoommates.length})
                      </h3>
                      {selectedStudentRoommates.length === 0 ? (
                        <div className="py-8 text-center text-muted-foreground rounded-lg border border-dashed border-border">
                          <Users className="mx-auto h-7 w-7 mb-2 opacity-20" />
                          <p className="text-xs">No roommates found</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {selectedStudentRoommates.map((rm) => {
                            const rmFeeData = studentFeeMap[rm.boardingNumber] || {};
                            const rmOutstanding = rmFeeData.outstanding || 0;
                            return (
                              <div key={rm._id || rm.id} className="flex items-center gap-3 p-3 rounded-lg border border-border/60 bg-card hover:bg-muted/30 transition-colors">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
                                  {(rm.user?.name || rm.name || '?').charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-[12px] font-medium text-foreground truncate">{rm.user?.name || rm.name}</p>
                                  <p className="text-[10px] text-muted-foreground">{rm.boardingNumber}</p>
                                </div>
                                {rmOutstanding > 0 && (
                                  <span className="text-[10px] font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-100">
                                    Rs. {rmOutstanding.toLocaleString()} due
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>

                {/* ── Fee Ledger Tab ── */}
                <TabsContent value="fee" className="flex-1 overflow-y-auto m-0 px-5 pb-5 pt-4">
                  {/* Summary Cards */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                      <p className="text-[10px] text-muted-foreground mb-1">Monthly Fee</p>
                      <p className="text-base font-bold text-foreground">Rs. {(selectedStudentMonthlyFee || 0).toLocaleString()}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-green-50 border border-green-200 dark:bg-green-950/20 dark:border-green-900/30">
                      <p className="text-[10px] text-muted-foreground mb-1">Total Paid</p>
                      <p className="text-base font-bold text-green-600">Rs. {selectedStudentPaid.toLocaleString()}</p>
                    </div>
                    <div className={`p-3 rounded-lg ${selectedStudentOutstanding > 0 ? 'bg-red-50 border border-red-200 dark:bg-red-950/20 dark:border-red-900/30' : 'bg-green-50 border border-green-200 dark:bg-green-950/20 dark:border-green-900/30'}`}>
                      <p className="text-[10px] text-muted-foreground mb-1">Outstanding</p>
                      <p className={`text-base font-bold ${selectedStudentOutstanding > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        Rs. {selectedStudentOutstanding.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Fee History Table */}
                  {selectedStudentChallans.length === 0 ? (
                    <div className="py-10 text-center text-muted-foreground rounded-lg border border-dashed border-border">
                      <Receipt className="mx-auto h-8 w-8 mb-2 opacity-30" />
                      <p className="text-sm">No fee records found for this student</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-lg border border-border">
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ backgroundColor: 'hsl(var(--muted) / 0.5)', borderBottom: '1px solid hsl(var(--border))' }}>
                            {['Month', 'Total', 'Paid', 'Balance', 'Method', 'Status'].map(h => (
                              <th key={h} style={{ fontSize: '10px', fontWeight: 600, color: 'hsl(var(--muted-foreground))', textTransform: 'uppercase', textAlign: 'left', padding: '8px 10px', letterSpacing: '0.05em' }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {selectedStudentChallans.map((challan, idx) => (
                            <tr
                              key={challan._id}
                              style={{
                                borderBottom: idx < selectedStudentChallans.length - 1 ? '1px solid hsl(var(--border))' : 'none',
                                backgroundColor: challan.status === 'paid' ? 'transparent' : challan.status === 'partial' ? 'hsl(45 100% 96% / 0.4)' : 'hsl(0 100% 97% / 0.4)'
                              }}
                            >
                              <td style={{ fontSize: '12px', padding: '9px 10px', fontWeight: 500 }}>
                                {challan.feeMonth} {challan.feeYear}
                              </td>
                              <td style={{ fontSize: '12px', padding: '9px 10px', color: 'hsl(var(--muted-foreground))' }}>
                                Rs. {(challan.totalAmount || 0).toLocaleString()}
                              </td>
                              <td style={{ fontSize: '12px', padding: '9px 10px', color: '#16A34A' }}>
                                Rs. {(challan.receivedAmount || 0).toLocaleString()}
                              </td>
                              <td style={{ fontSize: '12px', padding: '9px 10px', fontWeight: 500, color: challan.balanceAmount > 0 ? '#DC2626' : '#16A34A' }}>
                                Rs. {(challan.balanceAmount || 0).toLocaleString()}
                              </td>
                              <td style={{ fontSize: '11px', padding: '9px 10px', color: 'hsl(var(--muted-foreground))', textTransform: 'capitalize' }}>
                                {(challan.paymentMethod || '—').replace(/_/g, ' ')}
                              </td>
                              <td style={{ padding: '9px 10px' }}>
                                <span style={{
                                  fontSize: '10px',
                                  fontWeight: 600,
                                  padding: '2px 8px',
                                  borderRadius: '20px',
                                  backgroundColor: challan.status === 'paid' ? '#DCFCE7' : challan.status === 'partial' ? '#FEF3C7' : '#FEE2E2',
                                  color: challan.status === 'paid' ? '#16A34A' : challan.status === 'partial' ? '#CA8A04' : '#DC2626',
                                  textTransform: 'capitalize'
                                }}>
                                  {challan.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default StudentTracking;
