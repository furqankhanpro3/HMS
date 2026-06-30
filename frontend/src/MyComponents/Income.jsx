import MainLayout from "@/components/layout/MainLayout";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Banknote, Plus, Loader2, Search, Trash2, Edit } from "lucide-react";
import { useHostel } from "@/context/useHostel";
import { toast } from "sonner";

const INCOME_CATEGORIES = [
  { value: "boarding_fee", label: "Boarding Fee" },
  { value: "donation", label: "Donation" },
  { value: "investment", label: "Investment" },
  { value: "other", label: "Other" },
];

const PAYMENT_METHODS = [
  { value: "cash", label: "Cash" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "cheque", label: "Cheque" },
  { value: "mobile_wallet", label: "Mobile Wallet" },
];

const STATUS_OPTIONS = [
  { value: "paid", label: "Paid" },
  { value: "partial", label: "Partial" },
  { value: "pending", label: "Pending" },
];

const initialForm = {
  title: "",
  category: "",
  amount: "",
  date: "",
  paymentMethod: "",
  status: "paid",
  description: "",
};

const formatDate = (value) => {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-GB");
};

const formatAmount = (value) => {
  if (value === undefined || value === null) return "-";
  return `Rs. ${Number(value).toLocaleString()}`;
};

const Income = () => {
  const { getIncomes, createIncome, updateIncome, deleteIncome } = useHostel();

  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [status, setStatus] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState(null);
  const [formData, setFormData] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);

  const fetchIncomes = async (page = pagination.page) => {
    setLoading(true);
    try {
      const result = await getIncomes({
        page,
        limit: pagination.limit,
        search,
        category,
        paymentMethod,
        status,
        from,
        to,
      });
      if (result?.success) {
        setIncomes(result.data || []);
        setPagination(result.pagination || pagination);
      }
    } catch (error) {
      console.error("Error fetching income:", error);
      toast.error("Failed to fetch income");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncomes(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, category, paymentMethod, status, from, to, pagination.limit]);

  const handlePageChange = (page) => {
    if (page < 1 || page > pagination.totalPages) return;
    fetchIncomes(page);
  };

  const clearFilters = () => {
    setSearch("");
    setCategory("");
    setPaymentMethod("");
    setStatus("");
    setFrom("");
    setTo("");
  };

  const openAddModal = () => {
    setEditingIncome(null);
    setFormData(initialForm);
    setIsModalOpen(true);
  };

  const openEditModal = (income) => {
    setEditingIncome(income);
    setFormData({
      title: income.title || "",
      category: income.category || "",
      amount: income.amount?.toString() || "",
      date: income.date ? income.date.slice(0, 10) : "",
      paymentMethod: income.paymentMethod || "",
      status: income.status || "paid",
      description: income.description || "",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.category || !formData.amount || !formData.date) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSubmitting(true);
    const payload = {
      ...formData,
      amount: Number(formData.amount),
    };

    let result;
    if (editingIncome) {
      result = await updateIncome(editingIncome._id, payload);
    } else {
      result = await createIncome(payload);
    }

    if (result?.success) {
      toast.success(editingIncome ? "Income updated" : "Income created");
      setIsModalOpen(false);
      fetchIncomes(pagination.page);
    }
    setSubmitting(false);
  };

  const handleDelete = async (income) => {
    if (income.sourceType === "challan") {
      toast.error("Challan-linked income can only be deleted from Fee Management.");
      return;
    }
    if (!window.confirm("Are you sure you want to delete this income?")) return;

    const result = await deleteIncome(income._id);
    if (result?.success) {
      toast.success("Income deleted");
      fetchIncomes(pagination.page);
    }
  };

  const statusBadge = (statusValue) => {
    const styles = {
      paid: "bg-green-50 text-green-700 border border-green-200",
      partial: "bg-yellow-50 text-yellow-700 border border-yellow-200",
      pending: "bg-red-50 text-red-700 border border-red-200",
    };
    return (
      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${styles[statusValue] || "bg-gray-100 text-gray-700"}`}>
        {statusValue?.replace(/_/g, " ")}
      </span>
    );
  };

  const hasFilters = search || category || paymentMethod || status || from || to;

  return (
    <MainLayout>
      <div className="mb-6 animate-fade-in flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-[18px] font-semibold text-foreground">
            Income Management
          </h1>
          <p className="mt-2 text-[12px] font-light text-muted-foreground">
            Track fee collections and custom income
          </p>
        </div>
        <Button
          onClick={openAddModal}
          style={{
            borderRadius: "6px",
            fontSize: "12px",
            fontWeight: 400,
            padding: "6px 14px",
            height: "34px",
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Income
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3 mb-3 p-3 border border-border bg-muted/20 rounded-md animate-slide-up">
        <div className="flex flex-col gap-1 min-w-[200px]">
          <Label className="text-[11px] font-medium text-muted-foreground">Search</Label>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 text-[12px] pl-8"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1 min-w-[160px]">
          <Label className="text-[11px] font-medium text-muted-foreground">Category</Label>
          <Select value={category || undefined} onValueChange={setCategory}>
            <SelectTrigger className="h-8 text-[12px]">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              {INCOME_CATEGORIES.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1 min-w-[160px]">
          <Label className="text-[11px] font-medium text-muted-foreground">Payment Method</Label>
          <Select value={paymentMethod || undefined} onValueChange={setPaymentMethod}>
            <SelectTrigger className="h-8 text-[12px]">
              <SelectValue placeholder="All methods" />
            </SelectTrigger>
            <SelectContent>
              {PAYMENT_METHODS.map((m) => (
                <SelectItem key={m.value} value={m.value}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1 min-w-[140px]">
          <Label className="text-[11px] font-medium text-muted-foreground">Status</Label>
          <Select value={status || undefined} onValueChange={setStatus}>
            <SelectTrigger className="h-8 text-[12px]">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1 min-w-[140px]">
          <Label className="text-[11px] font-medium text-muted-foreground">From</Label>
          <Input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="h-8 text-[12px]"
          />
        </div>

        <div className="flex flex-col gap-1 min-w-[140px]">
          <Label className="text-[11px] font-medium text-muted-foreground">To</Label>
          <Input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="h-8 text-[12px]"
          />
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

      {/* Table */}
      <div className="overflow-x-auto animate-slide-up">
        <Table className="w-full border-collapse border border-border">
          <TableHeader>
            <TableRow className="border-b border-border bg-muted/20">
              {["Date", "Title", "Category", "Amount", "Method", "Status", "Source", "Actions"].map((h) => (
                <TableHead
                  key={h}
                  className="border-r border-border px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-foreground last:border-r-0"
                >
                  {h}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center border-b border-border">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : incomes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center text-muted-foreground border-b border-border">
                  <Banknote className="h-8 w-8 mb-1 mx-auto opacity-20" />
                  <p className="text-xs">No income records found</p>
                </TableCell>
              </TableRow>
            ) : (
              incomes.map((income) => (
                <TableRow key={income._id} className="border-b border-border transition-colors hover:bg-muted/20">
                  <TableCell className="border-r border-border px-4 py-2 text-[11px] text-muted-foreground">
                    {formatDate(income.date)}
                  </TableCell>
                  <TableCell className="border-r border-border px-4 py-2 text-[11px] font-medium text-foreground">
                    {income.title}
                  </TableCell>
                  <TableCell className="border-r border-border px-4 py-2 text-[11px] text-muted-foreground capitalize">
                    {income.category?.replace(/_/g, " ")}
                  </TableCell>
                  <TableCell className="border-r border-border px-4 py-2 text-[11px] text-muted-foreground">
                    {formatAmount(income.amount)}
                  </TableCell>
                  <TableCell className="border-r border-border px-4 py-2 text-[11px] text-muted-foreground capitalize">
                    {income.paymentMethod?.replace(/_/g, " ") || "-"}
                  </TableCell>
                  <TableCell className="border-r border-border px-4 py-2">{statusBadge(income.status)}</TableCell>
                  <TableCell className="border-r border-border px-4 py-2 text-[11px] text-muted-foreground">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        income.sourceType === "challan"
                          ? "bg-blue-50 text-blue-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {income.sourceType === "challan" ? "Challan" : "Custom"}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(income)}
                        disabled={income.sourceType === "challan"}
                        className="inline-flex items-center justify-center p-1 rounded hover:bg-muted transition-colors disabled:opacity-40"
                        title={income.sourceType === "challan" ? "Edit in Fee Management" : "Edit"}
                      >
                        <Edit className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>
                      <button
                        onClick={() => handleDelete(income)}
                        className="inline-flex items-center justify-center p-1 rounded hover:bg-muted transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="mt-4 flex justify-end">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => handlePageChange(pagination.page - 1)}
                  className={pagination.page === 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    onClick={() => handlePageChange(page)}
                    isActive={page === pagination.page}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  onClick={() => handlePageChange(pagination.page + 1)}
                  className={
                    pagination.page === pagination.totalPages ? "pointer-events-none opacity-50" : ""
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Add/Edit Sheet */}
      <Sheet open={isModalOpen} onOpenChange={setIsModalOpen}>
        <SheetContent side="right" className="max-w-2xl">
          <SheetHeader>
            <SheetTitle style={{ fontSize: "18px", fontWeight: 600 }}>
              {editingIncome ? "Edit Income" : "Add Income"}
            </SheetTitle>
          </SheetHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label className="text-[12px] font-medium">Title *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Donation from alumni"
                  className="h-8 text-[12px]"
                />
              </div>
              <div>
                <Label className="text-[12px] font-medium">Category *</Label>
                <Select
                  value={formData.category || undefined}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger className="h-8 text-[12px]">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {INCOME_CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-[12px] font-medium">Amount *</Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0.00"
                  className="h-8 text-[12px]"
                />
              </div>
              <div>
                <Label className="text-[12px] font-medium">Date *</Label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="h-8 text-[12px]"
                />
              </div>
              <div>
                <Label className="text-[12px] font-medium">Payment Method</Label>
                <Select
                  value={formData.paymentMethod || undefined}
                  onValueChange={(value) => setFormData({ ...formData, paymentMethod: value })}
                >
                  <SelectTrigger className="h-8 text-[12px]">
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_METHODS.map((m) => (
                      <SelectItem key={m.value} value={m.value}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-[12px] font-medium">Status</Label>
                <Select
                  value={formData.status || undefined}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger className="h-8 text-[12px]">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label className="text-[12px] font-medium">Description</Label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional notes..."
                  className="h-8 text-[12px]"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                style={{ borderRadius: "5px" }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting} style={{ borderRadius: "5px" }}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : editingIncome ? (
                  "Update Income"
                ) : (
                  "Add Income"
                )}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </MainLayout>
  );
};

export default Income;
