import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, UtensilsCrossed, AlertTriangle, LogOut, ChevronRight, Building2, DollarSign } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useHostel } from '@/context/useHostel';
import MainLayout from '@/components/layout/MainLayout';

const StudentPortal = () => {
    const { user, logout } = useAuth();
    const { students, challans } = useHostel();
    const navigate = useNavigate();

    const studentRecord = students.find(s =>
        (s.user?._id === user?._id || s.user === user?._id) ||
        (s.boardingNumber === user?.boardingNumber && user?.boardingNumber)
    );

    const boardingNumber = studentRecord?.boardingNumber || user?.boardingNumber;

    const challanList = useMemo(() => Array.isArray(challans) ? challans : [], [challans]);
    const myChallans = useMemo(() => {
        if (!boardingNumber) return challanList;
        return challanList.filter(c => c.boardingNo === boardingNumber);
    }, [boardingNumber, challanList]);

    const monthlyFee = studentRecord?.fee || (myChallans.length > 0 ? myChallans[0].totalAmount : 0);
    const outstandingBalance = myChallans.reduce((sum, c) => sum + (c.balanceAmount || 0), 0);

    const portalActions = [
        {
            title: 'My Profile',
            description: 'View personal information and hostel details.',
            icon: User,
            path: '/profile',
        },
        {
            title: 'Mess Menu',
            description: 'Check daily menu and meal timings.',
            icon: UtensilsCrossed,
            path: '/mess-info',
        },
        {
            title: 'Report Issues',
            description: 'Submit complaints for hostel concerns.',
            icon: AlertTriangle,
            path: '/complaints',
        },
    ];

    return (
        <MainLayout>
            <div style={{ maxWidth: '960px', margin: '0 auto', padding: '32px 16px' }} className="animate-fade-in">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4" style={{ marginBottom: '32px' }}>
                    <div>
                        <h1 style={{ fontSize: '22px', fontWeight: 600, color: '#1E1E1E', margin: 0 }}>
                            Welcome, {user?.name || 'Student'}
                        </h1>
                        <p style={{ fontSize: '13px', color: '#737373', marginTop: '4px' }}>
                            Manage your hostel life from one central hub.
                        </p>
                    </div>
                    <button
                        onClick={logout}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            padding: '8px 16px', borderRadius: '7px',
                            border: '1px solid #E5E5E5', backgroundColor: '#FFFFFF',
                            color: '#1E1E1E', fontSize: '12px', fontWeight: 500,
                            cursor: 'pointer'
                        }}
                    >
                        <LogOut style={{ width: '14px', height: '14px' }} />
                        Sign Out
                    </button>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" style={{ marginBottom: '32px' }}>
                    <div
                        style={{
                            backgroundColor: '#FFFFFF', borderRadius: '10px',
                            border: '1px solid #E5E5E5', padding: '20px', cursor: 'pointer'
                        }}
                        onClick={() => navigate('/profile')}
                    >
                        <Building2 style={{ width: '24px', height: '24px', color: '#1E1E1E', marginBottom: '10px' }} />
                        <div style={{ fontSize: '10px', fontWeight: 600, color: '#737373', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                            BOARDING NO.
                        </div>
                        <div style={{ fontSize: '20px', fontWeight: 600, color: '#1E1E1E' }}>
                            {boardingNumber || 'N/A'}
                        </div>
                    </div>

                    <div
                        style={{
                            backgroundColor: '#FFFFFF', borderRadius: '10px',
                            border: '1px solid #E5E5E5', padding: '20px', cursor: 'pointer'
                        }}
                        onClick={() => navigate('/profile')}
                    >
                        <DollarSign style={{ width: '24px', height: '24px', color: '#1E1E1E', marginBottom: '10px' }} />
                        <div style={{ fontSize: '10px', fontWeight: 600, color: '#737373', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                            MONTHLY FEE
                        </div>
                        <div style={{ fontSize: '20px', fontWeight: 600, color: '#1E1E1E' }}>
                            Rs. {monthlyFee?.toLocaleString() || '0'}
                        </div>
                    </div>

                    <div
                        style={{
                            backgroundColor: '#FFFFFF', borderRadius: '10px',
                            border: '1px solid #E5E5E5', padding: '20px', cursor: 'pointer'
                        }}
                        onClick={() => navigate('/profile')}
                    >
                        <AlertTriangle style={{ width: '24px', height: '24px', color: outstandingBalance > 0 ? '#EF4444' : '#22C55E', marginBottom: '10px' }} />
                        <div style={{ fontSize: '10px', fontWeight: 600, color: '#737373', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                            OUTSTANDING
                        </div>
                        <div style={{ fontSize: '20px', fontWeight: 600, color: outstandingBalance > 0 ? '#EF4444' : '#1E1E1E' }}>
                            Rs. {outstandingBalance.toLocaleString()}
                        </div>
                    </div>
                </div>

                {/* Action Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {portalActions.map((action) => (
                        <div
                            key={action.title}
                            style={{
                                backgroundColor: '#FFFFFF', borderRadius: '10px',
                                border: '1px solid #E5E5E5', padding: '24px',
                                cursor: 'pointer', transition: 'border-color 0.15s'
                            }}
                            onClick={() => navigate(action.path)}
                            onMouseEnter={(e) => e.currentTarget.style.borderColor = '#A3A3A3'}
                            onMouseLeave={(e) => e.currentTarget.style.borderColor = '#E5E5E5'}
                        >
                            <div style={{
                                width: '36px', height: '36px', borderRadius: '8px',
                                backgroundColor: '#F5F5F5',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                marginBottom: '16px'
                            }}>
                                <action.icon style={{ width: '18px', height: '18px', color: '#525252' }} />
                            </div>
                            <div style={{ fontSize: '14px', fontWeight: 600, color: '#1E1E1E', marginBottom: '6px' }}>
                                {action.title}
                            </div>
                            <div style={{ fontSize: '12px', color: '#737373', marginBottom: '12px', lineHeight: '1.5' }}>
                                {action.description}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 500, color: '#1E1E1E' }}>
                                Open <ChevronRight style={{ width: '12px', height: '12px' }} />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Support Section */}
                <div style={{
                    marginTop: '40px', padding: '24px', borderRadius: '10px',
                    backgroundColor: '#FAFAFA', border: '1px solid #E5E5E5', textAlign: 'center'
                }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#1E1E1E', marginBottom: '6px' }}>
                        Need Assistance?
                    </div>
                    <p style={{ fontSize: '12px', color: '#737373', maxWidth: '400px', margin: '0 auto 16px', lineHeight: '1.6' }}>
                        If you are having trouble with the portal or have questions about hostel life, contact the warden or hostel administration.
                    </p>
                    <button
                        style={{
                            padding: '8px 20px', borderRadius: '20px',
                            border: '1px solid #E5E5E5', backgroundColor: '#FFFFFF',
                            color: '#1E1E1E', fontSize: '12px', fontWeight: 500,
                            cursor: 'pointer'
                        }}
                    >
                        Contact Administration
                    </button>
                </div>
            </div>
        </MainLayout>
    );
};

export default StudentPortal;
