import Image from "next/image";
import type { NextPage } from "next";

const Home: NextPage = () => {
  return (
    <div className="flex items-center flex-col flex-grow pt-10">
      <div className="px-5 w-[90%] md:w-[75%]">
        <h1 className="text-center mb-6">
          <span className="block text-2xl mb-2">Dyno AI</span>
          <span className="block text-4xl font-bold">Your friendly AI Assistants</span>
        </h1>

      </div>
    </div>
  );
};

export default Home;
