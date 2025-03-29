import { useRouter } from "next/router";
import { Briefcase, PauseCircle, CheckCircle, LayoutGrid } from "lucide-react";
import StarryBackground from "@/components/StarryBackground";
import { FiArrowUp } from "react-icons/fi";
import BackButton from "@/components/BackButton";
import ScrollToTopButton from "@/components/scrollup";
export default function Home() {
  const router = useRouter();

  return (
    <div><BackButton route="/expense/home" Icon={FiArrowUp} />
    <div className="min-h-screen flex justify-center items-center relative bg-cover bg-center">
      <StarryBackground />
      <ScrollToTopButton/>
      {/* Glass Card */}
      <div className="glass-card w-full max-w-md p-8 rounded-3xl text-center space-y-10 mb-28 text-black">
        <h1 className="text-4xl font-extrabold text-white">View Expenses</h1>

        {/* Buttons */}
        <div className="flex flex-col gap-6">
          {[
            {
              name: "Ongoing",
              icon: <Briefcase />,
              route: "/Ongoing",
              gradient:
                "from-green-400 to-green-300 hover:from-green-500 hover:to-green-400",
            },
            {
              name: "On Hold",
              icon: <PauseCircle />,
              route: "/On Hold",
              gradient:
                "from-yellow-400 to-yellow-300 hover:from-yellow-500 hover:to-yellow-400",
            },
            {
              name: "Completed",
              icon: <CheckCircle />,
              route: "/Completed",
              gradient:
                "from-purple-400 to-purple-300 hover:from-purple-500 hover:to-purple-400",
            },
            {
              name: "All Projects",
              icon: <LayoutGrid />,
              route: "/all-projects",
              gradient:
                "from-blue-400 to-blue-300 hover:from-blue-500 hover:to-blue-400",
            },
          ].map((item, index) => (
            <button
              key={index}
              onClick={() => router.push(item.route)}
              className={`glass-btn bg-gradient-to-br ${item.gradient} flex items-center justify-center gap-3 py-3 rounded-xl`}
            >
              {item.icon}
              <span>{item.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
    </div>
  );
}
