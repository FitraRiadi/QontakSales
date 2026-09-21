import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import "react-easy-crop/react-easy-crop.css";
import {
  Box,
  Button,
  Dialog,
  Portal,
  Text,
  VStack,
} from "@chakra-ui/react";

function createImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

async function getCroppedBlob(imageSrc, pixelCrop) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 675;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    1200,
    675
  );
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Crop failed"))),
      "image/jpeg",
      0.9
    );
  });
}

export default function ImageCropDialog({ open, imageSrc, onClose, onApply }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedPixels, setCroppedPixels] = useState(null);
  const [applying, setApplying] = useState(false);

  const onCropComplete = useCallback((_, pixels) => {
    setCroppedPixels(pixels);
  }, []);

  const handleApply = async () => {
    if (!croppedPixels) return;
    setApplying(true);
    try {
      const blob = await getCroppedBlob(imageSrc, croppedPixels);
      onApply(blob);
    } catch {
      onApply(null);
    } finally {
      setApplying(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={(e) => !e.open && onClose()} size="lg">
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Crop Cover (16:9)</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <VStack gap={4} align="stretch">
                <Box position="relative" h="320px" bg="black" borderRadius="lg" overflow="hidden">
                  {imageSrc && (
                    <Cropper
                      image={imageSrc}
                      crop={crop}
                      zoom={zoom}
                      aspect={16 / 9}
                      onCropChange={setCrop}
                      onCropComplete={onCropComplete}
                      onZoomChange={setZoom}
                    />
                  )}
                </Box>
                <Box>
                  <Text fontSize="xs" mb={1}>Zoom</Text>
                  <input
                    type="range"
                    min={1}
                    max={3}
                    step={0.05}
                    value={zoom}
                    onChange={(e) => setZoom(Number(e.target.value))}
                    style={{ width: "100%" }}
                  />
                </Box>
              </VStack>
            </Dialog.Body>
            <Dialog.Footer>
              <Button variant="ghost" onClick={onClose}>Cancel</Button>
              <Button bg="primary" color="white" onClick={handleApply} loading={applying}>
                Apply Crop
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
