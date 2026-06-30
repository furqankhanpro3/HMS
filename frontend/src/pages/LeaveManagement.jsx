import React, { useState } from 'react';
import { CalendarOff, Plus, Check, X, Clock, FileText } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useHostel } from '@/context/useHostel';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const LeaveManagement = () => {
  const { students, hostels, leaveApplications, addLeaveApplication, updateLeaveStatus } = useHostel();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    studentId: '',
    startDate: '',
    endDate: '',
    reason: '',
  });
  const [errors, setErrors] = useState({});

  const selectedStudent = students.find((s) => s.id === formData.studentId);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.studentId) newErrors.studentId = 'Student is required';
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    if (!formData.endDate) newErrors.endDate = 'End date is required';
    if (formData.startDate && formData.endDate && formData.startDate > formData.endDate) {
      newErrors.endDate = 'End date must be after start date';
    }
    if (!formData.reason.trim()) newErrors.reason = 'Reason is required';
    if (formData.reason.length > 500) newErrors.reason = 'Reason must be less than 500 characters';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm() || !selectedStudent) return;

    addLeaveApplication({
      studentId: formData.studentId,
      studentName: selectedStudent.name,
      registrationNumber: selectedStudent.registrationNumber,
      hostelName: selectedStudent.hostelName,
      startDate: formData.startDate,
      endDate: formData.endDate,
      reason: formData.reason.trim(),
    });

    toast.success('Leave application submitted successfully');
    setFormData({ studentId: '', startDate: '', endDate: '', reason: '' });
    setIsDialogOpen(false);
  };

  const handleApprove = (id) => {
    updateLeaveStatus(id, 'Approved');
    toast.success('Leave approved');
  };

  const handleReject = (id) => {
    updateLeaveStatus(id, 'Rejected');
    toast.success('Leave rejected');
  };

  const pendingLeaves = leaveApplications.filter((l) => l.status === 'Pending');
  const approvedLeaves = leaveApplications.filter((l) => l.status === 'Approved');
  const rejectedLeaves = leaveApplications.filter((l) => l.status === 'Rejected');

  const LeaveCard = ({ leave, showActions = false }) => {
    const [remark, setRemark] = useState('');

    return (
      <Card className="animate-scale-in">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-lg">{leave.studentName || leave.student?.user?.name || 'Student'}</CardTitle>
              <CardDescription>
                {leave.registrationNumber || leave.student?.collegeNumber || 'N/A'} • {leave.hostelName || leave.student?.hostel?.name || 'N/A'}
              </CardDescription>
            </div>
            <Badge
              className={cn(
                leave.status === 'Pending' && 'bg-warning/10 text-warning',
                leave.status === 'Approved' && 'bg-success/10 text-success',
                leave.status === 'Rejected' && 'bg-destructive/10 text-destructive'
              )}
            >
              {leave.status === 'Pending' && <Clock className="mr-1 h-3 w-3" />}
              {leave.status === 'Approved' && <Check className="mr-1 h-3 w-3" />}
              {leave.status === 'Rejected' && <X className="mr-1 h-3 w-3" />}
              {leave.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1 text-muted-foreground">
              <CalendarOff className="h-4 w-4" />
              <span>{new Date(leave.startDate).toLocaleDateString()}</span>
              <span>to</span>
              <span>{new Date(leave.endDate).toLocaleDateString()}</span>
            </div>
          </div>
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-sm text-muted-foreground">Reason:</p>
            <p className="mt-1 text-sm">{leave.reason}</p>
          </div>

          {leave.remarks && (
            <div className="rounded-lg bg-primary/5 border border-primary/10 p-3">
              <p className="text-sm font-medium text-primary">Admin Remarks:</p>
              <p className="mt-1 text-sm italic">"{leave.remarks}"</p>
            </div>
          )}

          <p className="text-xs text-muted-foreground text-right">Applied on: {new Date(leave.createdAt).toLocaleDateString()}</p>

          {showActions && leave.status === 'Pending' && (
            <div className="space-y-3 pt-2">
              <Textarea
                placeholder="Add remarks (optional)..."
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                className="min-h-[60px] text-sm"
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 border-success text-success hover:bg-success hover:text-success-foreground"
                  onClick={() => {
                    updateLeaveStatus(leave._id || leave.id, 'Approved', remark);
                    toast.success('Leave approved');
                  }}
                >
                  <Check className="mr-2 h-4 w-4" />
                  Approve
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => {
                    updateLeaveStatus(leave._id || leave.id, 'Rejected', remark);
                    toast.success('Leave rejected');
                  }}
                >
                  <X className="mr-2 h-4 w-4" />
                  Reject
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <MainLayout>
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">
            Leave Management
          </h1>
          <p className="mt-2 text-muted-foreground">
            Review and approve student leave requests
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6 flex gap-4 animate-slide-up">
        <div className="flex items-center gap-2 rounded-lg bg-warning/10 px-4 py-2">
          <Clock className="h-5 w-5 text-warning" />
          <span className="font-medium text-warning">{pendingLeaves.length} Pending</span>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-success/10 px-4 py-2">
          <Check className="h-5 w-5 text-success" />
          <span className="font-medium text-success">{approvedLeaves.length} Approved</span>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-4 py-2">
          <X className="h-5 w-5 text-destructive" />
          <span className="font-medium text-destructive">{rejectedLeaves.length} Rejected</span>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="pending" className="animate-slide-up" style={{ animationDelay: '100ms' }}>
        <TabsList className="bg-muted/50">
          <TabsTrigger value="pending" className="data-[state=active]:bg-card">
            <Clock className="mr-2 h-4 w-4" />
            Pending ({pendingLeaves.length})
          </TabsTrigger>
          <TabsTrigger value="approved" className="data-[state=active]:bg-card">
            <Check className="mr-2 h-4 w-4" />
            Approved ({approvedLeaves.length})
          </TabsTrigger>
          <TabsTrigger value="rejected" className="data-[state=active]:bg-card">
            <X className="mr-2 h-4 w-4" />
            Rejected ({rejectedLeaves.length})
          </TabsTrigger>
          <TabsTrigger value="all" className="data-[state=active]:bg-card">
            <FileText className="mr-2 h-4 w-4" />
            All ({leaveApplications.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          {pendingLeaves.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 p-12">
              <Clock className="h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-lg font-medium text-muted-foreground">No pending applications</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pendingLeaves.map((leave) => (
                <LeaveCard key={leave.id} leave={leave} showActions />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="approved" className="mt-6">
          {approvedLeaves.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 p-12">
              <Check className="h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-lg font-medium text-muted-foreground">No approved applications</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {approvedLeaves.map((leave) => (
                <LeaveCard key={leave.id} leave={leave} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="rejected" className="mt-6">
          {rejectedLeaves.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 p-12">
              <X className="h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-lg font-medium text-muted-foreground">No rejected applications</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {rejectedLeaves.map((leave) => (
                <LeaveCard key={leave.id} leave={leave} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="all" className="mt-6">
          {leaveApplications.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 p-12">
              <FileText className="h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-lg font-medium text-muted-foreground">No applications yet</p>
              <p className="text-sm text-muted-foreground">Submit a new leave application to get started</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {leaveApplications.map((leave) => (
                <LeaveCard key={leave.id} leave={leave} showActions={leave.status === 'Pending'} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
};

export default LeaveManagement;
