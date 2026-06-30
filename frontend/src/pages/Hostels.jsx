import React, { useEffect, useState } from 'react';
import { Building2, Plus, Trash2, Edit, Users, Package, Bed, Search } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import axios from 'axios';

const API = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api`,
  withCredentials: true,
});

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
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

{/* Helper function - define outside component or inside */}
const getFloorOptions = (totalFloors) => {
  const options = ['Ground Floor'];
  const ordinals = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th',
    '11th', '12th', '13th', '14th', '15th', '16th', '17th', '18th', '19th', '20th'];
  
  for (let i = 1; i < totalFloors; i++) {
    options.push(`${ordinals[i - 1]} Floor`);
  }
  return options;
};
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
    addInventoryToRoom,
    updateRoomInventory,
    deleteRoomInventory,
    inventoryItems,
  } = useHostel();

  const [selectedHostel, setSelectedHostel] = useState(hostels[0]?._id || '');

  useEffect(() => {
    if (!selectedHostel && hostels.length > 0) {
      console.log("hostels :", hostels);
      setSelectedHostel(hostels[0]._id);
    }
  }, [hostels, selectedHostel]);

  const [isHostelDialogOpen, setIsHostelDialogOpen] = useState(false);
  const [isRoomDialogOpen, setIsRoomDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [isInventoryDialogOpen, setIsInventoryDialogOpen] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [editingHostel, setEditingHostel] = useState(null);
  const [editingRoom, setEditingRoom] = useState(null);

  const [roomSearchQuery, setRoomSearchQuery] = useState('');
  const [localRooms, setLocalRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(false);

  const fetchRooms = async (searchVal) => {
    setLoadingRooms(true);
    try {
      const res = await API.get(`/rooms?search=${encodeURIComponent(searchVal)}`);
      setLocalRooms(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRooms(false);
    }
  };

  useEffect(() => {
    fetchRooms(roomSearchQuery);
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchRooms(roomSearchQuery);
    }, 400);
    return () => clearTimeout(delayDebounceFn);
  }, [roomSearchQuery]);

  const refreshRooms = () => {
    fetchRooms(roomSearchQuery);
  };

  const displayedRooms = localRooms.filter(
    (r) => (r.hostel?._id || r.hostel) === selectedHostel
  );

  const [hostelForm, setHostelForm] = useState({ name: '', totalRooms: '', floors: '', 
    // category: ['BS'],
    //  description: '' 
  });

  const currentHostel = hostels.find((h) => h._id === selectedHostel);
  const selectedRoom = currentHostel?.rooms?.find(r => r._id === selectedRoomId);

  const [roomSections, setRoomSections] = useState([
    { roomNumber: '', seatType: 'Single', floor: 'Ground Floor', boardingFee: '' }
  ]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [inventoryForm, setInventoryForm] = useState({
    name: '',
    quantity: '',
  });
  const [selectedInventoryCategory, setSelectedInventoryCategory] = useState('');
  const [selectedInventoryItemId, setSelectedInventoryItemId] = useState('');
  const [editingRoomInventoryId, setEditingRoomInventoryId] = useState(null);
  const [editQuantity, setEditQuantity] = useState(0);

  const handleAddHostel = async (e) => {
    e.preventDefault();
    if (!hostelForm.name.trim()) {
      toast.error('Hostel name is required');
      return;
    }
    let result;
    if (editingHostel) {
      result = await updateHostel(editingHostel._id, {
        name: hostelForm.name,
        totalRooms: parseInt(hostelForm.totalRooms) || 0,
        floors: parseInt(hostelForm.floors) || 1,
        // category: hostelForm.category,
        // description: hostelForm.description,
      });
    } else {
      result = await addHostel({
        name: hostelForm.name,
        totalRooms: parseInt(hostelForm.totalRooms) || 0,
        floors: parseInt(hostelForm.floors) || 1,
        // category: hostelForm.category,
        // description: hostelForm.description,
      });
    }
console.log('Hostel save result:', result);
    if (result.success) {
      toast.success(editingHostel ? 'Hostel updated successfully' : 'Hostel added successfully');
      if (!editingHostel && result.data?._id) {
        setSelectedHostel(result.data._id);
      }
      setHostelForm({ name: '', totalRooms: '', floors: '', 
    // category: ['BS'],
    //  description: '' 
  });
      setEditingHostel(null);
      setIsHostelDialogOpen(false);
    }
  };
  

  // const handleEditHostel = (hostel) => {
  //   setEditingHostel(hostel);
  //   let initialCategory = hostel.category || ['BS'];
  //   if (typeof initialCategory === 'string') {
  //     initialCategory = [initialCategory];
  //   }
  //   setHostelForm({
  //     name: hostel.name,
  //     totalRooms: hostel.totalRooms.toString(),
  //     floors: hostel.floors.toString(),
  //     // category: initialCategory,
  //     description: hostel.description || ''
  //   });
  //   setIsHostelDialogOpen(true);
  // };

  const handleEditHostel = (hostel) => {
    setEditingHostel(hostel);
    setHostelForm({
      name: hostel.name,
      totalRooms: hostel.totalRooms.toString(),
      floors: hostel.floors.toString(),
      // description: hostel.description || ''
    });
    setIsHostelDialogOpen(true);
  };
  // const toggleCategory = (value) => {
  //   setHostelForm(prev => {
  //     const current = prev.category || [];
  //     if (current.includes(value)) {
  //       return { ...prev, category: current.filter(c => c !== value) };
  //     } else {
  //       return { ...prev, category: [...current, value] };
  //     }
  //   });
  // };

  const handleAddRoom = async (e) => {
    e.preventDefault();
    const capacityMap = { 'Single': 1, 'Double': 2, 'Triple': 3, 'Quad': 4, 'Quin': 5 };

    if (editingRoom) {
      const roomData = {
        roomNumber: roomSections[0].roomNumber,
        seatType: roomSections[0].seatType,
        floor: roomSections[0].floor,
        capacity: capacityMap[roomSections[0].seatType],
        boardingFee: roomSections[0].boardingFee !== '' ? Number(roomSections[0].boardingFee) : 0,
      };

      if (!roomData.roomNumber.trim()) {
        toast.error('Room number is required');
        return;
      }

      const result = await updateRoom(editingRoom._id, roomData);
      if (result.success) {
        toast.success('Room updated successfully');
        setEditingRoom(null);
        setIsRoomDialogOpen(false);
        refreshRooms();
      }
      return;
    }

    // Batch Add
    if (roomSections.some(r => !r.roomNumber.trim())) {
      toast.error('Please fill all room numbers');
      return;
    }

    const roomsToAdd = roomSections.length;
    if (currentHostel.rooms.length + roomsToAdd > currentHostel.totalRooms) {
      toast.error(`Cannot add ${roomsToAdd} rooms. Hall limit of ${currentHostel.totalRooms} will be exceeded.`);
      return;
    }

    let successCount = 0;
    for (const section of roomSections) {
      const roomData = {
        roomNumber: section.roomNumber,
        seatType: section.seatType,
        floor: section.floor,
        capacity: capacityMap[section.seatType],
        boardingFee: section.boardingFee !== '' ? Number(section.boardingFee) : 0,
      };

      const result = await addRoom(selectedHostel, roomData);
      if (result.success) successCount++;
    }

    if (successCount > 0) {
      toast.success(`${successCount} rooms added successfully`);
      setRoomSections([{ roomNumber: '', seatType: 'Single', floor: 'Ground Floor', boardingFee: '' }]);
      setIsRoomDialogOpen(false);
      refreshRooms();
    }
  };

  const addRoomSection = () => {
    if (currentHostel.rooms.length + roomSections.length >= currentHostel.totalRooms) {
      toast.error('Maximum hall capacity reached');
      return;
    }

    // Try to auto-increment the last room number if possible
    const lastRoom = roomSections[roomSections.length - 1];
    let nextRoomNumber = '';

    const match = lastRoom.roomNumber.match(/(.*?)(\d+)$/);
    if (match) {
      const prefix = match[1];
      const number = parseInt(match[2]);
      nextRoomNumber = `${prefix}${number + 1}`;
    }

    setRoomSections([...roomSections, { roomNumber: nextRoomNumber, seatType: lastRoom.seatType, floor: lastRoom.floor, boardingFee: lastRoom.boardingFee }]);
  };

  const removeRoomSection = (index) => {
    if (roomSections.length === 1) return;
    setRoomSections(roomSections.filter((_, i) => i !== index));
  };

  const updateSection = (index, field, value) => {
    setRoomSections(prev => prev.map((s, i) => i === index ? { ...s, [field]: value } : s));
  };

  const handleEditRoom = (room) => {
    setEditingRoom(room);
    setRoomSections([{
      roomNumber: room.roomNumber,
      seatType: room.seatType,
      floor: room.floor,
      boardingFee: room.boardingFee?.toString() || '',
    }]);
    setIsRoomDialogOpen(true);
  };

  const handleAssignStudent = async () => {
    if (!selectedStudent || !selectedRoomId) return;
    const result = await assignStudentToRoom(selectedStudent, selectedHostel, selectedRoomId);
    if (result.success) {
      toast.success('Student assigned to room');
      setSelectedStudent('');
      setIsAssignDialogOpen(false);
      refreshRooms();
    }
  };

  const getAssignedQuantity = (itemId) => {
    const item = inventoryItems.find((i) => i._id === itemId);
    if (!item) return 0;
    let assigned = 0;
    hostels.forEach((hostel) => {
      hostel.rooms?.forEach((room) => {
        room.inventory?.forEach((inv) => {
          if (inv.inventoryItem === itemId || String(inv.inventoryItem) === String(itemId) || inv.name === (item.itemType || item.category)) {
            assigned += inv.quantity || 0;
          }
        });
      });
    });
    return assigned;
  };

  const handleAddInventory = async (e) => {
    e.preventDefault();
    if (!selectedInventoryItemId || !inventoryForm.quantity) {
      toast.error('Please select an item and enter quantity');
      return;
    }
    const selectedItem = inventoryItems.find((item) => item._id === selectedInventoryItemId);
    if (!selectedItem) return;

    const available = selectedItem.quantity - getAssignedQuantity(selectedInventoryItemId);
    const qty = parseInt(inventoryForm.quantity);

    if (qty > available) {
      toast.error(`Only ${available} ${selectedItem.itemType || selectedItem.category} available in inventory`);
      return;
    }

    if (selectedRoom) {
      const result = await addInventoryToRoom(selectedHostel, selectedRoom._id || selectedRoom.id, {
        name: selectedItem.itemType || selectedItem.category,
        inventoryItem: selectedItem._id,
        quantity: qty,
      });
      if (result.success) {
        toast.success('Inventory item added');
        setInventoryForm({ name: '', quantity: '' });
        setSelectedInventoryCategory('');
        setSelectedInventoryItemId('');
        refreshRooms();
      }
    }
  };

  const unassignedStudents = students.filter((student) => {
    const studentId = student._id || student.id;
    const isAssigned = hostels.some((hostel) =>
      hostel.rooms.some((room) =>
        (room.occupants || []).some((occ) => {
          // occupants can be either a string ID or a populated object
          const occId = typeof occ === 'object' ? (occ._id || occ.id) : occ;
          return String(occId) === String(studentId);
        })
      )
    );
    return !isAssigned;
  });

  return (
    <MainLayout>
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
        <div>
          <h1 className="text-[18px] font-semibold text-foreground">
            Hostels & Rooms
          </h1>
          <p className="mt-2 text-[12px] font-light text-muted-foreground">
            View and manage all hostels, rooms, and bed assignments
          </p>
        </div>
        <Drawer open={isHostelDialogOpen} onOpenChange={setIsHostelDialogOpen}>
          <DrawerTrigger asChild>
            <Button size="sm" className="text-[12px] font-normal rounded-md">
              <Plus className="mr-2 h-4 w-4" />
              Add Hostel
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle className="font-display text-2xl">
                {editingHostel ? 'Edit Hostel' : 'Add New Hostel'}
              </DrawerTitle>
              <DrawerDescription>
                {editingHostel ? 'Update hostel details and capacity' : 'Create a new hostel to manage rooms and students'}
              </DrawerDescription>
            </DrawerHeader>
            <form onSubmit={handleAddHostel} className="mt-4 space-y-4">
              <div>
                <Label htmlFor="hostelName">Hostel Name</Label>
                <Input
                  id="hostelName"
                  value={hostelForm.name}
                  onChange={(e) => setHostelForm({ ...hostelForm, name: e.target.value })}
                  placeholder="e.g. Block A Hostel"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="totalRooms">Total Rooms</Label>
                  <Input
                    id="totalRooms"
                    type="number"
                    value={hostelForm.totalRooms}
                    onChange={(e) => setHostelForm({ ...hostelForm, totalRooms: e.target.value })}
                    placeholder="e.g. 50"
                  />
                </div>
                <div>
                  <Label htmlFor="floors">Floors</Label>
                  <Input
                    id="floors"
                    type="number"
                    value={hostelForm.floors}
                    onChange={(e) => setHostelForm({ ...hostelForm, floors: e.target.value })}
                    placeholder="e.g. 3"
                  />
                </div>
              </div>
              {/* <div className="space-y-3">
                <Label>Building For (Select all that apply)</Label>
                <div className="grid grid-cols-3 gap-4 rounded-lg border border-border p-4">
                  {['1st Year', '2nd Year', 'BS'].map((cat) => (
                    <div key={cat} className="flex items-center space-x-2">
                      <Checkbox
                        id={`cat-${cat}`}
                        checked={hostelForm.category.includes(cat)}
                        onCheckedChange={() => toggleCategory(cat)}
                      />
                      <Label
                        htmlFor={`cat-${cat}`}
                        className="text-sm font-medium leading-none cursor-pointer"
                      >
                        {cat}
                      </Label>
                    </div>
                  ))}
                </div>
              </div> */}
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => {
                  setIsHostelDialogOpen(false);
                  setEditingHostel(null);
                  setHostelForm({ name: '', totalRooms: '', floors: '',
                    //  category: ['BS'],
                      // description: ''
                     });
                }}>
                  Cancel
                </Button>
                <Button type="submit">{editingHostel ? 'Update Hostel' : 'Add Hostel'}</Button>
              </div>
            </form>
          </DrawerContent>
        </Drawer>
      </div>

      {/* Hostel Tabs */}
      <Tabs value={selectedHostel} onValueChange={setSelectedHostel} className="animate-slide-up">
        <TabsList className="mb-6 flex-wrap h-auto gap-2 bg-transparent p-0">
          {hostels.map((hostel) => (
            <TabsTrigger
              key={hostel._id || hostel.id}
              value={hostel._id || hostel.id}
              className="text-[12px] font-normal rounded-md border border-border bg-card px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Building2 className="mr-2 h-4 w-4" />
              {hostel.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {hostels.map((hostel) => (
          <TabsContent key={hostel._id || hostel.id} value={hostel._id || hostel.id} className="space-y-6">
            {/* Hostel Header */}
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-6">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20">
                  <Building2 className="h-7 w-7 text-primary" />
                </div>
                <div>
                  <h2 className="text-[16px] font-semibold tracking-tight">{hostel.name}</h2>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-muted-foreground">
                    {/* <span className="text-[10px] font-medium text-primary bg-primary/5 px-2 py-0.5 rounded-md">
                      {Array.isArray(hostel.category) ? hostel.category.join(' • ') : hostel.category}
                    </span> */}
                    <span className="text-border">|</span>
                    <span className="text-[11px] font-normal">{hostel.rooms.length} of {hostel.totalRooms} rooms added</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Sheet open={isRoomDialogOpen} onOpenChange={(open) => {
                  if (!open) {
                    setEditingRoom(null);
                    setRoomSections([{ roomNumber: '', seatType: 'Single', floor: 'Ground Floor', boardingFee: '' }]);
                  }
                  setIsRoomDialogOpen(open);
                }}>
                  <SheetTrigger asChild>
                    <Button
                      disabled={hostel.rooms.length >= hostel.totalRooms}
                      onClick={() => {
                        setSelectedHostel(hostel._id || hostel.id);
                        setEditingRoom(null);
                        setRoomSections([{ roomNumber: '', seatType: 'Single', floor: 'Ground Floor', boardingFee: '' }]);
                      }}
                      className="text-[12px] font-normal rounded-md"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Room
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="max-w-2xl overflow-y-auto">
                    <SheetHeader>
                      <SheetTitle className="text-[18px] font-semibold">
                        {editingRoom ? 'Edit Room' : `Add Rooms to ${hostel.name}`}
                      </SheetTitle>
                      <SheetDescription className="text-[12px] text-muted-foreground">
                        Configure room details and floor positions
                      </SheetDescription>
                    </SheetHeader>
                    <form onSubmit={handleAddRoom} className="mt-4 space-y-6">
                      <div className="space-y-6">
                        {roomSections.map((section, index) => (
                          <div key={index} className="relative rounded-xl border border-border p-4 bg-muted/20">
                            {!editingRoom && roomSections.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-2 top-2 text-muted-foreground hover:text-destructive"
                                onClick={() => removeRoomSection(index)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label className="text-[12px]">Room No</Label>
                                <Input
                                  className="h-8 text-[12px]"
                                  value={section.roomNumber}
                                  onChange={(e) => updateSection(index, 'roomNumber', e.target.value)}
                                  placeholder="e.g. 101"
                                />
                              </div>
                              <div>
                                <Label className="text-[12px]">Seats</Label>
                                <Select
                                  value={section.seatType}
                                  onValueChange={(val) => updateSection(index, 'seatType', val)}
                                >
                                  <SelectTrigger className="h-8 text-[12px]">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Single">Single</SelectItem>
                                    <SelectItem value="Double">Double</SelectItem>
                                    <SelectItem value="Triple">Triple</SelectItem>
                                    <SelectItem value="Quad">Quad</SelectItem>
                                    <SelectItem value="Quin">Quin</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label className="text-[12px]">Floor</Label>
                                <Select
                                  value={section.floor}
                                  onValueChange={(val) => updateSection(index, 'floor', val)}
                                >
                                  <SelectTrigger className="h-8 text-[12px]">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {getFloorOptions(hostel.floors || 1).map((floor) => (
                                      <SelectItem key={floor} value={floor}>
                                        {floor}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label className="text-[12px]">Boarding Fee (Rs.)</Label>
                                <Input
                                  className="h-8 text-[12px]"
                                  type="number"
                                  min="0"
                                  value={section.boardingFee}
                                  onChange={(e) => updateSection(index, 'boardingFee', e.target.value)}
                                  placeholder="e.g. 15000"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {!editingRoom && (
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full border-dashed"
                          onClick={addRoomSection}
                          disabled={hostel.rooms.length + roomSections.length >= hostel.totalRooms}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Add Another Section
                        </Button>
                      )}

                      <div className="flex justify-end gap-3 pt-4 border-t border-border">
                        <Button type="button" variant="outline" onClick={() => {
                          setIsRoomDialogOpen(false);
                          setEditingRoom(null);
                        }}>
                          Cancel
                        </Button>
                        <Button type="submit">
                          {editingRoom ? 'Update Room' : `Add ${roomSections.length} Rooms`}
                        </Button>
                      </div>
                    </form>
                  </SheetContent>
                </Sheet>
                <div className="h-8 w-px bg-border hidden sm:block mx-1" />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditHostel(hostel)}
                  className="text-[12px] font-normal rounded-md"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-[12px] font-normal rounded-md text-destructive hover:bg-destructive/5 hover:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete {hostel.name}?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Delete this hostel? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={async () => {
                          const result = await deleteHostel(hostel._id || hostel.id);
                          if (result.success) {
                            toast.success('Hostel deleted');
                            if (hostels.length > 1) {
                              setSelectedHostel(hostels.find((h) => (h._id || h.id) !== (hostel._id || hostel.id))?._id || '');
                            }
                          }
                        }}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete Hostel
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>

            {/* Search Input */}
            <div className="mb-4 max-w-md animate-fade-in">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by room number or student name..."
                  value={roomSearchQuery}
                  onChange={(e) => setRoomSearchQuery(e.target.value)}
                  className="pl-10 h-9 text-xs"
                />
              </div>
            </div>

            {/* Rooms Grid */}
            <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 animate-slide-up">
              {displayedRooms.length === 0 ? (
                <div className="col-span-full flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 p-12">
                  <Bed className="h-12 w-12 text-muted-foreground/50" />
                  <p className="mt-4 text-sm font-medium text-muted-foreground">No rooms found</p>
                  <p className="text-[11px] text-muted-foreground">
                    {roomSearchQuery ? "Try adjusting your search query" : "Add rooms to this hostel to get started"}
                  </p>
                </div>
              ) : (
                displayedRooms.map((room) => {
                  const occupancyPercent = (room.occupants?.length / room.capacity) * 100 || 0;
                  const isFull = room.occupants?.length >= room.capacity;

                  return (
                    <Card key={room._id || room.id} className="overflow-hidden rounded-lg border-[0.5px] border-[#E2E8F0] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.05)] transition-all hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
                      <div className="p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-foreground">Room {room.roomNumber}</span>
                          <span className={cn(
                            "h-2 w-2 rounded-full",
                            isFull ? "bg-destructive" : "bg-success"
                          )} title={isFull ? 'Full' : 'Available'} />
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          Fl. {room.floor.replace(/(\d+)(st|nd|rd|th)?\s*Floor/i, '$1')} • {room.seatType} • Rs. {room.boardingFee?.toLocaleString() ?? 0}
                        </p>

                        {/* Visual Beds Occupancy */}
                        <div className="flex items-center gap-1 my-2">
                          {Array.from({ length: room.capacity }).map((_, idx) => {
                            const isOccupied = idx < (room.occupants?.length || 0);
                            return (
                              <Bed
                                key={idx}
                                className={cn(
                                  "h-3.5 w-3.5 transition-colors",
                                  isOccupied ? "text-primary fill-primary/20" : "text-muted-foreground/30"
                                )}
                              />
                            );
                          })}
                        </div>

                        {/* Occupants List */}
                        {room.occupants?.length > 0 && (
                          <div className="space-y-1 mt-2 border-t border-border/60 pt-2">
                            {room.occupants.map((student) => {
                              const studentName = typeof student === 'object'
                                ? (student.user?.name || student.name || 'Student')
                                : 'Loading...';
                              const studentId = typeof student === 'object' ? (student._id || student.id) : student;
                              const boardingNo = typeof student === 'object' ? student.boardingNumber : '';
                              return (
                                <div key={studentId} className="flex items-center justify-between text-[10px] text-foreground bg-muted/20 px-1 py-0.5 rounded">
                                  <span className="truncate max-w-[60px]" title={studentName}>{studentName}</span>
                                  <div className="flex items-center gap-0.5 shrink-0">
                                    <span className="text-muted-foreground text-[8px]">({boardingNo})</span>
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <button className="text-muted-foreground hover:text-destructive p-0.5">
                                          <Trash2 className="h-2.5 w-2.5" />
                                        </button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>Remove Student?</AlertDialogTitle>
                                          <AlertDialogDescription>
                                            Remove <strong>{studentName}</strong> from Room {room.roomNumber}?
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                                          <AlertDialogAction
                                            onClick={async () => {
                                              const result = await removeStudentFromRoom(studentId, hostel._id || hostel.id, room._id || room.id);
                                              if (result.success) {
                                                toast.success(`${studentName} removed from room`);
                                                refreshRooms();
                                              }
                                            }}
                                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                          >
                                            Remove
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Actions Cog Row */}
                        <div className="flex items-center justify-end gap-1 mt-2 border-t border-border/60 pt-2">
                          <Sheet
                            open={isAssignDialogOpen && selectedRoomId === room._id}
                            onOpenChange={(open) => {
                              setIsAssignDialogOpen(open);
                              if (open) setSelectedRoomId(room._id);
                            }}
                          >
                            <SheetTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-muted-foreground hover:text-primary hover:bg-primary/5"
                                disabled={isFull}
                                onClick={() => setSelectedRoomId(room._id)}
                                title="Assign Student"
                              >
                                <Users className="h-3.5 w-3.5" />
                              </Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="max-w-xl">
                              <SheetHeader>
                                <SheetTitle>Assign Student to Room {room.roomNumber}</SheetTitle>
                                <SheetDescription>
                                  Select an unassigned student to place in this room
                                </SheetDescription>
                              </SheetHeader>
                              <div className="mt-4 space-y-4">
                                <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a student" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {unassignedStudents.map((student) => {
                                      const displayName = student.user?.name || student.name || student.boardingNumber || 'Unknown';
                                      return (
                                        <SelectItem key={student._id || student.id} value={student._id || student.id}>
                                          {displayName} ({student.boardingNumber})
                                        </SelectItem>
                                      );
                                    })}
                                  </SelectContent>
                                </Select>
                                {unassignedStudents.length === 0 && (
                                  <p className="text-sm text-muted-foreground">
                                    All students are already assigned to rooms
                                  </p>
                                )}
                                <div className="flex justify-end gap-3">
                                  <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
                                    Cancel
                                  </Button>
                                  <Button onClick={handleAssignStudent} disabled={!selectedStudent}>
                                    Assign Student
                                  </Button>
                                </div>
                              </div>
                            </SheetContent>
                          </Sheet>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-muted-foreground hover:text-primary hover:bg-primary/5"
                            onClick={() => {
                              setSelectedRoomId(room._id);
                              setIsInventoryDialogOpen(true);
                            }}
                            title="Inventory Items"
                          >
                            <Package className="h-3.5 w-3.5" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-muted-foreground hover:text-primary hover:bg-primary/5"
                            onClick={() => handleEditRoom(room)}
                            title="Edit Room"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Button>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/5"
                                title="Delete Room"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Room {room.roomNumber}?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Delete this room? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={async () => {
                                    const result = await deleteRoom(hostel._id || hostel.id, room._id || room.id);
                                    if (result.success) {
                                      toast.success('Room deleted');
                                      refreshRooms();
                                    }
                                  }}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete Room
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </Card>
                  );
                })
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Shared Inventory Sheet */}
      <Sheet open={isInventoryDialogOpen} onOpenChange={(open) => {
        setIsInventoryDialogOpen(open);
        if (!open) {
          setEditingRoomInventoryId(null);
        }
      }}>
        <SheetContent side="right" className="max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Room {selectedRoom?.roomNumber} Inventory</SheetTitle>
            <SheetDescription>
              Manage furniture and equipment for this room
            </SheetDescription>
          </SheetHeader>

          <div className="mt-4 space-y-6">
            {selectedRoom?.inventory?.length > 0 ? (
              <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar">
                {selectedRoom?.inventory?.map((item, index) => {
                  const centralItem = inventoryItems.find(
                    (i) => i._id === item.inventoryItem || (i.itemType || i.category) === item.name
                  );
                  const isEditing = editingRoomInventoryId === item._id;

                  const handleStartEdit = () => {
                    setEditingRoomInventoryId(item._id);
                    setEditQuantity(item.quantity);
                  };

                  const handleCancelEdit = () => {
                    setEditingRoomInventoryId(null);
                  };

                  const handleSaveEdit = async () => {
                    if (editQuantity <= 0) {
                      toast.error("Quantity must be greater than 0");
                      return;
                    }

                    if (centralItem) {
                      const totalAssigned = getAssignedQuantity(centralItem._id);
                      const available = centralItem.quantity - totalAssigned;
                      const maxAllowed = available + item.quantity;

                      if (editQuantity > maxAllowed) {
                        toast.error(`Cannot assign ${editQuantity} units. Only ${maxAllowed} units are available in central inventory (Total: ${centralItem.quantity}, Assigned: ${totalAssigned - item.quantity} to other rooms).`);
                        return;
                      }
                    }

                    const result = await updateRoomInventory(
                      selectedHostel,
                      selectedRoom._id || selectedRoom.id,
                      item._id,
                      { quantity: editQuantity }
                    );

                    if (result.success) {
                      toast.success("Quantity updated successfully");
                      setEditingRoomInventoryId(null);
                      refreshRooms();
                    }
                  };

                  return (
                    <div
                      key={item._id || item.id || index}
                      className="flex flex-col gap-3 rounded-xl border border-border bg-muted/30 p-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="font-semibold text-sm capitalize">
                            {centralItem ? (centralItem.itemType || centralItem.category).replace(/_/g, ' ') : item.name.replace(/_/g, ' ')}
                          </span>
                          {centralItem && (
                            <span className="text-[10px] text-muted-foreground mt-0.5">
                              Supplier: {centralItem.supplier || 'N/A'} | Location: {centralItem.location || 'N/A'}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          {!isEditing && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-primary hover:bg-primary/5"
                              onClick={handleStartEdit}
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/5"
                            onClick={async () => {
                              const result = await deleteRoomInventory(selectedHostel, selectedRoom._id || selectedRoom.id, item._id);
                              if (result && result.success) {
                                toast.success("Inventory item deleted successfully");
                                refreshRooms();
                              }
                            }}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-3 pt-1 border-t border-border/40">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider">Qty:</span>
                          {isEditing ? (
                            <Input
                              type="number"
                              className="h-7 w-20 text-xs"
                              value={editQuantity}
                              min="1"
                              onChange={(e) => setEditQuantity(parseInt(e.target.value) || 0)}
                            />
                          ) : (
                            <span className="text-xs font-medium">{item.quantity}</span>
                          )}
                        </div>

                        {isEditing && (
                          <div className="flex gap-1.5">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 px-2.5 text-xs text-muted-foreground hover:bg-muted"
                              onClick={handleCancelEdit}
                            >
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              className="h-7 px-2.5 text-xs"
                              onClick={handleSaveEdit}
                            >
                              Save
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center border-2 border-dashed border-border rounded-xl">
                <Package className="h-8 w-8 text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground">No items in this room yet</p>
              </div>
            )}

            <div className="rounded-xl border border-border p-4 bg-muted/10">
              <h4 className="mb-3 text-sm font-bold flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add From Inventory
              </h4>
              <div className="space-y-3">
                <div>
                  <Label className="text-[12px]">Category</Label>
                  <Select value={selectedInventoryCategory} onValueChange={(val) => { setSelectedInventoryCategory(val); setSelectedInventoryItemId(''); }}>
                    <SelectTrigger className="h-8 text-[12px]">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="furniture">Furniture</SelectItem>
                      <SelectItem value="electronics">Electronics</SelectItem>
                      <SelectItem value="miscellaneous">Miscellaneous</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {selectedInventoryCategory && (
                  <div>
                    <Label className="text-[12px]">Inventory Item</Label>
                    <Select value={selectedInventoryItemId} onValueChange={setSelectedInventoryItemId}>
                      <SelectTrigger className="h-8 text-[12px]">
                        <SelectValue placeholder="Select item" />
                      </SelectTrigger>
                      <SelectContent>
                        {inventoryItems
                          .filter((item) => item.category === selectedInventoryCategory)
                          .map((item) => (
                            <SelectItem key={item._id} value={item._id}>
                              {(item.itemType || item.category).replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    {selectedInventoryItemId && (
                      <p className="mt-1.5 text-[11px] text-muted-foreground">
                        Available: {' '}
                        <span className="font-semibold text-foreground">
                          {(() => {
                            const item = inventoryItems.find((i) => i._id === selectedInventoryItemId);
                            if (!item) return 0;
                            const available = item.quantity - getAssignedQuantity(selectedInventoryItemId);
                            return available;
                          })()}
                        </span>
                        {' '}of {inventoryItems.find((i) => i._id === selectedInventoryItemId)?.quantity ?? 0}
                      </p>
                    )}
                  </div>
                )}
                <div>
                  <Label className="text-[12px]">Quantity</Label>
                  <Input
                    type="number"
                    min="1"
                    placeholder="Qty"
                    value={inventoryForm.quantity}
                    onChange={(e) => setInventoryForm({ ...inventoryForm, quantity: e.target.value })}
                    className="w-full h-8 text-[12px]"
                  />
                </div>
                <Button 
                  type="button" 
                  className="w-full rounded-lg"
                  onClick={handleAddInventory}
                >
                  Add to Room
                </Button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </MainLayout >
  );
};

export default Hostels;
