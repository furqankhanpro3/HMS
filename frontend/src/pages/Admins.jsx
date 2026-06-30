import React, { useState, useEffect } from 'react';
import { 
  UserPlus, Search, Trash2, Edit, Users, Eye, EyeOff, Loader2, ShieldCheck, UserCog,
  LayoutDashboard, UserCheck, Building2, Package, Utensils, MessageSquare, Calendar, Banknote, TrendingUp, Shield, Briefcase
} from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerDescription,
    DrawerFooter,
} from '@/components/ui/drawer';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

const MODULES = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, desc: 'View statistics and overview charts' },
  { key: 'admissions', label: 'Admissions', icon: UserCheck, desc: 'Register new students and manage profiles' },
  { key: 'hostels', label: 'Hostels & Rooms', icon: Building2, desc: 'Manage hostel structures, room assignments' },
  { key: 'inventory', label: 'Inventory', icon: Package, desc: 'Track physical assets and room inventory' },
  { key: 'mess', label: 'Mess Management', icon: Utensils, desc: 'Manage food menu, student mess registration' },
  { key: 'complaints', label: 'Complaints', icon: MessageSquare, desc: 'Track and resolve student complaints' },
  { key: 'leaves', label: 'Leave Management', icon: Calendar, desc: 'Approve or reject student leave requests' },
  { key: 'fee', label: 'Fee Management', icon: Banknote, desc: 'Track monthly student fees and print receipts' },
  { key: 'finance', label: 'Finance', icon: TrendingUp, desc: 'Oversee income/expense records' },
  { key: 'staff', label: 'Staff Management', icon: Briefcase, desc: 'Manage staff profiles, leaves, and payroll' },
  { key: 'admins', label: 'Admin Management', icon: Shield, desc: 'Manage admin roles and access control' },
];

const defaultPermissions = () =>
  Object.fromEntries(MODULES.map((m) => [m.key, { view: false, create: false, edit: false, delete: false }]));

const Admins = () => {
    const { getAdmins, updateAdmin, deleteAdmin, addAdmin, user: currentUser } = useAuth();
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingAdmin, setEditingAdmin] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'admin',
        permissions: defaultPermissions(),
    });
    const [errors, setErrors] = useState({});

    const openDrawer = (admin = null) => {
        if (admin) {
            setEditingAdmin(admin);
            setFormData({
                name: admin.name,
                email: admin.email,
                password: '',
                role: admin.role,
                permissions: admin.permissions || defaultPermissions(),
            });
        } else {
            setEditingAdmin(null);
            setFormData({
                name: '',
                email: '',
                password: '',
                role: 'admin',
                permissions: defaultPermissions(),
            });
        }
        setErrors({});
        setShowPassword(false);
        setIsDrawerOpen(true);
    };

    const fetchAdmins = async () => {
        setLoading(true);
        const data = await getAdmins();
        setAdmins(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchAdmins();
    }, []);

    const validateForm = () => {
        const newErrors = {};

        if (!editingAdmin || editingAdmin.role !== 'superadmin') {
            if (!formData.name?.trim()) newErrors.name = 'Name is required';
        }

        if (!formData.email?.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }

        if (!editingAdmin && !formData.password) {
            newErrors.password = 'Password is required for new admins';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsSubmitting(true);
        try {
            let result;
            if (editingAdmin) {
                const updateData = editingAdmin.role === 'superadmin'
                    ? { email: formData.email }
                    : { ...formData };

                if (formData.password) {
                    updateData.password = formData.password;
                }

                result = await updateAdmin(editingAdmin._id || editingAdmin.id, updateData);
                if (result.success) toast.success('Admin updated successfully');
            } else {
                result = await addAdmin(formData);
                if (result.success) toast.success('Admin added successfully');
            }

            if (result.success) {
                setIsDrawerOpen(false);
                fetchAdmins();
            } else {
                toast.error(result.message || 'Operation failed');
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            toast.error('An unexpected error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to remove this admin?')) {
            const result = await deleteAdmin(id);
            if (result.success) {
                toast.success('Admin removed successfully');
                fetchAdmins();
            } else {
                toast.error(result.message || 'Failed to remove admin');
            }
        }
    };

    const filteredAdmins = admins.filter(
        (admin) =>
            (admin.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (admin.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const toggleModule = (moduleKey, checked) => {
        setFormData((prev) => ({
            ...prev,
            permissions: {
                ...prev.permissions,
                [moduleKey]: {
                    view: checked,
                    create: checked,
                    edit: checked,
                    delete: checked,
                },
            },
        }));
    };

    return (
        <MainLayout>
            {/* Page Header */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
                <div>
                    <h1 className="font-display text-2xl font-bold text-foreground">
                        Administrator Management
                    </h1>
                    <p className="text-xs text-muted-foreground mt-1">
                        Manage system administrators and their permissions
                    </p>
                </div>
                <Button size="sm" onClick={() => openDrawer()}>
                    <UserPlus className="mr-1.5 h-4 w-4" /> Add Admin
                </Button>
            </div>

            {/* Search and Stats */}
            <div className="mb-4 flex items-center gap-3 animate-slide-up">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search admins by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8 text-xs h-8"
                    />
                </div>
                <div className="text-[11px] text-muted-foreground font-medium">
                    Total: {admins.length} administrators
                </div>
            </div>

            {/* Admins Table */}
            <div className="overflow-x-auto animate-slide-up" style={{ animationDelay: '100ms' }}>
                <Table className="w-full border-collapse border border-border">
                    <TableHeader>
                        <TableRow className="border-b border-border bg-muted/20">
                            <TableHead className="border-r border-border px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-foreground">Administrator</TableHead>
                            <TableHead className="border-r border-border px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-foreground">Email Address</TableHead>
                            <TableHead className="border-r border-border px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-foreground">Role</TableHead>
                            <TableHead className="border-r border-border px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-foreground">Joined Date</TableHead>
                            <TableHead className="px-4 py-2.5 text-right text-[10px] font-semibold uppercase tracking-wider text-foreground">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-32 text-center border-b border-border">
                                    <div className="flex items-center justify-center">
                                        <Loader2 className="h-8 w-8 animate-spin text-primary opacity-50" />
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : filteredAdmins.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-32 text-center border-b border-border">
                                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                                        <Users className="h-8 w-8 mb-1 opacity-20" />
                                        <p className="text-xs">No administrators found</p>
                                        <p className="text-[11px]">Add a new admin to get started</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredAdmins.map((admin) => (
                                <TableRow key={admin._id || admin.id} className="border-b border-border transition-colors hover:bg-muted/20">
                                    <TableCell className="border-r border-border px-4 py-2">
                                        <div className="flex items-center gap-2.5">
                                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
                                                {admin.name?.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="font-medium text-[11px] text-foreground">{admin.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="border-r border-border px-4 py-2 text-[11px] text-muted-foreground">{admin.email}</TableCell>
                                    <TableCell className="border-r border-border px-4 py-2">
                                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                                            admin.role === 'superadmin'
                                                ? 'bg-amber-50 text-amber-700'
                                                : 'bg-blue-50 text-blue-700'
                                        }`}>
                                            {admin.role === 'superadmin' ? 'Super Admin' : 'Admin'}
                                        </span>
                                    </TableCell>
                                    <TableCell className="border-r border-border px-4 py-2 text-[11px] text-muted-foreground">{new Date(admin.createdAt).toLocaleDateString()}</TableCell>
                                    <TableCell className="px-4 py-2 text-right">
                                        <div className="flex justify-end gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 text-muted-foreground hover:text-primary"
                                                onClick={() => openDrawer(admin)}
                                            >
                                                <Edit className="h-3.5 w-3.5" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                                onClick={() => handleDelete(admin._id || admin.id)}
                                                disabled={admin.role === 'superadmin'}
                                                title={admin.role === 'superadmin' ? "Super Admin cannot be deleted" : "Delete Admin"}
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* ── ADD/EDIT ADMIN DRAWER ── */}
            <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
                <DrawerContent className="max-w-lg">
                    <DrawerHeader>
                        <DrawerTitle className="font-display text-lg">
                            {editingAdmin ? 'Edit Administrator' : 'Register New Administrator'}
                        </DrawerTitle>
                        <DrawerDescription>
                            {editingAdmin ? 'Update administrator details and permissions.' : 'Add a new administrator with role and module access.'}
                        </DrawerDescription>
                    </DrawerHeader>

                    <form onSubmit={handleSubmit} className="space-y-5 px-1">
                        {/* Basic Info */}
                        <div className="space-y-3">
                            <div>
                                <Label htmlFor="name" className="text-xs font-semibold">Full Name</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Enter full name"
                                    className={`text-xs mt-1 ${errors.name ? 'border-destructive' : ''}`}
                                    disabled={editingAdmin?.role === 'superadmin'}
                                />
                                {errors.name && <p className="mt-1 text-[10px] text-destructive">{errors.name}</p>}
                                {editingAdmin?.role === 'superadmin' && (
                                    <p className="mt-1 text-[10px] text-muted-foreground">Name cannot be changed for Super Admin</p>
                                )}
                            </div>
                            <div>
                                <Label htmlFor="email" className="text-xs font-semibold">Email Address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="admin@example.com"
                                    className={`text-xs mt-1 ${errors.email ? 'border-destructive' : ''}`}
                                />
                                {errors.email && <p className="mt-1 text-[10px] text-destructive">{errors.email}</p>}
                            </div>
                            <div>
                                <Label htmlFor="password" className="text-xs font-semibold">
                                    {editingAdmin ? 'New Password (leave blank to keep current)' : 'Login Password'}
                                </Label>
                                <div className="relative mt-1">
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        placeholder="••••••••"
                                        className={`text-xs pr-9 ${errors.password ? 'border-destructive' : ''}`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    >
                                        {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                                    </button>
                                </div>
                                {errors.password && <p className="mt-1 text-[10px] text-destructive">{errors.password}</p>}
                            </div>
                            <div>
                                <Label htmlFor="role" className="text-xs font-semibold">Role</Label>
                                <Select
                                    value={formData.role}
                                    onValueChange={(value) => setFormData({ ...formData, role: value })}
                                    disabled={editingAdmin?.role === 'superadmin'}
                                >
                                    <SelectTrigger className="text-xs mt-1">
                                        <SelectValue placeholder="Select role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="admin">Administrator</SelectItem>
                                        <SelectItem value="superadmin" disabled={currentUser?.role !== 'superadmin'}>Super Administrator</SelectItem>
                                    </SelectContent>
                                </Select>
                                {editingAdmin?.role === 'superadmin' && (
                                    <p className="mt-1 text-[10px] text-muted-foreground">Role cannot be changed for Super Admin</p>
                                )}
                            </div>
                        </div>

                        {/* Module Permissions */}
                        <div className="space-y-3 rounded-lg border border-border bg-muted/20 p-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-border">
                                <div>
                                    <Label className="text-xs font-semibold">Module Permissions</Label>
                                    <p className="text-[10px] text-muted-foreground mt-0.5">Select modules this administrator can access</p>
                                </div>
                                <span className="text-[9px] font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded self-start">
                                    Super admins have full access
                                </span>
                            </div>
                            {editingAdmin?.role === 'superadmin' ? (
                                <div className="p-3 bg-card border border-border rounded-lg text-center">
                                    <ShieldCheck className="h-7 w-7 text-amber-500 mx-auto mb-2 animate-pulse" />
                                    <p className="text-xs font-semibold text-foreground">Super Administrator</p>
                                    <p className="text-[10px] text-muted-foreground mt-1">Has full, unrestricted access to all system modules.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[40vh] overflow-y-auto pr-1">
                                    {MODULES.map((module) => {
                                        const Icon = module.icon;
                                        const isChecked = !!formData.permissions?.[module.key]?.view;
                                        return (
                                            <label
                                                key={module.key}
                                                className={`flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-all duration-200 ${
                                                    isChecked
                                                        ? 'border-primary/50 bg-primary/5'
                                                        : 'border-border/60 hover:border-border bg-card'
                                                }`}
                                            >
                                                <Checkbox
                                                    checked={isChecked}
                                                    onCheckedChange={(checked) => toggleModule(module.key, !!checked)}
                                                    className="mt-0.5 h-3.5 w-3.5"
                                                />
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-1.5">
                                                        <Icon className="h-3 w-3 shrink-0 text-muted-foreground" />
                                                        <span className="text-[11px] font-semibold text-foreground leading-tight">{module.label}</span>
                                                    </div>
                                                    <p className="text-[9px] text-muted-foreground mt-0.5 leading-tight line-clamp-2">{module.desc}</p>
                                                </div>
                                            </label>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <DrawerFooter className="px-0 border-t border-border/40 pt-4">
                            <Button type="button" variant="outline" size="sm" onClick={() => setIsDrawerOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" size="sm" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <><Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Processing...</>
                                ) : (
                                    editingAdmin ? 'Save Changes' : 'Add Admin'
                                )}
                            </Button>
                        </DrawerFooter>
                    </form>
                </DrawerContent>
            </Drawer>
        </MainLayout>
    );
};

export default Admins;
