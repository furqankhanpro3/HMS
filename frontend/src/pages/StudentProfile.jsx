import React, { useState, useMemo } from 'react';
import {
    BadgeCheck,
    Phone,
    Home,
    MapPin,
    ClipboardList,
    DollarSign,
    AlertTriangle,
    Receipt,
    CreditCard,
    User
} from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/context/AuthContext';
import { useHostel } from '@/context/useHostel';

const StudentProfile = () => {
    const { user } = useAuth();
    const { students, challans } = useHostel();
    const [activeTab, setActiveTab] = useState('profile');

    const studentProfile = students.find(s =>
        (s.user?._id === user?._id || s.user === user?._id) ||
        (s.boardingNumber === user?.boardingNumber && user?.boardingNumber)
    ) || {
        name: user?.name,
        boardingNumber: user?.boardingNumber || 'N/A',
        fatherName: 'N/A',
        contact: 'N/A',
        parentContact: 'N/A',
        room: null,
        hostel: null,
        admissionDate: new Date(),
        status: 'Active',
        fee: 0
    };

    const challanList = useMemo(() => Array.isArray(challans) ? challans : [], [challans]);
    const boardingNo = studentProfile?.boardingNumber;

    const myChallans = useMemo(() => {
        if (!boardingNo) return challanList;
        return challanList
            .filter(c => c.boardingNo === boardingNo)
            .sort((a, b) => new Date(b.receivingDate || b.createdAt) - new Date(a.receivingDate || a.createdAt));
    }, [boardingNo, challanList]);

    const monthlyFee = studentProfile?.fee || (myChallans.length > 0 ? myChallans[0].totalAmount : 0);
    const outstandingBalance = myChallans.reduce((sum, c) => sum + (c.balanceAmount || 0), 0);
    const totalPaid = myChallans.reduce((sum, c) => sum + (c.receivedAmount || 0), 0);

    const profileItems = [
        { label: 'BOARDING NO.', value: studentProfile.boardingNumber || 'N/A', icon: BadgeCheck },
        { label: 'FATHER NAME', value: studentProfile.fatherName || 'N/A', icon: User },
        { label: 'CONTACT', value: studentProfile.contact || 'N/A', icon: Phone },
        { label: 'PARENT CONTACT', value: studentProfile.parentContact || 'N/A', icon: Phone },
        { label: 'HOSTEL', value: studentProfile.hostel?.name || studentProfile.room?.hostel?.name || studentProfile.hostelName || 'Not Assigned', icon: Home },
        { label: 'ROOM NO.', value: studentProfile.room?.roomNumber || studentProfile.roomNumber || 'N/A', icon: MapPin },
    ];

    const tabs = [
        { id: 'profile', label: 'Profile', icon: ClipboardList },
        { id: 'fees', label: 'Fee Ledger', icon: Receipt },
    ];

    return (
        <MainLayout>
            <div style={{ maxWidth: '880px', margin: '0 auto', padding: '32px 16px' }} className="animate-fade-in">
                {/* Header */}
                <div style={{ marginBottom: '24px' }}>
                    <h1 style={{ fontSize: '22px', fontWeight: 600, color: '#1E1E1E', margin: 0 }}>
                        {studentProfile.user?.name || studentProfile.name}
                    </h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
                        <span style={{
                            fontSize: '11px', fontWeight: 500, padding: '3px 10px',
                            borderRadius: '12px', backgroundColor: '#F5F5F5', color: '#1E1E1E'
                        }}>
                            {studentProfile.boardingNumber || 'N/A'}
                        </span>
                        <span style={{
                            fontSize: '11px', fontWeight: 500, padding: '3px 10px',
                            borderRadius: '12px',
                            backgroundColor: studentProfile.status === 'Active' ? '#DCFCE7' : '#FEE2E2',
                            color: studentProfile.status === 'Active' ? '#16A34A' : '#DC2626'
                        }}>
                            {studentProfile.status || 'Active'}
                        </span>
                    </div>
                    {studentProfile.admissionDate && (
                        <p style={{ fontSize: '11px', color: '#737373', marginTop: '6px' }}>
                            Admitted {new Date(studentProfile.admissionDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                        </p>
                    )}
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: '4px', marginBottom: '28px', borderBottom: '1px solid #E5E5E5', paddingBottom: '0' }}>
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '6px',
                                padding: '10px 16px',
                                fontSize: '13px', fontWeight: activeTab === tab.id ? 600 : 400,
                                color: activeTab === tab.id ? '#1E1E1E' : '#737373',
                                backgroundColor: 'transparent',
                                border: 'none',
                                borderBottom: activeTab === tab.id ? '2px solid #1E1E1E' : '2px solid transparent',
                                cursor: 'pointer',
                                transition: 'color 0.15s, border-color 0.15s',
                                marginBottom: '-1px'
                            }}
                        >
                            <tab.icon style={{ width: '14px', height: '14px' }} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Profile Tab */}
                {activeTab === 'profile' && (
                    <div style={{
                        backgroundColor: '#FFFFFF', borderRadius: '10px',
                        border: '1px solid #E5E5E5', padding: '20px'
                    }} className="animate-slide-up">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                            <ClipboardList style={{ width: '16px', height: '16px', color: '#1E1E1E' }} />
                            <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#1E1E1E', margin: 0 }}>
                                Basic Information
                            </h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {profileItems.map((item, index) => (
                                <div key={index} style={{
                                    display: 'flex', alignItems: 'center', gap: '12px',
                                    padding: '12px', borderRadius: '8px', backgroundColor: '#FAFAFA'
                                }}>
                                    <div style={{
                                        width: '32px', height: '32px', borderRadius: '6px',
                                        backgroundColor: '#FFFFFF',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                                    }}>
                                        <item.icon style={{ width: '16px', height: '16px', color: '#525252' }} />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '10px', fontWeight: 600, color: '#737373', letterSpacing: '0.05em', marginBottom: '2px' }}>
                                            {item.label}
                                        </div>
                                        <div style={{ fontSize: '13px', fontWeight: 500, color: '#1E1E1E' }}>
                                            {item.value}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Fee Ledger Tab */}
                {activeTab === 'fees' && (
                    <div className="animate-slide-up">
                        {/* Fee Summary */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" style={{ marginBottom: '20px' }}>
                            <div style={{
                                backgroundColor: '#FFFFFF', borderRadius: '10px',
                                border: '1px solid #E5E5E5', padding: '16px',
                                display: 'flex', alignItems: 'center', gap: '12px'
                            }}>
                                <div style={{
                                    width: '36px', height: '36px', borderRadius: '8px',
                                    backgroundColor: '#F5F5F5',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                                }}>
                                    <DollarSign style={{ width: '18px', height: '18px', color: '#525252' }} />
                                </div>
                                <div>
                                    <div style={{ fontSize: '10px', fontWeight: 600, color: '#737373', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                                        MONTHLY FEE
                                    </div>
                                    <div style={{ fontSize: '18px', fontWeight: 600, color: '#1E1E1E' }}>
                                        Rs. {monthlyFee?.toLocaleString() || '0'}
                                    </div>
                                </div>
                            </div>

                            <div style={{
                                backgroundColor: '#FFFFFF', borderRadius: '10px',
                                border: outstandingBalance > 0 ? '1px solid #FCA5A5' : '1px solid #86EFAC',
                                padding: '16px',
                                display: 'flex', alignItems: 'center', gap: '12px'
                            }}>
                                <div style={{
                                    width: '36px', height: '36px', borderRadius: '8px',
                                    backgroundColor: outstandingBalance > 0 ? '#FEE2E2' : '#DCFCE7',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                                }}>
                                    <AlertTriangle style={{ width: '18px', height: '18px', color: outstandingBalance > 0 ? '#EF4444' : '#22C55E' }} />
                                </div>
                                <div>
                                    <div style={{ fontSize: '10px', fontWeight: 600, color: '#737373', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                                        OUTSTANDING
                                    </div>
                                    <div style={{ fontSize: '18px', fontWeight: 600, color: outstandingBalance > 0 ? '#EF4444' : '#22C55E' }}>
                                        Rs. {outstandingBalance.toLocaleString()}
                                    </div>
                                </div>
                            </div>

                            <div style={{
                                backgroundColor: '#FFFFFF', borderRadius: '10px',
                                border: '1px solid #86EFAC', padding: '16px',
                                display: 'flex', alignItems: 'center', gap: '12px'
                            }}>
                                <div style={{
                                    width: '36px', height: '36px', borderRadius: '8px',
                                    backgroundColor: '#DCFCE7',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                                }}>
                                    <CreditCard style={{ width: '18px', height: '18px', color: '#16A34A' }} />
                                </div>
                                <div>
                                    <div style={{ fontSize: '10px', fontWeight: 600, color: '#737373', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                                        TOTAL PAID
                                    </div>
                                    <div style={{ fontSize: '18px', fontWeight: 600, color: '#16A34A' }}>
                                        Rs. {totalPaid.toLocaleString()}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Fee Payment History Table */}
                        <div style={{
                            backgroundColor: '#FFFFFF', borderRadius: '10px',
                            border: '1px solid #E5E5E5', padding: '20px'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                                <Receipt style={{ width: '16px', height: '16px', color: '#1E1E1E' }} />
                                <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#1E1E1E', margin: 0 }}>
                                    Payment History
                                </h3>
                            </div>
                            {myChallans.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '40px 0', color: '#737373' }}>
                                    <Receipt style={{ width: '32px', height: '32px', margin: '0 auto 8px', opacity: 0.2 }} />
                                    <p style={{ fontSize: '12px' }}>No payment records found</p>
                                </div>
                            ) : (
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr style={{ borderBottom: '1px solid #E5E5E5' }}>
                                                <th style={{ fontSize: '10px', fontWeight: 600, color: '#737373', textTransform: 'uppercase', textAlign: 'left', padding: '8px 0', letterSpacing: '0.05em' }}>MONTH</th>
                                                <th style={{ fontSize: '10px', fontWeight: 600, color: '#737373', textTransform: 'uppercase', textAlign: 'left', padding: '8px 0' }}>TOTAL</th>
                                                <th style={{ fontSize: '10px', fontWeight: 600, color: '#737373', textTransform: 'uppercase', textAlign: 'left', padding: '8px 0' }}>PAID</th>
                                                <th style={{ fontSize: '10px', fontWeight: 600, color: '#737373', textTransform: 'uppercase', textAlign: 'left', padding: '8px 0' }}>BALANCE</th>
                                                <th style={{ fontSize: '10px', fontWeight: 600, color: '#737373', textTransform: 'uppercase', textAlign: 'left', padding: '8px 0' }}>METHOD</th>
                                                <th style={{ fontSize: '10px', fontWeight: 600, color: '#737373', textTransform: 'uppercase', textAlign: 'left', padding: '8px 0' }}>DATE</th>
                                                <th style={{ fontSize: '10px', fontWeight: 600, color: '#737373', textTransform: 'uppercase', textAlign: 'left', padding: '8px 0' }}>STATUS</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {myChallans.map((challan) => (
                                                <tr key={challan._id} style={{ borderBottom: '1px solid #F5F5F5' }}>
                                                    <td style={{ fontSize: '12px', padding: '12px 0', fontWeight: 500, color: '#1E1E1E' }}>
                                                        {challan.feeMonth} {challan.feeYear}
                                                    </td>
                                                    <td style={{ fontSize: '12px', padding: '12px 0', color: '#737373' }}>
                                                        Rs. {challan.totalAmount?.toLocaleString()}
                                                    </td>
                                                    <td style={{ fontSize: '12px', padding: '12px 0', color: '#22C55E', fontWeight: 500 }}>
                                                        Rs. {challan.receivedAmount?.toLocaleString()}
                                                    </td>
                                                    <td style={{ fontSize: '12px', padding: '12px 0', color: challan.balanceAmount > 0 ? '#EF4444' : '#737373', fontWeight: challan.balanceAmount > 0 ? 500 : 400 }}>
                                                        Rs. {challan.balanceAmount?.toLocaleString()}
                                                    </td>
                                                    <td style={{ fontSize: '11px', padding: '12px 0', color: '#737373', textTransform: 'capitalize' }}>
                                                        {(challan.paymentMethod || '').replace('_', ' ')}
                                                    </td>
                                                    <td style={{ fontSize: '11px', padding: '12px 0', color: '#737373' }}>
                                                        {challan.receivingDate ? new Date(challan.receivingDate).toLocaleDateString() : '-'}
                                                    </td>
                                                    <td style={{ padding: '12px 0' }}>
                                                        <span style={{
                                                            fontSize: '10px', fontWeight: 500,
                                                            padding: '3px 10px', borderRadius: '10px',
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
                        </div>
                    </div>
                )}
            </div>
        </MainLayout>
    );
};

export default StudentProfile;
