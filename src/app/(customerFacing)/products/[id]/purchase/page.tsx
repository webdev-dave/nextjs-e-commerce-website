import db from "@/db/db"
import { notFound } from "next/navigation"
import Stripe from "stripe"
import CheckoutForm from "./_components/CheckoutForm"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string)

// Using Next.js 15's typing system where params is a Promise
export default async function PurchasePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Await the params Promise to get the actual values
  const resolvedParams = await params;
  const { id } = resolvedParams;
  
  const product = await db.product.findUnique({ where: { id } })
  if (product == null) return notFound()
  
  const paymentIntent = await stripe.paymentIntents.create({
    amount: product.priceInCents,
    currency: "USD",
    metadata: { productId: product.id },
  })
  
  if (paymentIntent.client_secret == null) {
    throw Error("Stripe failed to create payment intent")
  }
  
  return (
    <CheckoutForm
      product={product}
      clientSecret={paymentIntent.client_secret}
    />
  )
}