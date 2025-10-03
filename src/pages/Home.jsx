import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import SignIn from "../components/SignIn";
import SignUp from "../components/SignUp";

// Base URL API Anda
const BASE_API_URL = "https://kfbt6z3d-3000.asse.devtunnels.ms/store";

function Home() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    // Default ke showSignIn true agar saat pertama kali load, form login muncul
    const [showSignIn, setShowSignIn] = useState(true);
    const [showSignUp, setShowSignUp] = useState(false);
    const [storeInfo, setStoreInfo] = useState({
        storeName: "",
        address: "",
        ownerName: ""
    });
    const [isEditing, setIsEditing] = useState(false);
    const [tempStoreInfo, setTempStoreInfo] = useState(storeInfo);
    const [loading, setLoading] = useState(false);
    const [alertMessage, setAlertMessage] = useState({ type: '', message: '' });

    // Helper: Mengambil Token JWT dari localStorage
    const getAuthToken = () => {
        const user = localStorage.getItem("user");
        if (user) {
            try {
                const userData = JSON.parse(user);
                return userData.token;
            } catch (e) {
                console.error("Error parsing user data:", e);
                return null;
            }
        }
        return null;
    };
    
    // Helper: Ekstraksi data toko dari objek 'user' di localStorage
    const extractStoreData = (userData) => {
        // Objek userData kini sudah berisi responsData (sesuai yang disimpan di SignIn.js)
        const loginResponse = userData.responsData;
        
        if (loginResponse && loginResponse.data && loginResponse.data.store && loginResponse.data.store.length > 0) {
            const storeData = loginResponse.data.store[0];
            return {
                storeName: storeData.store_name || "",
                address: storeData.address || "",
                ownerName: storeData.owner_name || ""
            };
        }
        return { storeName: "", address: "", ownerName: "" };
    };

    // FUNGSI INI DIPERBAIKI: MEMBACA DARI KUNCI "user"
    useEffect(() => {
        const userJson = localStorage.getItem("user");
        
        if (userJson) {
            try {
                const userData = JSON.parse(userJson);
                
                if (userData && userData.token) {
                    const extractedInfo = extractStoreData(userData);
                    
                    setIsLoggedIn(true);
                    setStoreInfo(extractedInfo);
                    setTempStoreInfo(extractedInfo);
                    setShowSignIn(false);
                    setShowSignUp(false);
                } else {
                    // Token hilang/tidak valid
                    localStorage.removeItem("user");
                    setIsLoggedIn(false);
                    setShowSignIn(true);
                }
            } catch (error) {
                console.error("Error parsing user data from localStorage:", error);
                localStorage.removeItem("user");
                setIsLoggedIn(false);
                setShowSignIn(true);
            }
        } else {
            // Tidak ada data, paksa tampilkan Sign In
            setIsLoggedIn(false);
            setShowSignIn(true);
            setShowSignUp(false);
        }
    }, []);

    // Fungsi ini dipanggil dari SignIn setelah login berhasil
    const handleLoginSuccess = (loginResponse) => {
        setIsLoggedIn(true);
        setShowSignIn(false);
        setShowSignUp(false);
        
        // Baca data dari localStorage yang baru disimpan oleh SignIn.js
        const userJson = localStorage.getItem("user");
        if (userJson) {
            const userData = JSON.parse(userJson);
            const extractedInfo = extractStoreData(userData);

            setStoreInfo(extractedInfo);
            setTempStoreInfo(extractedInfo);
        } else {
            // Fallback jika localStorage belum terupdate (jarang terjadi)
            const extractedInfo = extractStoreData({ responsData: loginResponse.responsData });
            setStoreInfo(extractedInfo);
            setTempStoreInfo(extractedInfo);
        }
    };

    const handleRegisterSuccess = () => {
        setIsLoggedIn(true);
        setShowSignIn(false);
        setShowSignUp(false);
        // Setelah register, disarankan memuat data toko jika ada atau mengarahkan ke setup
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
        localStorage.removeItem("user"); // Hapus kunci utama
        localStorage.removeItem("loginData"); // Hapus kunci lama (jaga-jaga)
        setIsLoggedIn(false);
        setShowSignIn(true); // Tampilkan Sign In
        setShowSignUp(false);
        setStoreInfo({ storeName: "", address: "", ownerName: "" });
        setTempStoreInfo({ storeName: "", address: "", ownerName: "" });
        setAlertMessage({ type: '', message: '' });
    };

    // Fungsi yang direvisi untuk mengirim data ke Backend
    const handleEditToggle = async () => {
        if (isEditing) {
            setLoading(true);
            setAlertMessage({ type: '', message: '' });
            const token = getAuthToken();

            if (!token) {
                setAlertMessage({ type: 'error', message: 'Authentication required. Please log in again.' });
                setLoading(false);
                return;
            }

            try {
                const response = await axios.put(
                    `${BASE_API_URL}/mystore/edit`,
                    {
                        owner_name: tempStoreInfo.ownerName,
                        address: tempStoreInfo.address,
                    },
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                    }
                );

                if (response.status === 201) {
                    // Update state utama
                    setStoreInfo(prev => ({
                        ...prev,
                        address: tempStoreInfo.address,
                        ownerName: tempStoreInfo.ownerName,
                    }));
                    
                    // Penting: Update localStorage 'user'
                    const userJson = localStorage.getItem("user");
                    if (userJson) {
                        const userData = JSON.parse(userJson);
                        if (userData.responsData.data.store.length > 0) {
                            userData.responsData.data.store[0].address = tempStoreInfo.address;
                            userData.responsData.data.store[0].owner_name = tempStoreInfo.ownerName;
                            localStorage.setItem("user", JSON.stringify(userData));
                        }
                    }

                    setIsEditing(false);
                    setAlertMessage({ type: 'success', message: 'Store information updated successfully! 🎉' });
                }
            } catch (error) {
                console.error("Error updating store info:", error);
                const msg = error.response?.data?.message || 'Failed to update store info. Check your API URL or connection.';
                setAlertMessage({ type: 'error', message: msg });
                setTempStoreInfo(storeInfo);
            } finally {
                setLoading(false);
            }

        } else {
            // Start editing
            setTempStoreInfo(storeInfo);
            setIsEditing(true);
            setAlertMessage({ type: '', message: '' });
        }
    };

    const handleCancelEdit = () => {
        setTempStoreInfo(storeInfo);
        setIsEditing(false);
        setAlertMessage({ type: '', message: '' });
    };

    const handleTempInputChange = (e) => {
        const { name, value } = e.target;
        setTempStoreInfo(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Komponen Alert untuk notifikasi
    const Alert = ({ type, message }) => {
        if (!message) return null;
        const baseStyle = "p-3 rounded-lg text-white font-medium mb-4 w-full text-center";
        const style = type === 'success'
            ? "bg-green-500"
            : "bg-red-500";
        return <div className={`${baseStyle} ${style}`}>{message}</div>;
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
                        
                        {/* Kolom Kiri: Welcome Message */}
                        <div className="flex-1 flex justify-center items-center flex-col p-6">
                            <h1 className="font-bold text-4xl md:text-6xl text-blue-400 text-center">
                                Welcome to the <br/> Seller Homepage
                            </h1>
                            <p className="mt-4 text-gray-600 text-xl">
                                Manage your store, products, and orders here.
                            </p>
                            <Link to="/products" className="mt-6 px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors shadow-md">
                                Go to Products
                            </Link>
                        </div>
                        
                        {/* Kolom Kanan: Store Info */}
                        <div className="flex-1 p-6 flex items-center justify-center">
                            <div className="bg-white h-auto w-full max-w-lg relative flex flex-col items-start gap-4 justify-center p-8 border-4 border-blue-400 rounded-lg shadow-lg mt-12 md:mt-0">
                                
                                <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-6 py-2 font-bold text-3xl rounded-lg shadow-md">
                                    Store Info
                                </div>
                                
                                {/* Notifikasi */}
                                <Alert type={alertMessage.type} message={alertMessage.message} />

                                <div className="flex justify-between items-center w-full mb-4 mt-4">
                                    <h2 className="text-2xl font-bold text-gray-800">Store Details</h2>
                                    <button
                                        onClick={handleEditToggle}
                                        disabled={loading}
                                        className={`px-4 py-2 rounded font-medium transition-colors ${
                                            loading
                                                ? "bg-gray-400 text-white cursor-not-allowed"
                                                : isEditing
                                                ? "bg-green-500 text-white hover:bg-green-600"
                                                : "bg-blue-500 text-white hover:bg-blue-600"
                                        }`}
                                    >
                                        {loading ? "Saving..." : isEditing ? "Save Changes" : "Edit Info"}
                                    </button>
                                </div>

                                <div className="w-full space-y-4">
                                    
                                    {/* Store Name - Hanya Baca */}
                                    <div>
                                        <label className="text-lg font-bold text-gray-700 mb-1 block">Store Name:</label>
                                        <div className="border border-gray-300 text-xl p-3 w-full bg-gray-100 rounded-lg font-medium">
                                            {storeInfo.storeName || "Not Set"}
                                        </div>
                                        <p className="text-sm text-gray-500 mt-1">Store name cannot be changed from here.</p>
                                    </div>

                                    {/* Owner Name - Bisa Diedit */}
                                    <div>
                                        <label className="text-lg font-bold text-gray-700 mb-1 block">Owner Name:</label>
                                        {isEditing ? (
                                            <input
                                                name="ownerName"
                                                className="border-2 border-blue-400 text-xl p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                type="text"
                                                placeholder="Enter owner name"
                                                value={tempStoreInfo.ownerName}
                                                onChange={handleTempInputChange}
                                            />
                                        ) : (
                                            <div className="border border-gray-300 text-xl p-3 w-full bg-gray-100 rounded-lg">
                                                {storeInfo.ownerName || "Not Set"}
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Address - Bisa Diedit */}
                                    <div>
                                        <label className="text-lg font-bold text-gray-700 mb-1 block">Address:</label>
                                        {isEditing ? (
                                            <textarea
                                                name="address"
                                                className="border-2 border-blue-400 text-xl p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="Enter store address"
                                                value={tempStoreInfo.address}
                                                onChange={handleTempInputChange}
                                                rows="3"
                                            />
                                        ) : (
                                            <div className="border border-gray-300 text-xl p-3 w-full bg-gray-100 rounded-lg whitespace-pre-wrap">
                                                {storeInfo.address || "Not Set"}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {isEditing && (
                                    <div className="flex justify-end space-x-3 w-full mt-4">
                                        <button
                                            onClick={handleCancelEdit}
                                            disabled={loading}
                                            className="px-4 py-2 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors shadow disabled:opacity-50"
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