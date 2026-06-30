import React, { useState } from "react";
import {
  UserPlus,
  Search,
  Trash2,
  Edit,
  Users,
  Eye,
  EyeOff,
  Loader2,
  MoreVertical,
} from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useHostel } from "@/context/useHostel";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const Admissions = () => {
  const { students, hostels, addStudent, deleteStudent, updateStudent } =
    useHostel();
  const { isSuperAdmin } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const isPriceLocked = !!editingStudent && !isSuperAdmin;
  const [viewingStudent, setViewingStudent] = useState(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [menuPosition, setMenuPosition] = useState({
    top: 0,
    left: 0,
    flip: false,
  });
  const [formData, setFormData] = useState({
    name: "",
    fatherName: "",
    organizationName: "",
    boardingNumber: "",
    password: "",
    fee: "",
    discount: "",
    // program: '',
    // department: '',
    // year: '',
    occupation: "",
    occupationOther: "",
    hostelName: "",
    roomNumber: "",
    contactNumber: "",
    parentContact: "",
    email: "",
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name?.trim()) newErrors.name = "Name is required";
    if (!formData.fatherName?.trim())
      newErrors.fatherName = "Father name is required";
    if (!formData.boardingNumber?.toString().trim()) {
      newErrors.boardingNumber = "Boarding number is required";
    }
    if (!editingStudent && !formData.password) {
      newErrors.password = "Password is required for new students";
    }
    if (!formData.occupation) newErrors.occupation = "Occupation is required";
    if (formData.occupation === "other" && !formData.occupationOther) {
      newErrors.occupationOther = "Please specify your occupation";
    }
    if (!formData.organizationName?.trim())
      newErrors.organizationName = "Organization/Institution name is required";
    if (!formData.fee) newErrors.fee = "Decided fee is required";
    // if (!formData.program) newErrors.program = 'Program is required';
    // if (!formData.department) newErrors.department = 'Department is required';
    // if (!formData.year) newErrors.year = 'Year is required';
    if (!formData.contactNumber?.trim()) {
      newErrors.contactNumber = "Contact number is required";
    }
    if (!formData.parentContact?.trim()) {
      newErrors.parentContact = "Parent contact is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form data on submit:", formData);

    if (!validateForm()) {
      console.log("Validation failed:", errors);
      return;
    }

    setIsSubmitting(true);
    try {
      const dataToSubmit = {
        ...formData,
        contact: formData.contactNumber, // Backend expects 'contact'
      };

      console.log("Data being sent to server:", dataToSubmit);

      let result;
      if (editingStudent) {
        const studentId = editingStudent._id || editingStudent.id;
        console.log("Updating student with ID:", studentId);
        result = await updateStudent(studentId, dataToSubmit);
        if (result?.success) toast.success("Student updated successfully");
      } else {
        result = await addStudent(dataToSubmit);
        if (result?.success) toast.success("Student admitted successfully");
      }

      if (result?.success) {
        setFormData({
          name: "",
          fatherName: "",
          boardingNumber: "",
          password: "",
          // program: '',
          // department: '',
          // year: '',
          fee: "",
          discount: "",
          occupation: "",
          organizationName: "",
          hostelName: "",
          roomNumber: "",
          contactNumber: "",
          parentContact: "",
          email: "",
        });
        setEditingStudent(null);
        setIsDialogOpen(false);
      }
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      toast.error("An unexpected error occurred during submission");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (student) => {
    console.log("Original student data:", student);

    setEditingStudent(student);
    setFormData({
      name: student.name || student.user?.name || "",
      fatherName: student.fatherName || "",
      password: "",
      hostelName:
        student.room?.hostel?.name ||
        student.hostel?.name ||
        student.hostelName ||
        "",
      roomNumber: (
        student.room?.roomNumber ||
        student.roomNumber ||
        ""
      ).toString(),
      boardingNumber: student.boardingNumber || "",
      contactNumber: student.contactNumber || student.contact || "",
      parentContact: student.parentContact || "",
      email: student.user?.email || student.email || "",
      fee: student.fee || "",
      discount: student.discount || "",
      occupation: student.occupation || "",
      occupationOther: student.occupationOther || "",
      organizationName: student.organizationName || "",
    });

    setIsDialogOpen(true);
  };
  const handleView = (student) => {
    setViewingStudent(student);
    setIsViewDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      const result = await deleteStudent(id);
      if (result.success) toast.success("Student removed successfully");
    }
  };

  const handleMenuClick = (e, studentId) => {
    e.stopPropagation();

    if (openMenuId === studentId) {
      setOpenMenuId(null);
      return;
    }

    const buttonRect = e.currentTarget.getBoundingClientRect();
    const dropdownHeight = 140; // Approximate height of dropdown
    const spaceBelow = window.innerHeight - buttonRect.bottom;
    const spaceAbove = buttonRect.top;

    // Determine if we should flip the dropdown upward
    const shouldFlip = spaceBelow < dropdownHeight && spaceAbove > spaceBelow;

    setMenuPosition({
      top: shouldFlip ? buttonRect.top - dropdownHeight : buttonRect.bottom + 4,
      left: buttonRect.right - 130, // Align right edge of dropdown with button
      flip: shouldFlip,
    });

    setOpenMenuId(studentId);
  };

  // Department color mapping
  // const getDepartmentColor = (department) => {
  //   const colors = {
  //     'Computer Science': { bg: '#EEF2FF', text: '#4338CA' }, // Soft indigo
  //     'Pre-Engineering': { bg: '#F0FDFA', text: '#0F766E' }, // Soft teal
  //     'Pre-Medical': { bg: '#FFFBEB', text: '#B45309' }, // Soft amber
  //     'Arts': { bg: '#F0FDF4', text: '#15803D' }, // Soft green
  //     'English': { bg: '#FDF2F8', text: '#BE185D' }, // Soft pink
  //     'Political Science': { bg: '#EEF2FF', text: '#4338CA' }, // Soft indigo
  //     'Law': { bg: '#FEF2F2', text: '#B91C1C' }, // Soft red
  //     'HND': { bg: '#F0FDFA', text: '#0F766E' }, // Soft teal
  //     'BBA': { bg: '#FFF7ED', text: '#C2410C' }, // Soft orange
  //     'Economics': { bg: '#ECFEFF', text: '#0E7490' }, // Soft cyan
  //   };
  //   return colors[department] || { bg: '#F8FAFC', text: '#475569' }; // Default soft gray
  // };

  const filteredStudents = students.filter(
    (student) =>
      (student.name || student.user?.name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (student.boardingNumber || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()),
  );

  return (
    <MainLayout>
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
        <div>
          <h1 className="text-[18px] font-semibold text-foreground">
            Admissions
          </h1>
          <p className="mt-2 text-[12px] font-light text-muted-foreground">
            View and manage all student admission records
          </p>
        </div>
        <Drawer open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DrawerTrigger asChild>
            <Button
              onClick={() => {
                setEditingStudent(null);
                setFormData({
                  name: "",
                  fatherName: "",
                  boardingNumber: "",
                  password: "",
                  occupation: "",
                  organizationName: "",
                  fee: "",
                  discount: "",
                  // program: '',
                  // department: '',
                  // year: '',
                  hostelName: "",
                  roomNumber: "",
                  contactNumber: "",
                  parentContact: "",
                  email: "",
                });
                setErrors({});
              }}
              style={{
                borderRadius: "6px",
                fontSize: "12px",
                fontWeight: 400,
                padding: "6px 14px",
                height: "34px",
                flexShrink: 0,
              }}
            >
              <UserPlus className="mr-2 h-4 w-4" />
              New Admission
            </Button>
          </DrawerTrigger>
          <DrawerContent className="max-w-4xl">
            <DrawerHeader>
              <DrawerTitle style={{ fontSize: "18px", fontWeight: 600 }}>
                {editingStudent ? "Edit Student" : "New Student Admission"}
              </DrawerTitle>
            </DrawerHeader>
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <style>
                {`
                  .admission-form label {
                    font-size: 12px;
                    font-weight: 500;
                  }
                  .admission-form input,
                  .admission-form input::placeholder {
                    font-size: 12px;
                    font-weight: 400;
                    height: 32px;
                    padding: 4px 8px;
                    border-radius: 4px;
                  }
                  .admission-form button[type="button"] > div {
                    font-size: 12px;
                    font-weight: 400;
                    height: 32px;
                    padding: 4px 8px;
                    border-radius: 4px;
                  }
                  .admission-form .error-text {
                    font-size: 11px;
                  }
                `}
              </style>
              <div className="admission-form grid grid-cols-2 gap-4">
                <div>
                  <Label
                    htmlFor="name"
                    style={{ fontSize: "13px", fontWeight: 500 }}
                  >
                    Student Name
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Enter full name"
                    className={errors.name ? "border-destructive" : ""}
                    style={{
                      fontSize: "12px",
                      fontWeight: 400,
                      height: "32px",
                      padding: "4px 8px",
                      borderRadius: "4px",
                    }}
                  />
                  {errors.name && (
                    <p
                      className="mt-1 error-text text-destructive"
                      style={{ fontSize: "12px" }}
                    >
                      {errors.name}
                    </p>
                  )}
                </div>

                <div>
                  <Label
                    htmlFor="fatherName"
                    style={{ fontSize: "13px", fontWeight: 500 }}
                  >
                    Father&apos;s Name
                  </Label>
                  <Input
                    id="fatherName"
                    value={formData.fatherName}
                    onChange={(e) =>
                      setFormData({ ...formData, fatherName: e.target.value })
                    }
                    placeholder="Enter father's name"
                    className={errors.fatherName ? "border-destructive" : ""}
                    style={{
                      fontSize: "12px",
                      fontWeight: 400,
                      height: "32px",
                      padding: "4px 8px",
                      borderRadius: "4px",
                    }}
                  />
                  {errors.fatherName && (
                    <p
                      className="mt-1 error-text text-destructive"
                      style={{ fontSize: "12px" }}
                    >
                      {errors.fatherName}
                    </p>
                  )}
                </div>
                <div>
                  <Label
                    htmlFor="email"
                    style={{ fontSize: "13px", fontWeight: 500 }}
                  >
                    Email (Optional)
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="student@example.com"
                    style={{
                      fontSize: "12px",
                      fontWeight: 400,
                      height: "32px",
                      padding: "4px 8px",
                      borderRadius: "4px",
                    }}
                  />
                </div>
                <div>
                  <Label
                    htmlFor="boardingNumber"
                    style={{ fontSize: "13px", fontWeight: 500 }}
                  >
                    Boarding Number
                  </Label>
                  <Input
                    id="boardingNumber"
                    value={formData.boardingNumber}
                    type="number"
                    placeholder="Enter boarding number"
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        boardingNumber: e.target.value,
                      })
                    }
                    className={
                      errors.boardingNumber ? "border-destructive" : ""
                    }
                    style={{
                      fontSize: "12px",
                      fontWeight: 400,
                      height: "32px",
                      padding: "4px 8px",
                      borderRadius: "4px",
                    }}
                  />
                  {errors.boardingNumber && (
                    <p
                      className="mt-1 error-text text-destructive"
                      style={{ fontSize: "12px" }}
                    >
                      {errors.boardingNumber}
                    </p>
                  )}
                </div>

                <div>
                  <Label
                    htmlFor="contactNumber"
                    style={{ fontSize: "13px", fontWeight: 500 }}
                  >
                    Contact Number
                  </Label>
                  <Input
                    id="contactNumber"
                    value={formData.contactNumber}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contactNumber: e.target.value,
                      })
                    }
                    placeholder="03XXXXXXXXX"
                    className={errors.contactNumber ? "border-destructive" : ""}
                    style={{
                      fontSize: "12px",
                      fontWeight: 400,
                      height: "32px",
                      padding: "4px 8px",
                      borderRadius: "4px",
                    }}
                  />
                  {errors.contactNumber && (
                    <p
                      className="mt-1 error-text text-destructive"
                      style={{ fontSize: "12px" }}
                    >
                      {errors.contactNumber}
                    </p>
                  )}
                </div>
                <div>
                  <Label
                    htmlFor="parentContact"
                    style={{ fontSize: "13px", fontWeight: 500 }}
                  >
                    Parent Contact
                  </Label>
                  <Input
                    id="parentContact"
                    value={formData.parentContact}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        parentContact: e.target.value,
                      })
                    }
                    placeholder="03XXXXXXXXX"
                    className={errors.parentContact ? "border-destructive" : ""}
                    style={{
                      fontSize: "12px",
                      fontWeight: 400,
                      height: "32px",
                      padding: "4px 8px",
                      borderRadius: "4px",
                    }}
                  />
                  {errors.parentContact && (
                    <p
                      className="mt-1 error-text text-destructive"
                      style={{ fontSize: "12px" }}
                    >
                      {errors.parentContact}
                    </p>
                  )}
                </div>
                <div>
                  <Label
                    htmlFor="hostelName"
                    style={{ fontSize: "13px", fontWeight: 500 }}
                  >
                    Hostel
                  </Label>
                  <Select
                    value={formData.hostelName}
                    onValueChange={(value) =>
                      setFormData({ ...formData, hostelName: value, roomNumber: "", fee: "", discount: "" })
                    }
                  >
                    <SelectTrigger
                      className={errors.hostelName ? "border-destructive" : ""}
                      style={{
                        fontSize: "12px",
                        fontWeight: 400,
                        height: "32px",
                        padding: "4px 8px",
                        borderRadius: "4px",
                      }}
                    >
                      <SelectValue placeholder="Select hostel" />
                    </SelectTrigger>
                    <SelectContent>
                      {hostels.map((hostel) => (
                        <SelectItem
                          key={hostel._id || hostel.id}
                          value={hostel.name}
                        >
                          {hostel.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.hostelName && (
                    <p
                      className="mt-1 error-text text-destructive"
                      style={{ fontSize: "12px" }}
                    >
                      {errors.hostelName}
                    </p>
                  )}
                </div>
                <div>
                  <Label
                    htmlFor="roomNumber"
                    style={{ fontSize: "13px", fontWeight: 500 }}
                  >
                    Room Number
                  </Label>
                  <Select
                    value={formData.roomNumber}
                    onValueChange={(value) => {
                      const room = hostels
                        .find((h) => h.name === formData.hostelName)
                        ?.rooms.find((r) => r.roomNumber === value);
                      const roomFee = room?.boardingFee || 0;
                      const discount = Number(formData.discount || 0);
                      const decidedFee = Math.max(0, roomFee - discount);
                      setFormData({
                        ...formData,
                        roomNumber: value,
                        fee: decidedFee.toString(),
                      });
                    }}
                    disabled={!formData.hostelName}
                  >
                    <SelectTrigger
                      style={{
                        fontSize: "12px",
                        fontWeight: 400,
                        height: "32px",
                        padding: "4px 8px",
                        borderRadius: "4px",
                      }}
                    >
                      <SelectValue
                        placeholder={
                          formData.hostelName
                            ? "Select room"
                            : "Select hostel first"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {hostels
                        .find((h) => h.name === formData.hostelName)
                        ?.rooms.map((room) => {
                          const isFull = room.currentOccupants >= room.capacity;
                          return (
                            <SelectItem
                              key={room._id || room.id}
                              value={room.roomNumber}
                              disabled={
                                isFull &&
                                (!editingStudent ||
                                  editingStudent.room?.roomNumber !==
                                    room.roomNumber)
                              }
                            >
                              Room {room.roomNumber} ({room.floor} -{" "}
                              {room.seatType}) - Fee Rs.{" "}
                              {room.boardingFee?.toLocaleString() || 0}
                              {isFull
                                ? " (Full)"
                                : ` (${room.currentOccupants}/${room.capacity})`}
                            </SelectItem>
                          );
                        })}
                      {hostels.find((h) => h.name === formData.hostelName)
                        ?.rooms.length === 0 && (
                        <SelectItem value="none" disabled>
                          No rooms in this hostel
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                {formData.roomNumber && (
                  <div className="col-span-2 rounded-lg border border-border bg-muted/20 p-3">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Room Fee</span>
                        <p className="font-medium">
                          Rs.{" "}
                          {hostels
                            .find((h) => h.name === formData.hostelName)
                            ?.rooms.find(
                              (r) => r.roomNumber === formData.roomNumber,
                            )?.boardingFee?.toLocaleString() || 0}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Discount</span>
                        <Input
                          type="number"
                          min="0"
                          value={formData.discount}
                          onChange={(e) => {
                            const discount = e.target.value;
                            const room = hostels
                              .find((h) => h.name === formData.hostelName)
                              ?.rooms.find(
                                (r) => r.roomNumber === formData.roomNumber,
                              );
                            const roomFee = room?.boardingFee || 0;
                            const decided =
                              discount === ""
                                ? roomFee
                                : Math.max(0, roomFee - Number(discount));
                            setFormData({
                              ...formData,
                              discount,
                              fee: decided.toString(),
                            });
                          }}
                          placeholder="0"
                          className="h-8 mt-1"
                          disabled={isPriceLocked}
                        />
                      </div>
                      <div>
                        <span className="text-muted-foreground">Decided Fee</span>
                        <Input
                          type="number"
                          min="0"
                          value={formData.fee}
                          onChange={(e) =>
                            setFormData({ ...formData, fee: e.target.value })
                          }
                          placeholder="Enter decided fee"
                          className="h-8 mt-1"
                          disabled={isPriceLocked}
                        />
                      </div>
                      <div>
                        <span className="text-muted-foreground">Final Fee</span>
                        <p className="font-medium text-primary">
                          Rs. {Number(formData.fee || 0).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                <div>
                  <Label
                    htmlFor="occupation"
                    style={{ fontSize: "13px", fontWeight: 500 }}
                  >
                    Occupation
                  </Label>
                  <Select
                    value={formData.occupation}
                    onValueChange={(value) =>
                      setFormData({ ...formData, occupation: value })
                    }
                  >
                    <SelectTrigger
                      className={errors.occupation ? "border-destructive" : ""}
                      style={{
                        fontSize: "12px",
                        fontWeight: 400,
                        height: "32px",
                        padding: "4px 8px",
                        borderRadius: "4px",
                      }}
                    >
                      <SelectValue placeholder="Select occupation" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="9">9th Student</SelectItem>
                      <SelectItem value="10">10th Student</SelectItem>
                      <SelectItem value="11">1st Year Student</SelectItem>
                      <SelectItem value="12">2nd Year Student</SelectItem>
                      <SelectItem value="mbbs">MBBS Student</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.occupation && (
                    <p
                      className="mt-1 error-text text-destructive"
                      style={{ fontSize: "12px" }}
                    >
                      {errors.occupation}
                    </p>
                  )}
                </div>
                {formData.occupation === "other" && (
                  <div>
                    <Label
                      htmlFor="occupationOther"
                      style={{ fontSize: "13px", fontWeight: 500 }}
                    >
                      Please specify
                    </Label>
                    <Input
                      id="occupationOther"
                      value={formData.occupationOther || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          occupationOther: e.target.value,
                        })
                      }
                      placeholder="Enter your occupation"
                      className={
                        errors.occupationOther ? "border-destructive" : ""
                      }
                      style={{
                        fontSize: "12px",
                        fontWeight: 400,
                        height: "32px",
                        padding: "4px 8px",
                        borderRadius: "4px",
                      }}
                    />
                    {errors.occupationOther && (
                      <p
                        className="mt-1 error-text text-destructive"
                        style={{ fontSize: "12px" }}
                      >
                        {errors.occupationOther}
                      </p>
                    )}
                  </div>
                )}
                <div>
                  <Label
                    htmlFor="name"
                    style={{ fontSize: "13px", fontWeight: 500 }}
                  >
                    Organization/Institution Name
                  </Label>
                  <Input
                    id="name"
                    value={formData.organizationName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        organizationName: e.target.value,
                      })
                    }
                    placeholder="Enter organization name"
                    className={
                      errors.organizationName ? "border-destructive" : ""
                    }
                    style={{
                      fontSize: "12px",
                      fontWeight: 400,
                      height: "32px",
                      padding: "4px 8px",
                      borderRadius: "4px",
                    }}
                  />
                  {errors.organizationName && (
                    <p
                      className="mt-1 error-text text-destructive"
                      style={{ fontSize: "12px" }}
                    >
                      {errors.organizationName}
                    </p>
                  )}
                </div>
                <div>
                  <Label
                    htmlFor="password"
                    style={{ fontSize: "13px", fontWeight: 500 }}
                  >
                    {editingStudent
                      ? "New Password (Leave blank to keep current)"
                      : "Login Password"}
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      placeholder={
                        editingStudent
                          ? "Leave blank to keep existing"
                          : "••••••••"
                      }
                      className={
                        errors.password ? "border-destructive pr-10" : "pr-10"
                      }
                      style={{
                        fontSize: "12px",
                        fontWeight: 400,
                        height: "32px",
                        padding: "4px 8px",
                        borderRadius: "4px",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p
                      className="mt-1 error-text text-destructive"
                      style={{ fontSize: "12px" }}
                    >
                      {errors.password}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  style={{ borderRadius: "5px" }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  style={{ borderRadius: "5px" }}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : editingStudent ? (
                    "Update Student"
                  ) : (
                    "Admit Student"
                  )}
                </Button>
              </div>
            </form>
          </DrawerContent>
        </Drawer>
      </div>

      {/* Search */}
      <div className="mb-2 animate-slide-up">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or boarding number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full"
            style={{
              borderRadius: "6px",
              border: "1px solid hsl(var(--border))",
              backgroundColor: "hsl(var(--card))",
              fontSize: "12px",
              fontWeight: 400,
              height: "36px",
            }}
          />
        </div>
      </div>
      <div className="mb-3 flex items-center gap-1 text-[11px] text-muted-foreground">
        <Users className="h-3 w-3" />
        <span>{filteredStudents.length} of {students.length} students</span>
      </div>

      {/* Students Table */}
      <div className="overflow-x-auto animate-slide-up" style={{ animationDelay: "100ms" }}>
        <Table className="w-full border-collapse border border-border">
          <TableHeader>
            <TableRow className="border-b border-border bg-muted/20">
              <TableHead className="border-r border-border px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-foreground">
                Boarding No.
              </TableHead>
              <TableHead className="border-r border-border px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-foreground">
                Name
              </TableHead>
              <TableHead className="border-r border-border px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-foreground">
                Hostel
              </TableHead>
              <TableHead className="border-r border-border px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-foreground">
                Room
              </TableHead>
              <TableHead className="border-r border-border px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-foreground">
                Contact
              </TableHead>
              <TableHead className="px-4 py-2.5 text-right text-[10px] font-semibold uppercase tracking-wider text-foreground">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStudents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center border-b border-border">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <Users className="h-8 w-8 mb-1 opacity-20" />
                    <p className="text-xs">No students found</p>
                    <p className="text-[11px]">Add a new student to get started</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredStudents.map((student) => (
                <TableRow
                  key={student._id || student.id}
                  className="border-b border-border transition-colors hover:bg-muted/20"
                >
                  <TableCell className="border-r border-border px-4 py-2 text-[11px] text-foreground">
                    {student.boardingNumber}
                  </TableCell>
                  <TableCell className="border-r border-border px-4 py-2 text-[11px] font-medium text-foreground">
                    {student.user?.name || student.name}
                  </TableCell>
                  <TableCell className="border-r border-border px-4 py-2 text-[11px] text-muted-foreground">
                    {student.room?.hostel?.name ||
                      student.hostel?.name ||
                      student.hostelName ||
                      "-"}
                  </TableCell>
                  <TableCell className="border-r border-border px-4 py-2 text-[11px] text-muted-foreground">
                    {student.room?.roomNumber || student.roomNumber || "-"}
                  </TableCell>
                  <TableCell className="border-r border-border px-4 py-2 text-[11px] text-muted-foreground">
                    {student.contact || student.contactNumber}
                  </TableCell>
                  <TableCell className="px-4 py-2 text-right">
                    <button
                      onClick={(e) =>
                        handleMenuClick(e, student._id || student.id)
                      }
                      className="inline-flex items-center justify-center p-1 rounded hover:bg-muted transition-colors"
                    >
                      <MoreVertical className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Fixed Position Dropdown Menu */}
      {openMenuId && (
        <>
          <div
            className="fixed inset-0 z-[9998]"
            onClick={() => setOpenMenuId(null)}
            style={{ background: "transparent" }}
          />
          <div
            className="fixed z-[9999]"
            style={{
              top: `${menuPosition.top}px`,
              left: `${menuPosition.left}px`,
              backgroundColor: "#FFFFFF",
              borderRadius: "7px",
              border: "0.5px solid #E2E8F0",
              padding: "4px",
              minWidth: "130px",
              boxShadow:
                "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
            }}
          >
            <button
              onClick={() => {
                const student = filteredStudents.find(
                  (s) => (s._id || s.id) === openMenuId,
                );
                if (student) handleView(student);
                setOpenMenuId(null);
              }}
              className="w-full flex items-center gap-2 transition-colors"
              style={{
                height: "32px",
                padding: "0 10px",
                border: "none",
                background: "transparent",
                cursor: "pointer",
                borderRadius: "5px",
                fontSize: "12px",
                fontWeight: 400,
                color: "#374151",
                textAlign: "left",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#F8FAFC")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }
            >
              <Eye
                style={{ width: "14px", height: "14px", color: "#64748B" }}
              />
              View
            </button>
            <button
              onClick={() => {
                const student = filteredStudents.find(
                  (s) => (s._id || s.id) === openMenuId,
                );
                if (student) handleEdit(student);
                setOpenMenuId(null);
              }}
              className="w-full flex items-center gap-2 transition-colors"
              style={{
                height: "32px",
                padding: "0 10px",
                border: "none",
                background: "transparent",
                cursor: "pointer",
                borderRadius: "5px",
                fontSize: "12px",
                fontWeight: 400,
                color: "#374151",
                textAlign: "left",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#F8FAFC")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }
            >
              <Edit
                style={{ width: "14px", height: "14px", color: "#64748B" }}
              />
              Edit
            </button>
            <div
              style={{
                height: "0.5px",
                backgroundColor: "#F1F5F9",
                margin: "2px 0",
              }}
            />
            <button
              onClick={() => {
                handleDelete(openMenuId);
                setOpenMenuId(null);
              }}
              className="w-full flex items-center gap-2 transition-colors"
              style={{
                height: "32px",
                padding: "0 10px",
                border: "none",
                background: "transparent",
                cursor: "pointer",
                borderRadius: "5px",
                fontSize: "12px",
                fontWeight: 400,
                color: "#EF4444",
                textAlign: "left",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#FEF2F2")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }
            >
              <Trash2
                style={{ width: "14px", height: "14px", color: "#EF4444" }}
              />
              Delete
            </button>
          </div>
        </>
      )}

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-[16px] font-semibold">Student Details</DialogTitle>
          </DialogHeader>
          {viewingStudent && (
            <div className="mt-4 space-y-4">
              {/* Profile Header */}
              <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/20 p-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[13px] font-bold text-primary">
                  {(viewingStudent.user?.name || viewingStudent.name || "?").charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-foreground">
                    {viewingStudent.user?.name || viewingStudent.name}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Boarding No. {viewingStudent.boardingNumber}
                  </p>
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-md border border-border p-3">
                  <Label className="text-[10px] uppercase text-muted-foreground tracking-wider">Father&apos;s Name</Label>
                  <p className="mt-1 text-[12px] font-medium text-foreground">{viewingStudent.fatherName || "-"}</p>
                </div>
                <div className="rounded-md border border-border p-3">
                  <Label className="text-[10px] uppercase text-muted-foreground tracking-wider">Contact Number</Label>
                  <p className="mt-1 text-[12px] font-medium text-foreground">{viewingStudent.contactNumber || "-"}</p>
                </div>
                <div className="rounded-md border border-border p-3">
                  <Label className="text-[10px] uppercase text-muted-foreground tracking-wider">Parent Contact</Label>
                  <p className="mt-1 text-[12px] font-medium text-foreground">{viewingStudent.parentContact || "-"}</p>
                </div>
                <div className="rounded-md border border-border p-3">
                  <Label className="text-[10px] uppercase text-muted-foreground tracking-wider">Email</Label>
                  <p className="mt-1 text-[12px] font-medium text-foreground">{viewingStudent.user?.email || viewingStudent.email || "-"}</p>
                </div>
                <div className="rounded-md border border-border p-3">
                  <Label className="text-[10px] uppercase text-muted-foreground tracking-wider">Hostel</Label>
                  <p className="mt-1 text-[12px] font-medium text-foreground">{viewingStudent.room?.hostel?.name || viewingStudent.hostel?.name || "-"}</p>
                </div>
                <div className="rounded-md border border-border p-3">
                  <Label className="text-[10px] uppercase text-muted-foreground tracking-wider">Room</Label>
                  <p className="mt-1 text-[12px] font-medium text-foreground">{viewingStudent.room?.roomNumber || viewingStudent.roomNumber || "-"}</p>
                </div>
                <div className="rounded-md border border-border p-3">
                  <Label className="text-[10px] uppercase text-muted-foreground tracking-wider">Occupation</Label>
                  <p className="mt-1 text-[12px] font-medium text-foreground">{viewingStudent.occupation || "-"}</p>
                </div>
                <div className="rounded-md border border-border p-3">
                  <Label className="text-[10px] uppercase text-muted-foreground tracking-wider">Organization</Label>
                  <p className="mt-1 text-[12px] font-medium text-foreground">{viewingStudent.organizationName || "-"}</p>
                </div>
                <div className="rounded-md border border-border p-3">
                  <Label className="text-[10px] uppercase text-muted-foreground tracking-wider">Fee</Label>
                  <p className="mt-1 text-[12px] font-medium text-foreground">Rs. {viewingStudent.fee || "-"}</p>
                </div>
                <div className="rounded-md border border-border p-3">
                  <Label className="text-[10px] uppercase text-muted-foreground tracking-wider">Discount</Label>
                  <p className="mt-1 text-[12px] font-medium text-foreground">Rs. {viewingStudent.discount || "0"}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default Admissions;
