"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MapIcon } from "lucide-react";

export default function HerMapPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <MapIcon />
            <div>
              <CardTitle>地圖探索</CardTitle>
              <CardDescription>搜尋附近的美食餐廳</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full rounded-lg" />
          <p className="mt-3 text-center text-sm text-muted-foreground">
            Google Maps 將在 S5 整合
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
