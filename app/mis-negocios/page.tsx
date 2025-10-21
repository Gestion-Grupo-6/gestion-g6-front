"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Header } from "@/components/header"
import { 
  Building2, 
  Plus, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Star,
  Edit,
  Trash2,
  Eye
} from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

interface Business {
  id: string
  name: string
  description: string
  address: string
  phone: string
  email: string
  category: string
  rating: number
  createdAt: string
}

export default function MisNegociosPage() {
  const { isAuthenticated, user } = useAuth()
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editingBusiness, setEditingBusiness] = useState<Business | null>(null)
  
  // Datos del formulario
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    phone: "",
    email: "",
    category: ""
  })

  // Negocios mock del usuario
  const [businesses, setBusinesses] = useState<Business[]>([
    {
      id: "1",
      name: "Restaurante El Buen Sabor",
      description: "Especialidad en comida argentina tradicional",
      address: "Av. Corrientes 1234, Buenos Aires",
      phone: "+54 11 1234-5678",
      email: "contacto@elbuensabor.com",
      category: "Restaurante",
      rating: 4.5,
      createdAt: "2024-01-15"
    },
    {
      id: "2", 
      name: "Hotel Boutique San Telmo",
      description: "Hotel boutique en el corazón de San Telmo",
      address: "Defensa 1234, San Telmo, Buenos Aires",
      phone: "+54 11 9876-5432",
      email: "reservas@hotelsantelmo.com",
      category: "Hotel",
      rating: 4.8,
      createdAt: "2024-02-20"
    }
  ])

  // Si no está autenticado, mostrar mensaje
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center py-12 px-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold">Acceso Requerido</CardTitle>
              <CardDescription>
                Necesitas iniciar sesión para gestionar tus negocios
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                Para subir y gestionar tus negocios, primero debes iniciar sesión.
              </p>
              <div className="flex gap-3 justify-center">
                <Button asChild>
                  <a href="/login">Iniciar sesión</a>
                </Button>
                <Button variant="outline" asChild>
                  <a href="/register">Registrarse</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (isEditing && editingBusiness) {
      // Editar negocio existente
      setBusinesses(businesses.map(business => 
        business.id === editingBusiness.id 
          ? { ...business, ...formData }
          : business
      ))
    } else {
      // Crear nuevo negocio
      const newBusiness: Business = {
        id: Date.now().toString(),
        ...formData,
        rating: 0,
        createdAt: new Date().toISOString().split('T')[0]
      }
      setBusinesses([...businesses, newBusiness])
    }
    
    // Limpiar formulario
    setFormData({
      name: "",
      description: "",
      address: "",
      phone: "",
      email: "",
      category: ""
    })
    setShowForm(false)
    setIsEditing(false)
    setEditingBusiness(null)
  }

  const handleEdit = (business: Business) => {
    setFormData({
      name: business.name,
      description: business.description,
      address: business.address,
      phone: business.phone,
      email: business.email,
      category: business.category
    })
    setEditingBusiness(business)
    setIsEditing(true)
    setShowForm(true)
  }

  const handleDelete = (businessId: string) => {
    setBusinesses(businesses.filter(business => business.id !== businessId))
  }

  const handleCancel = () => {
    setFormData({
      name: "",
      description: "",
      address: "",
      phone: "",
      email: "",
      category: ""
    })
    setShowForm(false)
    setIsEditing(false)
    setEditingBusiness(null)
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Mis Negocios</h1>
            <p className="text-muted-foreground">
              Gestiona tus negocios y atrae más clientes
            </p>
          </div>

          {/* Botón para agregar negocio */}
          {!showForm && (
            <div className="mb-6">
              <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Agregar Negocio
              </Button>
            </div>
          )}

          {/* Formulario para agregar/editar negocio */}
          {showForm && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>
                  {isEditing ? "Editar Negocio" : "Agregar Nuevo Negocio"}
                </CardTitle>
                <CardDescription>
                  Completa la información de tu negocio
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nombre del Negocio *</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Ej: Restaurante El Buen Sabor"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="category">Categoría *</Label>
                      <select
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-input rounded-md"
                        required
                      >
                        <option value="">Selecciona una categoría</option>
                        <option value="Restaurante">Restaurante</option>
                        <option value="Hotel">Hotel</option>
                        <option value="Actividad">Actividad</option>
                        <option value="Otro">Otro</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Descripción *</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Describe tu negocio..."
                      rows={3}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Dirección *</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="Dirección completa"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Teléfono *</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="+54 11 1234-5678"
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="contacto@negocio.com"
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button type="submit">
                      {isEditing ? "Actualizar Negocio" : "Agregar Negocio"}
                    </Button>
                    <Button type="button" variant="outline" onClick={handleCancel}>
                      Cancelar
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Lista de negocios */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {businesses.map((business) => (
              <Card key={business.id} className="group hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{business.name}</CardTitle>
                      <CardDescription className="flex items-center gap-1 mt-1">
                        <Building2 className="h-4 w-4" />
                        {business.category}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{business.rating}</span>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {business.description}
                  </p>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span className="truncate">{business.address}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      <span>{business.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span className="truncate">{business.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>Agregado: {new Date(business.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-3">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleEdit(business)}
                      className="flex-1"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="flex-1"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Ver
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => handleDelete(business.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {businesses.length === 0 && !showForm && (
            <Card className="text-center py-12">
              <CardContent>
                <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No tienes negocios registrados</h3>
                <p className="text-muted-foreground mb-4">
                  Comienza agregando tu primer negocio
                </p>
                <Button onClick={() => setShowForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar mi primer negocio
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
