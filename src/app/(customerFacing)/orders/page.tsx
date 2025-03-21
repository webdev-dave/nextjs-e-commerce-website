"use client";

import { emailOrderHistory } from "@/actions/orders";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

// Once we add user authentication, we can show the user their order history on page but for now we will just email them their order history

export default function MyOrdersPage() {
  const [data, action] = useActionState(emailOrderHistory, null);
  return (
    <form
      action={action}
      className="max-w-2xl mx-auto"
    >
      <Card>
        <CardHeader>
          <CardTitle>My Orders</CardTitle>
          <CardDescription>
            Enter your email and we will email you your order history
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div>
              <Label htmlFor="email">Email</Label>
            </div>
            <div>
              <Input
                type="email"
                required
                name="email"
                id="email"
              />
              {data?.error && <p className="text-destructive">{data.error}</p>}
            </div>
          </div>
        </CardContent>
        <CardFooter>
          {data?.message ? <p>{data.message}</p> : <SubmitButton />}
        </CardFooter>
      </Card>
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending}
      className="w-full"
      size="lg"
    >
      {pending ? "Sending..." : "Send Order History"}
    </Button>
  );
}
