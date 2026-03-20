import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Lock, LogOut, Plus, Save, Trash2, Upload } from "lucide-react";

import {
  createMedicineAction,
  deleteMedicineAction,
  deleteMedicineImageAction,
  loginAdminAction,
  logoutAdminAction,
  updateMedicineAction,
  uploadMedicineImagesAction,
} from "@/app/admin/actions";
import { getAllMedicines } from "@/lib/medicines";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin",
  description: "Tirupati Medix admin panel for medicine and image management.",
};

type AdminPageProps = {
  searchParams: Promise<{ error?: string }>;
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
          <form action={loginAdminAction} className="list-reset admin-form">
            <label>
              Password
              <input type="password" name="password" placeholder="Enter admin password" required />
            </label>
            {params.error === "invalid" ? (
              <p className="admin-error">
                <Lock size={16} /> Invalid password. Please try again.
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

  const medicines = await getAllMedicines();

  return (
    <div className="content-page container admin-shell">
      <section className="info-card admin-header">
        <div>
          <h1>Medicine Admin Panel</h1>
          <p className="muted">Manage categories, medicine details, prices, and multiple images.</p>
        </div>
        <form action={logoutAdminAction}>
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
              <form action={uploadMedicineImagesAction} className="admin-upload-form">
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
    </div>
  );
}
