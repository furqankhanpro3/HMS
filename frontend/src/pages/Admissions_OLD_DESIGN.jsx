import React, { useState } from 'react';
import { Search, Plus, Eye, Edit, Trash2 } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useHostel } from '@/context/useHostel';
import { toast } from 'sonner';

const Admissions = () => {
  const { students, hostels, addStudent, updateStudent, deleteStudent } = useHostel();
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    fatherName: '',
    collegeNumber: '',
    program: '',
    department: '',
    year: '',
    contact: '',
    emergencyContact: '',
    hostel: '',
    room: ''
  });

  const filteredStudents = students.filter((s) => {
    const studentName = s.user?.name || s.name || '';
    return (
      studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.collegeNumber || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleOpenDialog = (student = null) => {
    if (student) {
      setEditingStudent(student);
      setFormData({
        name: student.name || student.user?.name || '',
        email: student.email || student.user?.email || '',
        password: '',
        fatherName: student.fatherName || '',
        collegeNumber: student.collegeNumber || '',
        program: student.program || '',
        department: student.department || '',
        year: student.year || '',
        contact: student.contact || student.contactNumber || '',
        emergencyContact: student.emergencyContact || '',
        hostel: student.room?.hostel?._id || student.hostel?._id || '',
        room: student.room?._id || ''
      });
    } else {
      setEditingStudent(null);
      setFormData({
        name: '',
        email: '',
        password: '',
        fatherName: '',
        collegeNumber: '',
        program: '',
        department: '',
        year: '',
        contact: '',
        emergencyContact: '',
        hostel: '',
        room: ''
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingStudent(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      fatherName: '',
      collegeNumber: '',
      program: '',
      department: '',
      year: '',
      contact: '',
      emergencyContact: '',
      hostel: '',
      room: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const submitData = {
      name: formData.name,
      email: formData.email,
      fatherName: formData.fatherName,
      collegeNumber: formData.collegeNumber,
      program: formData.program,
      department: formData.department,
      year: formData.year,
      contact: formData.contact,
      emergencyContact: formData.emergencyContact,
      room: formData.room || undefined
    };

    if (!editingStudent && formData.password) {
      submitData.password = formData.password;
    }

    let result;
    if (editingStudent) {
      result = await updateStudent(editingStudent._id || editingStudent.id, submitData);
      if (result.success) {
        toast.success('Student updated successfully');
      }
    } else {
      result = await addStudent(submitData);
      if (result.success) {
        toast.success('Student added successfully');
      }
    }

    if (result.success) {
      handleCloseDialog();
    }
  };

  const handleDelete = async (studentId) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      const result = await deleteStudent(studentId);
      if (result.success) {
        toast.success('Student deleted successfully');
      }
    }
  };

  const availableRooms = formData.hostel 
    ? hostels.find(h => h._id === formData.hostel)?.rooms || []
    : [];

  return (
    <MainLayout>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between animate-fade-in">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Admissions</h1>
          <p className="mt-2 text-muted-foreground">
            Manage student admissions and registrations
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Add Student
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingStudent ? 'Edit Student' : 'Add New Student'}</DialogTitle>
              <DialogDescription>
                {editingStudent ? 'Update student information' : 'Fill in the details to add a new student'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>

                {!editingStudent && (
                  <div className="space-y-2">
                    <Label htmlFor="password">Password *</Label>
                    <Input
                      id="password"
                      type="password"
                      required={!editingStudent}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fatherName">Father Name</Label>
                    <Input
                      id="fatherName"
                      value={formData.fatherName}
                      onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="collegeNumber">Registration Number *</Label>
                    <Input
                      id="collegeNumber"
                      required
                      value={formData.collegeNumber}
                      onChange={(e) => setFormData({ ...formData, collegeNumber: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="program">Program *</Label>
                    <Select
                      value={formData.program}
                      onValueChange={(value) => setFormData({ ...formData, program: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Program" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="B.Tech">B.Tech</SelectItem>
                        <SelectItem value="M.Tech">M.Tech</SelectItem>
                        <SelectItem value="BBA">BBA</SelectItem>
                        <SelectItem value="MBA">MBA</SelectItem>
                        <SelectItem value="BS">BS</SelectItem>
                        <SelectItem value="MS">MS</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">Department *</Label>
                    <Select
                      value={formData.department}
                      onValueChange={(value) => setFormData({ ...formData, department: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CSE">CSE</SelectItem>
                        <SelectItem value="ECE">ECE</SelectItem>
                        <SelectItem value="ME">ME</SelectItem>
                        <SelectItem value="CE">CE</SelectItem>
                        <SelectItem value="EE">EE</SelectItem>
                        <SelectItem value="IT">IT</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="year">Year *</Label>
                    <Select
                      value={formData.year}
                      onValueChange={(value) => setFormData({ ...formData, year: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Year" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1st">1st Year</SelectItem>
                        <SelectItem value="2nd">2nd Year</SelectItem>
                        <SelectItem value="3rd">3rd Year</SelectItem>
                        <SelectItem value="4th">4th Year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contact">Contact Number</Label>
                    <Input
                      id="contact"
                      type="tel"
                      value={formData.contact}
                      onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emergencyContact">Emergency Contact</Label>
                    <Input
                      id="emergencyContact"
                      type="tel"
                      value={formData.emergencyContact}
                      onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="hostel">Hostel</Label>
                    <Select
                      value={formData.hostel}
                      onValueChange={(value) => setFormData({ ...formData, hostel: value, room: '' })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Hostel" />
                      </SelectTrigger>
                      <SelectContent>
                        {hostels.map(hostel => (
                          <SelectItem key={hostel._id} value={hostel._id}>
                            {hostel.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="room">Room</Label>
                    <Select
                      value={formData.room}
                      onValueChange={(value) => setFormData({ ...formData, room: value })}
                      disabled={!formData.hostel}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Room" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableRooms.map(room => (
                          <SelectItem key={room._id} value={room._id}>
                            {room.roomNumber} ({room.occupiedBeds || 0}/{room.capacity} occupied)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingStudent ? 'Update Student' : 'Add Student'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="mb-6 animate-slide-up">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search students..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Students Table */}
      <Card className="animate-slide-up">
        <CardHeader>
          <CardTitle>All Students</CardTitle>
          <CardDescription>
            Total {filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Reg. No.</TableHead>
                <TableHead>Program</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Year</TableHead>
                <TableHead>Hostel</TableHead>
                <TableHead>Room</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    No students found
                  </TableCell>
                </TableRow>
              ) : (
                filteredStudents.map((student) => {
                  const studentName = student.name || student.user?.name || 'Unknown';
                  const hostelName = student.room?.hostel?.name || student.hostel?.name || student.hostelName;
                  const roomNumber = student.room?.roomNumber || student.roomNumber;

                  return (
                    <TableRow key={student._id || student.id}>
                      <TableCell className="font-medium">{studentName}</TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {student.collegeNumber || 'N/A'}
                        </code>
                      </TableCell>
                      <TableCell>{student.program || '-'}</TableCell>
                      <TableCell>{student.department || '-'}</TableCell>
                      <TableCell>{student.year || '-'}</TableCell>
                      <TableCell>{hostelName || '-'}</TableCell>
                      <TableCell>{roomNumber || '-'}</TableCell>
                      <TableCell>{student.contact || student.contactNumber || '-'}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDialog(student)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(student._id || student.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </MainLayout>
  );
};

export default Admissions;
