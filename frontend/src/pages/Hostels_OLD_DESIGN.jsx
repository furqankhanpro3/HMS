import React, { useState } from 'react';
import { Building, Plus, Edit, Trash2, Users, Bed, Package } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { useHostel } from '@/context/useHostel';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const Hostels = () => {
  const {
    hostels,
    students,
    addHostel,
    updateHostel,
    deleteHostel,
    addRoom,
    updateRoom,
    deleteRoom,
    assignStudentToRoom,
    removeStudentFromRoom,
  } = useHostel();

  const [selectedHostel, setSelectedHostel] = useState(hostels[0]?._id || '');
  const [isHostelDialogOpen, setIsHostelDialogOpen] = useState(false);
  const [isRoomDialogOpen, setIsRoomDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [editingHostel, setEditingHostel] = useState(null);
  const [editingRoom, setEditingRoom] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);

  const [hostelFormData, setHostelFormData] = useState({
    name: '',
    address: '',
    warden: '',
    capacity: ''
  });

  const [roomFormData, setRoomFormData] = useState({
    roomNumber: '',
    floor: '',
    type: 'Double',
    capacity: '2'
  });

  const [assignFormData, setAssignFormData] = useState({
    studentId: ''
  });

  const currentHostel = hostels.find(h => h._id === selectedHostel);
  const currentRooms = currentHostel?.rooms || [];

  // Get unassigned students
  const unassignedStudents = students.filter(s => !s.room || !s.room._id);

  const handleOpenHostelDialog = (hostel = null) => {
    if (hostel) {
      setEditingHostel(hostel);
      setHostelFormData({
        name: hostel.name || '',
        address: hostel.address || '',
        warden: hostel.warden || '',
        capacity: hostel.capacity?.toString() || ''
      });
    } else {
      setEditingHostel(null);
      setHostelFormData({
        name: '',
        address: '',
        warden: '',
        capacity: ''
      });
    }
    setIsHostelDialogOpen(true);
  };

  const handleOpenRoomDialog = (room = null) => {
    if (room) {
      setEditingRoom(room);
      setRoomFormData({
        roomNumber: room.roomNumber || '',
        floor: room.floor?.toString() || '',
        type: room.type || 'Double',
        capacity: room.capacity?.toString() || '2'
      });
    } else {
      setEditingRoom(null);
      setRoomFormData({
        roomNumber: '',
        floor: '',
        type: 'Double',
        capacity: '2'
      });
    }
    setIsRoomDialogOpen(true);
  };

  const handleOpenAssignDialog = (room) => {
    setSelectedRoom(room);
    setAssignFormData({ studentId: '' });
    setIsAssignDialogOpen(true);
  };

  const handleSubmitHostel = async (e) => {
    e.preventDefault();
    const data = {
      ...hostelFormData,
      capacity: parseInt(hostelFormData.capacity)
    };

    let result;
    if (editingHostel) {
      result = await updateHostel(editingHostel._id, data);
      if (result.success) {
        toast.success('Hostel updated successfully');
      }
    } else {
      result = await addHostel(data);
      if (result.success) {
        toast.success('Hostel added successfully');
        if (result.data?._id) {
          setSelectedHostel(result.data._id);
        }
      }
    }

    if (result.success) {
      setIsHostelDialogOpen(false);
    }
  };

  const handleSubmitRoom = async (e) => {
    e.preventDefault();
    const data = {
      ...roomFormData,
      floor: parseInt(roomFormData.floor),
      capacity: parseInt(roomFormData.capacity)
    };

    let result;
    if (editingRoom) {
      result = await updateRoom(editingRoom._id, data);
      if (result.success) {
        toast.success('Room updated successfully');
      }
    } else {
      result = await addRoom(selectedHostel, data);
      if (result.success) {
        toast.success('Room added successfully');
      }
    }

    if (result.success) {
      setIsRoomDialogOpen(false);
    }
  };

  const handleAssignStudent = async (e) => {
    e.preventDefault();
    const result = await assignStudentToRoom(
      assignFormData.studentId,
      selectedHostel,
      selectedRoom._id
    );

    if (result.success) {
      toast.success('Student assigned successfully');
      setIsAssignDialogOpen(false);
    }
  };

  const handleRemoveStudent = async (studentId, roomId) => {
    if (window.confirm('Are you sure you want to remove this student from the room?')) {
      const result = await removeStudentFromRoom(studentId, selectedHostel, roomId);
      if (result.success) {
        toast.success('Student removed successfully');
      }
    }
  };

  const handleDeleteHostel = async (hostelId) => {
    if (window.confirm('Are you sure you want to delete this hostel? All rooms will be removed.')) {
      const result = await deleteHostel(hostelId);
      if (result.success) {
        toast.success('Hostel deleted successfully');
        if (hostels.length > 0) {
          setSelectedHostel(hostels[0]._id);
        }
      }
    }
  };

  const handleDeleteRoom = async (roomId) => {
    if (window.confirm('Are you sure you want to delete this room?')) {
      const result = await deleteRoom(selectedHostel, roomId);
      if (result.success) {
        toast.success('Room deleted successfully');
      }
    }
  };

  const getOccupancyColor = (percentage) => {
    if (percentage === 0) return 'bg-gray-500';
    if (percentage < 50) return 'bg-blue-500';
    if (percentage < 80) return 'bg-green-500';
    if (percentage < 100) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <MainLayout>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between animate-fade-in">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Hostels & Rooms</h1>
          <p className="mt-2 text-muted-foreground">
            Manage hostel buildings and room assignments
          </p>
        </div>
        <Dialog open={isHostelDialogOpen} onOpenChange={setIsHostelDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenHostelDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Add Hostel
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingHostel ? 'Edit Hostel' : 'Add New Hostel'}</DialogTitle>
              <DialogDescription>
                {editingHostel ? 'Update hostel information' : 'Create a new hostel building'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmitHostel}>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="hostelName">Hostel Name *</Label>
                  <Input
                    id="hostelName"
                    required
                    value={hostelFormData.name}
                    onChange={(e) => setHostelFormData({ ...hostelFormData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={hostelFormData.address}
                    onChange={(e) => setHostelFormData({ ...hostelFormData, address: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="warden">Warden Name</Label>
                  <Input
                    id="warden"
                    value={hostelFormData.warden}
                    onChange={(e) => setHostelFormData({ ...hostelFormData, warden: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="capacity">Total Capacity</Label>
                  <Input
                    id="capacity"
                    type="number"
                    value={hostelFormData.capacity}
                    onChange={(e) => setHostelFormData({ ...hostelFormData, capacity: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsHostelDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingHostel ? 'Update Hostel' : 'Add Hostel'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {hostels.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Building className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">
              No hostels found. Add a hostel to get started.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Hostel Tabs */}
          <Tabs value={selectedHostel} onValueChange={setSelectedHostel} className="space-y-6">
            <TabsList>
              {hostels.map((hostel) => (
                <TabsTrigger key={hostel._id} value={hostel._id}>
                  <Building className="mr-2 h-4 w-4" />
                  {hostel.name}
                </TabsTrigger>
              ))}
            </TabsList>

            {hostels.map((hostel) => (
              <TabsContent key={hostel._id} value={hostel._id} className="space-y-6">
                {/* Hostel Info Card */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="rounded-lg bg-primary/10 p-3">
                          <Building className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <CardTitle>{hostel.name}</CardTitle>
                          <CardDescription>
                            {hostel.rooms?.length || 0} rooms • Capacity: {hostel.capacity || 'N/A'}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Dialog open={isRoomDialogOpen} onOpenChange={setIsRoomDialogOpen}>
                          <DialogTrigger asChild>
                            <Button onClick={() => handleOpenRoomDialog()}>
                              <Plus className="mr-2 h-4 w-4" />
                              Add Room
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>{editingRoom ? 'Edit Room' : 'Add New Room'}</DialogTitle>
                              <DialogDescription>
                                {editingRoom ? 'Update room information' : 'Create a new room in this hostel'}
                              </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleSubmitRoom}>
                              <div className="grid gap-4 py-4">
                                <div className="space-y-2">
                                  <Label htmlFor="roomNumber">Room Number *</Label>
                                  <Input
                                    id="roomNumber"
                                    required
                                    value={roomFormData.roomNumber}
                                    onChange={(e) => setRoomFormData({ ...roomFormData, roomNumber: e.target.value })}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="floor">Floor *</Label>
                                  <Input
                                    id="floor"
                                    type="number"
                                    required
                                    value={roomFormData.floor}
                                    onChange={(e) => setRoomFormData({ ...roomFormData, floor: e.target.value })}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="type">Room Type *</Label>
                                  <Select
                                    value={roomFormData.type}
                                    onValueChange={(value) => setRoomFormData({ ...roomFormData, type: value })}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="Single">Single</SelectItem>
                                      <SelectItem value="Double">Double</SelectItem>
                                      <SelectItem value="Triple">Triple</SelectItem>
                                      <SelectItem value="Quad">Quad</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="capacity">Capacity *</Label>
                                  <Input
                                    id="capacity"
                                    type="number"
                                    required
                                    value={roomFormData.capacity}
                                    onChange={(e) => setRoomFormData({ ...roomFormData, capacity: e.target.value })}
                                  />
                                </div>
                              </div>
                              <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsRoomDialogOpen(false)}>
                                  Cancel
                                </Button>
                                <Button type="submit">
                                  {editingRoom ? 'Update Room' : 'Add Room'}
                                </Button>
                              </DialogFooter>
                            </form>
                          </DialogContent>
                        </Dialog>
                        <Button variant="outline" onClick={() => handleOpenHostelDialog(hostel)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                        <Button variant="outline" onClick={() => handleDeleteHostel(hostel._id)}>
                          <Trash2 className="mr-2 h-4 w-4 text-destructive" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                {/* Rooms Grid */}
                {currentRooms.length === 0 ? (
                  <Card>
                    <CardContent className="py-16 text-center">
                      <Bed className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                      <p className="text-muted-foreground">
                        No rooms found. Add a room to get started.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {currentRooms.map((room) => {
                      const occupiedBeds = room.occupiedBeds || 0;
                      const capacity = room.capacity || 0;
                      const occupancyPercentage = capacity > 0 ? Math.round((occupiedBeds / capacity) * 100) : 0;
                      const assignedStudents = students.filter(s => s.room?._id === room._id || s.room === room._id);

                      return (
                        <Card key={room._id} className="hover:shadow-lg transition-shadow">
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-lg">Room {room.roomNumber}</CardTitle>
                              <Badge variant={occupancyPercentage === 100 ? 'destructive' : 'default'}>
                                {occupancyPercentage === 100 ? 'Full' : 'Available'}
                              </Badge>
                            </div>
                            <CardDescription>
                              Floor {room.floor} • {room.type} • {occupiedBeds} of {capacity} beds occupied
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            {/* Occupancy Bar */}
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Occupancy</span>
                                <span className="font-semibold">{occupancyPercentage}%</span>
                              </div>
                              <Progress
                                value={occupancyPercentage}
                                className={cn('h-2', `[&>div]:${getOccupancyColor(occupancyPercentage)}`)}
                              />
                            </div>

                            {/* Assigned Students */}
                            {assignedStudents.length > 0 && (
                              <div className="space-y-2">
                                <p className="text-sm font-medium">Assigned Students:</p>
                                {assignedStudents.map((student) => (
                                  <div
                                    key={student._id}
                                    className="flex items-center justify-between text-sm bg-muted/50 p-2 rounded"
                                  >
                                    <div>
                                      <p className="font-medium">{student.name || student.user?.name}</p>
                                      <p className="text-xs text-muted-foreground">{student.collegeNumber}</p>
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleRemoveStudent(student._id, room._id)}
                                    >
                                      <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex gap-2 pt-2 border-t">
                              <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1"
                                    onClick={() => handleOpenAssignDialog(room)}
                                    disabled={occupancyPercentage === 100}
                                  >
                                    <Users className="mr-2 h-4 w-4" />
                                    Assign
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Assign Student to Room {selectedRoom?.roomNumber}</DialogTitle>
                                    <DialogDescription>
                                      Select a student to assign to this room
                                    </DialogDescription>
                                  </DialogHeader>
                                  <form onSubmit={handleAssignStudent}>
                                    <div className="grid gap-4 py-4">
                                      <div className="space-y-2">
                                        <Label htmlFor="student">Student *</Label>
                                        <Select
                                          value={assignFormData.studentId}
                                          onValueChange={(value) => setAssignFormData({ studentId: value })}
                                        >
                                          <SelectTrigger>
                                            <SelectValue placeholder="Select a student" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {unassignedStudents.map((student) => (
                                              <SelectItem key={student._id} value={student._id}>
                                                {student.name || student.user?.name} ({student.collegeNumber})
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      </div>
                                    </div>
                                    <DialogFooter>
                                      <Button type="button" variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
                                        Cancel
                                      </Button>
                                      <Button type="submit">Assign Student</Button>
                                    </DialogFooter>
                                  </form>
                                </DialogContent>
                              </Dialog>
                              <Button variant="outline" size="sm" onClick={() => handleOpenRoomDialog(room)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => handleDeleteRoom(room._id)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </>
      )}
    </MainLayout>
  );
};

export default Hostels;
