-- CreateTable
CREATE TABLE "DocumentCounter" (
    "id" SERIAL NOT NULL,
    "businessId" INTEGER NOT NULL,
    "documentType" "DocumentType" NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "DocumentCounter_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DocumentCounter_businessId_documentType_key" ON "DocumentCounter"("businessId", "documentType");

-- AddForeignKey
ALTER TABLE "DocumentCounter" ADD CONSTRAINT "DocumentCounter_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "BusinessAcc"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
