import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import SignIn from "../components/SignIn";
import SignUp from "../components/SignUp";

function Home() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [showSignIn, setShowSignIn] = useState(false);
    const [showSignUp, setShowSignUp] = useState(true);
    const [storeInfo, setStoreInfo] = useState({
        storeName: "",
        address: "",
        ownerName: ""
    });
    const [isEditing, setIsEditing] = useState(false);

    // Cek status login dan load data toko saat komponen dimuat
    useEffect(() => {
        const user = localStorage.getItem("user");
        const loginData = localStorage.getItem("loginData");
        
        if (user || loginData) {
            try {
                setIsLoggedIn(true);
                
                // Coba ambil data dari login response terlebih dahulu
                if (loginData) {
                    const loginResponse = JSON.parse(loginData);
                    console.log("Login response data:", loginResponse);
                    
                    if (loginResponse.responsData && loginResponse.responsData.data) {
                        const storeData = loginResponse.responsData.data.store[0];
                        const balanceData = loginResponse.responsData.data.balance;
                        
                        setStoreInfo({
                            storeName: storeData.store_name || "",
                            address: storeData.address || "",
                            ownerName: storeData.owner_name || ""
                        });
                        
                        // Simpan juga ke localStorage untuk konsistensi
                        localStorage.setItem("storeInfo", JSON.stringify({
                            address: storeData.address || "",
                            ownerName: storeData.owner_name || ""
                        }));
                        
                        return;
                    }
                }
                
                // Fallback: ambil dari user data biasa
                if (user) {
                    const userData = JSON.parse(user);
                    console.log("User data from localStorage:", userData);
                    
                    // Cek jika user data memiliki store info
                    if (userData.store_name) {
                        setStoreInfo(prev => ({
                            ...prev,
                            storeName: userData.store_name
                        }));
                    }
                    
                    // Load data tambahan toko dari localStorage jika ada
                    const storedStoreInfo = localStorage.getItem("storeInfo");
                    if (storedStoreInfo) {
                        try {
                            const parsedData = JSON.parse(storedStoreInfo);
                            setStoreInfo(prev => ({
                                ...prev,
                                address: parsedData.address || "",
                                ownerName: parsedData.ownerName || ""
                            }));
                        } catch (e) {
                            console.error("Error parsing storeInfo:", e);
                        }
                    }
                }
            } catch (error) {
                console.error("Error loading user data:", error);
            }
        }
    }, []);

    const handleLoginSuccess = () => {
        setIsLoggedIn(true);
        setShowSignIn(false);
        setShowSignUp(false);
        
        // Setelah login, ambil data dari localStorage
        const loginData = localStorage.getItem("loginData");
        if (loginData) {
            try {
                const loginResponse = JSON.parse(loginData);
                if (loginResponse.responsData && loginResponse.responsData.data) {
                    const storeData = loginResponse.responsData.data.store[0];
                    setStoreInfo({
                        storeName: storeData.store_name || "",
                        address: storeData.address || "",
                        ownerName: storeData.owner_name || ""
                    });
                    
                    // Simpan ke localStorage untuk konsistensi
                    localStorage.setItem("storeInfo", JSON.stringify({
                        address: storeData.address || "",
                        ownerName: storeData.owner_name || ""
                    }));
                }
            } catch (error) {
                console.error("Error parsing login data:", error);
            }
        }
    };

    const handleRegisterSuccess = () => {
        setIsLoggedIn(true);
        setShowSignIn(false);
        setShowSignUp(false);
        
        // Setelah register, ambil data user
        const user = localStorage.getItem("user");
        if (user) {
            try {
                const userData = JSON.parse(user);
                setStoreInfo(prev => ({
                    ...prev,
                    storeName: userData.store_name || ""
                }));
            } catch (error) {
                console.error("Error parsing user data:", error);
            }
        }
    };

    const handleSwitchToSignIn = () => {
        setShowSignIn(true);
        setShowSignUp(false);
    };

    const handleSwitchToSignUp = () => {
        setShowSignIn(false);
        setShowSignUp(true);
    };

    const handleLogout = () => {
        localStorage.removeItem("user");
        localStorage.removeItem("loginData");
        localStorage.removeItem("storeInfo");
        setIsLoggedIn(false);
        setShowSignUp(true);
    };

    const handleEditToggle = () => {
        if (isEditing) {
            // Save changes - hanya address dan ownerName yang bisa diubah
            localStorage.setItem("storeInfo", JSON.stringify({
                address: storeInfo.address,
                ownerName: storeInfo.ownerName
            }));
            
            // TODO: Kirim perubahan ke API
            console.log("Saving changes:", {
                address: storeInfo.address,
                ownerName: storeInfo.ownerName
            });
        }
        setIsEditing(!isEditing);
    };

    const handleCancelEdit = () => {
        // Kembalikan ke data sebelumnya dari localStorage
        const storedStoreInfo = localStorage.getItem("storeInfo");
        if (storedStoreInfo) {
            try {
                const parsedData = JSON.parse(storedStoreInfo);
                setStoreInfo(prev => ({
                    ...prev,
                    address: parsedData.address || "",
                    ownerName: parsedData.ownerName || ""
                }));
            } catch (error) {
                console.error("Error parsing storeInfo:", error);
            }
        }
        setIsEditing(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setStoreInfo(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <div className="relative min-h-screen">
            {/* Tampilkan Sign In atau Sign Up berdasarkan state */}
            {!isLoggedIn && showSignIn && (
                <SignIn 
                    onSuccess={handleLoginSuccess} 
                    onSwitchToSignUp={handleSwitchToSignUp} 
                />
            )}
            
            {!isLoggedIn && showSignUp && (
                <SignUp 
                    onSuccess={handleRegisterSuccess} 
                    onSwitchToSignIn={handleSwitchToSignIn} 
                />
            )}

            {/* Konten utama setelah login */}
            {isLoggedIn && (
                <>
                    <Navbar onLogout={handleLogout} />
                    <div className="min-h-screen md:h-screen flex flex-col md:flex-row bg-gray-50">
                        <div className="flex-1 flex justify-between flex-col p-6">
                            <h1 className="font-bold text-4xl md:text-6xl text-blue-400">Welcome to the dashboard</h1>
                            <Link
                                to="/Statistic"
                                className="bg-blue-400 p-4 text-white font-semibold w-40 flex justify-center text-2xl rounded-lg hover:bg-blue-500 transition-colors"
                            >
                                Statistic
                            </Link>
                        </div>
                        <div className="flex-1 p-6 flex items-center justify-center">
                            <div className="bg-white h-auto w-full md:w-130 relative flex flex-col items-start gap-4 justify-center p-8 border-4 border-blue-400 rounded-lg shadow-lg">
                                <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-6 py-2 font-bold text-3xl rounded-lg">
                                    Store Info
                                </div>

                                <div className="flex justify-between items-center w-full mb-4">
                                    <h2 className="text-2xl font-bold text-gray-800">Store Information</h2>
                                    <button
                                        onClick={handleEditToggle}
                                        className={`px-4 py-2 rounded font-medium ${
                                            isEditing 
                                                ? "bg-green-500 text-white hover:bg-green-600" 
                                                : "bg-blue-500 text-white hover:bg-blue-600"
                                        }`}
                                    >
                                        {isEditing ? "Save Changes" : "Edit Info"}
                                    </button>
                                </div>

                                <div className="w-full space-y-4">
                                    {/* Store Name - Hanya Baca */}
                                    <div>
                                        <label className="text-xl font-bold text-gray-700 mb-2 block">Store name:</label>
                                        <div className="border-2 border-transparent text-xl p-3 w-full bg-gray-100 rounded-lg">
                                            {storeInfo.storeName || "No store name set"}
                                        </div>
                                        <p className="text-sm text-gray-500 mt-1">Store name cannot be changed</p>
                                    </div>

                                    {/* Address - Bisa Diedit */}
                                    <div>
                                        <label className="text-xl font-bold text-gray-700 mb-2 block">Address:</label>
                                        {isEditing ? (
                                            <textarea
                                                name="address"
                                                className="border-2 border-blue-400 text-xl p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="Enter store address"
                                                value={storeInfo.address}
                                                onChange={handleInputChange}
                                                rows="3"
                                            />
                                        ) : (
                                            <div className="border-2 border-transparent text-xl p-3 w-full bg-gray-100 rounded-lg">
                                                {storeInfo.address || "No address set"}
                                            </div>
                                        )}
                                    </div>

                                    {/* Owner Name - Bisa Diedit */}
                                    <div>
                                        <label className="text-xl font-bold text-gray-700 mb-2 block">Owner name:</label>
                                        {isEditing ? (
                                            <input
                                                name="ownerName"
                                                className="border-2 border-blue-400 text-xl p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                type="text"
                                                placeholder="Enter owner name"
                                                value={storeInfo.ownerName}
                                                onChange={handleInputChange}
                                            />
                                        ) : (
                                            <div className="border-2 border-transparent text-xl p-3 w-full bg-gray-100 rounded-lg">
                                                {storeInfo.ownerName || "No owner name set"}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {isEditing && (
                                    <div className="flex justify-end space-x-3 w-full mt-4">
                                        <button
                                            onClick={handleCancelEdit}
                                            className="px-4 py-2 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export default Home;