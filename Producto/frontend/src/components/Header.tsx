import { useNavigate } from "react-router-dom";

type Props = {
  titulo: string;
};

function Header({ titulo }: Props) {
  const navigate = useNavigate();

  return (
    <div className="
      w-full
      bg-white 
      px-4 py-4 
      flex 
      justify-between 
      items-center 
      shadow-md 
      border-b
      flex-shrink-0
    ">

      {/* TÍTULO */}
      <h1 className="text-3xl font-semibold tracking-widest text-gray-800">
        {titulo}
      </h1>

      {/* DERECHA */}
      <div
        onClick={() => navigate("/perfil")}
        className="flex items-center gap-4 cursor-pointer hover:opacity-80"
      >
        <span className="text-xl">🔔</span>

        <img
          src="https://i.pravatar.cc/100"
          alt="perfil"
          className="w-10 h-10 rounded-full border-2 border-primary"
        />

        <span className="text-lg font-medium tracking-widest">
          ADMIN
        </span>
      </div>
    </div>
  );
}

export default Header;