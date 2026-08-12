import React, { useContext } from "react";
import { io } from "socket.io-client";
import { useState, useEffect } from "react";
import AppLayout from "../layouts/AppLayout";
import Header from "../components/Header";
import MapView from "../components/MapView";
import RideRequestPanel from "../components/RideRequestPanel";
import RideOptionsPanel from "../components/RideOptionsPanel";
import SearchingDriverPanel from "../components/SearchingDriverPanel";
import DriverAcceptedPanel from "../components/DriverAcceptedPanel";
import RideInProgressPanel from "../components/RideInProgressPanel";
import RideCompletePanel from "../components/RideCompletePanel";
import ScreenLoader from "../components/ScreenLoader";
import { AuthContext } from "../context/AuthContext";

const socket = io("https://ride-hailing-backend-coan.onrender.com", {
  reconnection: true,
  reconnectionAttempts: 5,
});

const fetchCoordinates = async (address) => {
  // Nominatim is free but requires a descriptive User-Agent or email in production
  const endpoint = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`;

  try {
    const response = await fetch(endpoint);
    const data = await response.json();

    if (data && data.length > 0) {
      return {
        address: data[0].display_name,
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
      };
    }
  } catch (error) {
    console.error("Geocoding error:", error);
  }
  return null;
};

// Promisified GPS Fetcher to pause execution until coordinates are found
const getCurrentGPSLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser."));
    } else {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          reject(error);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
      );
    }
  });
};

function RideFlow() {
  const [appState, setAppState] = useState("request"); // 'request' | 'options' | 'searching' | 'accepted' | 'in_progress' | 'completed'

  const [pickupLocation, setPickupLocation] = useState("");
  const [dropoffLocation, setDropoffLocation] = useState("");
  const [rideId, setRideId] = useState(null);
  const [driverDetails, setDriverDetails] = useState(null);
  const [driverLocation, setDriverLocation] = useState(null);
  const [activeRide, setActiveRide] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("user") || "123";
  const { user } = useContext(AuthContext);

  const getCleanUserId = () => {
    const stored =
      localStorage.getItem("userId") || localStorage.getItem("user");
    if (!stored) return "123";

    try {
      // If it's a JSON object string like {"_id": "6a61...", "name": "..."}, parse it!
      const parsed = JSON.parse(stored);
      return parsed._id || parsed.id || stored;
    } catch (e) {
      // If JSON.parse fails, it means it's already a plain ID string
      return stored;
    }
  };

  useEffect(() => {
    const hydrateRiderSession = async () => {
      if (!user || !user._id) {
        console.log("⏳ Waiting for user data to load...");
        return;
      }

      console.log("🔄 Hydration started for user:", user._id);

      // Ensure socket room is joined
      if (socket.connected) {
        socket.emit("joinUserRoom", user._id);
      } else {
        socket.on("connect", () => socket.emit("joinUserRoom", user._id));
      }

      try {
        const response = await fetch(
          "https://ride-hailing-backend-coan.onrender.com/api/rides/current/user",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const data = await response.json();

        if (data.ride) {
          console.log("🚗 Active ride recovered:", data.ride);
          setActiveRide(data.ride);
          setRideId(data.ride._id);

          if (data.ride.pickupLocation?.address)
            setPickupLocation(data.ride.pickupLocation.address);
          if (data.ride.dropoffLocation?.address)
            setDropoffLocation(data.ride.dropoffLocation.address);

          switch (data.ride.status) {
            case "requested":
              setAppState("searching");
              setIsSearching(true);
              break;
            case "accepted":
              setAppState("accepted");
              setIsSearching(false);
              if (data.ride.driver) setDriverDetails(data.ride.driver);
              break;
            case "in_progress":
              setAppState("in_progress");
              setIsSearching(false);
              if (data.ride.driver) setDriverDetails(data.ride.driver);
              break;
            default:
              setAppState("request");
              setIsSearching(false);
          }
        } else {
          console.log("✅ No active ride. Rider is idle.");
          setAppState("request");
        }
      } catch (error) {
        console.error("❌ Failed to hydrate rider session:", error);
      }
    };

    hydrateRiderSession();
  }, [user, token]);

  useEffect(() => {
    socket.onAny((eventName, ...args) => {
      console.log(`🔔 SOCKET EVENT: [${eventName}]`, args);
    });

    socket.on("rideAccepted", (data) => {
      console.log("🎉 RIDE ACCEPTED:", data);
      setActiveRide(data);
      setDriverDetails(data.driver);
      if (data._id || data.id || data.rideId) {
        setRideId(data._id || data.id || data.rideId);
      }
      setAppState("accepted");
    });

    socket.on("liveLocation", (data) => {
      setDriverLocation({ lat: data.lat, lng: data.lng });
    });

    socket.on("rideStarted", (data) => {
      console.log("🚕 RIDE STARTED:", data);
      setAppState("in_progress");
      if (data.ride) setActiveRide(data.ride);
    });

    socket.on("rideCompleted", () => {
      setAppState("completed");
    });

    socket.on("rideCancelled", (data) => {
      console.log("🚫 RIDE CANCELLED:", data);
      if (data.cancelledBy === "driver")
        alert("Your driver has cancelled the ride.");
      else if (data.cancelledBy === "rider") alert("You canceled the ride");
      else alert("Your ride has been cancelled.");

      setAppState("request");
      setRideId(null);
      setActiveRide(null);
      setDriverDetails(null);
      setDriverLocation(null);
      setPickupLocation("");
      setDropoffLocation("");
    });

    return () => {
      // Clean up event listeners so they don't multiply on re-renders
      socket.off("rideAccepted");
      socket.off("liveLocation");
      socket.off("rideStarted");
      socket.off("rideCompleted");
      socket.off("rideCancelled");
      socket.offAny();
    };
  }, []);

  const handleFindRide = async (pickupInput, dropoffInput) => {
    setIsSearching(true);

    try {
      let pickupData;

      if (
        pickupInput.toLowerCase() === "current location" ||
        pickupInput === ""
      ) {
        try {
          const coords = await getCurrentGPSLocation();
          pickupData = {
            address: "Current Location",
            lat: coords.lat,
            lng: coords.lng,
          };
        } catch (gpsError) {
          console.warn("GPS Request Failed:", gpsError);
          alert(
            "Could not access your GPS location. Please type your pickup address manually.",
          );
          setIsSearching(false);
          return;
        }
      } else {
        pickupData = await fetchCoordinates(pickupInput);
      }

      // Geocode the destination
      const dropoffData = await fetchCoordinates(dropoffInput);

      // Validation check
      if (!pickupData || !dropoffData) {
        alert(
          "We couldn't find one of those locations. Please try a different address.",
        );
        setIsSearching(false);
        return;
      }

      // 3. Save the full objects to your state!
      setPickupLocation(pickupData);
      setDropoffLocation(dropoffData);

      // 4. Move to the next screen to pick a car
      setAppState("options");
    } catch (error) {
      console.error("Error finding route:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleConfirmRide = async (rideDetails) => {
    // rideDetails should ideally come from your RideOptionsPanel
    setAppState("searching");

    try {
      //  Force strict types to guarantee Mongoose validation passes
      const safeFare = Number(rideDetails?.price);
      const finalFare = isNaN(safeFare) ? 12.5 : safeFare;

      // Helper to safely extract address string whether state is an object or string
      const getAddress = (loc, fallback) => {
        if (typeof loc === "string") return loc;
        if (loc && typeof loc.address === "string") return loc.address;
        return fallback;
      };

      //  Construct the payload
      const payload = {
        pickupLocation: {
          address: getAddress(pickupLocation, "Current Location"),
          lat: pickupLocation?.lat,
          lng: pickupLocation?.lng,
        },
        dropoffLocation: {
          address: getAddress(dropoffLocation, "Destination"),
          lat: dropoffLocation?.lat,
          lng: dropoffLocation?.lng,
        },
        vehicleType: rideDetails?.name || "Ride Standard",
        fare: finalFare,
      };

      console.log("🚀 FINAL PAYLOAD BEING SENT:", payload);

      const response = await fetch(
        "https://ride-hailing-backend-coan.onrender.com/api/rides/book",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        },
      );

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Failed to book ride");

      const newRideId =
        data.data?._id ||
        data.data?.id ||
        data.rideId ||
        data.ride?._id ||
        data._id;

      if (newRideId) {
        console.log("✅ Ride booked successfully. ID:", newRideId);
        setRideId(newRideId);
        setActiveRide(data.data || data.ride || data); // Store the full ride object so we can access it later
      } else {
        console.error(
          "⚠️ Backend did not return a recognizable ride ID!",
          data,
        );
      }
    } catch (error) {
      console.error("Booking Error:", error);
      alert(error.message);
      setAppState("options"); // Send them back to options if it fails
    }
  };

  const handleCancelRequest = async () => {
    const targetRideId = rideId || activeRide?._id || activeRide?.id;

    if (!targetRideId) {
      console.warn("⚠️ No active ride ID found to cancel. Resetting UI only.");
      setAppState("request");
      return;
    }

    try {
      console.log(`🛑 Sending Cancel Request for Ride ID: ${targetRideId}`);

      const response = await fetch(
        `https://ride-hailing-backend-coan.onrender.com/api/rides/${targetRideId}/cancel`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      const resData = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(resData.message || "Failed to cancel ride");
      }

      console.log("✅ Ride Successfully Cancelled in DB:", resData);

      // Completely reset all state so no ghost map markers remain
      setAppState("request");
      setRideId(null);
      setActiveRide(null);
      setDriverDetails(null);
      setDriverLocation(null);
      setPickupLocation("");
      setDropoffLocation("");
    } catch (error) {
      console.error("Cancel Request Error:", error);
      alert(error.message);
      setAppState("request");
    }
  };
  const handleDriverPickup = () => setAppState("in-progress");

  const handleBackToHome = () => {
    setAppState("request");
    setRideId(null);
    setDriverDetails(null);
    setPickupLocation("");
    setDropoffLocation("");
  };
  return (
    <AppLayout>
      <Header />
      <ScreenLoader>
        <div className="relative flex-1 w-full flex flex-col">
          <MapView
            driverLocation={driverLocation}
            pickupLocation={pickupLocation}
            dropoffLocation={dropoffLocation}
            rideState={appState}
          />

          {/* Render panels based on current app state */}
          {appState === "request" && (
            <RideRequestPanel onFindRide={handleFindRide} />
          )}

          {appState === "options" && (
            <RideOptionsPanel
              pickupLocation={pickupLocation}
              dropoffLocation={dropoffLocation}
              onBack={() => setAppState("request")}
              onConfirm={handleConfirmRide}
            />
          )}

          {appState === "searching" && (
            <SearchingDriverPanel onCancel={handleCancelRequest} />
          )}

          {appState === "accepted" && (
            <DriverAcceptedPanel
              rideData={activeRide}
              onCancel={handleCancelRequest}
              onDriverArrive={handleDriverPickup}
            />
          )}

          {appState === "in_progress" && (
            <RideInProgressPanel rideData={activeRide} />
          )}

          {appState === "completed" && (
            <RideCompletePanel
              onHome={handleBackToHome}
              rideData={activeRide}
            />
          )}
        </div>
      </ScreenLoader>
    </AppLayout>
  );
}

export default RideFlow;
