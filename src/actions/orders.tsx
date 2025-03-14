"use server";
import db from "@/db/db";
import OrderHistoryEmail from "@/email/OrderHistory";
import { Resend } from "resend";
import { z } from "zod";

const emailSchema = z.string().email();
const resend = new Resend(process.env.RESEND_API_KEY);

export async function emailOrderHistory(
  prevState: unknown,
  formData: FormData
): Promise<{ message?: string; error?: string }> {
  const result = emailSchema.safeParse(formData.get("email"));
  if (!result.success) {
    return { error: "Invalid email address" };
  }

  const user = await db.user.findUnique({
    where: {
      email: result.data,
    },
    select: {
      email: true,
      orders: {
        select: {
          pricePaidInCents: true,
          id: true,
          createdAt: true,
          product: {
            select: {
              id: true,
              name: true,
              imagePath: true,
              description: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    return { message: `Check your email to view your order history and download your products.` };
  }

  const orders = user.orders.map(order => {
    return {
      id: order.id,
      createdAt: order.createdAt,
      pricePaidInCents: order.pricePaidInCents,
      product: {
        id: order.product.id,
        name: order.product.name,
        imagePath: order.product.imagePath,
        description: order.product.description,
      },
    };
  });

  const data = await resend.emails.send({
    from: `Support <${process.env.SENDER_EMAIL}>`,
    to: user.email,
    subject: "Your Order History",
    react: <OrderHistoryEmail orders={orders} />,
  });

  if (data.error) {
    return { error: "There was an error sending your order history email. Please try again." };
  }

  return { message: "Check your email to view your order history and download your products." };
}
