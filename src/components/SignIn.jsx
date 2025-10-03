import React, { useRef, useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// CATATAN: Ganti URL di bawah dengan URL API Anda yang BENAR.
const API_URL = "https://kfbt6z3d-3000.asse.devtunnels.ms/auth/seller/login";

const SignIn = ({ onSuccess, onSwitchToSignUp }) => {
    const userRef = useRef(null);
    const errRef = useRef(null);
    const navigate = useNavigate();

    // State untuk form dan proses
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errMsg, setErrMsg] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    
    useEffect(() => {
        if (userRef.current) {
            userRef.current.focus();
        }
    }, []);

    useEffect(() => {
        setErrMsg('');
        if (showPopup) setShowPopup(false);
    }, [username, password]);

    const handleSignIn = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrMsg('');
        setShowPopup(false);

        try {
            const response = await axios.post(
                API_URL,
                {
                    username,
                    password,
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            console.log("Login Seller Response:", response.data);

            const responseData = response.data.responsData;

            if (!responseData || !responseData.Token) {
                throw new Error("Invalid response structure: responsData or Token missing.");
            }

            // PERBAIKAN FINAL DAN BENAR:
            // Simpan Token dan seluruh responsData di KUNCI TUNGGAL: "user".
            const userToStore = {
                // Token sangat penting untuk otentikasi cepat
                token: responseData.Token,
                // Ini KRITIS untuk Home.js dan Products.js
                responsData: responseData,
            };

            // Simpan HANYA SATU KEY di localStorage: "user".
            localStorage.setItem("user", JSON.stringify(userToStore));
            
            // Hapus key yang membingungkan jika masih ada
            localStorage.removeItem("loginData");

            // Reset form
            setUsername('');
            setPassword('');
            setErrMsg(null);
            
            // Beri tahu komponen Home bahwa login berhasil
            if (onSuccess) onSuccess(response.data);
            
            // Kembalikan navigasi ke Home (/)
            navigate('/');

        } catch (err) {
            console.error("Login failed:", err);
            let message = '';
            
            if (!err.response) {
                message = 'No Server Response. Check Network or CORS configuration on the server.';
            } else if (err.response?.status === 401) {
                message = 'Invalid Username or Password';
            } else if (err.response?.status === 400) {
                message = err.response?.data?.Message || 'Bad Request.';
            } else {
                message = err.response?.data?.Message || 'Login Failed due to server error.';
            }

            setErrMsg(message);
            setShowPopup(true);
            
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-100 bg-opacity-60 flex items-center justify-center z-50">
            <div className="bg-gradient-to-t from-blue-300 to-white p-8 shadow-lg max-w-md w-full flex flex-col gap-4 items-center justify-center">
                
                {/* Judul */}
                <h2 className="text-2xl font-bold text-center text-blue-600">
                    Sign in as Seller
                </h2>

                {/* Form Login */}
                <form onSubmit={handleSignIn} className="w-full">
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        ref={userRef}
                        onChange={(e) => setUsername(e.target.value)}
                        className="border border-gray-300 p-2 rounded w-full bg-gray-100 shadow-md"
                        required
                    />
                    <div className="relative w-full mt-4">
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="border border-gray-300 p-2 rounded w-full pr-10 bg-gray-100 shadow-md"
                            required
                        />
                        <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            )}
                        </button>
                    </div>
                    
                    {/* Pesan Sign Up */}
                    <p className="font-semibold text-center mt-4">
                        Don't have an account?{" "}
                        <button
                            type="button"
                            onClick={onSwitchToSignUp}
                            className="text-blue-400 font-bold"
                        >
                            Sign up
                        </button>
                    </p>
                    
                    {/* Tombol Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className={`bg-blue-500 text-white p-2 rounded font-semibold hover:bg-blue-600 transition-colors w-full mt-4 ${
                            loading ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                    >
                        {loading ? "Signing in..." : "Sign In"}
                    </button>
                </form>
            </div>

            {/* Popup untuk pesan gagal */}
            {showPopup && (
                <div className="fixed inset-0 bg-white bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 shadow-xl max-w-sm w-full text-center border-4 border-red-500 rounded-lg">
                        <h2 className="text-2xl font-bold text-red-500 mb-4">Login Failed</h2>
                        <p ref={errRef} className="text-gray-700 mb-6">{errMsg}</p>

                        <button
                            onClick={() => setShowPopup(false)}
                            className="bg-blue-400 text-white px-4 py-2 hover:bg-blue-600 transition-colors rounded-md"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SignIn;