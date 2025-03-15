import db from "@/db/db";
import { notFound } from "next/navigation";
import Stripe from "stripe";
import CheckoutForm from "./_components/CheckoutForm";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

type PageProps = {
  params: {
    id: string;
  };
  searchParams: Record<string, string | string[] | undefined>;
};

export default async function PurchasePage({ params }: PageProps) {
  const id = params.id;
  const product = await db.product.findUnique({
    where: { id },
  });
  if (!product) {
    return notFound();
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: product.priceInCents,
    currency: "USD",
    metadata: {
      productId: product.id,
    },
  });

  if (paymentIntent.client_secret == null) {
    throw Error("Failed to create stripe payment intent");
  }
  return (
    <CheckoutForm
      product={product}
      clientSecret={paymentIntent.client_secret}
    />
  );
}

// export default async function PurchasePage({
//   params,
// }: {
//   params: { id: string };
// }) {
//   const id = (params).id;
//   const product = await db.product.findUnique({
//     where: { id },
//   });
//   if (!product) {
//     return notFound();
//   }

//   const paymentIntent = await stripe.paymentIntents.create({
//     amount: product.priceInCents,
//     currency: "USD",
//     metadata: {
//       productId: product.id,
//     },
//   });

//   if (paymentIntent.client_secret == null) {
//     throw Error("Failed to create stripe payment intent");
//   }
//   return (
//     <CheckoutForm
//       product={product}
//       clientSecret={paymentIntent.client_secret}
//     />
//   );
// }
