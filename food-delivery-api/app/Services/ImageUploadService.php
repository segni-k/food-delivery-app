<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ImageUploadService
{
    public function storeCompressed(
        UploadedFile $file,
        string $directory,
        string $disk = 'public',
        int $maxWidth = 1920,
        int $maxHeight = 1920,
        int $quality = 80,
    ): string {
        $realPath = $file->getRealPath();

        if (! $realPath || ! extension_loaded('gd')) {
            return $file->store($directory, $disk);
        }

        $imageInfo = @getimagesize($realPath);
        if (! is_array($imageInfo)) {
            return $file->store($directory, $disk);
        }

        $mime = (string) ($imageInfo['mime'] ?? '');
        $sourceImage = $this->createImageResource($realPath, $mime);

        if (! $sourceImage) {
            return $file->store($directory, $disk);
        }

        $originalWidth = imagesx($sourceImage);
        $originalHeight = imagesy($sourceImage);
        if ($originalWidth < 1 || $originalHeight < 1) {
            imagedestroy($sourceImage);

            return $file->store($directory, $disk);
        }

        $scale = min(
            1,
            $maxWidth / $originalWidth,
            $maxHeight / $originalHeight,
        );

        $targetWidth = (int) max(1, round($originalWidth * $scale));
        $targetHeight = (int) max(1, round($originalHeight * $scale));

        $targetImage = imagecreatetruecolor($targetWidth, $targetHeight);
        if (! $targetImage) {
            imagedestroy($sourceImage);

            return $file->store($directory, $disk);
        }

        if (in_array($mime, ['image/png', 'image/webp', 'image/gif'], true)) {
            imagealphablending($targetImage, false);
            imagesavealpha($targetImage, true);
            $transparent = imagecolorallocatealpha($targetImage, 0, 0, 0, 127);
            imagefilledrectangle($targetImage, 0, 0, $targetWidth, $targetHeight, $transparent);
        }

        imagecopyresampled(
            $targetImage,
            $sourceImage,
            0,
            0,
            0,
            0,
            $targetWidth,
            $targetHeight,
            $originalWidth,
            $originalHeight,
        );

        $encoded = $this->encodeImage($targetImage, $mime, $quality);

        imagedestroy($sourceImage);
        imagedestroy($targetImage);

        if (! $encoded) {
            return $file->store($directory, $disk);
        }

        $path = trim($directory . '/' . Str::ulid() . '.' . $encoded['extension'], '/');
        $stored = Storage::disk($disk)->put($path, $encoded['content'], ['visibility' => 'public']);

        if (! $stored) {
            return $file->store($directory, $disk);
        }

        return $path;
    }

    private function createImageResource(string $realPath, string $mime): mixed
    {
        return match ($mime) {
            'image/jpeg', 'image/jpg' => @imagecreatefromjpeg($realPath),
            'image/png' => @imagecreatefrompng($realPath),
            'image/gif' => @imagecreatefromgif($realPath),
            'image/webp' => function_exists('imagecreatefromwebp') ? @imagecreatefromwebp($realPath) : null,
            default => null,
        };
    }

    private function encodeImage(mixed $image, string $mime, int $quality): ?array
    {
        $normalizedQuality = max(10, min(95, $quality));
        ob_start();

        $success = match ($mime) {
            'image/png' => imagepng($image, null, (int) round((100 - $normalizedQuality) / 11.1111111111)),
            'image/webp' => function_exists('imagewebp') ? imagewebp($image, null, $normalizedQuality) : imagejpeg($image, null, $normalizedQuality),
            'image/gif' => imagegif($image),
            default => imagejpeg($image, null, $normalizedQuality),
        };

        $content = ob_get_clean();

        if (! $success || ! is_string($content) || $content === '') {
            return null;
        }

        $extension = match ($mime) {
            'image/png' => 'png',
            'image/webp' => function_exists('imagewebp') ? 'webp' : 'jpg',
            'image/gif' => 'gif',
            default => 'jpg',
        };

        return [
            'extension' => $extension,
            'content' => $content,
        ];
    }
}
