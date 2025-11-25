"use client";
import { useState } from "react";
import { CldImage } from "next-cloudinary";
import { Button } from '@/app/components/button'

export default function Welcomepage() {
  const [createroom] = useState("");
  const [joinroom] = useState("");
  const [BuyToken] = useState("");
  const [tokenbalance] = useState();
  const [username] = useState("Patrick");
  //-------------------------------------------------------------------------------//
  function handleCreateRoom() {
    console.log("Create room clicked");
    setRoom("new-room");
     router.push("/createroom"); 
    //logic to create room in อนาคต โย่วๆ
  }
  function setRoom(roomId) {
    // Logic to set the room ID (e.g., update state, navigate to room, etc.)
    console.log("Room created with ID:", roomId);
  }
  //-------------------------------------------------------------------------------//
  async function JoinRoom(roomId) {
    console.log("Join room clicked");
    setRoom("friend-room");
  }
  async function BuyToken() {
    console.log("Buy token clicked");
    // Logic to handle token purchase
    //popup ซื้อ token
  }
  //-------------------------------------------------------------------------------//
  return (
<div className="relative w-full min-h-screen">

  {/* ชั้นภาพพื้นหลัง + เบลอ */}
  <div className="absolute inset-0 blur-[3px] opacity-25">
    <CldImage
      src="lpa26uhctlhihia0mkmf"
      width={1920}
      height={1080}
      className="w-full h-full object-cover"
      alt="background"
    />
  </div>
  <div className="absolute inset-0 flex items-center justify-center">
    <CldImage
      src="namegamegoat"
      width={1920}
      height={1080}
      className="object-contain"
      alt="game logo"
    />
  </div>

      {/* top-right capsule (ปรับขนาดพอดี ไม่ใหญ่เกิน) */}
      <div className="absolute top-6 right-6 flex items-center gap-3 bg-[#FBAF22] hover:bg-[#eedebf] px-4 py-2 rounded-full max-w-[320px] 
      shadow-[0_10px_0_#a52424] transition-all">
        {/* avatar */}
        <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
          {/* ใช้ path รูปที่คุณอัพโหลด (local path) */}
          <CldImage src="k302t89vjayzaffzm3ci" width={50} height={50} className="w-50 h-10 rounded-full" alt="User Avatar auto" />
        </div>


        {/* username + token */}
        <div className="flex items-center gap-3">
          <span className="text-xl font-semibold text-white truncate max-w-[100px]">{username}</span>
          <span className="text-xl font-semibold text-white bg-black/10 px-4 py-3 rounded-full">{tokenbalance}</span>
        </div>


        {/* buy button small */}
        <div className="ml-2">
          <Button onClick={BuyToken} className="px-2 py-2 text-xl font-bold rounded-full shadow-[0_3px_0_#000] ">
            Buy
          </Button>
        </div>
      </div>


      {/* overlay center */}
      <div className="absolute inset-0 flex flex-col items-center 
      justify-center text-center gap-5 px-4">

        {/* Buttons (พอดีกับหน้าจอ: responsive width) */}
        <div className="flex flex-col gap-10 mt-[300px] items-center-">

          <Button
            onClick={handleCreateRoom}
            className="w-60 md:w-64 lg:w-80 py-3 md:py-4 
            text-lg md:text-xl font-bold active:scale-95 
            text-black rounded-full shadow-[0_6px_0_#a52424] transition-all"
          >
            Create Room
          </Button>

          <Button
            onClick={JoinRoom}
            className="w-60 md:w-64 lg:w-80 py-3 md:py-4 
            text-lg md:text-xl font-bold active:scale-95 
            text-black rounded-full shadow-[0_10px_0_#a52424] transition-all"
          >
            Join Room
          </Button>
        </div>
      </div>
    </div>
  );
}