-- 1) Rename main table
RENAME TABLE medicines TO hollister;

-- 2) Recreate FK from medicine_images to hollister
-- Replace fk_medicine_images_medicine_id with your actual FK name if different.
ALTER TABLE medicine_images DROP FOREIGN KEY fk_medicine_images_medicine_id;
ALTER TABLE medicine_images
  ADD CONSTRAINT fk_medicine_images_medicine_id
  FOREIGN KEY (medicine_id) REFERENCES hollister(id) ON DELETE CASCADE;
