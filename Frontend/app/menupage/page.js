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


      <div className=" blur-sm bg-indigo-500 opacity-25 w-full h-screen relative">
        <CldImage
          src="lpa26uhctlhihia0mkmf"
          width={1920}
          height={1080}
          className="w-full h-full object-cover"
          alt="goat rider homepage"
        />
      </div>
      {/* Overlay */}
      <div className="
        absolute inset-0 
        flex flex-col items-center justify-center 
        text-center gap-8 px-4
      ">
        
        <h1 className="text-5xl md:text-7xl lg:text-[150px] font-bold text-white">
          Goat
        </h1>
        <h1 className="text-5xl md:text-7xl lg:text-[150px] font-bold text-white -mt-6">
          Ridder
        </h1>

        {/* Buttons row */}
        <div className="flex flex-col md:flex-row gap-4 mt-4">
          <Button
            onClick={handleCreateRoom}
            className="px-6 py-3 text-lg"
          >
            Create Room
          </Button>

          <Button
            onClick={Joinfriends}
            className="px-6 py-3 text-lg"
          >
            JOIN with FRIENDS
          </Button>
        </div>
      </div>

    </div>
  );
}