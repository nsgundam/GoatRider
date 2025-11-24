"use client";
import { useState } from "react";
import { CldImage } from "next-cloudinary";

export default function Welcomepage() {
  return (
      <div className="">
    <h1 className="text-[120px] font-bold text-white absolute top-[200px] left-[600px]">Goat </h1>
    <h1 className="text-[150px] font-bold text-white absolute top-[300px] left-[600px]">Ridder </h1>


  <div className=" blur-sm bg-indigo-500 opacity-25 w-full h-screen relative">
    <CldImage
      src="lpa26uhctlhihia0mkmf"
      width={1920}
      height={1080}
      className="w-full h-full object-cover"
      alt="goat rider homepage"
    />
 </div>
 </div>
);

}
