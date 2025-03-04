import db from "@/db/db";
import { PageHeader } from "../../../_components/PageHeader";
import { ProductForm } from "../../_components/ProductForm";
import { notFound } from "next/navigation";


export default async function EditProductPage({params: {id}}: {params: {id: string}}) {
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
