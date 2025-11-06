import React, { useState, useEffect } from "react";
import { listCrop, buyCrop, getCrop, getMyListings, getMyPurchases, getAllAvailableCrops, connectWallet } from "./marketplaceWeb3";
import { 
  animate, 
  AnimatePresence, 
  MotionConfig
} from "framer-motion";

const Marketplace = () => {
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [cropId, setCropId] = useState("");
  const [cropDetails, setCropDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [section, setSection] = useState("list"); 
  const [showListSuccess, setShowListSuccess] = useState(false);
  const [showBuySuccess, setShowBuySuccess] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [myListings, setMyListings] = useState([]);
  const [myPurchases, setMyPurchases] = useState([]);
  const [availableCrops, setAvailableCrops] = useState([]);

  const handleListCrop = async () => {
    console.log("🔹 Listing Crop: ", name, quantity, price);

    if (!name || quantity <= 0 || price <= 0) {
      alert("⚠️ Please enter valid details!");
      return;
    }

    // Connect wallet for blockchain listing
    if (!walletAddress) {
      try {
        await handleConnectWallet();
      } catch (error) {
        alert("❌ Please connect your wallet to list crops on blockchain!");
        return;
      }
    }

    setLoading(true);
    try {
      // List on blockchain
      await listCrop(name, Number(quantity), Number(price));
      setLoading(false);
      
      // Reset fields
      setName("");
      setQuantity("");
      setPrice("");
      
      setShowListSuccess(true);
      setTimeout(() => {
        setShowListSuccess(false);
      }, 3000);
      
      // Reload profile data and available crops
      loadProfileData();
      loadAvailableCrops();
      
      console.log("✅ Crop listed on blockchain!");
    } catch (error) {
      console.error("❌ Error listing crop:", error);
      alert("❌ Listing Failed: " + error.message);
      setLoading(false);
    }
  };

  const handleBuyCrop = async () => {
    // Connect wallet if not connected
    if (!walletAddress) {
      try {
        await handleConnectWallet();
      } catch (error) {
        alert("❌ Please connect your wallet to buy crops!");
        return;
      }
    }

    setLoading(true);
    try {
      await buyCrop(cropId, cropDetails[4]);
      setLoading(false);
      setCropDetails(null);
      setCropId("");
      
      setShowBuySuccess(true);
      setTimeout(() => {
        setShowBuySuccess(false);
      }, 3000);
      
      // Reload profile data and available crops
      loadProfileData();
      loadAvailableCrops();
    } catch (error) {
      console.error("❌ Error purchasing crop:", error);
      alert("❌ Purchase Failed: " + error.message);
      setLoading(false);
    }
  };

  const handleFetchCrop = async () => {
    if (!cropId) {
      alert("⚠️ Please enter a crop ID!");
      return;
    }
    
    setLoading(true);
    try {
      const crop = await getCrop(cropId);
      setCropDetails(crop);
      setLoading(false);
    } catch (error) {
      console.error("❌ Error fetching crop:", error);
      alert("❌ Fetch Failed: " + error.message);
      setLoading(false);
    }
  };

  const animateIn = (element) => {
    animate(
      element,
      { y: [20, 0], opacity: [0, 1] },
      { duration: 0.5, ease: "easeOut" }
    );
  };

  const animatePress = (element) => {
    animate(
      element,
      { scale: 0.98 },
      { duration: 0.1, ease: "easeOut" }
    ).then(() => {
      animate(
        element,
        { scale: 1 },
        { duration: 0.2, ease: "easeOut" }
      );
    });
  };

  useEffect(() => {
    const currentSection = document.getElementById(section + "-section");
    if (currentSection) {
      animateIn(currentSection);
    }
    
    // Load available crops when buy section is opened
    if (section === "buy") {
      loadAvailableCrops();
    }
    
    // Load profile data when profile section is opened
    if (section === "profile" && walletAddress) {
      loadProfileData();
      loadAvailableCrops();
    }
  }, [section]);

  // Removed auto-connect on mount - wallet connects when user takes action

  const handleConnectWallet = async () => {
    try {
      const address = await connectWallet();
      setWalletAddress(address);
      loadProfileData();
      loadAvailableCrops();
    } catch (error) {
      console.error("Wallet connection failed:", error);
    }
  };

  const loadProfileData = async () => {
    try {
      const listings = await getMyListings();
      const purchases = await getMyPurchases();
      
      const listingsDetails = await Promise.all(
        listings.map(async (id) => {
          const crop = await getCrop(id);
          return { id, ...crop };
        })
      );
      
      const purchasesDetails = await Promise.all(
        purchases.map(async (id) => {
          const crop = await getCrop(id);
          return { id, ...crop };
        })
      );
      
      setMyListings(listingsDetails);
      setMyPurchases(purchasesDetails);
    } catch (error) {
      console.error("Error loading profile:", error);
    }
  };

  const loadAvailableCrops = async () => {
    setLoading(true);
    try {
      console.log("📦 Loading available crops...");
      const cropIds = await getAllAvailableCrops();
      console.log("Found crop IDs:", cropIds);
      
      if (!cropIds || cropIds.length === 0) {
        console.log("No crops available");
        setAvailableCrops([]);
        setLoading(false);
        return;
      }
      
      const cropsDetails = await Promise.all(
        cropIds.map(async (id) => {
          try {
            const crop = await getCrop(id);
            console.log(`Crop ${id}:`, crop);
            return { id, ...crop };
          } catch (e) {
            console.error(`Error loading crop ${id}:`, e);
            return null;
          }
        })
      );
      
      const validCrops = cropsDetails.filter(c => c !== null);
      console.log("✅ Loaded crops:", validCrops);
      setAvailableCrops(validCrops);
    } catch (error) {
      console.error("❌ Error loading available crops:", error);
      console.error("Full error:", error);
      setAvailableCrops([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-6">
      <MotionConfig>
        <div 
          id="marketplace-container"
          className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          <div className="bg-gradient-to-r from-gray-900 to-black p-6 text-white">
            <h1 className="text-3xl font-bold flex items-center">
              <svg className="w-8 h-8 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span>
                FarmChain Marketplace
              </span>
            </h1>
            <p className="text-gray-300 mt-2">Buy and sell crops on the blockchain</p>
          </div>

          {/* the Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setSection("list")}
              className={`flex-1 py-4 font-medium text-center transition-all duration-300 ${
                section === "list"
                  ? "text-gray-900 border-b-2 border-black bg-gray-50"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <div className="flex justify-center items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg> List Crops
              </div>
            </button>
            <button
              onClick={() => setSection("buy")}
              className={`flex-1 py-4 font-medium text-center transition-all duration-300 ${
                section === "buy"
                  ? "text-gray-900 border-b-2 border-black bg-gray-50"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <div className="flex justify-center items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg> Buy Crops
              </div>
            </button>
            <button
              onClick={() => setSection("profile")}
              className={`flex-1 py-4 font-medium text-center transition-all duration-300 ${
                section === "profile"
                  ? "text-gray-900 border-b-2 border-black bg-gray-50"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <div className="flex justify-center items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg> Profile
              </div>
            </button>
          </div>

          <div className="p-6">
            {/* edhi List Crop Section */}
            {section === "list" && (
              <div 
                id="list-section"
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                  <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg> List a Crop
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <input
                      type="text"
                      placeholder="Crop Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-black focus:ring-2 focus:ring-gray-200"
                    />
                  </div>
                  
                  <div>
                    <input
                      type="number"
                      placeholder="Quantity (kg)"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-black focus:ring-2 focus:ring-gray-200"
                    />
                  </div>
                  
                  <div>
                    <input
                      type="number"
                      placeholder="Price (wei)"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-black focus:ring-2 focus:ring-gray-200"
                    />
                  </div>
                  
                  <button
                    onClick={(e) => {
                      animatePress(e.currentTarget);
                      handleListCrop();
                    }}
                    disabled={loading}
                    className="w-full bg-black hover:bg-gray-800 text-white font-medium py-3 px-6 rounded-lg shadow-md transform transition-all flex justify-center items-center"
                  >
                    {loading ? (
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg> List Crop
                      </>
                    )}
                  </button>
                  
                  <AnimatePresence>
                    {showListSuccess && (
                      <div 
                        className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-md mt-4"
                        ref={(el) => el && animateIn(el)}
                      >
                        <div className="flex items-center">
                          <div className="py-1">
                            <svg className="fill-current h-6 w-6 text-green-500 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                              <path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zm12.73-1.41A8 8 0 1 0 4.34 4.34a8 8 0 0 0 11.32 11.32zM6.7 9.29L9 11.6l4.3-4.3 1.4 1.42L9 14.4l-3.7-3.7 1.4-1.42z"/>
                            </svg>
                          </div>
                          <div>
                            <p className="font-bold">Success!</p>
                            <p className="text-sm">Your crop has been listed successfully.</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {/* edhi Buy Crop Section */}
            {section === "buy" && (
              <div 
                id="buy-section"
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                  <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg> Available Crops
                </h2>
                
                {/* Show all available crops */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {loading && (
                    <div className="col-span-2 text-center py-8">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
                      <p className="mt-4 text-gray-600">Loading crops...</p>
                    </div>
                  )}
                  
                  {!loading && availableCrops.length === 0 && (
                    <div className="col-span-2 text-center py-8 bg-gray-50 rounded-lg">
                      <p className="text-gray-600">No crops available yet. Be the first to list!</p>
                    </div>
                  )}
                  
                  {!loading && availableCrops.map((crop) => (
                    <div key={crop.id} className="bg-white border-2 border-gray-200 rounded-lg p-4 hover:border-black transition-all cursor-pointer"
                         onClick={() => {
                           setCropId(crop.id);
                           handleFetchCrop();
                         }}>
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-lg text-gray-900">{crop[2] || 'Unknown Crop'}</h3>
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium">
                          Available
                        </span>
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p><strong>Quantity:</strong> {crop[3]?.toString()} kg</p>
                        <p><strong>Price:</strong> {crop[4]?.toString()} wei</p>
                        <p className="text-xs text-gray-400">ID: #{crop.id?.toString()}</p>
                      </div>
                      <button className="mt-3 w-full bg-black text-white py-2 rounded hover:bg-gray-800 transition-all">
                        View Details
                      </button>
                    </div>
                  ))}
                </div>
                
                <div className="space-y-4">
                  <div className="flex space-x-3">
                    <div className="flex-grow">
                      <input
                        type="number"
                        placeholder="Enter Crop ID"
                        value={cropId}
                        onChange={(e) => setCropId(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-black focus:ring-2 focus:ring-gray-200"
                      />
                    </div>
                    
                    <button
                      onClick={(e) => {
                        animatePress(e.currentTarget);
                        handleFetchCrop();
                      }}
                      disabled={loading}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-900 font-medium py-3 px-6 rounded-lg shadow-md transform transition-all"
                    >
                      {loading ? (
                        <svg className="animate-spin h-5 w-5 text-gray-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <>
                          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg> Find
                        </>
                      )}
                    </button>
                  </div>
                  
                  <AnimatePresence>
                    {cropDetails && (
                      <div
                        className="mt-6 bg-gray-50 p-4 rounded-lg border-2 border-gray-200"
                        ref={(el) => el && animateIn(el)}
                      >
                        <h3 className="text-xl font-bold text-gray-900 mb-3">Crop Details</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-white p-3 rounded-md shadow-sm">
                            <p className="text-gray-500 text-sm">Name</p>
                            <p className="font-medium text-gray-900">{cropDetails[0]}</p>
                          </div>
                          <div className="bg-white p-3 rounded-md shadow-sm">
                            <p className="text-gray-500 text-sm">Quantity</p>
                            <p className="font-medium text-gray-900">{cropDetails[1].toString()}</p>
                          </div>
                          <div className="bg-white p-3 rounded-md shadow-sm">
                            <p className="text-gray-500 text-sm">Price (wei)</p>
                            <p className="font-medium text-gray-900">{cropDetails[2].toString()}</p>
                          </div>
                          <div className="bg-white p-3 rounded-md shadow-sm">
                            <p className="text-gray-500 text-sm">Seller</p>
                            <p className="font-medium text-gray-900 truncate">{cropDetails[3]}</p>
                          </div>
                        </div>
                        
                        <button
                          onClick={(e) => {
                            animatePress(e.currentTarget);
                            handleBuyCrop();
                          }}
                          disabled={loading}
                          className="w-full mt-4 bg-black hover:bg-gray-800 text-white font-medium py-3 px-6 rounded-lg shadow-md transform transition-all flex justify-center items-center"
                        >
                          {loading ? (
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          ) : (
                            <>
                              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                              </svg> Buy This Crop
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </AnimatePresence>
                  
                  <AnimatePresence>
                    {showBuySuccess && (
                      <div
                        className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-md mt-4"
                        ref={(el) => el && animateIn(el)}
                      >
                        <div className="flex items-center">
                          <div className="py-1">
                            <svg className="fill-current h-6 w-6 text-green-500 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                              <path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zm12.73-1.41A8 8 0 1 0 4.34 4.34a8 8 0 0 0 11.32 11.32zM6.7 9.29L9 11.6l4.3-4.3 1.4 1.42L9 14.4l-3.7-3.7 1.4-1.42z"/>
                            </svg>
                          </div>
                          <div>
                            <p className="font-bold">Purchase Successful!</p>
                            <p className="text-sm">You have successfully purchased this crop.</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {/* Profile Section */}
            {section === "profile" && (
              <div 
                id="profile-section"
                className="space-y-6"
              >
                <div className="bg-gradient-to-r from-gray-900 to-black text-white p-4 rounded-lg">
                  <h2 className="text-xl font-bold flex items-center mb-2">
                    <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg> My Profile
                  </h2>
                  <p className="text-sm text-gray-300 truncate">Wallet: {walletAddress || "Not Connected"}</p>
                </div>

                {/* My Listings */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg> My Listed Crops ({myListings.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {myListings.length === 0 ? (
                      <p className="text-gray-500 col-span-2">No crops listed yet.</p>
                    ) : (
                      myListings.map((crop) => (
                        <div key={crop.id} className="bg-gray-50 p-4 rounded-lg border-2 border-gray-200">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-bold text-gray-900">{crop[2]}</h4>
                            <span className={`px-2 py-1 text-xs rounded ${crop[5] ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                              {crop[5] ? 'Sold' : 'Available'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">Quantity: {crop[3]?.toString()}</p>
                          <p className="text-sm text-gray-600">Price: {crop[4]?.toString()} wei</p>
                          <p className="text-xs text-gray-400 mt-2">ID: #{crop.id?.toString()}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* My Purchases */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg> My Purchases ({myPurchases.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {myPurchases.length === 0 ? (
                      <p className="text-gray-500 col-span-2">No purchases yet.</p>
                    ) : (
                      myPurchases.map((crop) => (
                        <div key={crop.id} className="bg-green-50 p-4 rounded-lg border-2 border-green-200">
                          <h4 className="font-bold text-gray-900 mb-2">{crop[2]}</h4>
                          <p className="text-sm text-gray-600">Quantity: {crop[3]?.toString()}</p>
                          <p className="text-sm text-gray-600">Paid: {crop[4]?.toString()} wei</p>
                          <p className="text-xs text-gray-400 mt-2">Seller: {crop[1]?.substring(0, 10)}...</p>
                          <p className="text-xs text-gray-400">ID: #{crop.id?.toString()}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 p-4 text-center text-gray-500 text-sm border-t">
            <div className="flex justify-center items-center space-x-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>Powered by FarmChain Technology</span>
            </div>
          </div>
        </div>
      </MotionConfig>
    </div>
  );
};

export default Marketplace;