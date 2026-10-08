import { useEffect, useState } from "react";
import "./Hotellist.css";
import HotelCard from "./HotelCard";

const PAGE_SIZE = 3;

const Hotellist = ({ hotels = [] }) => {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(hotels.length / PAGE_SIZE));

  useEffect(() => {
    setPage(1);
  }, [hotels]);

  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const pageHotels = hotels.slice(start, start + PAGE_SIZE);
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  const goToPage = (nextPage) => {
    setPage(nextPage);
    window.scrollTo({ top: 320, behavior: "smooth" });
  };



  return (
    <section className="hotel-list">
      <div className="hotel-list-title-row">
        <div className="hotel-list-head">
          <h2>Hotels in Salem</h2>
          <p>Explore the best hotels in Salem with great amenities, comfort and value for money.</p>
        </div>
        <a href="#hotel-list" className="view-all-hotels">View All Hotels <span>›</span></a>
      </div>

      {hotels.length === 0 ? (
        <div className="hotel-empty">
          <h3>No hotels found</h3>
          <p>
            No hotels match your search criteria. Please try a different hotel
            name or clear the filter.
          </p>
        </div>
      ) : (
        <>
          <div className="cards" id="hotel-list">
            {pageHotels.map((hotel) => (
              <HotelCard key={hotel.id} data={hotel} />
            ))}
          </div>

          <nav className="pagination" aria-label="Hotel pages">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => goToPage(currentPage - 1)}
            >
              Prev
            </button>

            {pages.map((pageNumber) => (
              <button
                key={pageNumber}
                type="button"
                className={pageNumber === currentPage ? "active" : ""}
                onClick={() => goToPage(pageNumber)}
              >
                {pageNumber}
              </button>
            ))}

            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => goToPage(currentPage + 1)}
            >
              Next
            </button>
          </nav>
        </>
      )}
    </section>
  );
};

export default Hotellist;
