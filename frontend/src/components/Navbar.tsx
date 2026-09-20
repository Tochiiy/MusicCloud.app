import { useNavigate } from "react-router-dom";
import { useUserData } from "../context/userContext";
import Logo from "./Logo";




const Navbar = () => {

  const navigate = useNavigate();
  const { logoutUser } = useUserData();

  const handleLogout = async () => {
    await logoutUser();
    navigate("/login", { replace: true });
  };

  return <>
  
  <div className="w-full flex justify-between items-center font-semi-bold">
    <div className="flex items-center gap-2">
      <button type="button" aria-label="Go to MusicCloud home" className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
        <Logo className="h-9 w-auto" />
        <span className="hidden text-xl font-bold text-[#EFECFF] md:block">MusicCloud</span>
      </button>
      <img src="/left_arrow.png" alt="left arrow" className="w-6 h-6 bg-[#17142B] rounded-2xl cursor-pointer" onClick={() => navigate(-1)} />
      <img src="/right_arrow.png" alt="left arrow" className="w-6 h-6 bg-[#17142B] rounded-2xl cursor-pointer" onClick={() => navigate(+1)} />
    </div>

    <div className="flex items-center gap-4">
      <p className="px-4 py-1 cursor-pointer bg-[#EFECFF] text-[#17142B] rounded-full text-[20px] mt-4 md:block hidden " onClick={() => navigate("/coming-soon")}>Explore Premium</p>
      <p className="px-4 py-1 cursor-pointer bg-[#EFECFF] text-[#17142B] rounded-full text-[20px] mt-4 md:block hidden " onClick={() => navigate("/coming-soon")}>Install App</p>
      <p className="px-4 py-1 cursor-pointer bg-[#EFECFF] text-[#17142B] rounded-full text-[20px] mt-4 md:block" onClick={handleLogout}>LogOut</p>
   </div>
  </div>
  
    <div className="flex items-center gap-4 mt-4">
      <p className="bg-[#EFECFF] text-[#17142B] rounded-2xl py-1 px-4 text-[20px] cursor-pointer  md:block">All</p>
      <p className="bg-[#EFECFF] text-[#17142B] rounded-2xl py-1 px-4 text-[20px] cursor-pointer hidden md:block">Music</p>
      <p className="bg-[#EFECFF] text-[#17142B] rounded-2xl py-1 px-4 text-[20px] cursor-pointer hidden md:block">Podcasts</p>
      <p className="bg-[#EFECFF] text-[#17142B] rounded-2xl py-1 px-4 text-[20px] cursor-pointer md:block" onClick={() => {navigate("/playlist")}}>PlayList</p>
  </div>
  
  </>

}

export default Navbar