import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Orders from "../components/Orders"; 
import axios from "axios";


const BASE_API_URL = "https://kfbt6z3d-3000.asse.devtunnels.ms";
const TRANSACTION_URL = `${BASE_API_URL}/transaction`;

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

// Helper untuk format US Dollar
const formatUSD = (number) => {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
    }).format(number);
};


function Statistic(){
    const [orderCount, setOrderCount] = useState(0);
    const [totalRevenue, setTotalRevenue] = useState(0);
    const [loadingRevenue, setLoadingRevenue] = useState(true);
    const [revenueError, setRevenueError] = useState(null);

    // Fungsi untuk menghitung total pendapatan dari semua transaksi
    const calculateStatistics = async () => {
        setLoadingRevenue(true);
        setRevenueError(null);
        const token = getAuthToken();

        if (!token) {
            setRevenueError("Authentication required.");
            setLoadingRevenue(false);
            return;
        }

        try {
            // Mengambil semua riwayat transaksi
            const response = await axios.get(
                `${TRANSACTION_URL}/history`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            // --- PERBAIKAN LOGIKA DI SINI ---
            // Ambil array transaksi dari properti 'Transaction'
            const allTransactions = response.data.Transaction || [];

            // Status yang berhasil berdasarkan controller: 'success' (setelah confirm)
            // Ganti properti 'total_amount' menjadi 'total_price'
            const confirmedRevenue = allTransactions
                .filter(t => t.transaction_status === 'success')
                .reduce((sum, t) => sum + parseFloat(t.total_price || 0), 0);

            setTotalRevenue(confirmedRevenue);

        } catch (err) {
            console.error("Error calculating statistics:", err);
            setRevenueError("Failed to fetch statistics data. (Endpoint: /transaction/history)");
        } finally {
            setLoadingRevenue(false);
        }
    };

    useEffect(() => {
        calculateStatistics();
    }, []);

    // Callback dari Orders.jsx untuk mendapatkan jumlah order pending
    const handleOrderCountChange = (count) => {
        setOrderCount(count);
    };


    return(
        <section className="min-h-screen bg-gray-100 p-8">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h1 className="text-4xl font-extrabold text-blue-600">Orders and data</h1>
                <Link to="/" className="text-white bg-blue-500 p-2 text-lg font-semibold rounded hover:bg-blue-600 transition-colors">
                    Home
                </Link>
            </div>

            {/* Bagian Statistik Card */}
            <div className="flex flex-wrap gap-6 justify-between">
                
                {/* 1. Card Statistik - Total Pendapatan */}
                <div className="w-full md:w-[48%] bg-white p-6 rounded-lg shadow-xl border-t-4 border-green-500">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">Total Revenue</h2>
                    {loadingRevenue ? (
                        <p className="text-3xl font-bold text-gray-500">Loading...</p>
                    ) : revenueError ? (
                        <p className="text-red-500">{revenueError}</p>
                    ) : (
                        <p className="text-4xl font-extrabold text-green-600">
                            {formatUSD(totalRevenue)}
                        </p>
                    )}
                    <p className="text-sm text-gray-500 mt-2">Revenue from successful transactions.</p>
                </div>

                {/* 2. Card Statistik - Order Pending */}
                <div className="w-full md:w-[48%] bg-white p-6 rounded-lg shadow-xl border-t-4 border-yellow-500">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">Pending Orders</h2>
                    <p className="text-4xl font-extrabold text-yellow-600">
                        {orderCount}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">New orders requiring your confirmation.</p>
                    <Link to="#" onClick={() => document.getElementById('order-list').scrollIntoView({ behavior: 'smooth' })} className="text-blue-500 text-sm font-semibold hover:text-blue-700 mt-2 block">
                        View Orders
                    </Link>
                </div>
            </div>
            
            {/* --- */}

            {/* Bagian Orders List */}
            <div id="order-list" className="mt-10">
                <h2 className="text-3xl font-bold text-gray-800 mb-4">New Orders List</h2>
                <Orders onOrderCountChange={handleOrderCountChange} />
            </div>

        </section>
    );
}

export default Statistic;