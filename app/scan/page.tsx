import { getServerClient } from "@/lib/supabase-client-server"
import { cookies } from "next/headers"
import QRScanner from "./qr-scanner"

export default async function ScanPage() {
  const cookieStore = cookies()
  const supabase = getServerClient({
    get: (name) => {
      const cookie = cookieStore.get(name)
      return cookie ? { value: cookie.value } : { value: undefined }
    },
  })

  const {
    data: { session },
  } = await supabase.auth.getSession()
  const user = session?.user || null

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Escanear Código QR</h1>
      <QRScanner userId={user?.id} />
    </div>
  )
}

