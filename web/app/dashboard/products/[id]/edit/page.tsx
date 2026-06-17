import ProductForm from "../../product-form";

async function getProduct(id: string) {
  const res = await fetch(`http://localhost:8080/api/products/${encodeURIComponent(id)}`, { cache: "no-store" });
  if (!res.ok) return null;
  const data = await res.json();
  return data.product;
}

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) return <div>Product not found</div>;
  return (
    <div>
      <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--midnight)" }}>Edit product</h1>
      <p className="text-sm mb-8" style={{ color: "var(--ash)" }}>Update price, commission, status, and public buyer-page details.</p>
      <ProductForm
        mode="edit"
        initial={{
          ...product,
          commissionRate: Number(product.commissionRate),
        }}
      />
    </div>
  );
}

