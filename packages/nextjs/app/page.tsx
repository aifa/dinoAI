import Image from "next/image";
import type { NextPage } from "next";

const Home: NextPage = () => {
  return (
    <div className="flex items-center flex-col flex-grow pt-10">
      <div className="px-5 w-[90%] md:w-[75%]">
        <h1 className="text-center mb-6">
          <span className="block text-2xl mb-2">Dino AI</span>
          <span className="block text-4xl font-bold">AI powered Dino Assistants</span>
        </h1>
        <h2 className="text-center">Build your own Dino Assistants, or go through the available list</h2>
      </div>
    </div>
  );
};

export default Home;
