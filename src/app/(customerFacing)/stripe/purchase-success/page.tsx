import { Button } from "@/components/ui/button";
import db from "@/db/db";
import { formatCurrency } from "@/lib/formatters";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export default async function PurchaseSuccessPage({
  searchParams,
}: {
  searchParams: {
    payment_intent: string;
  };
}) {
  const paymentIntent = await stripe.paymentIntents.retrieve(
    searchParams.payment_intent
  );

  if (paymentIntent.metadata.productId == null) {
    return notFound();
  }

  const product = await db.product.findUnique({
    where: {
      id: paymentIntent.metadata.productId,
    },
  });

  if (!product) {
    return notFound();
  }

  const isSuccess = paymentIntent.status === "succeeded";

  return (
    <div className="max-w-5xl w-full mx-auto space-y-8">
      <h1 className="text-4xl font-bold">
        {isSuccess ? "Purchase Success" : "Error!"}
      </h1>
      <div className="flex items-center gap-4">
        <div className="flex-shrink-0 w-1/5 relative h-42">
          <Image
            src={product.imagePath}
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
          <Button
            className="mt-4"
            size="lg"
            asChild
          >
            {!isSuccess && (
              <Link href={`/products/${product.id}/purchase`}>Try Again</Link>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
