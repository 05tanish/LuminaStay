"use client";

import { useAuthStore } from "@/store/auth-store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BedDouble, Info } from "lucide-react";

export default function UserRoom() {
  const { user } = useAuthStore();
  
  // Ideally we would fetch `/user/me` with populated room details 
  // For the UI, we'll display what's in the auth cookie / context if available
  // Or handle missing data gracefully 

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Room</h1>
        <p className="text-muted-foreground">Information about your current accommodation.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BedDouble className="w-5 h-5 text-indigo-500" /> Allocation Details
          </CardTitle>
          <CardDescription>Your assigned property and bed in the hostel.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-muted/50 border">
              <p className="text-sm text-muted-foreground font-medium mb-1">Hostel</p>
              <p className="font-semibold">{(user as any)?.hostel?.name || "Sunrise Boys Hostel"}</p>
            </div>
            <div className="p-4 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800">
              <p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium mb-1">Room No</p>
              <p className="font-bold text-xl">{(user as any)?.room?.roomNo || "Not Assigned"}</p>
            </div>
          </div>
          
          <div className="p-4 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 rounded-md text-sm border border-amber-200 dark:border-amber-800 flex items-start gap-3">
            <Info className="w-5 h-5 shrink-0 mt-0.5" />
            <p>If you need to change your room or believe this information is incorrect, please raise a complaint or contact your hostel administrator.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
