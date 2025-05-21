// components/BackButton.js
import { FiArrowLeft } from "react-icons/fi";
import { useRouter } from "next/navigation";

const BackButton = ({ route = "/", label = "Back", onClick }) => {
  const router = useRouter();

  const handleClick = () => {
    if (onClick) {
      // Use the custom onClick handler if provided
      onClick();
    } else {
      // Otherwise use the default route navigation
      router.push(route);
    }
  };

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-2 pl-14 mt-4 hover:text-blue-400 transition-colors text-white"
    >
      <FiArrowLeft className="text-xl" />
      <span className="font-semibold">{label}</span>
    </button>
  );
};

export default BackButton;