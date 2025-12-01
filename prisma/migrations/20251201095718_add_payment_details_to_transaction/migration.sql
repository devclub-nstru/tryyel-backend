-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "paymentMethod" TEXT,
ADD COLUMN     "razorpayOrderId" TEXT,
ADD COLUMN     "razorpayPaymentId" TEXT,
ADD COLUMN     "razorpaySignature" TEXT;
