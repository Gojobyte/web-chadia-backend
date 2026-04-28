-- AlterTable
ALTER TABLE "domaines" ADD COLUMN     "image" TEXT;

-- AlterTable
ALTER TABLE "infos_ong" ADD COLUMN     "heroImage" TEXT NOT NULL DEFAULT '';
