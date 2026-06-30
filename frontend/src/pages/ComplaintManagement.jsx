import React, { useState } from 'react';
import { Check, Clock, FileText, Wrench, UtensilsCrossed, Sparkles, Shield, HelpCircle } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
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

const ComplaintManagement = () => {
    const { complaints, updateComplaintStatus } = useHostel();

    const pendingComplaints = complaints.filter((c) => c.status === 'Pending');
    const inProgressComplaints = complaints.filter((c) => c.status === 'In Progress');
    const resolvedComplaints = complaints.filter((c) => c.status === 'Resolved');

    const getCategoryIcon = (category) => {
        switch (category) {
            case 'Maintenance': return <Wrench className="mr-1 h-3 w-3" />;
            case 'Food': return <UtensilsCrossed className="mr-1 h-3 w-3" />;
            case 'Cleanliness': return <Sparkles className="mr-1 h-3 w-3" />;
            case 'Security': return <Shield className="mr-1 h-3 w-3" />;
            default: return <HelpCircle className="mr-1 h-3 w-3" />;
        }
    };

    const ComplaintCard = ({ complaint, showActions = false }) => {
        const [status, setStatus] = useState(complaint.status);
        const [priority, setPriority] = useState(complaint.priority || 'Medium');
        const [remark, setRemark] = useState(complaint.adminRemarks || '');

        const handleUpdate = async () => {
            const result = await updateComplaintStatus(complaint._id || complaint.id, status, remark, priority);
            if (result.success) {
                toast.success('Complaint updated successfully');
            }
        };

        return (
            <Card className="animate-scale-in rounded-md">
                <CardHeader className="pb-2 p-3">
                    <div className="flex items-start justify-between">
                        <div>
                            <CardTitle className="text-[13px] font-medium">{complaint.student?.user?.name || 'Student'}</CardTitle>
                            <CardDescription className="text-[11px]">
                                {complaint.student?.collegeNumber || 'N/A'} • {complaint.student?.room?.hostel?.name || 'Not Assigned'}
                            </CardDescription>
                        </div>
                        <Badge
                            className={cn(
                                'text-[10px] font-normal rounded',
                                complaint.status === 'Pending' && 'bg-warning/10 text-warning',
                                complaint.status === 'In Progress' && 'bg-blue-500/10 text-blue-600',
                                complaint.status === 'Resolved' && 'bg-success/10 text-success'
                            )}
                        >
                            {complaint.status === 'Pending' && <Clock className="mr-1 h-3 w-3" />}
                            {complaint.status === 'In Progress' && <Clock className="mr-1 h-3 w-3" />}
                            {complaint.status === 'Resolved' && <Check className="mr-1 h-3 w-3" />}
                            {complaint.status}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="space-y-2 p-3 pt-0">
                    <div className="flex items-center gap-2 text-[11px]">
                        <Badge variant="outline" className="text-[10px] font-normal">
                            {getCategoryIcon(complaint.category)}
                            {complaint.category}
                        </Badge>
                        <Badge variant="outline" className={cn(
                            'text-[10px] font-normal',
                            complaint.priority === 'High' && 'bg-red-500/10 text-red-600',
                            complaint.priority === 'Medium' && 'bg-amber-500/10 text-amber-600',
                            complaint.priority === 'Low' && 'bg-slate-500/10 text-slate-600'
                        )}>
                            {complaint.priority}
                        </Badge>
                    </div>
                    <div className="rounded-md bg-muted/30 p-2">
                        <p className="text-[10px] text-muted-foreground">Description:</p>
                        <p className="mt-0.5 text-[11px] text-foreground">{complaint.description}</p>
                    </div>

                    {complaint.adminRemarks && !showActions && (
                        <div className="rounded-md bg-primary/5 border border-primary/10 p-2">
                            <p className="text-[10px] font-medium text-primary">Admin Remarks:</p>
                            <p className="mt-0.5 text-[11px] italic">&ldquo;{complaint.adminRemarks}&rdquo;</p>
                        </div>
                    )}

                    <p className="text-[10px] text-muted-foreground text-right">Submitted: {new Date(complaint.createdAt).toLocaleDateString()}</p>

                    {showActions && (
                        <div className="space-y-2 pt-2 border-t border-border">
                            <div className="grid gap-1">
                                <label className="text-[11px] font-medium">Update Status</label>
                                <Select value={status} onValueChange={setStatus}>
                                    <SelectTrigger className="h-8 text-[11px]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Pending">Pending</SelectItem>
                                        <SelectItem value="In Progress">In Progress</SelectItem>
                                        <SelectItem value="Resolved">Resolved</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-1">
                                <label className="text-[11px] font-medium">Set Priority</label>
                                <Select value={priority} onValueChange={setPriority}>
                                    <SelectTrigger className="h-8 text-[11px]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Low">Low</SelectItem>
                                        <SelectItem value="Medium">Medium</SelectItem>
                                        <SelectItem value="High">High</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Textarea
                                placeholder="Add admin remarks (optional)..."
                                value={remark}
                                onChange={(e) => setRemark(e.target.value)}
                                className="min-h-[50px] text-[11px]"
                            />
                            <Button
                                size="sm"
                                className="w-full text-[11px] h-8"
                                onClick={handleUpdate}
                            >
                                <Check className="mr-1.5 h-3.5 w-3.5" />
                                Update Complaint
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        );
    };

    return (
        <MainLayout>
            {/* Header */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
                <div>
                    <h1 className="text-[18px] font-semibold text-foreground">
                        Complaints
                    </h1>
                    <p className="mt-2 text-[12px] font-light text-muted-foreground">
                        View and resolve complaints raised by students
                    </p>
                </div>
            </div>

            {/* Stats */}
            <div className="mb-4 flex gap-3 animate-slide-up">
                <div className="flex items-center gap-1.5 rounded-md bg-warning/10 px-3 py-1.5">
                    <Clock className="h-4 w-4 text-warning" />
                    <span className="text-[11px] font-medium text-warning">{pendingComplaints.length} Pending</span>
                </div>
                <div className="flex items-center gap-1.5 rounded-md bg-blue-500/10 px-3 py-1.5">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <span className="text-[11px] font-medium text-blue-600">{inProgressComplaints.length} In Progress</span>
                </div>
                <div className="flex items-center gap-1.5 rounded-md bg-success/10 px-3 py-1.5">
                    <Check className="h-4 w-4 text-success" />
                    <span className="text-[11px] font-medium text-success">{resolvedComplaints.length} Resolved</span>
                </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="pending" className="animate-slide-up" style={{ animationDelay: '100ms' }}>
                <TabsList className="bg-muted/50 h-8">
                    <TabsTrigger value="pending" className="data-[state=active]:bg-card text-[11px]">
                        <Clock className="mr-1.5 h-3.5 w-3.5" />
                        Pending ({pendingComplaints.length})
                    </TabsTrigger>
                    <TabsTrigger value="inprogress" className="data-[state=active]:bg-card text-[11px]">
                        <Clock className="mr-1.5 h-3.5 w-3.5" />
                        In Progress ({inProgressComplaints.length})
                    </TabsTrigger>
                    <TabsTrigger value="resolved" className="data-[state=active]:bg-card text-[11px]">
                        <Check className="mr-1.5 h-3.5 w-3.5" />
                        Resolved ({resolvedComplaints.length})
                    </TabsTrigger>
                    <TabsTrigger value="all" className="data-[state=active]:bg-card text-[11px]">
                        <FileText className="mr-1.5 h-3.5 w-3.5" />
                        All ({complaints.length})
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="pending" className="mt-4">
                    {pendingComplaints.length === 0 ? (
                        <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-border bg-muted/20 p-8">
                            <Clock className="h-8 w-8 text-muted-foreground/40" />
                            <p className="mt-2 text-[13px] font-medium text-muted-foreground">No pending complaints</p>
                        </div>
                    ) : (
                        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                            {pendingComplaints.map((complaint) => (
                                <ComplaintCard key={complaint._id || complaint.id} complaint={complaint} showActions />
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="inprogress" className="mt-4">
                    {inProgressComplaints.length === 0 ? (
                        <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-border bg-muted/20 p-8">
                            <Clock className="h-8 w-8 text-muted-foreground/40" />
                            <p className="mt-2 text-[13px] font-medium text-muted-foreground">No complaints in progress</p>
                        </div>
                    ) : (
                        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                            {inProgressComplaints.map((complaint) => (
                                <ComplaintCard key={complaint._id || complaint.id} complaint={complaint} showActions />
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="resolved" className="mt-4">
                    {resolvedComplaints.length === 0 ? (
                        <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-border bg-muted/20 p-8">
                            <Check className="h-8 w-8 text-muted-foreground/40" />
                            <p className="mt-2 text-[13px] font-medium text-muted-foreground">No resolved complaints</p>
                        </div>
                    ) : (
                        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                            {resolvedComplaints.map((complaint) => (
                                <ComplaintCard key={complaint._id || complaint.id} complaint={complaint} />
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="all" className="mt-4">
                    {complaints.length === 0 ? (
                        <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-border bg-muted/20 p-8">
                            <FileText className="h-8 w-8 text-muted-foreground/40" />
                            <p className="mt-2 text-[13px] font-medium text-muted-foreground">No complaints yet</p>
                            <p className="text-[11px] text-muted-foreground">Student complaints will appear here</p>
                        </div>
                    ) : (
                        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                            {complaints.map((complaint) => (
                                <ComplaintCard key={complaint._id || complaint.id} complaint={complaint} showActions={complaint.status !== 'Resolved'} />
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </MainLayout>
    );
};

export default ComplaintManagement;
