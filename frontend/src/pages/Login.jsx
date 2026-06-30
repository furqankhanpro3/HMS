import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Building2, ShieldCheck, Users, Calendar, User } from 'lucide-react';

const Login = () => {
    const [activeTab, setActiveTab] = useState('admin');
    const [loginId, setLoginId] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!loginId || !password) {
            return;
        }

        setIsSubmitting(true);
        const result = await login(loginId, password, activeTab);
        setIsSubmitting(false);

        if (result.success) {
            const user = result.user || JSON.parse(localStorage.getItem('hms_user'));
            const isAdmin = user?.role === 'admin' || user?.role === 'superadmin' || user?.isAdmin;

            if (isAdmin) {
                navigate('/admin/dashboard');
            } else {
                navigate('/');
            }
        }
    };

    const switchTab = (tab) => {
        setActiveTab(tab);
        setLoginId('');
        setPassword('');
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif', flexDirection: 'row', flexWrap: 'wrap' }}>
            {/* Left Panel - Branding (hidden on mobile) */}
            <div className="hidden md:flex" style={{
                flex: 1,
                minWidth: '320px',
                backgroundColor: '#1E1E1E',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '48px',
                position: 'relative'
            }}>
                <div style={{ maxWidth: '400px', width: '100%' }}>
                    {/* Logo */}
                    <div style={{
                        width: '48px',
                        height: '48px',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 24px'
                    }}>
                        <Building2 style={{ width: '20px', height: '20px', color: '#FFFFFF' }} />
                    </div>

                    {/* Heading */}
                    <h1 style={{
                        fontSize: '28px',
                        fontWeight: 500,
                        color: '#FFFFFF',
                        textAlign: 'center',
                        marginBottom: '8px'
                    }}>
                        HMS Portal
                    </h1>

                    {/* Subtitle */}
                    <p style={{
                        fontSize: '13px',
                        color: 'rgba(255, 255, 255, 0.5)',
                        textAlign: 'center',
                        marginBottom: '40px'
                    }}>
                        Hostel Management System
                    </p>

                    {/* Feature Highlights */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '60px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                                width: '32px',
                                height: '32px',
                                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                                borderRadius: '6px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <Building2 style={{ width: '16px', height: '16px', color: '#FFFFFF' }} />
                            </div>
                            <span style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.8)' }}>
                                Manage rooms & admissions
                            </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                                width: '32px',
                                height: '32px',
                                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                                borderRadius: '6px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <Users style={{ width: '16px', height: '16px', color: '#FFFFFF' }} />
                            </div>
                            <span style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.8)' }}>
                                Track student activity
                            </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                                width: '32px',
                                height: '32px',
                                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                                borderRadius: '6px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <Calendar style={{ width: '16px', height: '16px', color: '#FFFFFF' }} />
                            </div>
                            <span style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.8)' }}>
                                Handle leaves & complaints
                            </span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div style={{
                    position: 'absolute',
                    bottom: '24px',
                    fontSize: '11px',
                    color: 'rgba(255, 255, 255, 0.3)',
                    textAlign: 'center'
                }}>
                    Secure admin & student access portal
                </div>
            </div>

            {/* Right Panel - Login Form */}
            <div style={{
                flex: 1,
                minWidth: '300px',
                backgroundColor: '#FFFFFF',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '32px 24px'
            }}>
                <div style={{ maxWidth: '420px', width: '100%' }}>
                    {/* Tab Switcher */}
                    <div style={{
                        backgroundColor: '#F5F5F5',
                        borderRadius: '8px',
                        padding: '4px',
                        display: 'flex',
                        gap: '4px',
                        marginBottom: '24px'
                    }}>
                        <button
                            onClick={() => switchTab('admin')}
                            style={{
                                flex: 1,
                                height: '40px',
                                backgroundColor: activeTab === 'admin' ? '#FFFFFF' : 'transparent',
                                border: 'none',
                                borderRadius: '6px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                cursor: 'pointer',
                                fontSize: '13px',
                                fontWeight: activeTab === 'admin' ? 500 : 400,
                                color: activeTab === 'admin' ? '#1E1E1E' : '#A3A3A3',
                                transition: 'all 0.2s',
                                boxShadow: activeTab === 'admin' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'
                            }}
                        >
                            <ShieldCheck style={{
                                width: '16px',
                                height: '16px',
                                color: activeTab === 'admin' ? '#1E1E1E' : '#A3A3A3'
                            }} />
                            Admin
                        </button>

                        <button
                            onClick={() => switchTab('student')}
                            style={{
                                flex: 1,
                                height: '40px',
                                backgroundColor: activeTab === 'student' ? '#FFFFFF' : 'transparent',
                                border: 'none',
                                borderRadius: '6px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                cursor: 'pointer',
                                fontSize: '13px',
                                fontWeight: activeTab === 'student' ? 500 : 400,
                                color: activeTab === 'student' ? '#1E1E1E' : '#A3A3A3',
                                transition: 'all 0.2s',
                                boxShadow: activeTab === 'student' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'
                            }}
                        >
                            <User style={{
                                width: '16px',
                                height: '16px',
                                color: activeTab === 'student' ? '#1E1E1E' : '#A3A3A3'
                            }} />
                            Student
                        </button>
                    </div>

                    {/* Role Badge */}
                    <div style={{
                        backgroundColor: '#F5F5F5',
                        borderRadius: '20px',
                        padding: '4px 12px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        marginBottom: '24px',
                        border: '1px solid #E5E5E5'
                    }}>
                        <div style={{
                            width: '6px',
                            height: '6px',
                            backgroundColor: '#1E1E1E',
                            borderRadius: '50%'
                        }} />
                        <span style={{ fontSize: '11px', color: '#525252', fontWeight: 500 }}>
                            Signing in as {activeTab === 'admin' ? 'Admin' : 'Student'}
                        </span>
                    </div>

                    {/* Login Form */}
                    <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {/* ID Field */}
                        <div>
                            <label style={{
                                display: 'block',
                                fontSize: '11px',
                                color: '#737373',
                                marginBottom: '6px',
                                fontWeight: 500,
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                            }}>
                                {activeTab === 'admin' ? 'Email Address' : 'Boarding Number / Email'}
                            </label>
                            <input
                                type="text"
                                value={loginId}
                                onChange={(e) => setLoginId(e.target.value)}
                                placeholder={activeTab === 'admin' ? 'admin@example.com' : 'Enter boarding number'}
                                style={{
                                    width: '100%',
                                    height: '40px',
                                    backgroundColor: '#FFFFFF',
                                    border: '1px solid #E5E5E5',
                                    borderRadius: '7px',
                                    padding: '0 12px',
                                    fontSize: '13px',
                                    color: '#1E1E1E',
                                    outline: 'none',
                                    boxSizing: 'border-box'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#1E1E1E'}
                                onBlur={(e) => e.target.style.borderColor = '#E5E5E5'}
                            />
                        </div>

                        {/* Password Field */}
                        <div>
                            <label style={{
                                display: 'block',
                                fontSize: '11px',
                                color: '#737373',
                                marginBottom: '6px',
                                fontWeight: 500,
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                            }}>
                                Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                style={{
                                    width: '100%',
                                    height: '40px',
                                    backgroundColor: '#FFFFFF',
                                    border: '1px solid #E5E5E5',
                                    borderRadius: '7px',
                                    padding: '0 12px',
                                    fontSize: '13px',
                                    color: '#1E1E1E',
                                    outline: 'none',
                                    boxSizing: 'border-box'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#1E1E1E'}
                                onBlur={(e) => e.target.style.borderColor = '#E5E5E5'}
                            />
                            <div style={{ textAlign: 'right', marginTop: '8px' }}>
                                <a href="#" style={{
                                    fontSize: '11px',
                                    color: '#525252',
                                    textDecoration: 'none'
                                }}>
                                    Forgot password?
                                </a>
                            </div>
                        </div>

                        {/* Sign In Button */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            style={{
                                width: '100%',
                                height: '42px',
                                backgroundColor: '#1E1E1E',
                                color: '#FFFFFF',
                                border: 'none',
                                borderRadius: '7px',
                                fontSize: '13px',
                                fontWeight: 500,
                                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                                opacity: isSubmitting ? 0.7 : 1,
                                marginTop: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px'
                            }}
                        >
                            {isSubmitting ? (
                                <>Signing in...</>
                            ) : 'Sign in'}
                        </button>
                    </form>

                    {/* Divider */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        margin: '32px 0'
                    }}>
                        <div style={{ flex: 1, height: '1px', backgroundColor: '#E5E5E5' }} />
                        <span style={{ fontSize: '11px', color: '#A3A3A3' }}>
                            Hostel Management System
                        </span>
                        <div style={{ flex: 1, height: '1px', backgroundColor: '#E5E5E5' }} />
                    </div>

                    {/* Footer */}
                    <div style={{
                        textAlign: 'center',
                        fontSize: '11px',
                        color: '#737373'
                    }}>
                        Having trouble? Contact your hostel admin
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
