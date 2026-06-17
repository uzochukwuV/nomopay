import ProductForm from "../product-form";

export default function NewProductPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--midnight)" }}>Add product</h1>
      <p className="text-sm mb-8" style={{ color: "var(--ash)" }}>Create a buyer page and set the commission creators earn.</p>
      <ProductForm mode="create" />
    </div>
  );
}

