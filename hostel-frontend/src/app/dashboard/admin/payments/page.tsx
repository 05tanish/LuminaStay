"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAdminFees, useCreateFee, useRecordCashPayment, useUsers } from "@/hooks/use-api";
import { StatusBadge } from "@/components/status-badge";
import { Loader2, Plus, CreditCard, Banknote } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const createFeeSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  month: z.string().min(7, "Month is required (YYYY-MM)"),
  amount: z.preprocess((v) => Number(v), z.number().min(1, "Amount must be positive")),
  dueDate: z.string().min(1, "Due date is required"),
});

const cashSchema = z.object({
  monthlyFeeId: z.string().min(1, "Fee ID is required"),
  userId: z.string().min(1, "User ID is required"),
  transactionId: z.string().optional(),
  remarks: z.string().optional(),
});

type CreateFeeValues = z.infer<typeof createFeeSchema>;
type CashValues = z.infer<typeof cashSchema>;

export default function AdminPaymentsPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [createFeeOpen, setCreateFeeOpen] = useState(false);
  const [cashOpen, setCashOpen] = useState(false);
  const [selectedFeeId, setSelectedFeeId] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");

  const { data, isLoading } = useAdminFees({ page, limit: 20, status: statusFilter });
  const { mutate: createFee, isPending: creatingFee } = useCreateFee();
  const { mutate: recordCash, isPending: recordingCash } = useRecordCashPayment();
  const { data: usersData, isLoading: loadingUsers } = useUsers();
  
  const fees: any[] = data?.fees ?? data?.data ?? [];
  const allUsers: any[] = usersData?.users ?? usersData?.data ?? [];
  const total: number = data?.pagination?.total ?? data?.total ?? 0;
  const totalPages = Math.ceil(total / 20);

  const feeForm = useForm<CreateFeeValues>({
    resolver: zodResolver(createFeeSchema) as any,
    defaultValues: { userId: "", month: "", amount: 5000, dueDate: "" },
  });

  const cashForm = useForm<CashValues>({
    resolver: zodResolver(cashSchema),
    defaultValues: { monthlyFeeId: selectedFeeId, userId: selectedUserId, transactionId: "", remarks: "" },
  });

  function onCreateFee(values: CreateFeeValues) {
    createFee(values, { onSuccess: () => { setCreateFeeOpen(false); feeForm.reset(); } });
  }

  function onRecordCash(values: CashValues) {
    recordCash(values, { onSuccess: () => { setCashOpen(false); cashForm.reset(); } });
  }

  const openCashDialog = (fee: any) => {
    setSelectedFeeId(fee.id);
    setSelectedUserId(fee.userId);
    cashForm.setValue("monthlyFeeId", fee.id);
    cashForm.setValue("userId", fee.userId);
    setCashOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Payments</h1>
          <p className="text-muted-foreground text-sm">{total} total fee records</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => setCashOpen(true)}
          >
            <Banknote className="h-4 w-4 text-emerald-500" />
            Record Cash
          </Button>
          <Button
            className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
            onClick={() => setCreateFeeOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Create Fee
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <Tabs
        defaultValue="all"
        onValueChange={(v) => { setStatusFilter(v === "all" ? undefined : v); setPage(1); }}
      >
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="PENDING">Pending</TabsTrigger>
          <TabsTrigger value="PAID">Paid</TabsTrigger>
          <TabsTrigger value="OVERDUE">Overdue</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <FeesTable fees={fees} isLoading={isLoading} onRecordCash={openCashDialog} />
        </TabsContent>
        <TabsContent value="PENDING" className="mt-4">
          <FeesTable fees={fees} isLoading={isLoading} onRecordCash={openCashDialog} />
        </TabsContent>
        <TabsContent value="PAID" className="mt-4">
          <FeesTable fees={fees} isLoading={isLoading} onRecordCash={openCashDialog} />
        </TabsContent>
        <TabsContent value="OVERDUE" className="mt-4">
          <FeesTable fees={fees} isLoading={isLoading} onRecordCash={openCashDialog} />
        </TabsContent>
      </Tabs>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Page {page} of {totalPages}</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
            <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
          </div>
        </div>
      )}

      {/* Create Fee Dialog */}
      <Dialog open={createFeeOpen} onOpenChange={setCreateFeeOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Create Monthly Fee</DialogTitle></DialogHeader>
          <Form {...feeForm}>
            <form onSubmit={feeForm.handleSubmit(onCreateFee)} className="space-y-4 pt-2">
              <FormField control={feeForm.control} name="userId" render={({ field }) => (
                <FormItem>
                  <FormLabel>Resident</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={loadingUsers ? "Loading residents..." : "Select a resident"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {allUsers.map((u) => (
                        <SelectItem key={u.id} value={u.id}>
                          {u.name} ({u.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={feeForm.control} name="month" render={({ field }) => (
                <FormItem><FormLabel>Month (YYYY-MM)</FormLabel><FormControl><Input placeholder="2026-04" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={feeForm.control} name="amount" render={({ field }) => (
                <FormItem><FormLabel>Amount (₹)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={feeForm.control} name="dueDate" render={({ field }) => (
                <FormItem><FormLabel>Due Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={creatingFee}>
                {creatingFee && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Fee
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Cash Payment Dialog */}
      <Dialog open={cashOpen} onOpenChange={setCashOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Banknote className="h-5 w-5 text-emerald-500" />Record Cash Payment</DialogTitle></DialogHeader>
          <Form {...cashForm}>
            <form onSubmit={cashForm.handleSubmit(onRecordCash)} className="space-y-4 pt-2">
              <FormField control={cashForm.control} name="monthlyFeeId" render={({ field }) => (
                <FormItem><FormLabel>Monthly Fee ID</FormLabel><FormControl><Input placeholder="Fee record ID" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={cashForm.control} name="userId" render={({ field }) => (
                <FormItem>
                  <FormLabel>Resident</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecting resident..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={field.value}>
                        {allUsers.find(u => u.id === field.value)?.name || field.value}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={cashForm.control} name="transactionId" render={({ field }) => (
                <FormItem><FormLabel>Transaction ID (Optional)</FormLabel><FormControl><Input placeholder="Receipt number" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={cashForm.control} name="remarks" render={({ field }) => (
                <FormItem><FormLabel>Remarks (Optional)</FormLabel><FormControl><Input placeholder="Paid in full, etc." {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" disabled={recordingCash}>
                {recordingCash && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Record Payment
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function FeesTable({
  fees,
  isLoading,
  onRecordCash,
}: {
  fees: any[];
  isLoading: boolean;
  onRecordCash: (fee: any) => void;
}) {
  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead>Resident</TableHead>
            <TableHead>Month</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading
            ? Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                  ))}
                </TableRow>
              ))
            : fees.map((fee) => (
                <TableRow key={fee.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="font-medium">{fee.user?.name ?? fee.userId}</TableCell>
                  <TableCell className="text-muted-foreground">{fee.month}</TableCell>
                  <TableCell className="font-semibold">₹{fee.amount.toLocaleString("en-IN")}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(fee.dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </TableCell>
                  <TableCell><StatusBadge status={fee.status} /></TableCell>
                  <TableCell className="text-right">
                    {fee.status !== "PAID" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1 text-xs gap-1.5 text-emerald-600 border-emerald-300 hover:bg-emerald-50"
                        onClick={() => onRecordCash(fee)}
                      >
                        <Banknote className="h-3.5 w-3.5" /> Cash
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
          {!isLoading && fees.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground py-16">
                <CreditCard className="h-8 w-8 mx-auto mb-3 opacity-30" />
                No fee records found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
