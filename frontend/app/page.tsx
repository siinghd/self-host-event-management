import { ModeToggle } from "@/components/theme-toggler";
import { Navbar } from "@/components/Navbar";
import Confetticomp from "@/components/Confetti";
import { BackgroundBeams } from "@/components/ui/background-beams";

export default function Home() {
  return (
    <>
      <BackgroundBeams />
      <div className="">
        <Confetticomp />
        <Navbar />
        <div className="flex h-screen w-[70%] mx-auto relative flex-col justify-center items-center gap-4 mb-10">
          <h1 className="text-foreground drop-shadow-black dark:text-gray-200 text-4xl md:text-8xl text-center font-extrabold ">
            Give{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-pink-500 to-violet-600">
              Life{" "}
            </span>{" "}
            <br />
            To{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-l from-purple-500 via-pink-500 to-violet-800">
              Your{" "}
            </span>
            Plans
          </h1>
          <p>Trust us to be the cornerstone of your next extraordinary event</p>
          <div className="cursor-pointer mb-32">
            <a
              href="/login"
              className="relative inline-flex items-center justify-center px-10 py-4 overflow-hidden font-mono font-medium tracking-tighter text-white bg-secondary  rounded-lg group"
            >
              <span className="absolute w-0 h-0 transition-all duration-500 ease-out bg-gradient-to-r from-violet-800 to-violet-600 rounded-full group-hover:w-56 group-hover:h-56"></span>
              <span className="absolute inset-0 w-full h-full -mt-1 rounded-lg opacity-30 bg-gradient-to-b from-transparent via-transparent to-gray-700"></span>
              <span className="relative z-10">Get Started</span>
            </a>
          </div>
          <img
            src="https://media.tenor.com/yMy7F0iAp9IAAAAi/party-sharty-boom-box.gif"
            width="400"
            height="100"
            alt=""
            className="absolute z-0 bottom-0"
          />
        </div>
        <div className="absolute right-4 bottom-4 00 w-fit">
          <ModeToggle />
        </div>
      </div>
    </>
  );
}
