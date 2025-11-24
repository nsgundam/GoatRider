"use client";
import { useState } from "react";
import { CldImage } from "next-cloudinary";
import { Button } from '@/app/components/button'

export default function Welcomepage() {
const [createroom] = useState("");

  function handleCreateRoom() {
    console.log("Create room clicked");
    setRoom("new-room");
    //logic to create room in อนาคต โย่วๆ
  }
  function setRoom(roomId) {
    // Logic to set the room ID (e.g., update state, navigate to room, etc.)
    console.log("Room created with ID:", roomId);
  }
        //-------------------------------------------------------------------------------//
        async function Joinfriends() {
          console.log("Join friends clicked");
          setRoom("friend-room");
          }
        //-------------------------------------------------------------------------------//
  return (
      <div className="">
    <h1 className="text-[150px] font-bold text-white absolute top-[60px] left-[810px]">Goat </h1>
    <h1 className="text-[150px] font-bold text-white absolute top-[180px] left-[760px]">Ridder </h1>


  <div className=" blur-sm bg-indigo-500 opacity-25 w-full h-screen relative">
    <CldImage
      src="lpa26uhctlhihia0mkmf"
      width={1920}
      height={1080}
      className="w-full h-full object-cover"
      alt="goat rider homepage"
    />
    </div>
    {/* ปุ่ม Create Room */}
      <div className="absolute top-[400px] left-[900px]">
        <Button onClick={handleCreateRoom}>
          Create Room
        </Button>
 </div>
 </div>
    );
}