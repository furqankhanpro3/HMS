import React, { useState } from 'react';
import {
    AlertTriangle,
    MessageSquare,
    Send,
    Clock,
    CheckCircle2,
    Wrench,
    UtensilsCrossed,
    Sparkles,
    Shield,
    HelpCircle,
    Info
} from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/context/AuthContext';
import { useHostel } from '@/context/useHostel';
import { toast } from 'sonner';

const StudentComplaints = () => {
    const { user } = useAuth();
    const { students, complaints, addComplaint } = useHostel();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        category: '',
        description: '',
    });

    const studentRecord = students.find(s =>
        (s.user?._id === user?._id || s.user === user?._id || s.userId === user?._id) ||
        (s.boardingNumber === user?.boardingNumber && user?.boardingNumber) ||
        (s._id === user?._id || s.id === user?._id)
    );

    const studentId = studentRecord?._id || studentRecord?.id;

    const studentComplaints = complaints
        .filter(c => {
            const complaintStudentId = c.student?._id || c.student?.id || c.student;
            return complaintStudentId === studentId && studentId;
        })
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.category || !formData.description) {
            toast.error('Please fill in all required fields');
            return;
        }

        if (!studentId) {
            toast.error('Student identity not verified. Please refresh.');
            return;
        }

        setIsSubmitting(true);

        const result = await addComplaint({
            student: studentId,
            category: formData.category,
            description: formData.description,
        });

        if (result.success) {
            toast.success('Your complaint has been submitted');
            setFormData({ category: '', description: '' });
        }

        setIsSubmitting(false);
    };

    const getCategoryIcon = (category) => {
        switch (category) {
            case 'Maintenance': return <Wrench style={{ width: '12px', height: '12px' }} />;
            case 'Food': return <UtensilsCrossed style={{ width: '12px', height: '12px' }} />;
            case 'Cleanliness': return <Sparkles style={{ width: '12px', height: '12px' }} />;
            case 'Security': return <Shield style={{ width: '12px', height: '12px' }} />;
            default: return <HelpCircle style={{ width: '12px', height: '12px' }} />;
        }
    };

    const getCategoryStyle = (category) => {
        switch (category) {
            case 'Maintenance': return { bg: '#EFF6FF', color: '#2563EB' };
            case 'Food': return { bg: '#FFF7ED', color: '#EA580C' };
            case 'Cleanliness': return { bg: '#F0FDF4', color: '#16A34A' };
            case 'Security': return { bg: '#FEF2F2', color: '#DC2626' };
            default: return { bg: '#F5F5F5', color: '#525252' };
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Resolved': return { bg: '#F0FDF4', color: '#16A34A' };
            case 'In Progress': return { bg: '#EFF6FF', color: '#2563EB' };
            default: return { bg: '#FFFBEB', color: '#CA8A04' };
        }
    };

    const getStatusIcon = (status) => {
        if (status === 'Resolved') return <CheckCircle2 style={{ width: '10px', height: '10px' }} />;
        return <Clock style={{ width: '10px', height: '10px' }} />;
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const pendingCount = studentComplaints.filter(c => c.status === 'Pending').length;

    return (
        <MainLayout>
            <div style={{ maxWidth: '1040px', margin: '0 auto', padding: '32px 16px' }} className="animate-fade-in">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4" style={{ marginBottom: '28px' }}>
                    <div>
                        <h1 style={{ fontSize: '22px', fontWeight: 600, color: '#1E1E1E', margin: 0 }}>
                            Complaints
                        </h1>
                        <p style={{ fontSize: '13px', color: '#737373', marginTop: '4px' }}>
                            Report issues and track resolution status
                        </p>
                    </div>
                    {pendingCount > 0 && (
                        <span style={{
                            fontSize: '11px', fontWeight: 500, padding: '4px 12px',
                            borderRadius: '12px', backgroundColor: '#FEF3C7', color: '#CA8A04'
                        }}>
                            {pendingCount} pending
                        </span>
                    )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px', alignItems: 'start' }}>
                    {/* Form */}
                    <div style={{
                        backgroundColor: '#FFFFFF', borderRadius: '10px',
                        border: '1px solid #E5E5E5', padding: '20px',
                        position: 'sticky', top: '16px'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                            <AlertTriangle style={{ width: '16px', height: '16px', color: '#1E1E1E' }} />
                            <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#1E1E1E', margin: 0 }}>
                                New Complaint
                            </h3>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ fontSize: '10px', fontWeight: 600, color: '#737373', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>
                                    Category
                                </label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    style={{
                                        width: '100%', padding: '8px 12px', fontSize: '12px',
                                        borderRadius: '6px', border: '1px solid #E5E5E5',
                                        backgroundColor: '#FFFFFF', color: '#1E1E1E',
                                        fontWeight: 500, outline: 'none', cursor: 'pointer'
                                    }}
                                >
                                    <option value="">Select category...</option>
                                    <option value="Maintenance">Maintenance</option>
                                    <option value="Food">Food Quality</option>
                                    <option value="Cleanliness">Cleanliness</option>
                                    <option value="Security">Security</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ fontSize: '10px', fontWeight: 600, color: '#737373', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>
                                    Description
                                </label>
                                <textarea
                                    placeholder="Describe the issue in detail..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    style={{
                                        width: '100%', minHeight: '140px', padding: '10px 12px',
                                        fontSize: '12px', borderRadius: '6px',
                                        border: '1px solid #E5E5E5', backgroundColor: '#FFFFFF',
                                        color: '#1E1E1E', outline: 'none', resize: 'vertical',
                                        fontFamily: 'inherit', lineHeight: '1.6', boxSizing: 'border-box'
                                    }}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                style={{
                                    width: '100%', padding: '10px',
                                    borderRadius: '7px', border: 'none',
                                    backgroundColor: '#1E1E1E', color: '#FFFFFF',
                                    fontSize: '12px', fontWeight: 500,
                                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    gap: '6px', opacity: isSubmitting ? 0.6 : 1
                                }}
                            >
                                {isSubmitting ? 'Submitting...' : (
                                    <>Submit Complaint <Send style={{ width: '12px', height: '12px' }} /></>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Complaint History Table */}
                    <div style={{
                        backgroundColor: '#FFFFFF', borderRadius: '10px',
                        border: '1px solid #E5E5E5', padding: '20px'
                    }}>
                        <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#1E1E1E', marginBottom: '20px', marginTop: 0 }}>
                            Complaint History
                        </h3>

                        {studentComplaints.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '48px 0', color: '#737373' }}>
                                <MessageSquare style={{ width: '32px', height: '32px', margin: '0 auto 8px', opacity: 0.2 }} />
                                <p style={{ fontSize: '12px', fontWeight: 500, color: '#1E1E1E', marginBottom: '4px' }}>No complaints submitted yet</p>
                                <p style={{ fontSize: '11px' }}>Use the form to report any issues.</p>
                            </div>
                        ) : (
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid #E5E5E5' }}>
                                            <th style={{ fontSize: '10px', fontWeight: 600, color: '#737373', textTransform: 'uppercase', textAlign: 'left', padding: '8px 0', letterSpacing: '0.05em' }}>DATE</th>
                                            <th style={{ fontSize: '10px', fontWeight: 600, color: '#737373', textTransform: 'uppercase', textAlign: 'left', padding: '8px 0' }}>CATEGORY</th>
                                            <th style={{ fontSize: '10px', fontWeight: 600, color: '#737373', textTransform: 'uppercase', textAlign: 'left', padding: '8px 0' }}>DESCRIPTION</th>
                                            <th style={{ fontSize: '10px', fontWeight: 600, color: '#737373', textTransform: 'uppercase', textAlign: 'left', padding: '8px 0' }}>PRIORITY</th>
                                            <th style={{ fontSize: '10px', fontWeight: 600, color: '#737373', textTransform: 'uppercase', textAlign: 'left', padding: '8px 0' }}>STATUS</th>
                                            <th style={{ fontSize: '10px', fontWeight: 600, color: '#737373', textTransform: 'uppercase', textAlign: 'left', padding: '8px 0' }}>RESPONSE</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {studentComplaints.map((complaint, index) => {
                                            const catStyle = getCategoryStyle(complaint.category);
                                            const statStyle = getStatusStyle(complaint.status);
                                            return (
                                                <tr key={index} style={{ borderBottom: '1px solid #F5F5F5' }}>
                                                    <td style={{ fontSize: '12px', padding: '12px 0', fontWeight: 500, color: '#1E1E1E', whiteSpace: 'nowrap' }}>
                                                        {formatDate(complaint.createdAt)}
                                                    </td>
                                                    <td style={{ padding: '12px 0' }}>
                                                        <span style={{
                                                            display: 'inline-flex', alignItems: 'center', gap: '4px',
                                                            fontSize: '10px', fontWeight: 500, padding: '3px 8px',
                                                            borderRadius: '10px',
                                                            backgroundColor: catStyle.bg, color: catStyle.color
                                                        }}>
                                                            {getCategoryIcon(complaint.category)}
                                                            {complaint.category}
                                                        </span>
                                                    </td>
                                                    <td style={{ fontSize: '12px', padding: '12px 0', color: '#525252', maxWidth: '200px' }}>
                                                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                                            {complaint.description}
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '12px 0' }}>
                                                        <span style={{
                                                            fontSize: '10px', fontWeight: 500, padding: '3px 8px',
                                                            borderRadius: '10px',
                                                            backgroundColor: complaint.priority === 'High' ? '#FEF2F2' : complaint.priority === 'Medium' ? '#FFFBEB' : '#F5F5F5',
                                                            color: complaint.priority === 'High' ? '#DC2626' : complaint.priority === 'Medium' ? '#CA8A04' : '#525252'
                                                        }}>
                                                            {complaint.priority}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '12px 0' }}>
                                                        <span style={{
                                                            display: 'inline-flex', alignItems: 'center', gap: '4px',
                                                            fontSize: '10px', fontWeight: 500, padding: '3px 8px',
                                                            borderRadius: '10px',
                                                            backgroundColor: statStyle.bg, color: statStyle.color,
                                                            textTransform: 'capitalize'
                                                        }}>
                                                            {getStatusIcon(complaint.status)}
                                                            {complaint.status}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '12px 0', maxWidth: '160px' }}>
                                                        {complaint.adminRemark ? (
                                                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '4px' }}>
                                                                <Info style={{ width: '12px', height: '12px', color: '#737373', flexShrink: 0, marginTop: '2px' }} />
                                                                <span style={{ fontSize: '11px', color: '#737373', lineHeight: '1.5' }}>
                                                                    {complaint.adminRemark}
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            <span style={{ fontSize: '10px', color: '#A3A3A3' }}>No response yet</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                {/* Guidelines */}
                <div style={{
                    marginTop: '24px', padding: '16px', borderRadius: '10px',
                    backgroundColor: '#FEF2F2', border: '1px solid #FECACA',
                    display: 'flex', alignItems: 'flex-start', gap: '12px'
                }}>
                    <div style={{
                        width: '32px', height: '32px', borderRadius: '6px',
                        backgroundColor: '#FEE2E2',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                    }}>
                        <AlertTriangle style={{ width: '16px', height: '16px', color: '#DC2626' }} />
                    </div>
                    <div>
                        <div style={{ fontSize: '12px', fontWeight: 600, color: '#DC2626', marginBottom: '4px' }}>
                            Complaint Guidelines
                        </div>
                        <p style={{ fontSize: '11px', color: '#991B1B', lineHeight: '1.6', margin: 0 }}>
                            Be specific when describing issues. Include location, time, and relevant details. The administration will review and respond within 48-72 hours.
                        </p>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default StudentComplaints;
