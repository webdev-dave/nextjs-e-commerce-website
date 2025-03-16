"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrency } from "@/lib/formatters";
import {
  Elements,
  LinkAuthenticationElement,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import Image from "next/image";
import { FormEvent, useState } from "react";

type CheckoutFormProps = {
  product: {
    imagePath: string;
    name: string;
    priceInCents: number;
    description: string;
  };
  clientSecret: string;
};

export default function CheckoutForm({
  product,
  clientSecret,
}: CheckoutFormProps) {
  const stripePromise = loadStripe(
    process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY as string
  );
  return (
    <div className="max-w-5xl w-full mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <div className="flex-shrink-0 w-1/5 relative h-42">
          <Image
            src={`/api/images/proxy?path=${encodeURIComponent(product.imagePath)}`}
            fill
            alt={product.name}
            className="object-cover"
          />
        </div>
        <div className="text-lg">
          {formatCurrency(product.priceInCents / 100)}
          <h1 className="text-2xl font-bold">{product.name}</h1>
          <div className="line-clamp-3 text-muted-foreground">
            <p>{product.description}</p>
          </div>
        </div>
      </div>
      <Elements
        options={{
          clientSecret,
        }}
        stripe={stripePromise}
      >
        <PaymentForm priceInCents={product.priceInCents} />
      </Elements>
    </div>
  );
}

function PaymentForm({ priceInCents }: { priceInCents: number }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();
  const [email, setEmail] = useState<string>();
  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!stripe || !elements || !email) {
      return;
    }

    setIsLoading(true);

    stripe
      .confirmPayment({
        elements,
        confirmParams: {
          return_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/stripe/purchase-success`,
        },
      })
      .then(({ error }) => {
        if (error.type === "card_error" || error.type === "validation_error") {
          setErrorMessage(error.message);
        } else {
          setErrorMessage("An unexpected error occurred.");
        }
      })
      .finally(() => setIsLoading(false));
  };
  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Checkout</CardTitle>
          <CardDescription className="text-destructive">
            {errorMessage}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PaymentElement />
          <div className="mt-4">
            <LinkAuthenticationElement
              onChange={(e) => setEmail(e.value.email)}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            disabled={!stripe || !elements || isLoading || !email}
            size="lg"
            className="w-full"
          >
            {isLoading
              ? "Processing..."
              : `Purchase - ${formatCurrency(priceInCents / 100)}`}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
