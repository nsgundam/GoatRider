-- CreateEnum
CREATE TYPE "RoomStatus" AS ENUM ('WAITING', 'IN_GAME', 'FINISHED');

-- CreateEnum
CREATE TYPE "CardType" AS ENUM ('ACTION', 'DEFUSE', 'EXPLODE');

-- CreateEnum
CREATE TYPE "TokenTxType" AS ENUM ('BUY', 'STAKE_IN', 'WIN_OUT');

-- CreateTable
CREATE TABLE "User" (
    "walletAddress" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "currentTokenBalance" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastLogin" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("walletAddress")
);

-- CreateTable
CREATE TABLE "Room" (
    "roomId" TEXT NOT NULL,
    "creatorWalletAddress" TEXT NOT NULL,
    "roomName" TEXT NOT NULL,
    "requiredStake" INTEGER NOT NULL,
    "maxPlayers" INTEGER NOT NULL,
    "password" TEXT,
    "status" "RoomStatus" NOT NULL DEFAULT 'WAITING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Room_pkey" PRIMARY KEY ("roomId")
);

-- CreateTable
CREATE TABLE "PlayerRoomState" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "walletAddress" TEXT NOT NULL,
    "isReady" BOOLEAN NOT NULL DEFAULT false,
    "turnOrder" INTEGER,
    "hasExploded" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "PlayerRoomState_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameCard" (
    "cardId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" "CardType" NOT NULL,

    CONSTRAINT "GameCard_pkey" PRIMARY KEY ("cardId")
);

-- CreateTable
CREATE TABLE "PlayerCard" (
    "id" SERIAL NOT NULL,
    "playerStateId" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "deckPosition" INTEGER,

    CONSTRAINT "PlayerCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TokenTransaction" (
    "transactionHash" TEXT NOT NULL,
    "walletAddress" TEXT NOT NULL,
    "type" "TokenTxType" NOT NULL,
    "amount" INTEGER NOT NULL,
    "transactionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "relatedRoomId" TEXT,

    CONSTRAINT "TokenTransaction_pkey" PRIMARY KEY ("transactionHash")
);

-- CreateTable
CREATE TABLE "GameEvent" (
    "eventId" SERIAL NOT NULL,
    "roomId" TEXT NOT NULL,
    "walletAddress" TEXT NOT NULL,
    "actionType" TEXT NOT NULL,
    "details" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GameEvent_pkey" PRIMARY KEY ("eventId")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerRoomState_roomId_walletAddress_key" ON "PlayerRoomState"("roomId", "walletAddress");

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_creatorWalletAddress_fkey" FOREIGN KEY ("creatorWalletAddress") REFERENCES "User"("walletAddress") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerRoomState" ADD CONSTRAINT "PlayerRoomState_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("roomId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerRoomState" ADD CONSTRAINT "PlayerRoomState_walletAddress_fkey" FOREIGN KEY ("walletAddress") REFERENCES "User"("walletAddress") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerCard" ADD CONSTRAINT "PlayerCard_playerStateId_fkey" FOREIGN KEY ("playerStateId") REFERENCES "PlayerRoomState"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerCard" ADD CONSTRAINT "PlayerCard_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "GameCard"("cardId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TokenTransaction" ADD CONSTRAINT "TokenTransaction_walletAddress_fkey" FOREIGN KEY ("walletAddress") REFERENCES "User"("walletAddress") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TokenTransaction" ADD CONSTRAINT "TokenTransaction_relatedRoomId_fkey" FOREIGN KEY ("relatedRoomId") REFERENCES "Room"("roomId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameEvent" ADD CONSTRAINT "GameEvent_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("roomId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameEvent" ADD CONSTRAINT "GameEvent_walletAddress_fkey" FOREIGN KEY ("walletAddress") REFERENCES "User"("walletAddress") ON DELETE RESTRICT ON UPDATE CASCADE;
