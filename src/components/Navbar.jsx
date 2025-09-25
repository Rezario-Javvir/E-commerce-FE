import { Link } from "react-router-dom";

const Navbar = ({ onLogout }) => {
    return (
        <div className="bg-blue-600 p-4 text-white flex justify-between items-center">
            <div className="flex items-center">
                <Link to="/" className="text-xl font-bold mr-4">
                    Home
                </Link>
                <Link to="/products" className="text-lg mr-4">
                    Products
                </Link>
                <Link to="/Statistic" className="text-lg">
                    Statistic
                </Link>
            </div>
            <div className="flex items-center">
                <button 
                    onClick={onLogout}
                    className="bg-white text-blue-600 px-4 py-2 rounded font-semibold hover:bg-blue-100 transition-colors"
                >
                    Logout
                </button>
            </div>
        </div>
    );
};

export default Navbar;