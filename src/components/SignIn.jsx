import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const SignIn = ({ onSuccess, onSwitchToSignUp }) => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSignIn = async (e) => {
        e.preventDefault(); 
        if (!username || !password) {
            setError("Please fill both fields");
            return;
        }

        try {
            setLoading(true);
            const response = await axios.post(
                "https://vfs90dhv-3000.asse.devtunnels.ms/auth/seller/login",
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

            // Ambil Token dan User langsung dari response.data
            const { Token, User } = response.data;

            // Gabungkan Token dan User ke dalam satu objek
            const userData = {
                ...User,
                token: Token,
            };

            // Simpan objek yang sudah lengkap ke localStorage
            localStorage.setItem("user", JSON.stringify(userData));
            
            setError(null);
            onSuccess();
            navigate('/dashboard'); 
        } catch (err) {
            console.error("Login failed:", err);
            if (err.response?.status === 401) {
                setError("Invalid username or password");
            } else {
                setError(err.response?.data?.message || "Login failed due to server error or network issue.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-100 bg-opacity-60 flex items-center justify-center z-50">
            <div className="bg-gradient-to-t from-blue-300 to-white p-8 shadow-lg max-w-md w-full flex flex-col gap-4 items-center justify-center">
                <h2 className="text-2xl font-bold text-center text-blue-600">Sign in as Seller</h2>
                <form onSubmit={handleSignIn} className="w-full">
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
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
                    {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
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
        </div>
    );
};

export default SignIn;