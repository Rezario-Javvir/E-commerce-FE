import { Link } from "react-router"
import Orders from "../components/Orders"

function Statistic(){
    return(
        <section className="min-h-screen flex flex-wrap p-8 gap-3 gap-y-11 justify-between">
            <Link to="/" className="text-white bg-blue-400 p-2 text-2xl">Home</Link>
            <div className="flex w-full h-70  items-center gap-10">
                <div className="w-1/2 h-full bg-linear-to-t from-white to-blue-600 border-4 border-blue-400"></div>
                <div className="w-1/2 h-full bg-linear-to-t from-white to-blue-600 border-4 border-blue-400"></div>
            </div>
            <Orders/>
            <Orders/>
            <Orders/>
            <Orders/>
            <Orders/>
            <Orders/>
        </section>
    )
}

export default Statistic