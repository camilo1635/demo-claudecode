import { and, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { products } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { updateProduct } from "../../actions";
import { ProductForm } from "../../product-form";

export default async function EditProductPage({ params }: PageProps<"/products/[id]/edit">) {
  const user = await requireUser();
  const { id } = await params;
  const [product] = await db
    .select()
    .from(products)
    .where(and(eq(products.id, id), eq(products.userId, user.id)))
    .limit(1);
  if (!product) notFound();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">Editar producto</h1>
      <ProductForm action={updateProduct.bind(null, id)} product={product} />
    </div>
  );
}
