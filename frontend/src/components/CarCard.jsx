import React from "react";
import { Link } from "react-router-dom";
import styles from "./CarCard.module.css";

// Helper function to build image URLs
function imgUrl(u) {
  if (!u) return "";
  const s = String(u);
  if (s.startsWith("http")) return s;
  
  // Use VITE_ASSET_BASE_URL for static files
  const assetBaseUrl = import.meta.env.VITE_ASSET_BASE_URL;
  
  const imagePath = s.startsWith("/") ? s : "/" + s;
  const fullUrl = assetBaseUrl + imagePath;
  
  // Debug logging
  console.log("🔍 CarCard Image Debug:", {
    original: u,
    assetBaseUrl,
    imagePath,
    fullUrl,
    hasImage: !!u
  });
  
  return fullUrl;
}

function money(n) {
  const x = Number(n || 0);
  return x.toLocaleString("en-US");
}

export default function CarCard({ car, wishlist, toggleWish, user }) {
  const wished = wishlist.includes(car._id);

  // Debug logging for car data
  console.log("🔍 CarCard Data Debug:", {
    carId: car._id,
    carName: car.car_name,
    carImage: car.car_image,
    imageUrl: car.imageUrl,
    hasImage: !!car.car_image,
    hasImageUrl: !!car.imageUrl,
    imageType: typeof car.car_image,
    imageUrlType: typeof car.imageUrl,
    allCarKeys: Object.keys(car)
  });

  return (
    <div className={styles["car-card"]}>
      {/* Image Section */}
      <div className={styles["car-card__image-container"]}>
        {car.imageUrl ? (
          <>
            <img
              src={car.imageUrl}
              alt={car.car_name}
              className={styles["car-card__image"]}
              loading="lazy"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentElement.querySelector(`.${styles["car-card__no-image"]}`).style.display = 'flex';
              }}
            />
            <div className={styles["car-card__no-image"]} style={{ display: 'none' }}>
              <div className={styles["car-card__no-image-icon"]}>📷</div>
              <div className={styles["car-card__no-image-text"]}>No image</div>
            </div>
          </>
        ) : (
          <div className={styles["car-card__no-image"]}>
            <div className={styles["car-card__no-image-icon"]}>📷</div>
            <div className={styles["car-card__no-image-text"]}>No image</div>
          </div>
        )}

        {/* Gradient Overlay */}
        <div className={styles["car-card__image-overlay"]} />

        {/* Badges on Image */}
        <div className={styles["car-card__badges"]}>
          <span className={`${styles["car-card__badge"]} ${styles["car-card__badge--year"]}`}>
            📅 {car.car_year}
          </span>
          <span className={`${styles["car-card__badge"]} ${styles["car-card__badge--transmission"]}`}>
            ⚙ {car.car_gearbook || "-"}
          </span>
        </div>

        {/* Wishlist Button */}
        <button
          className={`${styles["car-card__wishlist"]} ${wished ? styles["car-card__wishlist--active"] : ''}`}
          onClick={() => {
            if (!user) return;
            toggleWish(car._id);
          }}
          title={user ? "Wishlist" : "Login to use wishlist"}
        >
          {wished ? "♥" : "♡"}
        </button>
      </div>

      {/* Content Section - Middle part */}
      <div className={styles["car-card__content"]}>
        {/* Price */}
        <div className={styles["car-card__price"]}>
          ${money(car.car_price)}
        </div>

        {/* Car Name */}
        <h3 className={styles["car-card__title"]}>
          {car.car_name}
        </h3>

        {/* Category */}
        <div className={styles["car-card__category"]}>
          {car?.car_category?.name || "Category"}
        </div>

        {/* Meta Info */}
        <div className={styles["car-card__info"]}>
          <span className={styles["car-card__info-item"]}>
            📅 {car.car_year}
          </span>
          <span className={styles["car-card__info-item"]}>
            🛣 {car.car_distance}
          </span>
          <span className={styles["car-card__info-item"]}>
            ⚙ {car.car_gearbook || "-"}
          </span>
        </div>

        {/* Action Button - In content flow */}
        <div className={styles["car-card__button-container"]}>
          <Link 
            to={`/cars/${car._id}`} 
            className={styles["car-card__button"]}
          >
            View details
          </Link>
        </div>
      </div>

      {/* Footer Section - Always visible at bottom */}
      <div className={styles["car-card__footer"]}>
        {/* Seller Info */}
        <div className={styles["car-card__seller"]}>
          <span className={styles["car-card__seller-name"]}>
            {car?.owner?.first_name || "User"}
          </span>
          <span className={styles["car-card__seller-email"]}>
            @{(car?.owner?.email || "").split("@")[0]}
          </span>
        </div>
      </div>
    </div>
  );
}
