import { useNavigate } from "react-router-dom";
import PlayListCard from "../components/PlayListCard";

const Sidebar = () => {
  const navigate = useNavigate();

  return <div className="w-[25%] h-full p-2 flex-col gap-2 text-white hidden lg:flex">
    <div className="bg-[#17142B] aspect-square h-[15%] rounded flex flex-col justify-around">
      <div className="flex items-center gap-8 pl-8 cursor-pointer" onClick={() => { 
        navigate('/');
      }}>
        <img src="/home.png" alt="home" className="w-6 h-6" />
        <span className="font-bold">Home</span>
      </div>

      <div className="flex items-center gap-8 pl-8 cursor-pointer" >
        <img src="/search.png" alt="search" className="w-6 h-6" />
        <span className="font-bold">Search</span>
      </div>

    </div>
    
    <div className="bg-[#17142B] h-[85%] rounded">
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/stack.png" alt="stacks" className="w-8 h-6" />
          <span className="semi-bold">Your Library</span>
        </div>
        <div className="flex items-center gap-3">
          <img src="/arrow.png" alt="plus" className="w-6 h-6" />
          <img src="/plus.png" alt="plus" className="w-6 h-6" />
        </div>
      </div>
      <div onClick={() => {
        navigate("/playlists")
      }}>
        <PlayListCard />
        </div>

      <div className="p-4 m-2 bg-[#17142B] rounded font-semibold flex flex-col items-start gap-1 pl-4 mt-4">
        <h1>Follow some podcast</h1>
        <p className="font-light ">We'll keep you up to date on new podcasts and songs</p>
        <button className="px-4 py-1.5 bg-[#EFECFF] text-[#17142B] rounded text-[15px] rounded-full mt-4">Browse Podcasts</button>
      </div>
     </div>
    </div>
}

export default Sidebar