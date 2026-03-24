"use client";

import { useRouter } from "next/navigation";
import { ShoppingCart, Zap } from "lucide-react";
import { useState } from "react";

type ShopProductActionsProps = {
  productType: "hollister" | "meril_fa" | "meril_sa" | "dynamic";
  productId: number;
};

export function ShopProductActions({ productType, productId }: ShopProductActionsProps) {
  const router = useRouter();
  const [loadingAction, setLoadingAction] = useState<"add" | "buy_now" | null>(null);

  async function submit(action: "add" | "buy_now") {
    try {
      setLoadingAction(action);
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          productType,
          productId,
          quantity: 1,
        }),
      });

      const result = await response.json();
      if (!response.ok || !result.ok) {
        throw new Error(result.message ?? "Unable to update cart.");
      }

      if (action === "buy_now") {
        router.push("/checkout");
        return;
      }

      router.push("/cart");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to update cart.";
      window.alert(message);
    } finally {
      setLoadingAction(null);
    }
  }

  return (
    <div className="product-card__actions product-card__actions--stacked">
      <button
        type="button"
        className="btn btn-secondary"
        onClick={() => submit("add")}
        disabled={loadingAction !== null}
      >
        <ShoppingCart size={16} />
        {loadingAction === "add" ? "Adding..." : "Add to Cart"}
      </button>
      <button
        type="button"
        className="btn btn-primary"
        onClick={() => submit("buy_now")}
        disabled={loadingAction !== null}
      >
        <Zap size={16} />
        {loadingAction === "buy_now" ? "Redirecting..." : "Buy Now"}
      </button>
    </div>
  );
}
