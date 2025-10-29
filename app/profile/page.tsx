"use client"

import { useState, useRef } from "react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Header } from "@/components/header"
import { User, Mail, Phone, MapPin, Save, LogOut, Pencil } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { updateUser, uploadProfilePhoto } from "@/api/user"
import { Usuario } from "@/types/user"


export default function ProfilePage() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [profilePhoto, setProfilePhoto] = useState(user?.profilePhoto || "/placeholder-user.jpg")
  const [pendingPhotoFile, setPendingPhotoFile] = useState<File | null>(null)
  const [formData, setFormData] = useState({
    firstName: user?.name || "",
    lastName: user?.lastname || "",
    email: user?.email || "",
    // phone: user?.phone || "",
    // address: user?.address || ""
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSave = async () => {
    try {
      const userToUpdate = { ...(user as Usuario) }
      userToUpdate.id = user?.id as string
      userToUpdate.name = formData.firstName
      userToUpdate.lastname = formData.lastName
      userToUpdate.email = formData.email
      userToUpdate.password = user?.password as string

      if (pendingPhotoFile && user) {
        const uploaded = await uploadProfilePhoto(user.id, pendingPhotoFile)
        userToUpdate.profilePhoto = uploaded
      }

      const updated = await updateUser(userToUpdate)
      setProfilePhoto(updated.profilePhoto || profilePhoto)
      setPendingPhotoFile(null)
      setIsEditing(false)
      toast.success("El perfil se actualizó correctamente")
    } catch (error) {
      console.error("Error al guardar el perfil:", error)
      toast.error("No se pudo actualizar el perfil")
    }
  }

  const handlePhotoEdit = () => {
    if (!isEditing) return
    fileInputRef.current?.click()
  }

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!isEditing) return
    if (file) {
      setPendingPhotoFile(file)
      const previewUrl = URL.createObjectURL(file)
      setProfilePhoto(previewUrl)
    }
  }

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground mb-4">No tienes una sesión activa</p>
              <Button asChild>
                <a href="/login">Iniciar sesión</a>
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 py-12 px-4">
        <div className="container mx-auto max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Mi Perfil
              </CardTitle>
              <CardDescription>
                Gestiona tu información personal
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Profile Photo Section */}
              <div className="flex items-center justify-center pb-6">
                <div className="relative">
                  <img
                    src={profilePhoto}
                    alt="Profile Photo"
                    className="w-32 h-32 rounded-full object-cover border-4 border-border"
                  />
                  {isEditing && (
                    <button
                      onClick={handlePhotoEdit}
                      className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 shadow-lg hover:bg-primary/90 transition-colors"
                      title="Editar foto de perfil"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Nombre</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="lastName">Apellido</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="pl-10"
                  />
                </div>
              </div>
              
              {}

              <div className="flex gap-3 pt-4">
                {isEditing ? (
                  <>
                    <Button onClick={handleSave} className="flex items-center gap-2">
                      <Save className="h-4 w-4" />
                      Guardar cambios
                    </Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancelar
                    </Button>
                  </>
                ) : (
                  <Button onClick={() => setIsEditing(true)}>
                    Editar perfil
                  </Button>
                )}
              </div>

              <div className="pt-6 border-t">
                <Button 
                  variant="destructive" 
                  onClick={handleLogout}
                  className="flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Cerrar sesión
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
