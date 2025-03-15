import db from "@/db/db";
import { PageHeader } from "../../../_components/PageHeader";
import { ProductForm } from "../../_components/ProductForm";
import { notFound } from "next/navigation";


export default async function EditProductPage({params }: {params: Promise<{id: string}>}) {
  const resolvedParams = await params;
  const {id} = resolvedParams;
  const product = await db.product.findUnique({where: {id}})

  if(product == null){
    return notFound()
  }
  return (
    <>
      <PageHeader>Edit Product</PageHeader>
      <ProductForm product={product} />
    </>
  );
}
