"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Icons } from "@/components/ui/icons";

export default function ErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error") || "An unexpected error occurred";
  const returnUrl = searchParams.get("returnUrl") || "/";

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center">
            <div className="rounded-full bg-red-100 p-3">
              <Icons.warning className="h-6 w-6 text-red-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">Error</CardTitle>
          <CardDescription className="text-center">
            We encountered a problem
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="mb-4 text-muted-foreground">{error}</p>
          <p className="text-sm text-muted-foreground">
            If this problem persists, please contact the building management.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button asChild variant="default">
            <Link href={returnUrl}>
              Go Back
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
