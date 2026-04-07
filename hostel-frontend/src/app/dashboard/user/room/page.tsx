"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BedDouble, Building2, Info, User } from "lucide-react";

function useMyProfile() {
  return useQuery({
    queryKey: ["user-me"],
    queryFn: async () => {
      const { data } = await api.get("/user/me");
      return data.data;
    },
    staleTime: 30000,
  });
}

export default function UserRoom() {
  const { data: profile, isLoading } = useMyProfile();

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Room</h1>
        <p className="text-muted-foreground">Your current accommodation details.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BedDouble className="w-5 h-5 text-indigo-500" />
            Allocation Details
          </CardTitle>
          <CardDescription>Your assigned hostel, room, and bed.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 rounded-lg" />)}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-muted/50 border">
                  <div className="flex items-center gap-2 mb-1">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground font-medium">Hostel</p>
                  </div>
                  <p className="font-semibold">{profile?.hostel?.name ?? "Not Assigned"}</p>
                </div>

                <div className="p-4 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800">
                  <div className="flex items-center gap-2 mb-1">
                    <BedDouble className="h-4 w-4 text-indigo-500" />
                    <p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">Room No</p>
                  </div>
                  <p className="font-bold text-xl text-indigo-700 dark:text-indigo-300">
                    {profile?.room?.roomNo ?? "—"}
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800">
                  <div className="flex items-center gap-2 mb-1">
                    <User className="h-4 w-4 text-emerald-500" />
                    <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">Bed No</p>
                  </div>
                  <p className="font-bold text-xl text-emerald-700 dark:text-emerald-300">
                    {profile?.bed?.bedNo ?? "—"}
                  </p>
                </div>
              </div>

              {!profile?.room && (
                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 rounded-md text-sm border border-amber-200 dark:border-amber-800 flex items-start gap-3">
                  <Info className="w-5 h-5 shrink-0 mt-0.5" />
                  <p>You have not been assigned a room yet. Please contact your hostel administrator.</p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
