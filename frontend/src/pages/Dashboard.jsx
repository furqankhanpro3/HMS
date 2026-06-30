import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useHostel } from '@/context/useHostel';
import { Link } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import {
  Building2,
  UserPlus,
  MessageSquare,
  Plus,
  ArrowUpRight,
  ChevronRight,
  DollarSign,
  CreditCard,
  AlertTriangle,
  Receipt,
  Loader2,
} from 'lucide-react';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June', 
  'July', 'August', 'September', 'October', 'November', 'December'
];

const YEARS = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 2 + i);

const Dashboard = () => {
  const { students, hostels, complaints, challans, getFilteredChallans } = useHostel();
  const { user } = useAuth();
  const hasAdminAccess = user?.role === 'admin' || user?.role === 'superadmin' || user?.isAdmin;

  // Filters State
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');
  const [dashboardChallans, setDashboardChallans] = useState([]);
  const [loadingChallans, setLoadingChallans] = useState(false);
  const [selectedHostelForChart, setSelectedHostelForChart] = useState('');

  // Fetch Filtered Challans when filters change
  useEffect(() => {
    const fetchFilteredData = async () => {
      setLoadingChallans(true);
      const res = await getFilteredChallans({
        feeMonth: selectedMonth === 'all' ? undefined : selectedMonth,
        feeYear: selectedYear === 'all' ? undefined : selectedYear,
      });
      if (res.success) {
        setDashboardChallans(res.data);
      } else {
        setDashboardChallans(Array.isArray(challans) ? challans : []);
      }
      setLoadingChallans(false);
    };

    if (hasAdminAccess) {
      fetchFilteredData();
    }
  }, [selectedMonth, selectedYear, challans]);

  // Admin Stats
  const totalStudents = students.length;
  const openComplaints = complaints.filter(c => c.status === 'Pending' || c.status === 'In Progress').length;

  // Fee Stats (Admin)
  const challanList = Array.isArray(dashboardChallans) ? dashboardChallans : [];
  const totalFeesCollected = challanList.reduce((sum, c) => sum + (c.receivedAmount || 0), 0);
  const totalOutstanding = challanList.reduce((sum, c) => sum + (c.balanceAmount || 0), 0);
  const recentPayments = [...challanList]
    .filter(c => c.receivedAmount > 0)
    .sort((a, b) => new Date(b.receivingDate || b.createdAt) - new Date(a.receivingDate || a.createdAt))
    .slice(0, 6);

  // Hostel Chart Metrics
  const hostelList = hostels || [];
  useEffect(() => {
    if (!selectedHostelForChart && hostelList.length > 0) {
      setSelectedHostelForChart(hostelList[0].name);
    }
  }, [hostelList]);

  const activeHostelObj = hostelList.find(h => h.name === selectedHostelForChart);
  let occupiedSeats = 0;
  let vacantSeats = 0;
  let totalCapacity = 0;

  if (activeHostelObj && Array.isArray(activeHostelObj.rooms)) {
    activeHostelObj.rooms.forEach(room => {
      const occupantsCount = Array.isArray(room.occupants) ? room.occupants.length : 0;
      const capacity = Number(room.capacity) || 1;
      occupiedSeats += occupantsCount;
      totalCapacity += capacity;
    });
    vacantSeats = Math.max(0, totalCapacity - occupiedSeats);
  }

  const pieData = [
    { name: 'Occupied', value: occupiedSeats, color: '#1E1E1E' },
    { name: 'Vacant', value: vacantSeats, color: '#D4D4D4' }
  ];

  // Sample room data
  const sampleRooms = hostels.slice(0, 1).flatMap(hostel => 
    hostel.rooms.slice(0, 6).map(room => ({
      roomNumber: room.roomNumber,
      block: hostel.name,
      student: room.occupants.length > 0 ? (room.occupants[0].name || room.occupants[0].user?.name || 'Student') : '-',
      status: room.occupants.length >= room.capacity ? 'Occupied' : room.occupants.length > 0 ? 'Occupied' : 'Vacant'
    }))
  );

  // Student view — Fee stats
  if (!hasAdminAccess) {
    const studentProfile = students.find(s =>
      (s.user?._id === user?._id || s.user === user?._id) ||
      (s.boardingNumber === user?.boardingNumber && user?.boardingNumber)
    );
    const boardingNo = studentProfile?.boardingNumber;
    const myChallans = boardingNo
      ? challanList.filter(c => c.boardingNo === boardingNo)
      : challanList;

    const monthlyFee = studentProfile?.fee || (myChallans.length > 0 ? myChallans[0].totalAmount : 0);
    const outstandingBalance = myChallans.reduce((sum, c) => sum + (c.balanceAmount || 0), 0);
    const recentStudentPayments = [...myChallans]
      .filter(c => c.receivedAmount > 0)
      .sort((a, b) => new Date(b.receivingDate || b.createdAt) - new Date(a.receivingDate || a.createdAt))
      .slice(0, 5);

    return (
      <MainLayout>
        <div className="mb-8 animate-fade-in">
          <h1 style={{ fontSize: '24px', fontWeight: 600, color: '#1E1E1E', margin: 0 }}>
            Hello, {user?.name || 'Student'}!
          </h1>
          <p style={{ marginTop: '8px', fontSize: '13px', color: '#737373' }}>
            Your personal hostel dashboard
          </p>
        </div>

        {/* Student Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-slide-up" style={{ marginBottom: '24px' }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '10px',
            border: '1px solid #E5E5E5',
            padding: '20px'
          }}>
            <Building2 style={{ width: '28px', height: '28px', color: '#22C55E', marginBottom: '12px' }} />
            <div style={{ fontSize: '24px', fontWeight: 600, color: '#1E1E1E', marginBottom: '4px' }}>
              Active
            </div>
            <div style={{ fontSize: '12px', color: '#737373' }}>
              Current registration
            </div>
          </div>

          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '10px',
            border: '1px solid #E5E5E5',
            padding: '20px'
          }}>
            <DollarSign style={{ width: '28px', height: '28px', color: '#1E1E1E', marginBottom: '12px' }} />
            <div style={{ fontSize: '24px', fontWeight: 600, color: '#1E1E1E', marginBottom: '4px' }}>
              Rs. {monthlyFee?.toLocaleString() || '0'}
            </div>
            <div style={{ fontSize: '12px', color: '#737373' }}>
              Monthly fee
            </div>
          </div>

          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '10px',
            border: '1px solid #E5E5E5',
            padding: '20px'
          }}>
            <AlertTriangle style={{ width: '28px', height: '28px', color: outstandingBalance > 0 ? '#EF4444' : '#22C55E', marginBottom: '12px' }} />
            <div style={{ fontSize: '24px', fontWeight: 600, color: outstandingBalance > 0 ? '#EF4444' : '#1E1E1E', marginBottom: '4px' }}>
              Rs. {outstandingBalance.toLocaleString()}
            </div>
            <div style={{ fontSize: '12px', color: '#737373' }}>
              Outstanding balance
            </div>
          </div>
        </div>

        {/* Recent Payments Table */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '10px',
          border: '1px solid #E5E5E5',
          padding: '20px'
        }} className="animate-slide-up">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#1E1E1E', margin: 0 }}>
              Recent Payments
            </h3>
            <Link to="/admin/fee" style={{ fontSize: '11px', color: '#1E1E1E', textDecoration: 'none', fontWeight: 500 }}>
              View All →
            </Link>
          </div>
          {recentStudentPayments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: '#737373' }}>
              <Receipt style={{ width: '32px', height: '32px', margin: '0 auto 8px', opacity: 0.3 }} />
              <p style={{ fontSize: '12px' }}>No payment records yet</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #E5E5E5' }}>
                  <th style={{ fontSize: '10px', fontWeight: 600, color: '#737373', textTransform: 'uppercase', textAlign: 'left', padding: '8px 0', letterSpacing: '0.05em' }}>MONTH</th>
                  <th style={{ fontSize: '10px', fontWeight: 600, color: '#737373', textTransform: 'uppercase', textAlign: 'left', padding: '8px 0', letterSpacing: '0.05em' }}>TOTAL</th>
                  <th style={{ fontSize: '10px', fontWeight: 600, color: '#737373', textTransform: 'uppercase', textAlign: 'left', padding: '8px 0', letterSpacing: '0.05em' }}>PAID</th>
                  <th style={{ fontSize: '10px', fontWeight: 600, color: '#737373', textTransform: 'uppercase', textAlign: 'left', padding: '8px 0', letterSpacing: '0.05em' }}>DUE</th>
                  <th style={{ fontSize: '10px', fontWeight: 600, color: '#737373', textTransform: 'uppercase', textAlign: 'left', padding: '8px 0', letterSpacing: '0.05em' }}>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {recentStudentPayments.map((challan, index) => (
                  <tr key={challan._id || index} style={{ borderBottom: '1px solid #F5F5F5' }}>
                    <td style={{ fontSize: '12px', color: '#1E1E1E', padding: '12px 0', fontWeight: 500 }}>
                      {challan.feeMonth} {challan.feeYear}
                    </td>
                    <td style={{ fontSize: '12px', color: '#737373', padding: '12px 0' }}>
                      Rs. {challan.totalAmount?.toLocaleString()}
                    </td>
                    <td style={{ fontSize: '12px', color: '#22C55E', padding: '12px 0' }}>
                      Rs. {challan.receivedAmount?.toLocaleString()}
                    </td>
                    <td style={{ fontSize: '12px', color: challan.balanceAmount > 0 ? '#EF4444' : '#737373', padding: '12px 0' }}>
                      Rs. {challan.balanceAmount?.toLocaleString()}
                    </td>
                    <td style={{ padding: '12px 0' }}>
                      <span style={{
                        fontSize: '10px',
                        fontWeight: 500,
                        padding: '4px 10px',
                        borderRadius: '12px',
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
          )}
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {/* Top Bar */}
      <div 
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
        style={{
          backgroundColor: '#FFFFFF',
          minHeight: '54px',
          borderBottom: '1px solid #E5E5E5',
          padding: '12px 24px',
          marginBottom: '24px',
          marginTop: '-16px',
          marginLeft: '-16px',
          marginRight: '-16px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h1 style={{ fontSize: '15px', fontWeight: 600, color: '#1E1E1E', margin: 0 }}>
            Admin Dashboard
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: '12px' }}>
            <select 
              value={selectedMonth} 
              onChange={(e) => setSelectedMonth(e.target.value)}
              style={{
                padding: '4px 10px',
                fontSize: '11px',
                borderRadius: '6px',
                border: '1px solid #E5E5E5',
                backgroundColor: '#FFFFFF',
                color: '#1E1E1E',
                fontWeight: 500,
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              <option value="all">All Months</option>
              {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>

            <select 
              value={selectedYear} 
              onChange={(e) => setSelectedYear(e.target.value)}
              style={{
                padding: '4px 10px',
                fontSize: '11px',
                borderRadius: '6px',
                border: '1px solid #E5E5E5',
                backgroundColor: '#FFFFFF',
                color: '#1E1E1E',
                fontWeight: 500,
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              <option value="all">All Years</option>
              {YEARS.map(y => <option key={y} value={y.toString()}>{y}</option>)}
            </select>
            {loadingChallans && <Loader2 className="h-3.5 w-3.5 animate-spin opacity-60" />}
          </div>
        </div>
        
        <Link to="/admin/admissions">
          <button style={{
            backgroundColor: '#1E1E1E',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '7px',
            padding: '8px 16px',
            fontSize: '12px',
            fontWeight: 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <Plus style={{ width: '14px', height: '14px' }} />
            New
          </button>
        </Link>
      </div>

      {/* Stat Cards Row — responsive columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" style={{ marginBottom: '24px' }}>
        {/* Total Students */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '10px',
          border: '1px solid #E5E5E5',
          padding: '16px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '10px', fontWeight: 600, color: '#737373', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              TOTAL STUDENTS
            </span>
            <div style={{ width: '7px', height: '7px', backgroundColor: '#22C55E', borderRadius: '50%' }} />
          </div>
          <div style={{ fontSize: '28px', fontWeight: 600, color: '#1E1E1E', marginBottom: '4px' }}>
            {totalStudents}
          </div>
          <div style={{ fontSize: '11px', color: '#737373', marginBottom: '12px' }}>
            Admitted students
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '10px', color: '#22C55E', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ArrowUpRight style={{ width: '10px', height: '10px' }} />
              +2 this month
            </span>
            <Link to="/admin/tracking" style={{ fontSize: '10px', color: '#1E1E1E', textDecoration: 'none', fontWeight: 500 }}>
              View →
            </Link>
          </div>
        </div>

        {/* Fees Collected */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '10px',
          border: '1px solid #E5E5E5',
          padding: '16px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '10px', fontWeight: 600, color: '#737373', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              FEES COLLECTED
            </span>
            <div style={{ width: '7px', height: '7px', backgroundColor: '#22C55E', borderRadius: '50%' }} />
          </div>
          <div style={{ fontSize: '28px', fontWeight: 600, color: '#1E1E1E', marginBottom: '4px' }}>
            Rs. {totalFeesCollected.toLocaleString()}
          </div>
          <div style={{ fontSize: '11px', color: '#737373', marginBottom: '12px' }}>
            Total received
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '10px', color: '#22C55E', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <DollarSign style={{ width: '10px', height: '10px' }} />
              {challanList.filter(c => c.status === 'paid').length} fully paid
            </span>
            <Link to="/admin/fee" style={{ fontSize: '10px', color: '#1E1E1E', textDecoration: 'none', fontWeight: 500 }}>
              View →
            </Link>
          </div>
        </div>

        {/* Outstanding Fees */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '10px',
          border: '1px solid #E5E5E5',
          padding: '16px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '10px', fontWeight: 600, color: '#737373', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              OUTSTANDING FEES
            </span>
            <div style={{ width: '7px', height: '7px', backgroundColor: totalOutstanding > 0 ? '#F59E0B' : '#22C55E', borderRadius: '50%' }} />
          </div>
          <div style={{ fontSize: '28px', fontWeight: 600, color: totalOutstanding > 0 ? '#EF4444' : '#1E1E1E', marginBottom: '4px' }}>
            Rs. {totalOutstanding.toLocaleString()}
          </div>
          <div style={{ fontSize: '11px', color: '#737373', marginBottom: '12px' }}>
            Pending balance
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '10px', color: '#EF4444', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <AlertTriangle style={{ width: '10px', height: '10px' }} />
              {challanList.filter(c => c.status === 'pending' || c.status === 'partial').length} unpaid
            </span>
            <Link to="/admin/fee" style={{ fontSize: '10px', color: '#1E1E1E', textDecoration: 'none', fontWeight: 500 }}>
              View →
            </Link>
          </div>
        </div>

        {/* Open Complaints */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '10px',
          border: '1px solid #E5E5E5',
          padding: '16px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '10px', fontWeight: 600, color: '#737373', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              OPEN COMPLAINTS
            </span>
            <div style={{ width: '7px', height: '7px', backgroundColor: openComplaints > 0 ? '#F59E0B' : '#22C55E', borderRadius: '50%' }} />
          </div>
          <div style={{ fontSize: '28px', fontWeight: 600, color: openComplaints > 0 ? '#1E1E1E' : '#1E1E1E', marginBottom: '4px' }}>
            {openComplaints}
          </div>
          <div style={{ fontSize: '11px', color: '#737373', marginBottom: '12px' }}>
            Pending resolution
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '10px', color: '#EF4444', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <MessageSquare style={{ width: '10px', height: '10px' }} />
              {complaints.length} total
            </span>
            <Link to="/admin/complaints" style={{ fontSize: '10px', color: '#1E1E1E', textDecoration: 'none', fontWeight: 500 }}>
              View →
            </Link>
          </div>
        </div>
      </div>

      {/* Middle Section: Occupancy + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4" style={{ marginBottom: '24px' }}>
        {/* Occupancy Pie Chart */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '10px',
          border: '1px solid #E5E5E5',
          padding: '20px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#1E1E1E', margin: 0 }}>
              Room Occupancy
            </h3>
            <select
              value={selectedHostelForChart}
              onChange={(e) => setSelectedHostelForChart(e.target.value)}
              style={{
                padding: '3px 8px',
                fontSize: '10px',
                borderRadius: '6px',
                border: '1px solid #E5E5E5',
                backgroundColor: '#FAFAFA',
                color: '#1E1E1E',
                fontWeight: 500,
                cursor: 'pointer',
                outline: 'none',
                maxWidth: '110px'
              }}
            >
              {hostelList.map(h => <option key={h._id || h.name} value={h.name}>{h.name}</option>)}
            </select>
          </div>
          {totalCapacity === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: '#737373' }}>
              <Building2 style={{ width: '28px', height: '28px', margin: '0 auto 8px', opacity: 0.3 }} />
              <p style={{ fontSize: '11px' }}>No room data</p>
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={38}
                    outerRadius={58}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ fontSize: '11px', borderRadius: '8px', border: '1px solid #E5E5E5', padding: '6px 10px' }}
                    formatter={(value, name) => [`${value} beds`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
                {pieData.map(entry => (
                  <div key={entry.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: entry.color, flexShrink: 0 }} />
                      <span style={{ fontSize: '11px', color: '#525252' }}>{entry.name}</span>
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#1E1E1E' }}>
                      {entry.value} <span style={{ fontSize: '10px', color: '#737373', fontWeight: 400 }}>/ {totalCapacity}</span>
                    </span>
                  </div>
                ))}
                <div style={{ marginTop: '4px', height: '3px', backgroundColor: '#F5F5F5', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${totalCapacity > 0 ? (occupiedSeats / totalCapacity) * 100 : 0}%`, backgroundColor: '#1E1E1E', transition: 'width 0.4s ease' }} />
                </div>
                <div style={{ fontSize: '10px', color: '#737373', textAlign: 'right' }}>
                  {totalCapacity > 0 ? Math.round((occupiedSeats / totalCapacity) * 100) : 0}% occupancy rate
                </div>
              </div>
            </>
          )}
        </div>

        {/* Quick Actions */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '10px',
          border: '1px solid #E5E5E5',
          padding: '20px'
        }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#1E1E1E', marginBottom: '16px', marginTop: 0 }}>
            Quick Actions
          </h3>
          
          <Link to="/admin/admissions" style={{ textDecoration: 'none' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 0',
              borderBottom: '1px solid #F5F5F5',
              cursor: 'pointer'
            }}>
              <div style={{
                width: '28px',
                height: '28px',
                backgroundColor: '#F5F5F5',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <UserPlus style={{ width: '14px', height: '14px', color: '#525252' }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '12px', fontWeight: 500, color: '#1E1E1E' }}>New Admission</div>
                <div style={{ fontSize: '10px', color: '#737373' }}>Register new student</div>
              </div>
              <ChevronRight style={{ width: '14px', height: '14px', color: '#A3A3A3' }} />
            </div>
          </Link>

          <Link to="/admin/complaints" style={{ textDecoration: 'none' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 0',
              borderBottom: '1px solid #F5F5F5',
              cursor: 'pointer'
            }}>
              <div style={{
                width: '28px',
                height: '28px',
                backgroundColor: '#F5F5F5',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <MessageSquare style={{ width: '14px', height: '14px', color: '#525252' }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '12px', fontWeight: 500, color: '#1E1E1E' }}>Complaints</div>
                <div style={{ fontSize: '10px', color: '#737373' }}>{openComplaints} unresolved</div>
              </div>
              <ChevronRight style={{ width: '14px', height: '14px', color: '#A3A3A3' }} />
            </div>
          </Link>

          <Link to="/admin/fee" style={{ textDecoration: 'none' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 0',
              borderBottom: '1px solid #F5F5F5',
              cursor: 'pointer'
            }}>
              <div style={{
                width: '28px',
                height: '28px',
                backgroundColor: '#F5F5F5',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <CreditCard style={{ width: '14px', height: '14px', color: '#525252' }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '12px', fontWeight: 500, color: '#1E1E1E' }}>Fee Management</div>
                <div style={{ fontSize: '10px', color: '#737373' }}>Record & track payments</div>
              </div>
              <ChevronRight style={{ width: '14px', height: '14px', color: '#A3A3A3' }} />
            </div>
          </Link>

          <Link to="/admin/tracking" style={{ textDecoration: 'none' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 0',
              cursor: 'pointer'
            }}>
              <div style={{
                width: '28px',
                height: '28px',
                backgroundColor: '#F5F5F5',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Building2 style={{ width: '14px', height: '14px', color: '#525252' }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '12px', fontWeight: 500, color: '#1E1E1E' }}>Student Tracking</div>
                <div style={{ fontSize: '10px', color: '#737373' }}>View rooms & students</div>
              </div>
              <ChevronRight style={{ width: '14px', height: '14px', color: '#A3A3A3' }} />
            </div>
          </Link>
        </div>
      </div>

      {/* Bottom Row: Room Snapshot + Recent Fee Collections */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-4">
        {/* Room Sample Table */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '10px',
          border: '1px solid #E5E5E5',
          padding: '20px'
        }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#1E1E1E', marginBottom: '16px', marginTop: 0 }}>
            Room Snapshot
          </h3>
          {sampleRooms.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: '#737373' }}>
              <Building2 style={{ width: '28px', height: '28px', margin: '0 auto 8px', opacity: 0.3 }} />
              <p style={{ fontSize: '11px' }}>No rooms available</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #E5E5E5' }}>
                  <th style={{ fontSize: '10px', fontWeight: 600, color: '#737373', textTransform: 'uppercase', textAlign: 'left', padding: '8px 0', letterSpacing: '0.05em' }}>ROOM</th>
                  <th style={{ fontSize: '10px', fontWeight: 600, color: '#737373', textTransform: 'uppercase', textAlign: 'left', padding: '8px 0', letterSpacing: '0.05em' }}>BLOCK</th>
                  <th style={{ fontSize: '10px', fontWeight: 600, color: '#737373', textTransform: 'uppercase', textAlign: 'left', padding: '8px 0', letterSpacing: '0.05em' }}>STUDENT</th>
                  <th style={{ fontSize: '10px', fontWeight: 600, color: '#737373', textTransform: 'uppercase', textAlign: 'left', padding: '8px 0', letterSpacing: '0.05em' }}>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {sampleRooms.map((room, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid #F5F5F5' }}>
                    <td style={{ fontSize: '12px', color: '#1E1E1E', padding: '12px 0', fontWeight: 500 }}>R-{room.roomNumber}</td>
                    <td style={{ fontSize: '12px', color: '#737373', padding: '12px 0' }}>{room.block}</td>
                    <td style={{ fontSize: '12px', color: '#1E1E1E', padding: '12px 0' }}>{room.student}</td>
                    <td style={{ padding: '12px 0' }}>
                      <span style={{
                        fontSize: '10px',
                        fontWeight: 500,
                        padding: '4px 10px',
                        borderRadius: '12px',
                        backgroundColor: room.status === 'Occupied' ? '#DCFCE7' : '#FEE2E2',
                        color: room.status === 'Occupied' ? '#16A34A' : '#DC2626'
                      }}>
                        {room.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Recent Fee Collections */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '10px',
          border: '1px solid #E5E5E5',
          padding: '20px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#1E1E1E', margin: 0 }}>
              Recent Fee Collections
            </h3>
            <Link to="/admin/fee" style={{ fontSize: '11px', color: '#1E1E1E', textDecoration: 'none', fontWeight: 500 }}>
              View All →
            </Link>
          </div>
          {recentPayments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: '#737373' }}>
              <Receipt style={{ width: '32px', height: '32px', margin: '0 auto 8px', opacity: 0.3 }} />
              <p style={{ fontSize: '12px' }}>No fee collections yet</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #E5E5E5' }}>
                  <th style={{ fontSize: '10px', fontWeight: 600, color: '#737373', textTransform: 'uppercase', textAlign: 'left', padding: '8px 0', letterSpacing: '0.05em' }}>STUDENT</th>
                  <th style={{ fontSize: '10px', fontWeight: 600, color: '#737373', textTransform: 'uppercase', textAlign: 'left', padding: '8px 0', letterSpacing: '0.05em' }}>MONTH</th>
                  <th style={{ fontSize: '10px', fontWeight: 600, color: '#737373', textTransform: 'uppercase', textAlign: 'left', padding: '8px 0', letterSpacing: '0.05em' }}>PAID</th>
                  <th style={{ fontSize: '10px', fontWeight: 600, color: '#737373', textTransform: 'uppercase', textAlign: 'left', padding: '8px 0', letterSpacing: '0.05em' }}>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {recentPayments.map((challan, index) => (
                  <tr key={challan._id || index} style={{ borderBottom: '1px solid #F5F5F5' }}>
                    <td style={{ fontSize: '12px', color: '#1E1E1E', padding: '12px 0', fontWeight: 500 }}>
                      {challan.boarderName}
                    </td>
                    <td style={{ fontSize: '12px', color: '#737373', padding: '12px 0' }}>
                      {challan.feeMonth} {challan.feeYear}
                    </td>
                    <td style={{ fontSize: '12px', color: '#22C55E', padding: '12px 0' }}>
                      Rs. {challan.receivedAmount?.toLocaleString()}
                    </td>
                    <td style={{ padding: '12px 0' }}>
                      <span style={{
                        fontSize: '10px',
                        fontWeight: 500,
                        padding: '4px 10px',
                        borderRadius: '12px',
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
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
