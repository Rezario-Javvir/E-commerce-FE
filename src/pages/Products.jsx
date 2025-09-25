import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

function Products() {
  const [productName, setProductName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [myProducts, setMyProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // 🎯 Mengambil data produk milik seller saat komponen dimuat
  useEffect(() => {
    fetchMyProducts();
  }, []);

  const fetchMyProducts = async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user.token) {
      setError("Please log in to view your products.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(
        "https://vfs90dhv-3000.asse.devtunnels.ms/product",
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );
      // Filter produk berdasarkan sellerId jika API menyediakannya
      // Jika tidak, API harus sudah difilter di sisi backend
      setMyProducts(response.data.product || []);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching my products:", err);
      setError("Failed to load products.");
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user.token) {
      alert("You must be logged in to add a product.");
      return;
    }

   
    const formData = new FormData();
    formData.append("product_name", productName);
    formData.append("price", price);
    formData.append("description", description);
    if (image) {
      formData.append("image", image);
    }

    try {
      // 🎯 Mengirim data ke endpoint POST
      const response = await axios.post(
        "https://vfs90dhv-3000.asse.devtunnels.ms/product/add",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${user.token}`,
          },
        }
      );
      setSuccessMessage("Product added successfully!");
      // Reset form
      setProductName("");
      setPrice("");
      setDescription("");
      setImage(null);
      // Refresh daftar produk
      fetchMyProducts();
    } catch (err) {
      console.error("Error adding product:", err);
      setError("Failed to add product. Check your data and token.");
    }
  };

  const handleDeleteProduct = async (productId) => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user.token) {
      alert("You must be logged in to delete a product.");
      return;
    }
  
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }
  
    try {
      await axios.delete(
        `https://vfs90dhv-3000.asse.devtunnels.ms/product/${productId}`,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );
      alert("Product deleted successfully!");
      fetchMyProducts(); // Refresh daftar produk
    } catch (err) {
      console.error("Error deleting product:", err);
      setError("Failed to delete product.");
    }
  };

  return (
    <section className="min-h-screen bg-linear-to-t from-blue-600 to-white">
      <nav className="w-full h-15 flex items-center justify-between px-5">
        <h1 className="font-bold text-blue-400 text-2xl">Product</h1>
        <Link to="/" className="p-2 bg-blue-400 text-white font-semibold">Home</Link>
      </nav>

      <div className="min-h-screen flex flex-col md:flex-row items-center">
        {/* Formulir Add Product */}
        <div className="flex-1 flex-wrap p-6 flex justify-center gap-5">
          <form onSubmit={handleSubmit} className="bg-linear-to-t to-blue-600 from-white h-auto w-110 flex items-start justify-center p-3 flex-col text-white">
            <div className="-ml-10 w-100 h-15 bg-blue-400 flex justify-center items-center">
              <h1 className="text-white font-semibold text-3xl">Add Product</h1>
            </div>
            
            {successMessage && <div className="p-2 bg-green-500 text-white mt-4">{successMessage}</div>}
            {error && <div className="p-2 bg-red-500 text-white mt-4">{error}</div>}

            <label htmlFor="productName" className="font-bold mt-4">Name</label>
            <input
              id="productName"
              type="text"
              className="w-full p-2 border-4 font-bold text-blue-400 bg-white"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              required
            />
            
            <label htmlFor="price" className="font-bold mt-4">Price</label>
            <input
              id="price"
              type="number"
              className="w-full p-2 border-4 font-bold text-blue-400 bg-white"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />

            <label htmlFor="description" className="font-bold mt-4">Description</label>
            <input
              id="description"
              type="text"
              className="w-full p-2 border-4 font-bold text-blue-400 bg-white"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
            
            <div className="mt-10 w-full flex justify-between">
              <input
                id="imageUpload"
                type="file"
                onChange={handleImageChange}
                className="hidden"
              />
              <label
                htmlFor="imageUpload"
                className="bg-white text-blue-400 border-4 p-2 border-blue-400 cursor-pointer"
              >
                Upload image
              </label>
              <button
                type="submit"
                className="bg-white text-blue-400 border-4 p-2 border-blue-400"
              >
                Confirm
              </button>
            </div>
            {image && <p className="text-white mt-2">File selected: {image.name}</p>}
          </form>
        </div>

        {/* Semua Produk */}
        <div className="flex-1 p-6 flex items-center justify-center">
          <div className="relative bg-linear-to-t from-white to-blue-600 h-auto min-h-130 w-110 border-4 border-blue-400 flex items-center justify-between flex-col px-5 py-10 gap-3">
            <div className="p-2 bg-blue-400 text-white absolute -top-5 font-bold text-center text-2xl">
              all products
            </div>
            
            {loading && <div className="text-white">Loading products...</div>}
            {error && <div className="text-red-500">{error}</div>}
            
            <div className="w-full space-y-4">
              {myProducts.length > 0 ? (
                myProducts.map((product) => (
                  <div key={product.id} className="bg-white p-4 rounded shadow flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {product.image && (
                        <img
                          src={`https://vfs90dhv-3000.asse.devtunnels.ms/${product.image.replace("public/", "")}`}
                          alt={product.product_name}
                          className="w-16 h-16 object-cover rounded"
                        />
                      )}
                      <div>
                        <h3 className="font-bold text-lg text-gray-800">{product.product_name}</h3>
                        <p className="text-blue-500">${product.price}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                ))
              ) : (
                !loading && <div className="text-white text-center">No products found.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Products;