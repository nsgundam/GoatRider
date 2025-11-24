"use client";
import { useState } from "react";
import { CldImage } from "next-cloudinary";

export default function Welcomepage() {
  const [error, seterror] = useState("");
  const [loading, setloading] = useState(false);
  const [wallet, setwallet] = useState(null);
  const [showpopup, setshowpopup] = useState(false);
  const [name, setname] = useState("");

  //-----------------------------------------------------------//
  // Connect to MetaMask (safe for SSR) 
  async function handleConnectWallet() {
    seterror("");

    // Protect against server-side execution: window is only available in the browser
    if (typeof window === "undefined") {
      console.warn("handleConnectWallet called on the server. Abort.");
      seterror("This action must be performed in a browser.");
      return;
    }

    // Now it's safe to read window.ethereum
    const provider = window?.ethereum;
    if (!provider) {
      alert("Please install MetaMask");
      seterror("MetaMask not installed");
      return;
    }

    try {
      setloading(true);
      // Request accounts from the provider
      const accounts = await provider.request({ method: "eth_requestAccounts" });
      if (!accounts || accounts.length === 0) {
        seterror("No accounts returned");
        return;
      }
      const account = accounts[0];
      setwallet(account);
      //------------------------popup------------------------------//
      setshowpopup(true);
    } catch (err) {
      console.error("MetaMask connection error:", err);
      // userRejectedRequest has code 4001 in many MetaMask versions
      if (err && err.code === 4001) {
        seterror("User rejected connection");
      } else {
        seterror("Failed to connect wallet");
      }
    } finally {
      setloading(false);
    }
  }
  //-----------------------------------------------------------//

  async function summitname(e) {
    e.preventDefault();
    seterror("");

    const trimmed = name.trim();
    if (!trimmed) {
      seterror("enter your name");
      return;
    }
    if (!wallet) {
      seterror("no wallet connected");
      return;
    }
    // สมมมุติว่า fetch เรียบร้อย ไม่มีปัญหา
    console.log("Submitting (frontend test naja):", { wallet, name: trimmed });
    // show a simple confirmation and close popup
    alert(`Welcome, ${trimmed}!\nWallet: ${wallet}`);
    setshowpopup(false);
    setname("");
  }
  //-----------------------------------------------------------//

  return (
    <div className="relative w-full h-screen">
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <CldImage
          src="qy3vo3jhmpocodpavgrf"
          width={1920}
          height={1080}
          className="w-full h-full object-cover pointer-events-none"
          alt="goat rider homepage"
        />
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center gap-8 px-4 z-20">
        {/* Headings */}
        <h1 className="text-5xl md:text-7xl lg:text-[150px] font-bold text-white">Goat</h1>
        <h1 className="text-5xl md:text-7xl lg:text-[150px] font-bold text-white -mt-6">Ridder</h1>

        <button
          onClick={() => {
            console.log("Connect button clicked (debug)");
            handleConnectWallet();
          }}
          // only disable while loading; let wallet state be shown but not block reconnect attempts
          disabled={loading}
          className="z-30 pointer-events-auto text-2xl font-normal bg-blue-50 text-black rounded-none hover:bg-blue-100 transition-colors duration-300 px-6 py-3 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Connecting..." : "Connect Wallet"}
        </button>

        {/* error message for quick feedback */}
        {error && (
          <div className="mt-2 text-red-200 bg-red-900/30 px-3 py-1 rounded-md">{error}</div>
        )}
      </div>

      {/* popup placeholder (if you use) */}
      {showpopup && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50">
          <div className="bg-white p-6 rounded-md max-w-sm w-full">
            <h3 className="text-black text-lg font-semibold">Enter your name</h3>
            <form onSubmit={summitname} className="mt-3">
              <input
                value={name}
                onChange={(e) => setname(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="Your name"
              />
              <div className="mt-3 flex justify-end gap-2">
                <button type="button" onClick={() => setshowpopup(false)} className=" text-black px-3 py-2 border rounded-md">Cancel</button>
                <button type="submit" className="px-3 py-2 bg-blue-600 text-white rounded-md">Submit</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Notes:
// - The important fix: check `typeof window` before accessing `window.ethereum`. That avoids errors during SSR.
// - Keep pointer-events-none on the background image only; don't put it on a root wrapper.
// - When debugging MetaMask, open DevTools and watch console logs from the button click and the provider request.
