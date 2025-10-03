import React, { useState, useEffect } from "react";
import axios from "axios";

// Base URL API yang dikonfirmasi
const BASE_API_URL = "https://kfbt6z3d-3000.asse.devtunnels.ms";
const TRANSACTION_URL = `${BASE_API_URL}/transaction`;

// Helper untuk mendapatkan token autentikasi
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

// Komponen Modal Konfirmasi (New Component)
const ConfirmationModal = ({ show, transaction, actionType, onConfirm, onClose, loading }) => {
    if (!show) return null;

    const actionText = actionType === 'confirm' ? 'Confirm' : 'Cancel';
    const bgColor = actionType === 'confirm' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600';
    const headerColor = actionType === 'confirm' ? 'text-green-600' : 'text-red-600';

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 transition-opacity duration-300">
            <div className="bg-white p-6 rounded-lg shadow-2xl w-full max-w-sm transform transition-all duration-300 scale-100">
                <h3 className={`text-2xl font-bold mb-4 ${headerColor}`}>
                    {actionText} Order #{transaction.id}?
                </h3>
                <p className="text-gray-700 mb-4">
                    Are you sure you want to **{actionText.toUpperCase()}** this transaction? 
                    {actionType === 'confirm' ? 
                        " This will finalize the purchase and update product stock." :
                        " This will cancel the order and refund the buyer's balance."
                    }
                </p>
                <div className="p-3 bg-gray-100 rounded mb-4">
                    <p className="font-semibold">Buyer: {transaction.user?.username || 'N/A'}</p>
                    <p className="font-bold text-xl mt-1">Total: {formatUSD(transaction.total_price || 0)}</p>
                </div>

                <div className="flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition duration-150 disabled:opacity-50"
                    >
                        Close
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className={`px-4 py-2 text-white font-semibold rounded-lg transition duration-150 ${bgColor} disabled:opacity-50`}
                    >
                        {loading ? 'Processing...' : `${actionText} Now`}
                    </button>
                </div>
            </div>
        </div>
    );
};


const Orders = ({ onOrderCountChange }) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);

    // --- State Baru untuk Modal ---
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
    const [transactionToConfirm, setTransactionToConfirm] = useState(null);
    const [actionType, setActionType] = useState(null); // 'confirm' atau 'cancel'

    useEffect(() => {
        fetchOrders();
    }, []);

    // Helper untuk menampilkan modal konfirmasi
    const handleConfirmClick = (order, type) => {
        setTransactionToConfirm(order);
        setActionType(type);
        setShowConfirmationModal(true);
    };

    // Helper untuk menutup modal
    const handleModalClose = () => {
        setShowConfirmationModal(false);
        setTransactionToConfirm(null);
        setActionType(null);
    };

    // 1. FUNGSI AMBIL ORDER
    const fetchOrders = async () => {
        setLoading(true);
        setError(null);
        const token = getAuthToken();

        if (!token) {
            setError("Authentication failed. Please log in again.");
            setLoading(false);
            return;
        }

        try {
            const response = await axios.get(
                `${TRANSACTION_URL}/history`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            
            const fetchedOrders = response.data.Transaction || []; 

            // Filter transaksi dengan status 'pending'
            const pendingOrders = fetchedOrders.filter(
                order => order.transaction_status === 'pending' 
            );

            setOrders(pendingOrders);
            if (onOrderCountChange) {
                onOrderCountChange(pendingOrders.length);
            }
        } catch (err) {
            console.error("Error fetching orders:", err);
            setError(err.response?.data?.message || "Failed to load order history. (Endpoint: /transaction/history)");
        } finally {
            setLoading(false);
        }
    };

    // 2. FUNGSI KONFIRMASI ORDER (Dijalankan dari Modal)
    const handleConfirmOrder = async () => {
        if (!transactionToConfirm) return;
        
        const transactionId = transactionToConfirm.id;

        setActionLoading(true);
        setError(null);
        const token = getAuthToken();

        try {
            await axios.post(
                `${TRANSACTION_URL}/confirm`,
                { transaction_id: transactionId },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            
            alert(`Transaction ${transactionId} confirmed successfully!`);
            handleModalClose(); // Tutup modal setelah sukses
            fetchOrders(); 
        } catch (err) {
            console.error("Error confirming order:", err);
            setError(err.response?.data?.message || "Failed to confirm order. (Endpoint: /transaction/confirm)");
            handleModalClose(); // Tutup modal meskipun error (opsional: bisa tetap dibuka)
        } finally {
            setActionLoading(false);
        }
    };
    
    // 3. FUNGSI BATALKAN ORDER (Dijalankan dari Modal)
    const handleCancelOrder = async () => {
        if (!transactionToConfirm) return;
        
        const transactionId = transactionToConfirm.id;

        setActionLoading(true);
        setError(null);
        const token = getAuthToken();

        try {
            await axios.post(
                `${TRANSACTION_URL}/cancel-by-seller`,
                { transaction_id: transactionId },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            
            alert(`Transaction ${transactionId} cancelled successfully!`);
            handleModalClose(); // Tutup modal setelah sukses
            fetchOrders(); 
        } catch (err) {
            console.error("Error cancelling order:", err);
            setError(err.response?.data?.message || "Failed to cancel order. (Endpoint: /transaction/cancel-by-seller)");
            handleModalClose(); // Tutup modal meskipun error (opsional)
        } finally {
            setActionLoading(false);
        }
    };


    return (
        <div className="w-90 md:w-full h-120 bg-white border-4 border-blue-400 relative p-6 overflow-y-auto shadow-xl">
            {/* Modal Konfirmasi */}
            {transactionToConfirm && (
                <ConfirmationModal
                    show={showConfirmationModal}
                    transaction={transactionToConfirm}
                    actionType={actionType}
                    onConfirm={actionType === 'confirm' ? handleConfirmOrder : handleCancelOrder}
                    onClose={handleModalClose}
                    loading={actionLoading}
                />
            )}
            {/* Akhir Modal Konfirmasi */}

            <div className=" bg-sky-500 text-white p-3 font-bold text-xl md:text-2xl rounded-md shadow-lg">
                Pending Orders ({orders.length})
            </div>
            
            <div className="mt-8">
                {error && <div className="p-3 bg-red-100 text-red-700 rounded mb-4 text-center">{error}</div>}
                
                {loading ? (
                    <div className="text-center text-gray-500">Loading new orders...</div>
                ) : orders.length === 0 ? (
                    <div className="text-center text-gray-500 mt-10 p-5 border border-dashed rounded">
                        🎉 No new orders requiring action!
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order) => (
                            <div key={order.id} className="p-4 border-b border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors">
                                <p className="font-bold text-gray-800">Order ID: #{order.id}</p>
                                <p className="text-sm text-gray-600">Date: {new Date(order.created_at).toLocaleDateString()}</p> 
                                <p className="text-sm text-gray-600 mb-2">Buyer: {order.user?.username || 'N/A'}</p>
                                
                                <div className="ml-4 space-y-1">
                                    {(order.details || []).map((item, index) => (
                                        <div key={index} className="flex justify-between text-sm">
                                            <span>{item.product?.product_name} x {item.quantity}</span>
                                            <span className="font-semibold">{formatUSD(item.subtotal)}</span>
                                        </div>
                                    ))}
                                </div>

                                <p className="font-extrabold text-lg mt-2 text-green-600">Total: {formatUSD(order.total_price || 0)}</p>
                                <p className={`font-semibold text-sm mt-1 uppercase ${order.transaction_status === 'pending' ? 'text-yellow-600' : 'text-green-600'}`}>
                                    Status: {order.transaction_status}
                                </p>

                                {/* Action Buttons - Memanggil helper untuk menampilkan modal */}
                                <div className="flex gap-2 mt-3">
                                    <button
                                        onClick={() => handleConfirmClick(order, 'confirm')}
                                        disabled={actionLoading || order.transaction_status !== 'pending'} 
                                        className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 disabled:opacity-50"
                                    >
                                        Confirm
                                    </button>
                                    <button
                                        onClick={() => handleConfirmClick(order, 'cancel')}
                                        disabled={actionLoading || order.transaction_status !== 'pending'}
                                        className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Orders;