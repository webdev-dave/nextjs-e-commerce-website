import { dateFormatter, formatCurrency } from "@/lib/formatters";
import {
  Section,
  Text,
  Row,
  Column,
  Img,
  Button,
} from "@react-email/components";

type OrderInformationProps = {
  product: {
    name: string;
    description: string;
    imagePath: string;
    id: string;
  };
  order: {
    id: string;
    createdAt: Date;
    pricePaidInCents: number;
  };
};

export function OrderInformation({ order, product }: OrderInformationProps) {
  console.log(process.env.SERVER_URL);
  return (
    <>
      <Section>
        <Row>
          <Column>
            <Text className="mb-0 text-gray-500 whitespace-nowrap text-nowrap mr-4">
              Order ID
            </Text>
            <Text className="mt-0 mr-4">{order.id}</Text>
          </Column>
          <Column>
            <Text className="mb-0 text-gray-500 whitespace-nowrap text-nowrap mr-4">
              Purchased On
            </Text>
            <Text className="mt-0 mr-4">
              {dateFormatter.format(order.createdAt)}
            </Text>
          </Column>
          <Column>
            <Text className="mb-0 text-gray-500 whitespace-nowrap text-nowrap mr-4">
              Price Paid
            </Text>
            <Text className="mt-0 mr-4">
              {formatCurrency(order.pricePaidInCents / 100)}
            </Text>
          </Column>
        </Row>
      </Section>

      <Section className="border border-solid border-gray-500 rounded-lg p-4 md:p-6 my-4">
        <Img
          width={100}
          src={`${process.env.SERVER_URL}${product.imagePath}`}
          alt={product.name}
          className="w-full h-auto"
        />
        <Row className="mt-8">
          <Column className="align-bottom">
            <Text className="text-lg font-bold m-0 mr-4">
              {product.name}
            </Text>{" "}
          </Column>
        </Row>
        <Row>
          <Column>
            <Text className="text-gray-500 mb-0 w-4/5">
              {product.description.split(" ").slice(0, 25).join(" ") + "..."}
            </Text>
          </Column>
        </Row>
        <Row>
          <Column>
            <Section>
              <Button
                href={`${process.env.SERVER_URL}/products/${product.id}/purchase`}
                className="bg-black text-white px-4 py-2 mt-4 rounded text-lg text-center"
                style={{ display: "block", textAlign: "center" }}
              >
                View Product
              </Button>
            </Section>
          </Column>
        </Row>
      </Section>
    </>
  );
}
