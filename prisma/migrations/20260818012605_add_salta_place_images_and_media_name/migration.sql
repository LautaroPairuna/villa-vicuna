-- AlterTable
ALTER TABLE `Media` ADD COLUMN `originalName` VARCHAR(191) NOT NULL DEFAULT '';

-- CreateTable
CREATE TABLE `SaltaPlaceImage` (
    `id` VARCHAR(191) NOT NULL,
    `placeId` VARCHAR(191) NOT NULL,
    `mediaId` VARCHAR(191) NOT NULL,
    `order` INTEGER NOT NULL DEFAULT 0,

    INDEX `SaltaPlaceImage_placeId_idx`(`placeId`),
    INDEX `SaltaPlaceImage_mediaId_idx`(`mediaId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `SaltaPlaceImage` ADD CONSTRAINT `SaltaPlaceImage_placeId_fkey` FOREIGN KEY (`placeId`) REFERENCES `SaltaPlace`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SaltaPlaceImage` ADD CONSTRAINT `SaltaPlaceImage_mediaId_fkey` FOREIGN KEY (`mediaId`) REFERENCES `Media`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
