import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Lock, LogOut, Plus, Save, Trash2, Upload } from "lucide-react";

import {
  createMerilProductAction,
  createMedicineAction,
  deleteMerilProductAction,
  deleteMedicineAction,
  deleteMedicineImageAction,
  updateMerilProductAction,
  updateMedicineAction,
} from "@/app/admin/actions";
import { getAllMerilProducts } from "@/lib/meril";
import { getAllMedicines } from "@/lib/medicines";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin",
  description: "Tirupati Medix admin panel for medicine and image management.",
};

type AdminPageProps = {
  searchParams: Promise<{ error?: string; upload?: string }>;
};

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const params = await searchParams;
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
  let dataLoadFailed = false;

  try {
    const [medicinesResult, merilResult] = await Promise.allSettled([
      getAllMedicines(),
      getAllMerilProducts(),
    ]);

    medicines = medicinesResult.status === "fulfilled" ? medicinesResult.value : [];
    merilProducts = merilResult.status === "fulfilled" ? merilResult.value : [];
    dataLoadFailed = medicinesResult.status === "rejected" || merilResult.status === "rejected";
  } catch {
    dataLoadFailed = true;
  }

  return (
    <div className="content-page container admin-shell">
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
        </div>
        <form action="/admin/logout" method="post">
          <button type="submit" className="btn btn-secondary">
            <LogOut size={16} /> Logout
          </button>
        </form>
      </section>

      <section className="info-card">
        <h2>Add New Medicine</h2>
        <form action={createMedicineAction} className="admin-grid-form">
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
              <form action={deleteMedicineAction}>
                <input type="hidden" name="id" value={medicine.id} />
                <button type="submit" className="btn btn-secondary">
                  <Trash2 size={16} /> Delete
                </button>
              </form>
            </div>

            <form action={updateMedicineAction} className="admin-grid-form">
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
              <form
                action="/admin/upload-images"
                method="post"
                encType="multipart/form-data"
                className="admin-upload-form"
              >
                <input type="hidden" name="medicine_id" value={medicine.id} />
                <input type="file" name="images" accept="image/*" multiple required />
                <button type="submit" className="btn btn-secondary">
                  <Upload size={16} /> Upload Images
                </button>
              </form>

              <div className="admin-image-grid">
                {medicine.imageItems.length === 0 ? (
                  <p className="muted">No images uploaded yet.</p>
                ) : (
                  medicine.imageItems.map((image, index) => (
                    <div key={image.id} className="admin-image-item">
                      <img src={image.path} alt={`${medicine.genericName} ${index + 1}`} />
                      <form action={deleteMedicineImageAction}>
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

      <section className="info-card">
        <h2>Add New Meril Fully Automatic Product</h2>
        <form action={createMerilProductAction} className="admin-grid-form">
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
            <Plus size={16} /> Add Meril Product
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
              <form action={deleteMerilProductAction}>
                <input type="hidden" name="id" value={item.id} />
                <button type="submit" className="btn btn-secondary">
                  <Trash2 size={16} /> Delete
                </button>
              </form>
            </div>

            <form action={updateMerilProductAction} className="admin-grid-form">
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
                <Save size={16} /> Save Meril Product
              </button>
            </form>
          </article>
        ))}
      </section>
    </div>
  );
}
