"use client";

import { useState } from "react";
import { useProfileRequests, useRespondProfileRequest } from "@/hooks/use-api";
import { useAuthStore } from "@/store/auth-store";
import { Loader2, CheckCircle, XCircle, Clock, UserCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";

export default function ApprovalsPage() {
  const { user } = useAuthStore();
  const { data: requests, isLoading } = useProfileRequests();
  const { mutate: respondRequest, isPending } = useRespondProfileRequest();

  const [comments, setComments] = useState<Record<string, string>>({});
  const [activeRequestId, setActiveRequestId] = useState<string | null>(null);

  if (isLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-600 h-8 w-8" /></div>;
  }

  const handleResponse = (id: string, status: "APPROVED" | "REJECTED") => {
    setActiveRequestId(id);
    respondRequest({
      id,
      status,
      adminComment: comments[id] || "",
    }, {
        onSettled: () => setActiveRequestId(null)
    });
  };

  const pendingRequests = requests || [];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Profile Approvals</h1>
        <p className="text-muted-foreground text-sm">
          Review and approve changes students are requesting for their family details.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {pendingRequests.length === 0 ? (
          <div className="text-center py-24 bg-card rounded-xl border border-dashed">
             <UserCheck className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
             <h3 className="text-lg font-medium text-foreground">All Caught Up!</h3>
             <p className="text-sm text-muted-foreground mt-1">There are no pending profile update requests right now.</p>
          </div>
        ) : (
          pendingRequests.map((req: any) => (
            <Card key={req.id} className="shadow-sm">
              <CardHeader className="bg-muted/30 border-b pb-4">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                            Request from {req.user?.name}
                        </CardTitle>
                        <CardDescription className="mt-1">
                            {req.user?.email} • {req.user?.phone}
                        </CardDescription>
                    </div>
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                      <Clock className="w-3 h-3 mr-1" /> Pending
                    </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div>
                  <h4 className="text-sm font-semibold mb-2 text-indigo-600">User's Reason:</h4>
                  <p className="text-sm bg-muted/50 p-4 rounded-lg italic border border-indigo-100 dark:border-indigo-900/50">
                    "{req.reason}"
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-semibold mb-3">Requested Changes:</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {Object.entries(req.requestedChanges).map(([key, value]) => {
                      if (!value) return null; // Don't show empty requested changes to reduce clutter
                      
                      // Format field name (camelCase to Title Case)
                      const formattedKey = key
                        .replace(/([A-Z])/g, ' $1')
                        .replace(/^./, (str) => str.toUpperCase());
                        
                      return (
                        <div key={key} className="flex flex-col text-sm p-3 bg-card border rounded-md shadow-sm">
                          <span className="text-muted-foreground text-xs">{formattedKey}</span>
                          <span className="font-medium mt-1">{value as string}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold mb-2">Admin Remarks (Optional):</h4>
                  <Textarea 
                     placeholder="Add a remark (especially if rejecting)..."
                     value={comments[req.id] || ""}
                     onChange={(e) => setComments(prev => ({ ...prev, [req.id]: e.target.value }))}
                     className="resize-none"
                  />
                </div>
              </CardContent>
              <CardFooter className="bg-muted/10 border-t pt-4 flex justify-end gap-3">
                <Button 
                    variant="outline" 
                    className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                    disabled={isPending && activeRequestId === req.id}
                    onClick={() => handleResponse(req.id, "REJECTED")}
                >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                </Button>
                <Button 
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    disabled={isPending && activeRequestId === req.id}
                    onClick={() => handleResponse(req.id, "APPROVED")}
                >
                    {isPending && activeRequestId === req.id ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                        <CheckCircle className="w-4 h-4 mr-2" />
                    )}
                    Approve Changes
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
