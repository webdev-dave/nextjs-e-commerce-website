import db from "@/db/db"
import { notFound } from "next/navigation"
import Stripe from "stripe"
import CheckoutForm from "./_components/CheckoutForm"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string)

// Create a specific type for our page parameters
type ProductPageParams = {
  id: string;
}

type PromiseTypePlaceholder = {
  then: unknown;
  catch: unknown;
  finally: unknown;
  [Symbol.toStringTag]: string;
}

export default async function PurchasePage(props: {
  params: ProductPageParams & Partial<PromiseTypePlaceholder>;
}) {
  // Access the ID safely from props
  const id = props.params.id;
  
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