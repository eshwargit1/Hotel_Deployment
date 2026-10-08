import React from "react";
import { useNavigate } from "react-router-dom";
import { formatPrice } from "../hotelsStore";
import "./HotelCard.css";

const HotelCard = ({ data, onUpdate, onDelete }) => {
  const navigate = useNavigate();
  const isManage = Boolean(onUpdate || onDelete);

  const openHotel = () => {
    navigate(`/view/${data.id}`);
  };

  return (
    <article
      className={`card${isManage ? " card-manage" : ""}`}
      onClick={isManage ? undefined : openHotel}
      role={isManage ? "article" : "link"}
      tabIndex={isManage ? undefined : 0}
      onKeyDown={
        isManage
          ? undefined
          : (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                openHotel();
              }
            }
      }
    >
      <img src={data.src} alt={data.hotelName} />
      {!isManage && <span className="rating">★ {data.rating}</span>}
      <div className="card-body">
        <div className="card-top">
          <h3>{data.hotelName}</h3>
        </div>
        <p className="location"><span>♦</span> {data.location}</p>
        <p className="desc">{data.description}</p>
        <div className="card-bottom">
          <p className="price">
            {formatPrice(data.price)} <span>/ night</span>
          </p>
          {isManage ? (
            <div className="card-actions">
              {onUpdate ? (
                <button
                  type="button"
                  className="btn-update"
                  onClick={(event) => {
                    event.stopPropagation();
                    onUpdate(data);
                  }}
                >
                  Update
                </button>
              ) : null}
              {onDelete ? (
                <button
                  type="button"
                  className="btn-delete"
                  onClick={(event) => {
                    event.stopPropagation();
                    onDelete(data);
                  }}
                >
                  Delete
                </button>
              ) : null}
            </div>
          ) : (
              <button type="button" onClick={openHotel}>
              View Details <span>›</span>
            </button>
          )}
        </div>
      </div>
    </article>
  );
};

export default HotelCard;
