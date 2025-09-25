import { Link } from "react-router-dom"

function Account(){
    return(
        <section className="min-h-screen bg-linear-to-t from-blue-600 to-white">
            <nav className="w-full h-15 flex items-center justify-between px-5">
                <h1 className="font-bold text-blue-400 text-2xl">Account Settings</h1>
                <Link to="/" className="p-2 bg-blue-400 text-white font-semibold">Home</Link>
            </nav>

            <div className="min-h-screen flex flex-col md:flex-row">
              <div className=" flex-1 flex-wrap p-6 flex justify-center gap-5">

                <div className="bg-white h-25 w-110 flex items-center">
                  <div className="-ml-10 w-100 h-15 bg-blue-400 flex justify-center items-center">
                    <h1 className="text-white font-semibold text-3xl">Managing Account</h1>
                  </div>
                </div>

                <div className="bg-white h-100 w-110 flex items-start justify-center p-3 flex-col">
                  <h1 className="font-bold">Email</h1>
                  <input type="text" className="w-full p-2 border-2 font-bold text-white bg-blue-400"/>
                  <h1 className="font-bold">Password</h1>
                  <input type="password" className="w-full p-2 border-2 font-bold text-white bg-blue-400"/>
                </div>
              </div>
              <div className="flex-1 p-6 flex items-center justify-center">
                <div className="relative bg-linear-to-t from-white to-blue-600 h-130 w-110 border-4 border-blue-400 flex items-center justify-between flex-col px-5 py-10 gap-3">
                  <div className="w-full">
                  <h1 className="text-2xl font-bold text-white">Store name</h1>
                  <input type="text" className="p-2 border-4 border-blue-400 text-blue-400 bg-white font-bold w-full"/>
                  <h1 className="text-2xl font-bold text-white">Password</h1>
                  <input type="text" className="p-2 border-4 border-blue-400 text-blue-400 bg-white font-bold w-full"/>
                  </div>
                  <button className="p-2 text-white bg-blue-400 font-bold bottom-0 text-2xl right-1/2">Change</button>
                </div>
              </div>
            </div>
        </section>
    )
}

export default Account