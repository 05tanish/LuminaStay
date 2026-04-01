"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format, addDays, startOfWeek } from "date-fns";
import { useFoodWeekly, useUpsertFood } from "@/hooks/use-api";
import { Loader2, ChefHat, CalendarDays, Edit3 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

const MEAL_TYPES = ["BREAKFAST", "LUNCH", "DINNER"] as const;
const mealEmojis = { BREAKFAST: "🌅", LUNCH: "☀️", DINNER: "🌙" };

function WeekGrid({ weekData }: { weekData: any[] }) {
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });

  const days = Array.from({ length: 7 }).map((_, i) => {
    const date = addDays(weekStart, i);
    const dateStr = format(date, "yyyy-MM-dd");
    const dayData = weekData?.find((d: any) =>
      format(new Date(d.date), "yyyy-MM-dd") === dateStr
    );
    return { date, dateStr, dayData };
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
      {days.map(({ date, dateStr, dayData }) => {
        const isToday = format(date, "yyyy-MM-dd") === format(today, "yyyy-MM-dd");
        return (
          <div
            key={dateStr}
            className={`rounded-xl border p-3 space-y-2 ${
              isToday ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20" : "bg-card"
            }`}
          >
            <div className="text-center">
              <p className={`text-xs font-bold uppercase ${isToday ? "text-indigo-600" : "text-muted-foreground"}`}>
                {format(date, "EEE")}
              </p>
              <p className={`text-lg font-bold ${isToday ? "text-indigo-600" : ""}`}>
                {format(date, "d")}
              </p>
            </div>
            {MEAL_TYPES.map((mealType) => {
              const meal = dayData?.meals?.find((m: any) => m.type === mealType);
              return (
                <div key={mealType} className="text-xs space-y-0.5">
                  <p className="font-semibold text-muted-foreground">
                    {mealEmojis[mealType]} {mealType.charAt(0) + mealType.slice(1).toLowerCase()}
                  </p>
                  {meal?.items?.length > 0 ? (
                    <p className="text-foreground leading-snug">
                      {meal.items.map((i: any) => i.name).join(", ")}
                    </p>
                  ) : (
                    <p className="text-muted-foreground/60 italic">—</p>
                  )}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

const menuSchema = z.object({
  date: z.string().min(1, "Select a date"),
  breakfast: z.string().optional(),
  lunch: z.string().optional(),
  dinner: z.string().optional(),
});

type MenuFormValues = z.infer<typeof menuSchema>;

export default function AdminFoodPage() {
  const { data: weekData, isLoading } = useFoodWeekly();
  const { mutate: upsertFood, isPending } = useUpsertFood();
  const [editOpen, setEditOpen] = useState(false);

  const form = useForm<MenuFormValues>({
    resolver: zodResolver(menuSchema),
    defaultValues: {
      date: format(new Date(), "yyyy-MM-dd"),
      breakfast: "",
      lunch: "",
      dinner: "",
    },
  });

  function onSubmit(values: MenuFormValues) {
    // Transform comma-separated strings into item arrays
    const meals = {
      BREAKFAST: values.breakfast?.split(",").map((s) => s.trim()).filter(Boolean),
      LUNCH: values.lunch?.split(",").map((s) => s.trim()).filter(Boolean),
      DINNER: values.dinner?.split(",").map((s) => s.trim()).filter(Boolean),
    };
    upsertFood(
      { date: values.date, meals },
      { onSuccess: () => setEditOpen(false) }
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Food Menu</h1>
          <p className="text-muted-foreground text-sm">Weekly meal schedule for your hostel</p>
        </div>
        <Button
          onClick={() => setEditOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
        >
          <Edit3 className="h-4 w-4" /> Update Menu
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-7 gap-3">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-52 rounded-xl" />
          ))}
        </div>
      ) : (
        <WeekGrid weekData={Array.isArray(weekData) ? weekData : []} />
      )}

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ChefHat className="h-5 w-5 text-indigo-500" />
              Update Daily Menu
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Date</label>
              <Input type="date" {...form.register("date")} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">🌅 Breakfast</label>
              <Textarea
                placeholder="e.g. Idli, Sambar, Chutney (comma-separated)"
                {...form.register("breakfast")}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">☀️ Lunch</label>
              <Textarea
                placeholder="e.g. Dal, Rice, Sabzi, Roti"
                {...form.register("lunch")}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">🌙 Dinner</label>
              <Textarea
                placeholder="e.g. Paneer Butter Masala, Naan, Salad"
                {...form.register("dinner")}
                rows={2}
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700"
              disabled={isPending}
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Menu
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
