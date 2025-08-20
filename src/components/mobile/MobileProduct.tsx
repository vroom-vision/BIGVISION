import React from "react";

interface MobileProductProps {
  image: string;
  title: string;
  price: string;
  onClick?: () => void;
}

const MobileProduct: React.FC<MobileProductProps> = ({ image, title, price, onClick }) => {
  return (
    <div className="w-full max-w-xs mx-auto bg-white/10 rounded-xl shadow-md p-4 flex flex-col items-center mb-4" onClick={onClick}>
      <img src={image} alt={title} className="w-32 h-32 object-cover rounded-lg mb-2" />
      <h3 className="text-lg font-semibold text-white mb-1 text-center">{title}</h3>
      <span className="text-purple-400 font-bold text-base mb-2">{price}</span>
      <button className="bg-purple-500 text-white px-4 py-2 rounded-full mt-auto">View Details</button>
    </div>
  );
};

export default MobileProduct;
