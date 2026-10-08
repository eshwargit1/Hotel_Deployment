import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import HotelMap from "./HotelMap";
import { formatPrice, getVisibleHotels } from "../hotelsStore";
import "./view.css";
import { Helmet } from "react-helmet-async";

const View = () => {
  const { id } = useParams();
  const [hotel, setHotel] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    fetch("http://localhost:5000/hotels")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Hotels request failed: ${response.status}`);
        }
        return response.json();
      })
      .then((rows) => {
        const apiHotels = rows.map((item, index) => ({
          id: String(item.id ?? item.hotel_id ?? `api-hotel-${index}`),
          hotelName: item.hotelName ?? item.hotel_name ?? item.name ?? "Unnamed hotel",
          location: item.location ?? item.address ?? "Salem",
          latitude: String(item.latitude ?? ""),
          longitude: String(item.longitude ?? ""),
          price: String(item.price ?? ""),
          rating: String(item.rating ?? ""),
          description: item.description ?? "",
          src: [item.src, item.image, item.image_url].find(Boolean)?.replace(
            /^\/(uploads\/)/,
            "http://localhost:5000/$1"
          ) ?? "",
          images: item.images ?? [],
        }));

        if (isMounted) {
          const visibleHotels = getVisibleHotels(apiHotels);
          setHotel(visibleHotels.find((item) => String(item.id) === id) ?? null);
          setIsLoading(false);
        }
      })
      .catch((error) => {
        console.error("Error fetching hotel:", error);
        if (isMounted) {
          setHotel(getVisibleHotels().find((item) => String(item.id) === id) ?? null);
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (isLoading) {
    return null;
  }

  if (!hotel) {
    return (
      <div className="page">

        <Helmet>
         <title>Hotels | RHS Hotels Management</title>
           <meta
            name="description"
            content="Browse available hotels, locations, prices, ratings, and hotel details."
          />
          <meta
            name="keywords"
            content="hotels, hotel list, hotel rooms, hotel prices, hotel locations"
          />
       </Helmet>

        <Nav />

        <main className="hotel-view">
          <div className="hotel-view-missing">
            <h1>Hotel not found</h1>
            <p>This listing is not available. Go back to the hotel list.</p>
            <Link to="/" className="hotel-view-back">
              Back to hotels
            </Link>
          </div>
        </main>
        
        <Footer />
      </div>
    );
  }

  return (
    <div className="page">
      <Helmet>
  <title>{hotel.hotelName}</title>
  <meta
    name="description"
    content={hotel.description}
  />
  <meta
    name="keywords"
    content="hotels, hotel list, hotel rooms, hotel prices, hotel locations"
  />
</Helmet>
      <Nav />
      <main className="hotel-view">
        <Link to="/" className="hotel-view-back">
          ← Back to hotels
        </Link>

        <div className="hotel-view-layout">
          <article className="hotel-view-card">
            <img src={hotel.src} alt={hotel.hotelName} />
            {hotel.images?.length > 1 && (
              <div className="hotel-view-thumbs">
                {hotel.images.map((src, index) => (
                  <img key={`${hotel.id}-img-${index}`} src={src} alt={`${hotel.hotelName} ${index + 1}`} />
                ))}
              </div>
            )}
            <div className="hotel-view-body">
              <div className="hotel-view-top">
                <h1>{hotel.hotelName}</h1>
                <span className="rating">{hotel.rating}</span>
              </div>
              <p className="location">{hotel.location}</p>
              <p className="hotel-view-coords">
                <span>Latitude: {hotel.latitude}</span>
                <span>Longitude: {hotel.longitude}</span>
              </p>
              <p className="hotel-view-desc">{hotel.description}</p>
              <p className="price">
                {formatPrice(hotel.price)} <span>/ night</span>
              </p>
            </div>
          </article>

          <aside className="hotel-map-wrap">
            <h2>Map</h2>
            <HotelMap
              latitude={hotel.latitude}
              longitude={hotel.longitude}
              hotelName={hotel.hotelName}
              location={hotel.location}
            />
            <p className="hotel-map-note">
              Location from OpenStreetMap for {hotel.latitude}, {hotel.longitude}
            </p>
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default View;
