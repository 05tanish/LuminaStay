"use client";

import { useState } from "react";
import { useMenu } from "@/lib/api-hooks";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Utensils } from "lucide-react";

export default function UserFoodMenu() {
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const { data: menuData, isLoading } = useMenu(date);

  const getMealItems = (type: string) => {
    if (!menuData || !menuData.meals) return [];
    const meal = menuData.meals.find((m: any) => m.type === type);
    return meal?.items?.map((i: any) => i.name ?? i) ?? [];
  };

  const breakfast = getMealItems("BREAKFAST");
  const lunch = getMealItems("LUNCH");
  const dinner = getMealItems("DINNER");

  return (
    <div className="space-y-6 max-w-4xl max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Food Menu</h1>
        <p className="text-muted-foreground">View what is being served in the mess.</p>
      </div>

      <div className="flex items-end gap-4 max-w-xs">
        <div className="space-y-2 flex-1">
          <Label>Select Date</Label>
          <Input 
            type="date" 
            value={date} 
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <MealCard title="Breakfast" items={breakfast} icon="🌅" isLoading={isLoading} />
        <MealCard title="Lunch" items={lunch} icon="☀️" isLoading={isLoading} />
        <MealCard title="Dinner" items={dinner} icon="🌙" isLoading={isLoading} />
      </div>
    </div>
  );
}

function MealCard({ title, items, icon, isLoading }: { title: string, items: string[], icon: string, isLoading: boolean }) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-3 border-b bg-muted/20">
        <CardTitle className="flex items-center gap-2 text-xl">
          <span>{icon}</span> {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        {isLoading ? (
          <div className="space-y-2 animate-pulse">
            <div className="h-4 w-3/4 rounded bg-muted" />
            <div className="h-4 w-1/2 rounded bg-muted" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-muted-foreground text-sm flex items-center justify-center py-4">
            <Utensils className="w-4 h-4 mr-2 opacity-50" /> No menu set
          </div>
        ) : (
          <ul className="space-y-2 list-disc list-inside text-sm text-foreground">
            {items.map((item, i) => (
              <li key={i} className="pl-1 leading-relaxed capitalize">{item}</li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
