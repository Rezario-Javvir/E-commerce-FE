import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

// Base URL API Anda
const BASE_API_URL = "https://kfbt6z3d-3000.asse.devtunnels.ms/product";
const CATEGORY_API_URL = "https://kfbt6z3d-3000.asse.devtunnels.ms/category"; // Endpoint untuk kategori
const BASE_IMAGE_URL = "https://kfbt6z3d-3000.asse.devtunnels.ms";

// --- HELPER FUNCTIONS ---

/**
 * Helper untuk format US Dollar
 */
const formatUSD = (number) => {
    const num = Number(number);
    if (isNaN(num)) return "$0.00";
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
    }).format(num);
};

/**
 * Mengambil Token Autentikasi dari localStorage.
 */
const getAuthToken = () => {
    const user = localStorage.getItem("user");

    if (!user) return null;

    try {
        const userData = JSON.parse(user);
        
        // Token bisa berada di berbagai properti tergantung respons login
        const token = userData.token || userData.Token || userData.responsData?.Token; 

        return token || null;

    } catch (e) {
        console.error("DEBUG (AuthToken): Error parsing user data from localStorage:", e);
        return null;
    }
};

/**
 * Mengambil Store ID dari data pengguna di localStorage.
 */
const getStoreId = () => {
    const user = localStorage.getItem("user");
    if (!user) return null;

    try {
        const userData = JSON.parse(user);
        let storeId = null;

        // Cek jalur data yang mungkin
        const storeArray = userData.responsData?.data?.store;
        
        if (storeArray && storeArray.length > 0 && storeArray[0].id) {
            storeId = storeArray[0].id;
        }
        else if (userData.store_id) {
             storeId = userData.store_id;
        }
        
        if (storeId) {
            console.log("DEBUG (StoreId): Store ID found successfully:", storeId);
            return String(storeId);
        }

        console.error("DEBUG (StoreId): FINAL FAIL: Store ID property is missing.");
        return null;

    } catch (e) {
        console.error("DEBUG (StoreId): Error parsing user data for store ID:", e);
        return null;
    }
};

/**
 * Fungsi untuk memperbaiki path gambar yang berasal dari backend.
 */
const fixImagePath = (imagePath) => {
    if (!imagePath) return null;
    return imagePath.replace(/\\/g, "/").replace("public/", "");
};
// ---------------------------------------------------


// Komponen Card Produk yang Bisa Diedit
const ProductCard = ({ product, onDelete, onUpdate, categories }) => {
    const [isEditing, setIsEditing] = useState(false);
    
    const [editData, setEditData] = useState({
        product_name: product.product_name,
        price: product.price,
        description: product.description,
        stock: product.stock, 
        // Penting: category_id diinisialisasi sebagai string untuk elemen select
        category_id: String(product.category_id), 
        image: null, 
    });
    const [updateLoading, setUpdateLoading] = useState(false);
    const [updateError, setUpdateError] = useState(null);

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditData(prev => ({ ...prev, [name]: value }));
    };

    const handleEditImageChange = (e) => {
        setEditData(prev => ({ ...prev, image: e.target.files[0] }));
    };

    // Helper untuk menampilkan nama kategori
    const getCategoryName = (id) => {
        const category = categories.find(cat => String(cat.id) === String(id));
        return category ? category.category_name : `ID: ${id} (Unknown)`;
    };

    const handleUpdateSubmit = async (e) => {
        e.preventDefault();
        setUpdateLoading(true);
        setUpdateError(null);
        
        const token = getAuthToken();
        const store_id = getStoreId();

        if (!token || !store_id) {
            setUpdateError("Authentication failed or Store ID missing. Please relog.");
            setUpdateLoading(false);
            return;
        }

        if (!editData.product_name || !editData.price || !editData.stock || !editData.category_id) {
             setUpdateError("All required fields are missing.");
             setUpdateLoading(false);
             return;
        }

        const formData = new FormData();
        formData.append("product_name", editData.product_name);
        formData.append("price", editData.price);
        formData.append("description", editData.description);
        formData.append("stock", editData.stock); 
        formData.append("category_id", editData.category_id);
        formData.append("store_id", store_id); 
        
        if (editData.image) {
            formData.append("image", editData.image);
        }

        try {
            await axios.put(
                `${BASE_API_URL}/${product.id}`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            onUpdate(); 
            setIsEditing(false);
        } catch (err) {
            console.error("Error updating product:", err);
            setUpdateError(err.response?.data?.message || "Failed to update product.");
        } finally {
            setUpdateLoading(false);
        }
    };

    const fixedImagePath = fixImagePath(product.image);
    const imageUrl = fixedImagePath ? `${BASE_IMAGE_URL}/${fixedImagePath}` : null;
    
    // SVG Placeholder untuk gambar yang gagal dimuat
    const imageErrorSvg = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2UzZTNlMyIvPjx0ZXh0IHg9IjEwMCIgeT0iMTUwIiBkb21pbmF0LWJhc2VsaW5lPSJtaWRkbGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJtb25vc3BhY2UiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==";


    if (isEditing) {
        return (
            <form onSubmit={handleUpdateSubmit} className="bg-yellow-100 p-4 rounded shadow-lg border-2 border-yellow-500 w-full">
                <h3 className="font-bold text-xl text-yellow-700 mb-2">Edit Product</h3>
                {updateError && <div className="text-red-600 mb-2">{updateError}</div>}
                
                <input type="text" name="product_name" value={editData.product_name} onChange={handleEditChange} placeholder="Product Name" className="w-full p-2 border mb-2" required />
                <input type="number" name="price" value={editData.price} onChange={handleEditChange} placeholder="Price (USD)" className="w-full p-2 border mb-2" required />
                <input type="number" name="stock" value={editData.stock} onChange={handleEditChange} placeholder="Stock Quantity" className="w-full p-2 border mb-2" required /> 
                
                {/* DROPDOWN KATEGORI UNTUK EDIT */}
                <select 
                    name="category_id" 
                    value={editData.category_id} // Pastikan ini adalah string
                    onChange={handleEditChange} 
                    className="w-full p-2 border mb-2 bg-white" 
                    required
                >
                    <option value="" disabled>Select Category</option>
                    {/* Render opsi hanya jika categories ada */}
                    {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                            {cat.category_name}
                        </option>
                    ))}
                </select>
                {/* END DROPDOWN */}
                
                <textarea name="description" value={editData.description} onChange={handleEditChange} placeholder="Description" className="w-full p-2 border mb-2" rows="2" required />
                
                <label className="block text-sm font-medium text-gray-700 mb-1">New Image (Optional):</label>
                <input type="file" onChange={handleEditImageChange} className="w-full p-1 border mb-3 text-sm" />

                <div className="flex justify-end gap-2">
                    <button type="button" onClick={() => setIsEditing(false)} className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600">Cancel</button>
                    <button type="submit" disabled={updateLoading} className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 disabled:opacity-50">
                        {updateLoading ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </form>
        );
    }

    return (
        <div className="bg-white p-4 rounded shadow flex items-center justify-between w-full">
            <div className="flex items-center gap-4">
                <img
                    src={imageUrl || imageErrorSvg}
                    alt={product.product_name}
                    className="w-16 h-16 object-cover rounded border border-gray-300"
                    onError={(e) => {
                        e.target.src = imageErrorSvg; 
                    }}
                />
                
                <div>
                    <h3 className="font-bold text-lg text-gray-800">{product.product_name}</h3>
                    <p className="text-gray-600 text-sm">{product.description}</p>
                    {/* TAMPILKAN NAMA KATEGORI */}
                    <p className="text-xs text-gray-500">Stock: {product.stock} | Category: {getCategoryName(product.category_id)}</p>
                    {/* END TAMPILKAN NAMA KATEGORI */}
                    <p className="text-blue-500 font-semibold mt-1">
                        {formatUSD(product.price)}
                    </p>
                </div>
            </div>
            <div className="flex gap-2">
                <button
                    onClick={() => {
                        // Atur ulang editData saat memulai edit
                        setEditData({
                            product_name: product.product_name,
                            price: product.price,
                            description: product.description,
                            stock: product.stock, 
                            category_id: String(product.category_id), // Penting: pastikan string
                            image: null, 
                        });
                        setIsEditing(true);
                    }}
                    className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 text-sm"
                >
                    Edit
                </button>
                <button
                    onClick={() => onDelete(product.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm"
                >
                    Delete
                </button>
            </div>
        </div>
    );
};


// ==============================================================================

function Products() {
    const [productName, setProductName] = useState("");
    const [price, setPrice] = useState("");
    const [description, setDescription] = useState("");
    const [stock, setStock] = useState(""); 
    const [categoryId, setCategoryId] = useState(""); // State untuk ID kategori yang dipilih
    const [image, setImage] = useState(null);
    const [myProducts, setMyProducts] = useState([]);
    const [categories, setCategories] = useState([]); // State untuk data kategori
    const [loading, setLoading] = useState(true);
    const [addLoading, setAddLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    // useEffect untuk memuat data saat komponen pertama kali di-mount
    useEffect(() => {
        fetchMyProducts();
        fetchCategories(); 
    }, []);

    // --- FUNGSI FETCH KATEGORI DENGAN AUTENTIKASI ---
    // Di Products.jsx

// Di Products.jsx

const fetchCategories = async () => {
    const token = getAuthToken();
    
    if (!token) {
        console.error("DEBUG (fetchCategories): Authentication token is missing.");
        return; 
    }

    try {
        const response = await axios.get(
            CATEGORY_API_URL, 
            {
                headers: {
                    Authorization: `Bearer ${token}`, 
                },
            }
        );
        
        // --- PERBAIKAN FINAL DI SINI: Gunakan properti 'Categories' ---
        const fetchedCategories = response.data.Categories; 
        
        if (Array.isArray(fetchedCategories)) {
            console.log("SUCCESS: Categories fetched and loaded into state.");
            setCategories(fetchedCategories); 
        } else {
             // Debug log jika properti 'Categories' tidak ada atau bukan array
             console.error("DEBUG: Category data is not an array (Expected response.data.Categories).", response.data);
             setCategories([]);
        }

    } catch (err) {
        console.error("Error fetching categories (Status 401/500):", err);
    }
};

    // 1. FUNGSI FETCH PRODUK
    const fetchMyProducts = async () => {
        setLoading(true);
        setError(null);
        
        const token = getAuthToken();
        const store_id = getStoreId();
        
        if (!token || !store_id) {
            setError("Authentication token or Store ID is missing. Please log in.");
            setLoading(false);
            return;
        }

        try {
            const response = await axios.get(
                BASE_API_URL, 
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    params: {
                        store_id: store_id,
                    }
                }
            );
            
            setMyProducts(response.data.product || []);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching my products:", err);
            setError(err.response?.data?.message || "Failed to load products. Check your token/API endpoint.");
            setLoading(false);
        }
    };

    const handleImageChange = (e) => {
        setImage(e.target.files[0]);
    };

    // 2. FUNGSI TAMBAH PRODUK
    const handleSubmit = async (e) => {
        e.preventDefault();
        setAddLoading(true);
        setError(null);
        setSuccessMessage(null);

        const token = getAuthToken();
        const store_id = getStoreId(); 
        
        if (!token || !store_id) {
            setError("You must be logged in with a store to add a product.");
            setAddLoading(false);
            return;
        }

        if (!productName || !price || !description || !stock || !categoryId || !image) {
             setError("All required fields (Name, Price, Desc, Stock, Category, and Image) must be filled.");
             setAddLoading(false);
             return;
        }
        
        const formData = new FormData();
        formData.append("product_name", productName);
        formData.append("description", description);
        formData.append("price", price); 
        formData.append("stock", stock); 
        formData.append("category_id", categoryId); // Nilai dari dropdown
        formData.append("store_id", store_id); 
        
        if (image) {
            formData.append("image", image);
        }

        try {
            await axios.post(
                `${BASE_API_URL}/add`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setSuccessMessage("Product added successfully! 🎉");
            
            // Reset form
            setProductName("");
            setPrice("");
            setDescription("");
            setStock(""); 
            setCategoryId(""); // Reset categoryId
            setImage(null);
            document.getElementById("productImageInput").value = "";
            
            fetchMyProducts();
        } catch (err) {
            console.error("Error adding product:", err);
            setError(err.response?.data?.message || "Failed to add product. Check inputs and server logs.");
        } finally {
            setAddLoading(false);
        }
    };

    // 3. FUNGSI HAPUS PRODUK
    const handleDeleteProduct = async (productId) => {
        const token = getAuthToken();
        const store_id = getStoreId();

        if (!token || !store_id) {
            alert("You must be logged in with a store to delete a product.");
            return;
        }
    
        if (!window.confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
            return;
        }
    
        try {
            await axios.delete(
                `${BASE_API_URL}/${productId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setSuccessMessage(`Product ID ${productId} deleted successfully!`);
            fetchMyProducts();
        } catch (err) {
            console.error("Error deleting product:", err);
            setError("Failed to delete product. It may not exist or you lack permission.");
        }
    };

    return (
        <section className="min-h-screen bg-gray-100">
            <nav className="w-full h-16 flex items-center justify-between px-8 bg-blue-500 shadow-md">
                <h1 className="font-bold text-white text-3xl">Products Management 📦</h1>
                <Link to="/" className="p-2 bg-white text-blue-500 font-semibold rounded-lg hover:bg-blue-100 transition duration-150">
                    Home
                </Link>
            </nav>

            <div className="min-h-[calc(100vh-64px)] flex flex-col md:flex-row p-6 gap-8">
                
                {/* 1. Formulir Add Product */}
                <div className="md:w-1/3 w-full bg-white p-6 shadow-xl rounded-lg h-fit border-t-4 border-blue-500">
                    <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-2">Add New Product</h2>
                    
                    {successMessage && <div className="p-3 bg-green-100 text-green-700 rounded mb-4">{successMessage}</div>}
                    {error && <div className="p-3 bg-red-100 text-red-700 rounded mb-4">{error}</div>}

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <label className="block">
                            <span className="font-semibold text-gray-700">Product Name</span>
                            <input type="text" className="w-full p-2 border border-gray-300 rounded mt-1 focus:ring-blue-500 focus:border-blue-500" value={productName} onChange={(e) => setProductName(e.target.value)} required />
                        </label>
                        
                        <label className="block">
                            <span className="font-semibold text-gray-700">Price (USD)</span> 
                            <input type="number" className="w-full p-2 border border-gray-300 rounded mt-1 focus:ring-blue-500 focus:border-blue-500" value={price} onChange={(e) => setPrice(e.target.value)} min="0.01" step="any" required />
                        </label>
                        
                        <label className="block">
                            <span className="font-semibold text-gray-700">Stock Quantity</span> 
                            <input type="number" className="w-full p-2 border border-gray-300 rounded mt-1 focus:ring-blue-500 focus:border-blue-500" value={stock} onChange={(e) => setStock(e.target.value)} min="1" required />
                        </label>

                        {/* DROPDOWN KATEGORI UNTUK ADD */}
                        <label className="block">
                            <span className="font-semibold text-gray-700">Category</span>
                            <select 
                                className="w-full p-2 border border-gray-300 rounded mt-1 focus:ring-blue-500 focus:border-blue-500 bg-white" 
                                value={categoryId} 
                                onChange={(e) => setCategoryId(e.target.value)} 
                                required
                            >
                                <option value="" disabled>Pilih Kategori</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.category_name}
                                    </option>
                                ))}
                            </select>
                            {/* Menghapus pesan loading yang mengganggu, karena status 200 OK sudah terkonfirmasi */}
                        </label>
                        {/* END DROPDOWN */}

                        <label className="block">
                            <span className="font-semibold text-gray-700">Description</span>
                            <textarea className="w-full p-2 border border-gray-300 rounded mt-1 focus:ring-blue-500 focus:border-blue-500" value={description} onChange={(e) => setDescription(e.target.value)} rows="3" required />
                        </label>
                        
                        <label className="block">
                            <span className="font-semibold text-gray-700">Product Image</span>
                            <input type="file" id="productImageInput" onChange={handleImageChange} className="w-full mt-1 p-2 border border-gray-300 rounded file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" required />
                            {image && <p className="text-sm text-gray-500 mt-1">Selected: {image.name}</p>}
                        </label>
                        
                        <button type="submit" disabled={addLoading} className="bg-blue-500 text-white font-bold p-3 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-4">
                            {addLoading ? "Adding Product..." : "Add Product"}
                        </button>
                    </form>
                </div>

                {/* 2. Semua Produk */}
                <div className="md:w-2/3 w-full bg-white p-6 shadow-xl rounded-lg border-t-4 border-blue-500">
                    <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-2">Your Listings ({myProducts.length})</h2>
                    
                    {loading ? (
                        <div className="text-center text-lg text-gray-500 mt-10">Loading products...</div>
                    ) : myProducts.length > 0 ? (
                        <div className="space-y-4">
                            {myProducts.map((product) => (
                                <ProductCard 
                                    key={product.id} 
                                    product={product} 
                                    onDelete={handleDeleteProduct}
                                    onUpdate={fetchMyProducts}
                                    categories={categories} // Pass categories ke ProductCard
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-lg text-gray-500 mt-10 p-5 border border-dashed rounded">
                            You currently have no products listed. Start by adding one! 
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}

export default Products;