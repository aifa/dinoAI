"use client";

import { redirect } from "next/navigation";
import { set } from "nprogress";
import { useState } from "react";
import { useAccount } from "wagmi";
import { RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import { useScaffoldContractWrite } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

export const CreateMyDinoForm = () => {
  const { address: connectedAddress, isConnected, isConnecting } = useAccount();
  const { writeAsync: mintItem } = useScaffoldContractWrite({
    contractName: "DinoAI",
    functionName: "mintItem",
    args: [connectedAddress, "", "", "", "", ""],
  });

  const handleMintItem = async () => {
    try {
      await mintItem({
        args: [connectedAddress, systemPrompt, model, temperature, name, description],
      });
      setName("");
      setDescription("");
      setSystemPrompt("");
      setModel("");
      setTemperature("");
    } catch (error) {
      notification.error("Error creating item");
    }
  };

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [model, setModel] = useState("");
  const [temperature, setTemperature] = useState("");

  return (
    <>
      {!isConnected || isConnecting ? (
        <RainbowKitCustomConnectButton />
      ) : (
        <>
          <div className="flex items-center flex-col pt-10">
            <div className="px-5">
              <h3 className="text-center mb-8">
                <span className="block text-4xl font-normal">Create a new assistant</span>
              </h3>
            </div>
          </div>
          <div className="flex flex-wrap gap-4 my-8 px-5 justify-center">
            <div className="card card-compact bg-base-100 shadow-lg sm:min-w-[300px] shadow-secondary">
              <div className="card-body space-y-3">
                <div className="flex flex-col justify-center mt-1 flex-wrap">
                  <label className="block">
                    <p className="text-xl p-0 m-0 font-normal">
                      <span>Name</span>
                    </p>
                    <input
                      className="w-full mt-1"
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      required
                    />
                  </label>
                </div>
                <div className="flex flex-col justify-center mt-1 flex-wrap">
                  <label className="block">
                    <p className="text-xl p-0 m-0 font-normal">
                      <span>Description</span>
                    </p>
                    <input
                      className="w-full mt-1"
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      required
                    />
                  </label>
                </div>
                <div className="flex flex-col justify-center mt-1 flex-wrap">
                  <label className="block">
                    <p className="text-xl p-0 m-0 font-normal">
                      <span>Model</span>
                    </p>
                    <input className="w-full mt-1" value={model} onChange={e => setModel(e.target.value)} required />
                  </label>
                  <label className="block">
                    <p className="text-xl p-0 m-0 font-normal">
                      <span>Temperature</span>
                    </p>
                    <input
                      className="w-full mt-1"
                      value={temperature}
                      onChange={e => setTemperature(e.target.value)}
                      required
                    />
                  </label>
                </div>
                <div className="flex flex-col justify-center mt-1 flex-wrap">
                  <label className="block">
                    <p className="text-xl p-0 m-0 font-normal">
                      <span>System Prompt</span>
                    </p>
                    <textarea
                      className="w-full mt-1"
                      value={systemPrompt}
                      onChange={e => setSystemPrompt(e.target.value)}
                      required
                    />
                  </label>
                </div>
                <div className="card-actions justify-center">
                  <button
                    className="btn btn-secondary"
                    disabled={!name || !description || !model || !temperature || !systemPrompt}
                    onClick={handleMintItem}
                  >
                    Mint Dino
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
      ;
    </>
  );
};

export default CreateMyDinoForm;
