// components/BackButton.js
import { FiArrowLeft } from "react-icons/fi";
import { useRouter } from "next/navigation";

const BackButton = ({ route = "/", label = "Back" }) => {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push(route)}
      className="flex items-center gap-2 pl-14 mt-4 hover:text-blue-400 transition-colors text-white"
    >
      <FiArrowLeft className="text-xl" />
      <span className="font-semibold">{label}</span>
    </button>
  );
};

export default BackButton;