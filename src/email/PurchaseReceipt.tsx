import { Html, Preview, Tailwind, Container, Heading, Head, Body } from "@react-email/components";
import { OrderInformation } from "./components/OrderInformation";

type PurchaseReceiptEmailProps = {
    product: {
        name: string;
        description: string;
        imagePath: string;
        id: string;
    }
    order: {
        id: string;
        createdAt: Date;
        pricePaidInCents: number;
    }
}

PurchaseReceiptEmail.PreviewProps = {
    product: {
        name: "Product Name",
        description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.",
        imagePath: "/products/Gemini_Generated_Image_b36jgob36jgob36j-fd9ce424-65cd-45cd-9442-ee2cc76dae57.jpg",
        id: "51d06fe9-d9e0-4918-840e-903fabf64214",
    },
    order: {
        id: crypto.randomUUID(),
        createdAt: new Date(),
        pricePaidInCents: 10000,
    }
} satisfies PurchaseReceiptEmailProps;

export default function PurchaseReceiptEmail({product, order}: PurchaseReceiptEmailProps){
    return (
        <Html>
            <Preview>Download {product.name} and view receipt</Preview>
            <Tailwind>
             <Head />
             <Body className="font-sans bg-white">
                <Container className="max-w-xl">
                    <Heading className="text-2xl font-bold">Purchase Receipt</Heading>
                    <OrderInformation order={order} product={product} />
                </Container>
             </Body>
            </Tailwind>
        </Html>
    )
}
