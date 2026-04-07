"use client";

import { useState } from "react";
import { useNotifications, useMarkNotificationRead } from "@/hooks/use-api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Bell, Check, Inbox } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function NotificationsPage() {
  const { data, isLoading } = useNotifications();
  const { mutate: markRead } = useMarkNotificationRead();
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const notifications = data?.notifications ?? data?.data ?? [];
  const filteredNotifications = filter === "unread" 
    ? notifications.filter((n: any) => !n.read) 
    : notifications;

  const handleMarkRead = (id: string) => {
    markRead(id);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground text-sm">
            Stay updated with important messages and announcements
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
          >
            All
          </Button>
          <Button
            variant={filter === "unread" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("unread")}
          >
            Unread
          </Button>
        </div>
      </div>

      {filteredNotifications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Inbox className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {filter === "unread" ? "No unread notifications" : "No notifications yet"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notif: any) => (
            <Card
              key={notif.id}
              className={`transition-colors ${
                !notif.read ? "bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900" : ""
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Bell className={`h-4 w-4 ${!notif.read ? "text-blue-600" : "text-muted-foreground"}`} />
                      <CardTitle className="text-base">
                        {notif.notification?.title || notif.title}
                      </CardTitle>
                      {!notif.read && (
                        <Badge variant="default" className="ml-auto">
                          New
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="text-xs">
                      {formatDistanceToNow(new Date(notif.notification?.createdAt || notif.createdAt), {
                        addSuffix: true,
                      })}
                      {notif.notification?.hostel?.name && (
                        <span className="ml-2">• {notif.notification.hostel.name}</span>
                      )}
                    </CardDescription>
                  </div>
                  {!notif.read && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMarkRead(notif.id)}
                      className="shrink-0"
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Mark read
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground">
                  {notif.notification?.message || notif.message}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
