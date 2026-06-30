import React, { useState } from "react";
import {
  UtensilsCrossed,
  Check,
  X,
  Edit,
  Save,
  Calendar,
  Search,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useHostel } from "@/context/useHostel";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const MessManagement = () => {
  const {
    students,
    hostels,
    messAttendance,
    messMenu,
    markAttendance,
    updateMessMenu,
  } = useHostel();
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [selectedHostel, setSelectedHostel] = useState("all");
  const [isEditingMenu, setIsEditingMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Ensure we always have 7 days
  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  const fullMenu = days.map((day) => {
    const defaultMenu = {
      day,
      breakfast: "",
      lunch: "",
      dinner: "",
    };
    const existing = messMenu.find((m) => m.day === day);
    return existing ? { ...defaultMenu, ...existing } : defaultMenu;
  });

  const [editedMenu, setEditedMenu] = useState(fullMenu);

  // Sync state when context data loads
  React.useEffect(() => {
    if (messMenu.length > 0) {
      const syncedMenu = days.map((day) => {
        const defaultMenu = {
          day,
          breakfast: "",
          lunch: "",
          dinner: "",
        };
        const existing = messMenu.find((m) => m.day === day);
        return existing ? { ...defaultMenu, ...existing } : defaultMenu;
      });
      setEditedMenu(syncedMenu);
    }
  }, [messMenu]);

  const handleAttendance = async (studentId, status) => {
    try {
      await markAttendance({
        studentId,
        date: selectedDate,
        status,
      });
      toast.success(`Marked ${status.toLowerCase()} for the day`);
    } catch {
      toast.error("Failed to mark attendance");
    }
  };

  const getAttendanceRecord = (studentId) => {
    return messAttendance.find((a) => {
      const recordDate = new Date(a.date).toISOString().split("T")[0];
      const aStudentId = a.student?._id || a.student;
      return aStudentId === studentId && recordDate === selectedDate;
    });
  };

  const getAttendanceStatus = (studentId) =>
    getAttendanceRecord(studentId)?.status;

  const handleSaveMenu = async () => {
    const promises = editedMenu.map((dayMenu) =>
      updateMessMenu(dayMenu.day, {
        breakfast: dayMenu.breakfast,
        lunch: dayMenu.lunch,
        dinner: dayMenu.dinner,
      }),
    );
    await Promise.all(promises);
    setIsEditingMenu(false);
    toast.success("Menu updated successfully");
  };

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      (student.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (student.registrationNumber || student.collegeNumber || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    const studentHostelId =
      student.room?.hostel?._id || student.room?.hostel || student.hostel;
    const matchesHostel =
      selectedHostel === "all" || studentHostelId === selectedHostel;

    return matchesSearch && matchesHostel;
  });

  // Stats - calculated based on filtered students
  const filteredAttendance = filteredStudents.map((s) =>
    getAttendanceStatus(s._id),
  );
  const presentCount = filteredAttendance.filter(
    (status) => status === "Present",
  ).length;
  const absentCount = filteredAttendance.filter(
    (status) => status === "Absent",
  ).length;

  const SHOW_ATTENDANCE = false; // flip to true to re-enable attendence record not to render as not needed
  // const item = messInventory?.[0];
  // console.log("hi",messInventory[0].messItem)
  // const currentQty = item?.quantity ?? 0;
  // console.log("messInventory:",messInventory)
  // const handleSave = () => {console.log("Saving deductions:")};

  return (
    <MainLayout>
      {/* Header */}
      <div className="mb-8 animate-fade-in flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">
            Mess Management
          </h1>
          <p className="mt-2 text-muted-foreground">
            Track and manage the mess menu
          </p>
        </div>
      </div>

      <Tabs defaultValue="menu" className="space-y-6">
        <TabsList className="bg-muted/50">
          {SHOW_ATTENDANCE && (
            <TabsTrigger
              value="attendance"
              className="data-[state=active]:bg-card"
            >
              <Check className="mr-2 h-4 w-4" />
              Attendance
            </TabsTrigger>
          )}
          <TabsTrigger value="menu" className="data-[state=active]:bg-card">
            <UtensilsCrossed className="mr-2 h-4 w-4" />
            Weekly Menu
          </TabsTrigger>
        </TabsList>

        {/* Attendance Tab */}
        {SHOW_ATTENDANCE && (
          <TabsContent
            value="attendance"
            className="space-y-6 animate-slide-up"
          >
            {/* Controls */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Label htmlFor="date">Date:</Label>
                <Input
                  id="date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-auto"
                />
              </div>

              <div className="flex items-center gap-2">
                <Label htmlFor="hostel">Building:</Label>
                <Select
                  value={selectedHostel}
                  onValueChange={(value) => setSelectedHostel(value)}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select Building" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Buildings</SelectItem>
                    {hostels.map((hostel) => (
                      <SelectItem key={hostel._id} value={hostel._id}>
                        {hostel.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 max-w-sm relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search student..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Stats */}
            <div className="flex gap-4">
              <div className="flex items-center gap-2 rounded-lg bg-success/10 px-4 py-2">
                <Check className="h-5 w-5 text-success" />
                <span className="font-medium text-success">
                  {presentCount} Present
                </span>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-4 py-2">
                <X className="h-5 w-5 text-destructive" />
                <span className="font-medium text-destructive">
                  {absentCount} Absent
                </span>
              </div>
            </div>

            {/* Attendance Table */}
            <div className="rounded-xl border border-border bg-card shadow-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Registration No.</TableHead>
                    <TableHead>Hostel</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Marked By</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-32 text-center">
                        <p className="text-muted-foreground">
                          No students matched.
                        </p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredStudents.map((student) => {
                      const record = getAttendanceRecord(student._id);
                      const status = record?.status;
                      return (
                        <TableRow key={student._id}>
                          <TableCell className="font-medium">
                            {student.user?.name || student.name}
                          </TableCell>
                          <TableCell>{student.collegeNumber}</TableCell>
                          <TableCell>
                            {student.room?.hostel?.name || student.hostelName}
                          </TableCell>
                          <TableCell>
                            {status && (
                              <Badge
                                className={cn(
                                  status === "Present" &&
                                    "bg-success/10 text-success",
                                  status === "Absent" &&
                                    "bg-destructive/10 text-destructive",
                                )}
                              >
                                {status}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {record && (
                              <span className="text-xs font-medium text-foreground/70">
                                {record.markedBy?.name || "Self/System"}
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant={
                                  status === "Present" ? "default" : "outline"
                                }
                                size="sm"
                                onClick={() =>
                                  handleAttendance(student._id, "Present")
                                }
                                className={cn(
                                  status === "Present" &&
                                    "bg-success hover:bg-success/90 text-white border-success",
                                )}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                variant={
                                  status === "Absent" ? "default" : "outline"
                                }
                                size="sm"
                                onClick={() =>
                                  handleAttendance(student._id, "Absent")
                                }
                                className={cn(
                                  status === "Absent" &&
                                    "bg-destructive hover:bg-destructive/90 text-white border-destructive",
                                )}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        )}

        {/* Menu Tab */}
        <TabsContent value="menu" className="space-y-6 animate-slide-up">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold">
              Weekly Mess Menu
            </h2>
            <Button
              variant={isEditingMenu ? "default" : "outline"}
              onClick={() => {
                if (isEditingMenu) {
                  handleSaveMenu();
                } else {
                  setEditedMenu([...fullMenu]);
                  setIsEditingMenu(true);
                }
              }}
            >
              {isEditingMenu ? (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Menu
                </>
              ) : (
                <>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Menu
                </>
              )}
            </Button>
          </div>

          <div className="grid gap-4">
            {(isEditingMenu ? editedMenu : fullMenu).map((day, index) => (
              <Card key={day.day} className="overflow-hidden">
                <CardHeader className="bg-muted/30 pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Calendar className="h-5 w-5 text-primary" />
                    {day.day}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <Label className="text-muted-foreground">Breakfast</Label>
                      {isEditingMenu ? (
                        <>
                          <Input
                            value={editedMenu[index].breakfast}
                            onChange={(e) => {
                              const newMenu = [...editedMenu];
                              newMenu[index] = {
                                ...newMenu[index],
                                breakfast: e.target.value,
                              };
                              setEditedMenu(newMenu);
                            }}
                            className="mt-1"
                            placeholder="Menu item"
                          />
                        </>
                      ) : (
                        <div>
                          <p className="mt-1 text-foreground">
                            {day.breakfast}
                          </p>
                        </div>
                      )}
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Lunch</Label>
                      {isEditingMenu ? (
                        <>
                          <Input
                            value={editedMenu[index].lunch}
                            onChange={(e) => {
                              const newMenu = [...editedMenu];
                              newMenu[index] = {
                                ...newMenu[index],
                                lunch: e.target.value,
                              };
                              setEditedMenu(newMenu);
                            }}
                            className="mt-1"
                            placeholder="Menu item"
                          />
                        </>
                      ) : (
                        <div>
                          <p className="mt-1 text-foreground">{day.lunch}</p>
                        </div>
                      )}
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Dinner</Label>
                      {isEditingMenu ? (
                        <>
                          <Input
                            value={editedMenu[index].dinner}
                            onChange={(e) => {
                              const newMenu = [...editedMenu];
                              newMenu[index] = {
                                ...newMenu[index],
                                dinner: e.target.value,
                              };
                              setEditedMenu(newMenu);
                            }}
                            className="mt-1"
                            placeholder="Menu item"
                          />
                        </>
                      ) : (
                        <div>
                          <p className="mt-1 text-foreground">{day.dinner}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
};

export default MessManagement;
