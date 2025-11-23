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
    //มีMATAMASKบ่อ้าย
    async function handleConnectWallet() {
        seterror("");
        if (!window?.ethereum) { //บ่มีบ่
            alert("Please install Metamask"); //ไปติดตั้งก่อนเด้ออ้าย
            return;
        }

        try {
            setloading(true);
            const accounts = await window.ethereum.request({
                method: "eth_requestAccounts",
            });
            const account = accounts[0];
            setwallet(account);
            //------------------------popup------------------------------//
            setshowpopup(true);
            setloading(false);
        } catch (err) {
            console.error(err);
            seterror("Failed to connect wallet");
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
  <div className="w-full h-screen relative">
    <CldImage
      src="goat_homepage"
      width={1920}
      height={1080}
      className="w-full h-full object-cover"
      alt="goat rider homepage"
    />

    {/* ปุ่ม Connect */}
    <button
      onClick={handleConnectWallet}
      disabled={loading || wallet}
      className="text-2xl absolute top-170 right-240 px-20 py-5 font-normal  bg-blue-50 text-black rounded none hover:bg-blue-100 transition-colors duration-300"
    >
      {loading ? "Connecting..." : "Connect Wallet"}
    </button>
  </div>
);

}