import MainLayout from "@/components/layout/MainLayout";
import React, { useState } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { DollarSign, MoreVertical, Search, Users } from "lucide-react";
import BoardingFeeForm from "./BoardingFeeForm";

import { useHostel } from "@/context/useHostel";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const YEARS = ["2024", "2025", "2026", "2027", "2028", "2029", "2030", "2031", "2032", "2033", "2034", "2035"];

const Fee = () => {
  const { challans } = useHostel();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchStudent, setSearchStudent] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [filterYear, setFilterYear] = useState("");

  const handleMenuClick = (e, id) => {
    e.stopPropagation();
    console.log("Challan action menu", id);
  };

  const clearFilters = () => {
    setSearchStudent("");
    setFilterMonth("");
    setFilterYear("");
  };

  const challanList = Array.isArray(challans) ? challans : [];

  const filteredChallans = challanList.filter((challan) => {
    const matchesStudent =
      !searchStudent ||
      (challan.boarderName || "")
        .toLowerCase()
        .includes(searchStudent.toLowerCase()) ||
      (challan.boardingNo || "")
        .toLowerCase()
        .includes(searchStudent.toLowerCase());
    const matchesMonth =
      !filterMonth || challan.feeMonth === filterMonth;
    const matchesYear =
      !filterYear || String(challan.feeYear) === filterYear;
    return matchesStudent && matchesMonth && matchesYear;
  });

  const hasFilters = searchStudent || filterMonth || filterYear;

  return (
    <MainLayout>
      <div className="mb-6 animate-fade-in flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-[18px] font-semibold text-foreground">
            Fee Management
          </h1>
          <p className="mt-2 text-[12px] font-light text-muted-foreground">
            Track and manage your fees
          </p>
        </div>
        <Drawer open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DrawerTrigger asChild>
            <Button
              style={{
                borderRadius: "6px",
                fontSize: "12px",
                fontWeight: 400,
                padding: "6px 14px",
                height: "34px",
                flexShrink: 0,
              }}
            >
              <DollarSign className="mr-2 h-4 w-4" />
              Record Payment
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle style={{ fontSize: "18px", fontWeight: 600 }}>
                Record Boarding Fee Payment
              </DrawerTitle>
            </DrawerHeader>
            <BoardingFeeForm onSuccess={() => setIsDialogOpen(false)} />
          </DrawerContent>
        </Drawer>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3 mb-3 p-3 border border-border bg-muted/20 rounded-md animate-slide-up">
        <div className="flex flex-col gap-1 min-w-[200px]">
          <Label className="text-[11px] font-medium text-muted-foreground">Search Student</Label>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Name or boarding number..."
              value={searchStudent}
              onChange={(e) => setSearchStudent(e.target.value)}
              className="h-8 text-[12px] pl-8"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1 min-w-[160px]">
          <Label className="text-[11px] font-medium text-muted-foreground">Month</Label>
          <Select value={filterMonth || undefined} onValueChange={setFilterMonth}>
            <SelectTrigger className="h-8 text-[12px]">
              <SelectValue placeholder="All months" />
            </SelectTrigger>
            <SelectContent>
              {MONTH_NAMES.map((m) => (
                <SelectItem key={m} value={m}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1 min-w-[120px]">
          <Label className="text-[11px] font-medium text-muted-foreground">Year</Label>
          <Select value={filterYear || undefined} onValueChange={setFilterYear}>
            <SelectTrigger className="h-8 text-[12px]">
              <SelectValue placeholder="All years" />
            </SelectTrigger>
            <SelectContent>
              {YEARS.map((y) => (
                <SelectItem key={y} value={y}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {hasFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearFilters}
            className="h-8 text-[12px] rounded-sm"
          >
            Clear Filters
          </Button>
        )}
      </div>

      <div className="mb-3 flex items-center gap-1 text-[11px] text-muted-foreground">
        <Users className="h-3 w-3" />
        <span>{filteredChallans.length} of {challanList.length} records</span>
      </div>

      {/* Challans Table */}
      <div className="overflow-x-auto animate-slide-up" style={{ animationDelay: "100ms" }}>
        <Table className="w-full border-collapse border border-border">
          <TableHeader>
            <TableRow className="border-b border-border bg-muted/20">
              <TableHead className="border-r border-border px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-foreground">
                Name
              </TableHead>
              <TableHead className="border-r border-border px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-foreground">
                Fee Month
              </TableHead>
              <TableHead className="border-r border-border px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-foreground">
                Total
              </TableHead>
              <TableHead className="border-r border-border px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-foreground">
                Paid
              </TableHead>
              <TableHead className="border-r border-border px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-foreground">
                Due
              </TableHead>
              <TableHead className="px-4 py-2.5 text-right text-[10px] font-semibold uppercase tracking-wider text-foreground">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredChallans.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center border-b border-border">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <Users className="h-8 w-8 mb-1 opacity-20" />
                    <p className="text-xs">No fee records found</p>
                    <p className="text-[11px]">
                      {hasFilters ? "Try adjusting your filters" : "Record a payment to get started"}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredChallans.map((challan) => (
                <TableRow
                  key={challan._id}
                  className="border-b border-border transition-colors hover:bg-muted/20"
                >
                  <TableCell className="border-r border-border px-4 py-2 text-[11px] font-medium text-foreground">
                    {challan.boarderName || "-"}
                  </TableCell>

                  <TableCell className="border-r border-border px-4 py-2 text-[11px] text-muted-foreground">
                    {challan.feeMonth} {challan.feeYear}
                  </TableCell>

                  <TableCell className="border-r border-border px-4 py-2 text-[11px] text-muted-foreground">
                    Rs. {challan.totalAmount?.toLocaleString() ?? "-"}
                  </TableCell>

                  <TableCell className="border-r border-border px-4 py-2 text-[11px] text-muted-foreground">
                    Rs. {challan.receivedAmount?.toLocaleString() ?? "-"}
                  </TableCell>

                  <TableCell className="border-r border-border px-4 py-2 text-[11px] text-muted-foreground">
                    Rs. {challan.balanceAmount?.toLocaleString() ?? "-"}
                  </TableCell>

                  <TableCell className="px-4 py-2 text-right">
                    <button
                      onClick={(e) => handleMenuClick(e, challan._id)}
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
    </MainLayout>
  );
};

export default Fee;
