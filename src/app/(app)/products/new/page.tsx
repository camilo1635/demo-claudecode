import { createProduct } from "../actions";
import { ProductForm } from "../product-form";

export default function NewProductPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">Nuevo producto</h1>
      <ProductForm action={createProduct} />
    </div>
  );
}
