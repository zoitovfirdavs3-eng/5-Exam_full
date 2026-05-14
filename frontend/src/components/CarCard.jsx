import React from "react";
import { Link } from "react-router-dom";
import styles from "./CarCard.module.css";

function imgUrl(u) {
  if (!u) return "";
  const s = String(u);
  if (s.startsWith("http")) return s;
  const assetBaseUrl = import.meta.env.VITE_ASSET_BASE_URL || "";
  const imagePath = s.startsWith("/") ? s : "/" + s;
  return assetBaseUrl + imagePath;
}

function money(n) {
  return Number(n || 0).toLocaleString("en-US");
}

export default function CarCard({ car, wishlist, toggleWish, user }) {
  const wished = wishlist.includes(car._id);

  return (
    <div className={styles["car-card"]}>
      <div className={styles["car-card__image-container"]}>
        {car.car_image ? (
          <>
            <img
              src={imgUrl(car.car_image)}
              alt={car.car_name}
              className={styles["car-card__image"]}
              loading="lazy"
              onError={(e) => {
                e.target.style.display = "none";
                const noImg = e.target.parentElement.querySelector(`.${styles["car-card__no-image"]}`);
                if (noImg) noImg.style.display = "flex";
              }}
            />
            <div className={styles["car-card__no-image"]} style={{ display: "none" }}>
              <div className={styles["car-card__no-image-icon"]}>📷</div>
              <div className={styles["car-card__no-image-text"]}>Rasm yo'q</div>
            </div>
          </>
        ) : (
          <div className={styles["car-card__no-image"]}>
            <div className={styles["car-card__no-image-icon"]}>📷</div>
            <div className={styles["car-card__no-image-text"]}>Rasm yo'q</div>
          </div>
        )}
        <div className={styles["car-card__image-overlay"]} />
        <div className={styles["car-card__badges"]}>
          <span className={`${styles["car-card__badge"]} ${styles["car-card__badge--year"]}`}>📅 {car.car_year}</span>
          <span className={`${styles["car-card__badge"]} ${styles["car-card__badge--transmission"]}`}>⚙ {car.car_gearbook || "-"}</span>
        </div>
        <button
          className={`${styles["car-card__wishlist"]} ${wished ? styles["car-card__wishlist--active"] : ""}`}
          onClick={() => { if (!user) return; toggleWish(car._id); }}
          title={user ? "Wishlist" : "Kirish kerak"}
        >
          {wished ? "♥" : "♡"}
        </button>
      </div>

      <div className={styles["car-card__content"]}>
        <div className={styles["car-card__price"]}>${money(car.car_price)}</div>
        <h3 className={styles["car-card__title"]}>{car.car_name}</h3>
        <div className={styles["car-card__category"]}>{car?.car_category?.name || "Kategoriya"}</div>
        <div className={styles["car-card__info"]}>
          <span className={styles["car-card__info-item"]}>📅 {car.car_year}</span>
          <span className={styles["car-card__info-item"]}>🛣 {car.car_distance}</span>
          <span className={styles["car-card__info-item"]}>⚙ {car.car_gearbook || "-"}</span>
        </div>
        <div className={styles["car-card__seller"]}>
          <span className={styles["car-card__seller-name"]}>{car?.owner?.first_name || "Foydalanuvchi"}</span>
          <span className={styles["car-card__seller-email"]}>@{(car?.owner?.email || "").split("@")[0]}</span>
        </div>
        <Link to={`/cars/${car._id}`} className={styles["car-card__button"]}>Batafsil</Link>
      </div>
    </div>
  );
}
