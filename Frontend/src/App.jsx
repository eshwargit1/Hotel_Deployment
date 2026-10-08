import { useEffect, useState, useMemo } from "react";
import { Routes, Route } from "react-router-dom";
import "./App.css";
import Nav from "./components/Nav";
import Filter from "./components/Filter";
import Hotellist from "./components/Hotellist";
import Banner from "./components/Banner";
import Footer from "./components/Footer";
import View from "./page/view";
import AddHotel from "./page/AddHotel";
import UpdateHotel from "./page/UpdateHotel";
import { getVisibleHotels } from "./hotelsStore";
import { Helmet } from "react-helmet-async";

const Home = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [apiHotels, setApiHotels] = useState(null);

  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedLocation("");
    setMinPrice("");
    setMaxPrice("");
  };

  useEffect(() => {
    fetch("http://localhost:5000/hotels")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Hotels request failed: ${response.status}`);
        }
        return response.json();
      })
      .then((rows) => {
        const normalizedHotels = rows.map((hotel, index) => ({
          id: hotel.id ?? hotel.hotel_id ?? `api-hotel-${index}`,
          hotelName: hotel.hotelName ?? hotel.hotel_name ?? hotel.name ?? "Unnamed hotel",
          location: hotel.location ?? hotel.address ?? "Salem",
          latitude: String(hotel.latitude ?? ""),
          longitude: String(hotel.longitude ?? ""),
          price: String(hotel.price ?? ""),
          rating: String(hotel.rating ?? ""),
          description: hotel.description ?? "",
          src: [hotel.src, hotel.image, hotel.image_url].find(Boolean)?.replace(
            /^\/(uploads\/)/,
            "http://localhost:5000/$1"
          ) ?? "",
          images: hotel.images ?? [],
        }));
        setApiHotels(normalizedHotels);
      })
      .catch((error) => {
        console.error("Error fetching hotels:", error);
        setApiHotels([]);
      });
  }, []);

  const hotels = useMemo(
    () => getVisibleHotels(apiHotels ?? []),
    [apiHotels]
  );

  const filteredHotels = useMemo(() => {
    return hotels.filter((hotel) => {
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase().trim();
        const matchesName = hotel.hotelName.toLowerCase().includes(query);
        const matchesLocation = hotel.location.toLowerCase().includes(query);
        if (!matchesName && !matchesLocation) {
          return false;
        }
      }

      if (selectedLocation) {
        const locationQuery = selectedLocation.toLowerCase();
        if (!hotel.location.toLowerCase().includes(locationQuery)) {
          return false;
        }
      }

      const numericPrice = parseInt(hotel.price.replace(/[^0-9]/g, ""), 10);

      if (minPrice && numericPrice < parseInt(minPrice, 10)) {
        return false;
      }

      if (maxPrice && numericPrice > parseInt(maxPrice, 10)) {
        return false;
      }

      return true;
    });
  }, [hotels, searchTerm, selectedLocation, minPrice, maxPrice]);

  return (
    <div className="page">
      <Helmet>
        <title>Home | RHS Hotels Management</title>
           <meta name="description" content="Welcome to RHS Hotels Management. Discover and manage hotels easily."/>
           <meta name="keywords" content="hotels, hotel management, hotel booking, RHS hotels"/>
      </Helmet>
      <Nav />
      <section className="home-hero">
        <Banner />
        <Filter
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedLocation={selectedLocation}
        setSelectedLocation={setSelectedLocation}
        minPrice={minPrice}
        setMinPrice={setMinPrice}
        maxPrice={maxPrice}
        setMaxPrice={setMaxPrice}
        onReset={handleResetFilters}
        />
      </section>
      <Hotellist hotels={filteredHotels} />
      <Footer />
    </div>
  );
};

const App = () => {
  return (
    
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/add" element={<AddHotel />} />
      <Route path="/update" element={<UpdateHotel />} />
      <Route path="/delete" element={<UpdateHotel deleteOnly />} />
      <Route path="/update/:id" element={<AddHotel />} />
      <Route path="/view/:id" element={<View />} />
    </Routes>
  );
};

export default App;
