type CardProps = {
  title: string;
  value: number | string;
  extra?: string;
};

export default function Card({ title, value, extra }: CardProps) {

  

  // 👇 lógica de color
  const getColor = () => {
    if (typeof value === "number") {
      if (value <= 3) return "bg-red-500"
      if (value <= 10) return "bg-[#145c43]" // verde medio
      return "bg-[#0B3D2E]" // verde fuerte
    }
    return "bg-[#0B3D2E]"
  }

  

  return (
    <div

  className={`
    w-[250px]
    p-6
    rounded-3xl
    text-white
    shadow-md
    min-h-[140px]

    transition-all duration-300 ease-in-out

    hover:-translate-y-2
    hover:scale-105
    hover:shadow-2xl
    hover:shadow-black/30 
    hover:brightness-110

    ${getColor()}
  `}
>
  
      <h4 className="font-semibold">{title}</h4>

      <h2 className="text-2xl font-bold mt-2">
        {value}
      </h2>

      {extra && (
        <p className="text-green-300 font-semibold mt-1">
          {extra}
        </p>
      )}

      {typeof value === "number" && value <= 3 && (
        <p className="text-yellow-300 text-sm mt-1">
          ⚠️ Stock bajo
        </p>
      )}
    </div>
    
  );
}

