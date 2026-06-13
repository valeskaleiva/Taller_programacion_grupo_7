type CardProps = {
  title: string;
  value: number | string;
  extra?: string;
};

export default function Card({ title, value, extra }: CardProps) {

  const isZeroValue = () => {
    if (typeof value === "number") return value === 0;
    if (typeof value !== "string") return false;

    const normalized = value.replace(/[^0-9-]/g, "");
    if (!normalized) return false;

    return Number(normalized) === 0;
  };

  

  const getCardStyle = () => {
    if (isZeroValue()) {
      return {
        backgroundColor: '#bbf7d0',
        color: '#0f172a',
      } as const;
    }

    return {
      backgroundColor: '#047857',
      color: '#ffffff',
    } as const;
  };

  const cardStyle = getCardStyle();

  return (
    <div
      className="w-[250px] p-6 rounded-3xl text-center shadow-md min-h-[140px]"
      style={cardStyle}
    >
      <h4 className="font-semibold">{title}</h4>

      <h2 className="text-2xl font-bold mt-2">{value}</h2>

      {extra && (
        <p className={`font-semibold mt-1 ${isZeroValue() ? 'text-[#145c43]' : 'text-green-200'}`}>
          {extra}
        </p>
      )}

      {typeof value === 'number' && value <= 3 && (
        <p className="text-yellow-300 text-sm mt-1">
          
        </p>
      )}
    </div>
  );
}

