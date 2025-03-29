"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Scan } from "lucide-react"
// Import normally, but only use within useEffect
import { Html5Qrcode } from "html5-qrcode";
import { toast } from "react-hot-toast"

export default function QrScannerAlternative() {
  const [showScanner, setShowScanner] = useState(false)
  const [cameras, setCameras] = useState<{ id: string; label: string }[]>([])
  const [selectedCamera, setSelectedCamera] = useState<string | null>(null)
  const [scanning, setScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // Use the specific type now, but initialize as null
  const scannerRef = useRef<Html5Qrcode | null>(null) 
  const router = useRouter()

  // Effect to get cameras when scanner is shown
  useEffect(() => {
    // Only run on client-side when showScanner becomes true
    if (showScanner && typeof window !== "undefined") {
      Html5Qrcode.getCameras()
        .then(devices => {
          if (devices && devices.length) {
            setCameras(devices)
            // Select the first camera by default only if none is selected
            if (!selectedCamera) {
                 setSelectedCamera(devices[0].id)
            }
          } else {
            setError("No se detectaron cámaras...");
          }
        })
        .catch(err => {
          console.error("Error al obtener cámaras:", err)
          setError("Error al acceder a las cámaras...");
        });
    }
    // Run when showScanner changes
  }, [showScanner]); 

  // Effect to start/stop scanner based on state
  useEffect(() => {
    // Ensure this only runs client-side
    if (typeof window === "undefined") return;

    if (scanning && selectedCamera && !scannerRef.current) {
      // Start scanning
      const html5QrCode = new Html5Qrcode("qr-reader-alternative");
      scannerRef.current = html5QrCode;
      html5QrCode.start(
        selectedCamera,
        { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 },
        onScanSuccess,
        onScanFailure
      )
      .catch(err => {
        console.error("Error al iniciar el escáner:", err);
        setError("Error al iniciar el escáner. Intente nuevamente.");
        setScanning(false); // Reset scanning state on error
        scannerRef.current = null; // Clear ref on error
      });
    } else if (!scanning && scannerRef.current) {
      // Stop scanning
      scannerRef.current.stop()
        .then(() => {
          console.log("Scanner stopped.");
          scannerRef.current = null;
        })
        .catch(err => {
          console.error("Error al detener el escáner:", err);
          // Don't necessarily set error state here, stopping might fail sometimes
          scannerRef.current = null; // Still clear ref
        });
    }

    // Cleanup function to stop scanner when component unmounts or scanning becomes false
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(err => console.error("Cleanup: Error stopping scanner", err));
        scannerRef.current = null;
      }
    };
  }, [scanning, selectedCamera]); // Dependencies that trigger start/stop

  // --- Button Handlers --- 
  const handleStartScanner = () => {
      if (!selectedCamera) {
          setError("Por favor seleccione una cámara.");
          return;
      }
      setError(null);
      setScanning(true);
  }

  const handleStopScanner = () => {
      setScanning(false);
  }
  
  // --- Scan Handlers (Already Refactored) --- 
  const onScanSuccess = (decodedText: string) => {
    // Stop the scanner and close the modal
    handleStopScanner(); // Use the handler to set scanning state false
    setShowScanner(false);
    document.body.style.overflow = "auto"; 
    console.log("Alternative QR scanned (expecting URL):", decodedText);
    try {
        const url = new URL(decodedText);
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_VERCEL_URL || window.location.origin
        const appOrigin = new URL(appUrl).origin

        // Check if it's a URL from our app
        if (url.origin === appOrigin) {
          // Check if it looks like a product page URL
          if (url.pathname.startsWith("/product/")) {
            console.log(`Navigating to internal product page: ${url.pathname}${url.search}`)
            // Navigate to the product page within the app
            router.push(url.pathname + url.search)
          } else {
            // It's another internal URL, navigate to it
            console.log(`Navigating to internal page: ${url.pathname}${url.search}`)
            router.push(url.pathname + url.search)
          }
        } else {
          // It's a valid URL but external, open in new tab for safety
          console.log("Opening external URL:", decodedText)
          window.open(decodedText, "_blank", "noopener,noreferrer")
          // Optionally show a toast message about opening an external link
          toast("Abriendo enlace externo..."); 
        }
    } catch (error) { 
        toast.error("Código QR no contiene una URL válida."); 
    }
  }

  const onScanFailure = (errorMessage: string) => {
    // Only log errors, don't bother the user unless necessary
    // console.error("Alternative QR Scan Error:", errorMessage);
    if (errorMessage.includes("Camera access denied")) {
        setError("Acceso a la cámara denegado. Por favor, permite el acceso en la configuración de tu navegador.");
        // Consider stopping scan/closing modal if permission denied?
    } else if (errorMessage.includes("NotAllowedError")) { 
        setError("Permiso para usar la cámara denegado.");
    }
    // Ignore other common errors like "No QR code found"
  }

  // --- Modal Handlers --- 
  const handleOpenScanner = () => {
    setError(null)
    // Reset camera list and selection potentially?
    // setCameras([]);
    // setSelectedCamera(null);
    setShowScanner(true)
  }

  const handleCloseScanner = () => {
    handleStopScanner(); // Ensure scanner stops
    setShowScanner(false)
  }

  // --- Render --- 
  return (
    <>
      {/* FAB Button */}
      <button
        onClick={handleOpenScanner}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition-all hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        aria-label="Escanear código QR"
      >
        <Scan className="h-6 w-6" />
      </button>

      {/* Scanner Modal */} 
      {showScanner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
          <div className="relative w-full max-w-lg rounded-lg bg-white p-6">
            <button
              onClick={handleCloseScanner}
              className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
              aria-label="Cerrar escáner"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h3 className="mb-4 text-center text-xl font-bold">Escanear Código QR</h3>

            {error ? (
              <div className="mb-4 rounded-lg bg-red-100 p-4 text-center text-red-700">
                <p>{error}</p>
                <button
                  onClick={() => {
                    setError(null)
                    setShowScanner(false)
                    setTimeout(() => setShowScanner(true), 100)
                  }}
                  className="mt-2 rounded bg-red-600 px-3 py-1 text-white hover:bg-red-700"
                >
                  Reintentar
                </button>
              </div>
            ) : (
              <p className="mb-4 text-center text-sm text-gray-600">
                Apunte la cámara al código QR del producto para agregarlo a su carrito
              </p>
            )}

            {cameras.length > 0 && !scanning && (
              <div className="mb-4">
                <label htmlFor="camera-select" className="mb-2 block text-sm font-medium text-gray-700">
                  Seleccionar cámara:
                </label>
                <select
                  id="camera-select"
                  value={selectedCamera || ""}
                  onChange={(e) => { 
                      setSelectedCamera(e.target.value);
                      // Stop scanner if running when camera changes? Might not be necessary if start is manual
                      // if (scanning) setScanning(false);
                  }}
                  className="block w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                >
                  {cameras.map((camera) => (
                    <option key={camera.id} value={camera.id}>
                      {camera.label || `Cámara ${camera.id}`}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {!scanning && selectedCamera && (
              <button
                onClick={handleStartScanner}
                className="mb-4 w-full rounded-md bg-blue-600 py-2 text-white hover:bg-blue-700"
              >
                Iniciar escáner
              </button>
            )}

            {scanning && (
              <button
                onClick={handleStopScanner}
                className="mb-4 w-full rounded-md bg-red-600 py-2 text-white hover:bg-red-700"
              >
                Detener escáner
              </button>
            )}

            {selectedCamera && <div id="qr-reader-alternative" className="mx-auto overflow-hidden rounded-lg mt-4"></div>}
            {!selectedCamera && cameras.length === 0 && !error && <p>Buscando cámaras...</p>} 

            <div className="mt-4 text-center text-sm text-gray-500">
              Recuerde que solo puede agregar 1 unidad por referencia de producto
            </div>
          </div>
        </div>
      )}
    </>
  )
}

