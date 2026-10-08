import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import HotelMap from "./HotelMap";
import {Helmet} from "react-helmet-async";
import {
  formatPrice,
  getVisibleHotels,
  slugifyName,
  updateHotelById,
} from "../hotelsStore";
import "./AddHotel.css";

const emptyForm = {
  hotelName: "",
  location: "",
  price: "",
  rating: "8.0",
  description: "",
  latitude: "11.6643",
  longitude: "78.1460",
};

const toImageUrl = (imagePath) => {
  if (!imagePath || imagePath.startsWith("data:") || imagePath.startsWith("http")) {
    return imagePath || "";
  }

  return `http://localhost:5000${imagePath.startsWith("/") ? "" : "/"}${imagePath}`;
};

const AddHotel = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const [editHotel, setEditHotel] = useState(null);
  const [isLoadingEdit, setIsLoadingEdit] = useState(isEdit);
  const [form, setForm] = useState(emptyForm);
  const [images, setImages] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [mapCoords, setMapCoords] = useState({
    latitude: emptyForm.latitude,
    longitude: emptyForm.longitude,
  });
  const [geoStatus, setGeoStatus] = useState("");
  const [geoError, setGeoError] = useState(false);
  const [message, setMessage] = useState("");
  const [messageError, setMessageError] = useState(false);

  useEffect(() => {
    if (!isEdit) {
      return;
    }

    const loadHotel = async () => {
      const localHotel = getVisibleHotels().find((item) => String(item.id) === id);
      if (localHotel) {
        setEditHotel(localHotel);
        setIsLoadingEdit(false);
        return;
      }

      try {
        const response = await fetch("http://localhost:5000/hotels");
        if (!response.ok) {
          throw new Error("Could not load hotel");
        }

        const rows = await response.json();
        const apiHotel = rows.find((item) => String(item.id ?? item.hotel_id) === id);
        if (apiHotel) {
          const source = apiHotel.image_url ?? apiHotel.image ?? apiHotel.src ?? "";
          setEditHotel({
            id: String(apiHotel.id ?? apiHotel.hotel_id),
            hotelName: apiHotel.hotelName ?? apiHotel.hotel_name ?? apiHotel.name ?? "",
            location: apiHotel.location ?? "",
            price: String(apiHotel.price ?? ""),
            rating: String(apiHotel.rating ?? "8.0"),
            description: apiHotel.description ?? "",
            latitude: String(apiHotel.latitude ?? ""),
            longitude: String(apiHotel.longitude ?? ""),
            src: toImageUrl(source),
            images: source ? [toImageUrl(source)] : [],
            source: "api",
          });
        }
      } catch (error) {
        console.error("Error loading hotel for update:", error);
      } finally {
        setIsLoadingEdit(false);
      }
    };

    loadHotel();
  }, [id, isEdit]);

  useEffect(() => {
    if (!editHotel) {
      return;
    }

    setForm({
      hotelName: editHotel.hotelName || "",
      location: editHotel.location || "",
      price: String(editHotel.price || "").replace(/[^0-9]/g, ""),
      rating: editHotel.rating || "8.0",
      description: editHotel.description || "",
      latitude: String(editHotel.latitude || ""),
      longitude: String(editHotel.longitude || ""),
    });

    const photoList = (editHotel.images?.length ? editHotel.images : [editHotel.src]).filter(Boolean);
    setImages(photoList.map((src, index) => ({ src, name: `photo-${index + 1}` })));
  }, [editHotel]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMapCoords({
        latitude: form.latitude,
        longitude: form.longitude,
      });
    }, 350);

    return () => clearTimeout(timer);
  }, [form.latitude, form.longitude]);

  const preview = useMemo(() => {
    const priceLabel = formatPrice(form.price);
    return {
      hotelName: form.hotelName.trim() || "Your hotel name",
      location: form.location.trim() || "City / area",
      rating: form.rating.trim() || "—",
      description:
        form.description.trim() ||
        "A short description of rooms, amenities and nearby landmarks will appear here.",
      price: priceLabel ? `${priceLabel}` : "₹ —",
      src: images[0]?.src || "",
      images,
    };
  }, [form, images]);

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const readFiles = (fileList) => {
    const files = Array.from(fileList || []);
    setSelectedFiles((prev) => [...prev, ...files]);
    files.forEach((file) => {
      if (!file.type.startsWith("image/")) {
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        setImages((prev) => [
          ...prev,
          { src: reader.result, name: file.name, fromFile: true },
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const findOnMap = async () => {
    const query = form.location.trim();
    if (!query) {
      setGeoError(true);
      setGeoStatus("Enter a location first.");
      return;
    }

    setGeoError(false);
    setGeoStatus("Finding map location...");

    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`;
      const response = await fetch(url, {
        headers: { Accept: "application/json" },
      });
      const results = await response.json();

      if (!results.length) {
        setGeoError(true);
        setGeoStatus("No map match found. Type latitude and longitude instead.");
        return;
      }

      const { lat, lon } = results[0];
      setForm((prev) => ({
        ...prev,
        latitude: Number(lat).toFixed(4),
        longitude: Number(lon).toFixed(4),
      }));
      setGeoStatus(`Pinned from map search: ${lat}, ${lon}`);
    } catch {
      setGeoError(true);
      setGeoStatus("Could not reach the map service. Enter coordinates manually.");
    }
  };

  const resetForm = () => {
    if (editHotel) {
      setForm({
        hotelName: editHotel.hotelName || "",
        location: editHotel.location || "",
        price: String(editHotel.price || "").replace(/[^0-9]/g, ""),
        rating: editHotel.rating || "8.0",
        description: editHotel.description || "",
        latitude: String(editHotel.latitude || ""),
        longitude: String(editHotel.longitude || ""),
      });
      const photoList = (editHotel.images?.length
        ? editHotel.images
        : [editHotel.src]
      ).filter(Boolean);
      setImages(photoList.map((src, index) => ({ src, name: `photo-${index + 1}` })));
    } else {
      setForm(emptyForm);
      setImages([]);
      setSelectedFiles([]);
    }
    setMessage("");
    setGeoStatus("");
    setGeoError(false);
    setMessageError(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setMessageError(false);

    if (!form.hotelName.trim() || !form.location.trim() || !form.price || !form.description.trim()) {
      setMessageError(true);
      setMessage("Fill in name, location, price and description.");
      return;
    }

    const lat = parseFloat(form.latitude);
    const lng = parseFloat(form.longitude);
    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      setMessageError(true);
      setMessage("Latitude and longitude must be valid numbers.");
      return;
    }

    if (!images.length) {
      setMessageError(true);
      setMessage("Add at least one hotel image.");
      return;
    }

    const hotel = {
      id: isEdit && editHotel ? editHotel.id : slugifyName(form.hotelName),
      hotelName: form.hotelName.trim(),
      location: form.location.trim(),
      latitude: String(lat),
      longitude: String(lng),
      price: formatPrice(form.price),
      rating: form.rating.trim() || "8.0",
      description: form.description.trim(),
      src: images[0].src,
      images: images.map((item) => item.src),
    };

    if (isEdit) {
      if (editHotel.source === "api") {
        const payload = new FormData();
        Object.entries(hotel).forEach(([key, value]) => {
          if (!["id", "src", "images"].includes(key)) {
            payload.append(key, value);
          }
        });
        selectedFiles.forEach((file) => payload.append("images", file));

        try {
          const response = await fetch(`http://localhost:5000/hotels/${editHotel.id}`, {
            method: "PUT",
            body: payload,
          });
          if (!response.ok) {
            const result = await response.json().catch(() => ({}));
            throw new Error(result.error || "Could not update hotel");
          }
          navigate("/update");
        } catch (error) {
          setMessageError(true);
          setMessage(error.message || "Could not update hotel. Please try again.");
        }
      } else {
        updateHotelById(hotel);
        navigate("/update");
      }
      return;
    }

    const payload = new FormData();
    payload.append("hotelName", hotel.hotelName);
    payload.append("location", hotel.location);
    payload.append("latitude", hotel.latitude);
    payload.append("longitude", hotel.longitude);
    payload.append("price", hotel.price);
    payload.append("rating", hotel.rating);
    payload.append("description", hotel.description);
    selectedFiles.forEach((file) => payload.append("images", file));

    try {
      const response = await fetch("http://localhost:5000/hotels", {
        method: "POST",
        body: payload,
      });

      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.error || "Could not save hotel");
      }

      const savedHotel = await response.json();
      navigate(`/view/${savedHotel.id}`);
    } catch (error) {
      setMessageError(true);
      setMessage(error.message || "Could not save hotel. Please try again.");
    }
  };

  if (isEdit && isLoadingEdit) {
    return null;
  }

  if (isEdit && !editHotel) {
    return (
      <div className="page">

        <Helmet>
        <title>Add Hotel Page </title>
        <meta
          name="description"
          content="Find and manage hotels easily."
        />
      </Helmet>
        <Nav />
        <main className="add-hotel-page">
          <section className="add-hotel-hero">
            <div className="add-hotel-hero-inner">
              <h1>Hotel not found</h1>
              <p className="lead">This listing is not available to update.</p>
              <p>
                <Link to="/update" className="geo-btn" style={{ display: "inline-block", lineHeight: "36px" }}>
                  Back to hotels
                </Link>
              </p>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="page">
      <Helmet>
  <title>Add Hotel | RHS Hotels Management</title>
  <meta
    name="description"
    content="Add new hotel information including name, location, price, rating, description, and images."
  />
  <meta
    name="keywords"
    content="add hotel, create hotel, hotel management, hotel details"
  />
</Helmet>
      <Nav />
      <main className="add-hotel-page">
        <section className="add-hotel-hero">
          <div className="add-hotel-hero-inner">
            <p className="eyebrow">{isEdit ? "Edit listing" : "List a property"}</p>
            <h1>{isEdit ? "Update hotel" : "Add a new hotel"}</h1>
            <p className="lead">
              {isEdit
                ? "Change photos, rates or map coordinates. The live preview updates as you type."
                : "Enter photos, rates and map coordinates. The live preview on the right updates as you type."}
            </p>
          </div>
        </section>

        <div className="add-hotel-layout">
          <form className="add-hotel-form" onSubmit={handleSubmit}>
            <h2>Hotel details</h2>
            <div className="add-hotel-grid">
              <div className="add-hotel-field">
                <label htmlFor="hotelName">Hotel name</label>
                <input
                  id="hotelName"
                  name="hotelName"
                  value={form.hotelName}
                  onChange={updateField}
                  placeholder="Grand Palace Hotel"
                />
              </div>

              <div className="add-hotel-field">
                <label htmlFor="price">Price per night (₹)</label>
                <input
                  id="price"
                  name="price"
                  type="number"
                  min="1"
                  value={form.price}
                  onChange={updateField}
                  placeholder="4200"
                />
              </div>

              <div className="add-hotel-field full">
                <label htmlFor="location">Location</label>
                <div className="geo-row">
                  <input
                    id="location"
                    name="location"
                    value={form.location}
                    onChange={updateField}
                    placeholder="Fairlands, Salem"
                  />
                  <button type="button" className="geo-btn" onClick={findOnMap}>
                    Find on map
                  </button>
                </div>
                {geoStatus ? (
                  <p className={`geo-status${geoError ? " error" : ""}`}>
                    {geoStatus}
                  </p>
                ) : (
                  <p className="add-hotel-hint">
                    Search the address, or type latitude and longitude below.
                  </p>
                )}
              </div>

              <div className="add-hotel-field">
                <label htmlFor="latitude">Latitude</label>
                <input
                  id="latitude"
                  name="latitude"
                  value={form.latitude}
                  onChange={updateField}
                  placeholder="11.6643"
                />
              </div>

              <div className="add-hotel-field">
                <label htmlFor="longitude">Longitude</label>
                <input
                  id="longitude"
                  name="longitude"
                  value={form.longitude}
                  onChange={updateField}
                  placeholder="78.1460"
                />
              </div>

              <div className="add-hotel-field">
                <label htmlFor="rating">Rating</label>
                <input
                  id="rating"
                  name="rating"
                  value={form.rating}
                  onChange={updateField}
                  placeholder="8.4"
                />
              </div>

              <div className="add-hotel-field full">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={form.description}
                  onChange={updateField}
                  placeholder="City hotel with AC rooms, restaurant and free parking."
                />
              </div>

              <div className="add-hotel-field full">
                <label htmlFor="images">Hotel images</label>
                <input
                  id="images"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(event) => {
                    readFiles(event.target.files);
                    event.target.value = "";
                  }}
                />
                <p className="add-hotel-hint">
                  You can select more than one photo. The first image is the cover.
                </p>
                {images.length > 0 && (
                  <div className="image-picks">
                    {images.map((item, index) => (
                      <img
                        key={`${item.name}-${index}`}
                        className="image-pick"
                        src={item.src}
                        alt={item.name || `Hotel photo ${index + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="add-hotel-actions">
              <button type="submit">{isEdit ? "Save changes" : "Save hotel"}</button>
              <button type="button" className="secondary" onClick={resetForm}>
                {isEdit ? "Reset fields" : "Clear form"}
              </button>
            </div>
            {message ? (
              <p className={`add-hotel-message${messageError ? " error" : ""}`}>
                {message}
              </p>
            ) : null}
          </form>

          <aside className="add-hotel-preview">
            <h2>Live preview</h2>
            <article className="preview-card">
              {preview.src ? (
                <img
                  className="preview-hero"
                  src={preview.src}
                  alt={preview.hotelName}
                />
              ) : (
                <div className="preview-placeholder">Hotel image preview</div>
              )}
              {preview.images.length > 1 && (
                <div className="preview-thumbs">
                  {preview.images.slice(0, 6).map((item, index) => (
                    <img
                      key={`${item.name}-${index}`}
                      src={item.src}
                      alt={`Preview ${index + 1}`}
                    />
                  ))}
                </div>
              )}
              <div className="preview-body">
                <div className="preview-top">
                  <h3>{preview.hotelName}</h3>
                  <span className="rating">{preview.rating}</span>
                </div>
                <p className="location">{preview.location}</p>
                <p className="preview-coords">
                  <span>Latitude: {form.latitude || "—"}</span>
                  <span>Longitude: {form.longitude || "—"}</span>
                </p>
                <p className="desc">{preview.description}</p>
                <p className="price">
                  {preview.price} <span>/ night</span>
                </p>
              </div>
            </article>
            <HotelMap
              latitude={mapCoords.latitude}
              longitude={mapCoords.longitude}
              hotelName={preview.hotelName}
              location={preview.location}
            />
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AddHotel;
