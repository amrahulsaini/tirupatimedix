import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { Lock, LogOut, Plus, Save, Trash2, Upload, Filter } from "lucide-react";
import { AdminQueryCleaner } from "@/app/admin/_components/admin-query-cleaner";
import { AdminImageUploadForm } from "@/app/admin/_components/admin-image-upload-form";
import { getAllMerilProducts } from "@/lib/meril";
import { getAllMerilSemiProducts } from "@/lib/meril-semi";
import { getAllMedicines } from "@/lib/medicines";
import { getAllDynamicTechnoProducts } from "@/lib/dynamic-techno";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin",
  description: "Tirupati Medix admin panel for medicine and image management.",
};

type AdminPageProps = {
  searchParams: Promise<{ error?: string; upload?: string; action?: string; status?: string; tab?: string }>;
};

function getAdminActionMessage(action?: string, status?: string) {
  if (!action || !status) {
    return null;
  }

  const labels: Record<string, string> = {
    "create-medicine": "Ostomy Care product added",
    "update-medicine": "Ostomy Care product updated",
    "delete-medicine": "Ostomy Care product deleted",
    "delete-image": "Image removed",
    "create-meril": "Pathology (Fully Auto) product added",
    "update-meril": "Pathology (Fully Auto) product updated",
    "delete-meril": "Pathology (Fully Auto) product deleted",
    "delete-meril-image": "Pathology (Fully Auto) image removed",
    "create-meril-semi": "Pathology (Semi Auto) product added",
    "update-meril-semi": "Pathology (Semi Auto) product updated",
    "delete-meril-semi": "Pathology (Semi Auto) product deleted",
    "delete-meril-semi-image": "Pathology (Semi Auto) image removed",
    "create-dynamic-techno": "Wound Dressing product added",
    "update-dynamic-techno": "Wound Dressing product updated",
    "delete-dynamic-techno": "Wound Dressing product deleted",
    "delete-dynamic-techno-image": "Wound Dressing image removed",
  };

  const label = labels[action] ?? "Action";
  if (status === "ok") {
    return { kind: "success" as const, text: `${label} successfully.` };
  }
  if (status === "invalid") {
    return { kind: "error" as const, text: `${label} failed. Please check required fields.` };
  }
  if (status === "error") {
    return { kind: "error" as const, text: `${label} failed due to server/database error.` };
  }

  return null;
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const params = await searchParams;
  const hasQueryFeedback = Boolean(params.error || params.upload || params.action || params.status);
  const actionMessage = getAdminActionMessage(params.action, params.status);
  const activeTab = params.tab || "all";
  const cookieStore = await cookies();
  const isLoggedIn = cookieStore.get("medix_admin_session")?.value === "1";

  if (!isLoggedIn) {
    return (
      <div className="content-page container admin-shell">
        <section className="info-card admin-login-card">
          <h1>Admin Login</h1>
          <p className="muted">Enter your admin password to manage medicines and images.</p>
          <form action="/admin/login" method="post" className="list-reset admin-form">
            <label>
              Password
              <input type="password" name="password" placeholder="Enter admin password" required />
            </label>
            {params.error === "invalid" ? (
              <p className="admin-error">
                <Lock size={16} /> Invalid password. Please try again.
              </p>
            ) : null}
            {params.error === "config" ? (
              <p className="admin-error">
                <Lock size={16} /> ADMIN_PASSWORD is missing in `.env.local`.
              </p>
            ) : null}
            {params.error === "server" ? (
              <p className="admin-error">
                <Lock size={16} /> Server error during login. Restart server and re-check env values.
              </p>
            ) : null}
            <button type="submit" className="btn btn-primary">
              <Lock size={16} /> Login
            </button>
          </form>
        </section>
      </div>
    );
  }

  let medicines = [] as Awaited<ReturnType<typeof getAllMedicines>>;
  let merilProducts = [] as Awaited<ReturnType<typeof getAllMerilProducts>>;
  let merilSemiProducts = [] as Awaited<ReturnType<typeof getAllMerilSemiProducts>>;
  let dynamicTechnoProducts = [] as Awaited<ReturnType<typeof getAllDynamicTechnoProducts>>;
  let dataLoadFailed = false;

  try {
    const [medicinesResult, merilResult, merilSemiResult, dynamicTechnoResult] = await Promise.allSettled([
      getAllMedicines(),
      getAllMerilProducts(),
      getAllMerilSemiProducts(),
      getAllDynamicTechnoProducts(),
    ]);

    medicines = medicinesResult.status === "fulfilled" ? medicinesResult.value : [];
    merilProducts = merilResult.status === "fulfilled" ? merilResult.value : [];
    merilSemiProducts = merilSemiResult.status === "fulfilled" ? merilSemiResult.value : [];
    dynamicTechnoProducts = dynamicTechnoResult.status === "fulfilled" ? dynamicTechnoResult.value : [];
    dataLoadFailed = medicinesResult.status === "rejected" || merilResult.status === "rejected" || merilSemiResult.status === "rejected" || dynamicTechnoResult.status === "rejected";
  } catch {
    dataLoadFailed = true;
  }

  return (
    <div className="content-page container admin-shell">
      {hasQueryFeedback ? <AdminQueryCleaner /> : null}
      <section className="info-card admin-header">
        <div>
          <h1>Medicine Admin Panel</h1>
          <p className="muted">Manage categories, medicine details, prices, and multiple images.</p>
          {dataLoadFailed ? (
            <p className="admin-error">
              <Lock size={16} /> Catalog data is temporarily unavailable. Please verify settings and try again.
            </p>
          ) : null}
          {params.upload === "ok" ? (
            <p className="admin-success">
              <Upload size={16} /> Images uploaded successfully.
            </p>
          ) : null}
          {params.upload === "empty" ? (
            <p className="admin-error">
              <Upload size={16} /> Select at least one image before uploading.
            </p>
          ) : null}
          {params.upload === "invalid" ? (
            <p className="admin-error">
              <Upload size={16} /> Invalid product selected for image upload.
            </p>
          ) : null}
          {params.upload === "large" ? (
            <p className="admin-error">
              <Upload size={16} /> One or more images are too large. Keep each file under 10 MB.
            </p>
          ) : null}
          {params.upload === "server" ? (
            <p className="admin-error">
              <Upload size={16} /> Upload failed due to server error. Please try again.
            </p>
          ) : null}
          {actionMessage?.kind === "success" ? (
            <p className="admin-success">
              <Save size={16} /> {actionMessage.text}
            </p>
          ) : null}
          {actionMessage?.kind === "error" ? (
            <p className="admin-error">
              <Lock size={16} /> {actionMessage.text}
            </p>
          ) : null}
        </div>
        <form action="/admin/logout" method="post">
          <button type="submit" className="btn btn-secondary">
            <LogOut size={16} /> Logout
          </button>
        </form>
      </section>

      <nav className="admin-category-tabs">
        <Link href="/admin?tab=all" className={`admin-tab${activeTab === "all" ? " admin-tab--active" : ""}`}>
          <Filter size={14} /> All Categories
        </Link>
        <Link href="/admin?tab=hollister" className={`admin-tab${activeTab === "hollister" ? " admin-tab--active" : ""}`}>
          Ostomy Care ({medicines.length})
        </Link>
        <Link href="/admin?tab=meril-full" className={`admin-tab${activeTab === "meril-full" ? " admin-tab--active" : ""}`}>
          Pathology – Fully Auto ({merilProducts.length})
        </Link>
        <Link href="/admin?tab=meril-semi" className={`admin-tab${activeTab === "meril-semi" ? " admin-tab--active" : ""}`}>
          Pathology – Semi Auto ({merilSemiProducts.length})
        </Link>
        <Link href="/admin?tab=dynamic-techno" className={`admin-tab${activeTab === "dynamic-techno" ? " admin-tab--active" : ""}`}>
          Wound Dressing ({dynamicTechnoProducts.length})
        </Link>
      </nav>

      {(activeTab === "all" || activeTab === "hollister") && (<>
      <section className="info-card">
        <h2>Add New Medicine</h2>
        <form action="/admin/mutate" method="post" className="admin-grid-form">
          <input type="hidden" name="op" value="create-medicine" />
          <label>
            Code
            <input name="code" required />
          </label>
          <label>
            Category
            <input name="category" required />
          </label>
          <label className="admin-span-2">
            Generic Name
            <input name="generic_name" required />
          </label>
          <label>
            Packing Per Box
            <input name="packing_per_box" type="number" min={1} step={1} required />
          </label>
          <label>
            DP Units
            <input name="dp_units" type="number" min={0} step="0.01" required />
          </label>
          <label>
            MRP Units
            <input name="mrp_units" type="number" min={0} step="0.01" required />
          </label>
          <label>
            Cut Price
            <input name="cut_price" type="number" min={0} step="0.01" required />
          </label>
          <button type="submit" className="btn btn-primary admin-span-2">
            <Plus size={16} /> Add Medicine
          </button>
        </form>
      </section>

      <section className="admin-medicine-list">
        {medicines.map((medicine) => (
          <article key={medicine.id} className="info-card admin-medicine-card">
            <div className="admin-card-head">
              <h3>
                {medicine.genericName} <span className="pill">Code: {medicine.code}</span>
              </h3>
              <form action="/admin/mutate" method="post">
                <input type="hidden" name="op" value="delete-medicine" />
                <input type="hidden" name="id" value={medicine.id} />
                <button type="submit" className="btn btn-secondary">
                  <Trash2 size={16} /> Delete
                </button>
              </form>
            </div>

            <form action="/admin/mutate" method="post" className="admin-grid-form">
              <input type="hidden" name="op" value="update-medicine" />
              <input type="hidden" name="id" value={medicine.id} />
              <label>
                Code
                <input name="code" defaultValue={medicine.code} required />
              </label>
              <label>
                Category
                <input name="category" defaultValue={medicine.category} required />
              </label>
              <label className="admin-span-2">
                Generic Name
                <input name="generic_name" defaultValue={medicine.genericName} required />
              </label>
              <label>
                Packing Per Box
                <input
                  name="packing_per_box"
                  type="number"
                  min={1}
                  step={1}
                  defaultValue={medicine.packingPerBox}
                  required
                />
              </label>
              <label>
                DP Units
                <input
                  name="dp_units"
                  type="number"
                  min={0}
                  step="0.01"
                  defaultValue={medicine.dpUnits}
                  required
                />
              </label>
              <label>
                MRP Units
                <input
                  name="mrp_units"
                  type="number"
                  min={0}
                  step="0.01"
                  defaultValue={medicine.mrpUnits}
                  required
                />
              </label>
              <label>
                Cut Price
                <input
                  name="cut_price"
                  type="number"
                  min={0}
                  step="0.01"
                  defaultValue={medicine.cutPrice}
                  required
                />
              </label>
              <button type="submit" className="btn btn-primary admin-span-2">
                <Save size={16} /> Save Changes
              </button>
            </form>

            <div className="admin-images-block">
              <h4>Images</h4>
              <AdminImageUploadForm entityId={medicine.id} target="medicine" />

              <div className="admin-image-grid">
                {medicine.imageItems.length === 0 ? (
                  <p className="muted">No images uploaded yet.</p>
                ) : (
                  medicine.imageItems.map((image, index) => (
                    <div key={image.id} className="admin-image-item">
                      <img src={image.path} alt={`${medicine.genericName} ${index + 1}`} />
                      <form action="/admin/mutate" method="post">
                        <input type="hidden" name="op" value="delete-image" />
                        <input type="hidden" name="image_id" value={image.id} />
                        <input type="hidden" name="image_path" value={image.path} />
                        <button type="submit" className="btn btn-secondary">
                          Remove
                        </button>
                      </form>
                    </div>
                  ))
                )}
              </div>
            </div>
          </article>
        ))}
      </section>
      </>)}

      {(activeTab === "all" || activeTab === "meril-full") && (<>
      <section className="info-card">
        <h2>Add New Pathology (Fully Auto) Product</h2>
        <form action="/admin/mutate" method="post" className="admin-grid-form">
          <input type="hidden" name="op" value="create-meril" />
          <label>
            Sr. No
            <input name="sr_no" type="number" min={1} step={1} required />
          </label>
          <label>
            Category
            <input name="category" defaultValue="meril fully automatic" required />
          </label>
          <label className="admin-span-2">
            Product Name
            <input name="product_name" required />
          </label>
          <label>
            Pack Size
            <input name="pack_size" required />
          </label>
          <label>
            MRP Units
            <input name="mrp_units" type="number" min={0} step="0.01" required />
          </label>
          <label>
            Cut Price
            <input name="cut_price" type="number" min={0} step="0.01" required />
          </label>
          <label>
            GST
            <input name="gst" defaultValue="5%" required />
          </label>
          <button type="submit" className="btn btn-primary admin-span-2">
            <Plus size={16} /> Add Pathology Product
          </button>
        </form>
      </section>

      <section className="admin-medicine-list">
        {merilProducts.map((item) => (
          <article key={item.id} className="info-card admin-medicine-card">
            <div className="admin-card-head">
              <h3>
                {item.productName} <span className="pill">SR: {item.srNo}</span>
              </h3>
              <form action="/admin/mutate" method="post">
                <input type="hidden" name="op" value="delete-meril" />
                <input type="hidden" name="id" value={item.id} />
                <button type="submit" className="btn btn-secondary">
                  <Trash2 size={16} /> Delete
                </button>
              </form>
            </div>

            <form action="/admin/mutate" method="post" className="admin-grid-form">
              <input type="hidden" name="op" value="update-meril" />
              <input type="hidden" name="id" value={item.id} />
              <label>
                Sr. No
                <input name="sr_no" type="number" min={1} step={1} defaultValue={item.srNo} required />
              </label>
              <label>
                Category
                <input name="category" defaultValue={item.category} required />
              </label>
              <label className="admin-span-2">
                Product Name
                <input name="product_name" defaultValue={item.productName} required />
              </label>
              <label>
                Pack Size
                <input name="pack_size" defaultValue={item.packSize} required />
              </label>
              <label>
                MRP Units
                <input name="mrp_units" type="number" min={0} step="0.01" defaultValue={item.mrpUnits} required />
              </label>
              <label>
                Cut Price
                <input
                  name="cut_price"
                  type="number"
                  min={0}
                  step="0.01"
                  defaultValue={item.cutPrice}
                  required
                />
              </label>
              <label>
                GST
                <input name="gst" defaultValue={item.gst} required />
              </label>
              <button type="submit" className="btn btn-primary admin-span-2">
                <Save size={16} /> Save Pathology Product
              </button>
            </form>

            <div className="admin-images-block">
              <h4>Pathology (Fully Auto) Images</h4>
              <AdminImageUploadForm entityId={item.id} target="meril" />

              <div className="admin-image-grid">
                {item.imageItems.length === 0 ? (
                  <p className="muted">No images uploaded yet.</p>
                ) : (
                  item.imageItems.map((image, index) => (
                    <div key={image.id} className="admin-image-item">
                      <img src={image.path} alt={`${item.productName} ${index + 1}`} />
                      <form action="/admin/mutate" method="post">
                        <input type="hidden" name="op" value="delete-meril-image" />
                        <input type="hidden" name="image_id" value={image.id} />
                        <input type="hidden" name="image_path" value={image.path} />
                        <button type="submit" className="btn btn-secondary">
                          Remove
                        </button>
                      </form>
                    </div>
                  ))
                )}
              </div>
            </div>
          </article>
        ))}
      </section>
      </>)}

      {(activeTab === "all" || activeTab === "meril-semi") && (<>
      <section className="info-card admin-section-divider">
        <h2>Add New Pathology (Semi Auto) Product</h2>
        <form action="/admin/mutate" method="post" className="admin-grid-form">
          <input type="hidden" name="op" value="create-meril-semi" />
          <label>
            Sr. No
            <input name="sr_no" type="number" min={1} step={1} required />
          </label>
          <label>
            Category
            <input name="category" defaultValue="meril semi automatic" required />
          </label>
          <label className="admin-span-2">
            Product Name
            <input name="product_name" required />
          </label>
          <label>
            Pack Size
            <input name="pack_size" required />
          </label>
          <label>
            MRP Units
            <input name="mrp_units" type="number" min={0} step="0.01" required />
          </label>
          <label>
            Cut Price
            <input name="cut_price" type="number" min={0} step="0.01" required />
          </label>
          <label>
            GST
            <input name="gst" defaultValue="5%" required />
          </label>
          <button type="submit" className="btn btn-primary admin-span-2">
            <Plus size={16} /> Add Semi-Auto Product
          </button>
        </form>
      </section>

      <section className="admin-medicine-list">
        {merilSemiProducts.map((item) => (
          <article key={item.id} className="info-card admin-medicine-card">
            <div className="admin-card-head">
              <h3>
                {item.productName} <span className="pill">SR: {item.srNo}</span>
                <span className="pill pill--semi">Semi-Auto</span>
              </h3>
              <form action="/admin/mutate" method="post">
                <input type="hidden" name="op" value="delete-meril-semi" />
                <input type="hidden" name="id" value={item.id} />
                <button type="submit" className="btn btn-secondary">
                  <Trash2 size={16} /> Delete
                </button>
              </form>
            </div>

            <form action="/admin/mutate" method="post" className="admin-grid-form">
              <input type="hidden" name="op" value="update-meril-semi" />
              <input type="hidden" name="id" value={item.id} />
              <label>
                Sr. No
                <input name="sr_no" type="number" min={1} step={1} defaultValue={item.srNo} required />
              </label>
              <label>
                Category
                <input name="category" defaultValue={item.category} required />
              </label>
              <label className="admin-span-2">
                Product Name
                <input name="product_name" defaultValue={item.productName} required />
              </label>
              <label>
                Pack Size
                <input name="pack_size" defaultValue={item.packSize} required />
              </label>
              <label>
                MRP Units
                <input name="mrp_units" type="number" min={0} step="0.01" defaultValue={item.mrpUnits} required />
              </label>
              <label>
                Cut Price
                <input
                  name="cut_price"
                  type="number"
                  min={0}
                  step="0.01"
                  defaultValue={item.cutPrice}
                  required
                />
              </label>
              <label>
                GST
                <input name="gst" defaultValue={item.gst} required />
              </label>
              <button type="submit" className="btn btn-primary admin-span-2">
                <Save size={16} /> Save Semi-Auto Product
              </button>
            </form>

            <div className="admin-images-block">
              <h4>Pathology (Semi Auto) Images</h4>
              <AdminImageUploadForm entityId={item.id} target="meril-semi" />

              <div className="admin-image-grid">
                {item.imageItems.length === 0 ? (
                  <p className="muted">No images uploaded yet.</p>
                ) : (
                  item.imageItems.map((image, index) => (
                    <div key={image.id} className="admin-image-item">
                      <img src={image.path} alt={`${item.productName} ${index + 1}`} />
                      <form action="/admin/mutate" method="post">
                        <input type="hidden" name="op" value="delete-meril-semi-image" />
                        <input type="hidden" name="image_id" value={image.id} />
                        <input type="hidden" name="image_path" value={image.path} />
                        <button type="submit" className="btn btn-secondary">
                          Remove
                        </button>
                      </form>
                    </div>
                  ))
                )}
              </div>
            </div>
          </article>
        ))}
      </section>
      </>)}

      {(activeTab === "all" || activeTab === "dynamic-techno") && (<>
      <section className="info-card admin-section-divider">
        <h2>Add New Wound Dressing Product</h2>
        <form action="/admin/mutate" method="post" className="admin-grid-form">
          <input type="hidden" name="op" value="create-dynamic-techno" />
          <label>
            Item Code
            <input name="item_code" required />
          </label>
          <label>
            Brand Name
            <input name="brand_name" required />
          </label>
          <label className="admin-span-2">
            Product Description
            <input name="product_description" required />
          </label>
          <label>
            Size
            <input name="size" required />
          </label>
          <label>
            UOM
            <input name="uom" required />
          </label>
          <label>
            MRP
            <input name="mrp" type="number" min={0} step="0.01" required />
          </label>
          <label>
            Cut Price
            <input name="cut_price" type="number" min={0} step="0.01" required />
          </label>
          <button type="submit" className="btn btn-primary admin-span-2">
            <Plus size={16} /> Add Wound Dressing Product
          </button>
        </form>
      </section>

      <section className="admin-medicine-list">
        {dynamicTechnoProducts.map((item) => (
          <article key={item.id} className="info-card admin-medicine-card">
            <div className="admin-card-head">
              <h3>
                {item.productDescription} <span className="pill">Code: {item.itemCode}</span>
                <span className="pill pill--wound">Wound Dressing</span>
              </h3>
              <form action="/admin/mutate" method="post">
                <input type="hidden" name="op" value="delete-dynamic-techno" />
                <input type="hidden" name="id" value={item.id} />
                <button type="submit" className="btn btn-secondary">
                  <Trash2 size={16} /> Delete
                </button>
              </form>
            </div>

            <form action="/admin/mutate" method="post" className="admin-grid-form">
              <input type="hidden" name="op" value="update-dynamic-techno" />
              <input type="hidden" name="id" value={item.id} />
              <label>
                Item Code
                <input name="item_code" defaultValue={item.itemCode} required />
              </label>
              <label>
                Brand Name
                <input name="brand_name" defaultValue={item.brandName} required />
              </label>
              <label className="admin-span-2">
                Product Description
                <input name="product_description" defaultValue={item.productDescription} required />
              </label>
              <label>
                Size
                <input name="size" defaultValue={item.size} required />
              </label>
              <label>
                UOM
                <input name="uom" defaultValue={item.uom} required />
              </label>
              <label>
                MRP
                <input name="mrp" type="number" min={0} step="0.01" defaultValue={item.mrp} required />
              </label>
              <label>
                Cut Price
                <input name="cut_price" type="number" min={0} step="0.01" defaultValue={item.cutPrice} required />
              </label>
              <button type="submit" className="btn btn-primary admin-span-2">
                <Save size={16} /> Save Wound Dressing Product
              </button>
            </form>

            <div className="admin-images-block">
              <h4>Wound Dressing Images</h4>
              <AdminImageUploadForm entityId={item.id} target="dynamic-techno" />

              <div className="admin-image-grid">
                {item.imageItems.length === 0 ? (
                  <p className="muted">No images uploaded yet.</p>
                ) : (
                  item.imageItems.map((image, index) => (
                    <div key={image.id} className="admin-image-item">
                      <img src={image.path} alt={`${item.productDescription} ${index + 1}`} />
                      <form action="/admin/mutate" method="post">
                        <input type="hidden" name="op" value="delete-dynamic-techno-image" />
                        <input type="hidden" name="image_id" value={image.id} />
                        <input type="hidden" name="image_path" value={image.path} />
                        <button type="submit" className="btn btn-secondary">
                          Remove
                        </button>
                      </form>
                    </div>
                  ))
                )}
              </div>
            </div>
          </article>
        ))}
      </section>
      </>)}
    </div>
  );
}
