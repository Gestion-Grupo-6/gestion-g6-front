// Helper para mapear la respuesta del backend a la interfaz Usuario
// El backend usa: name, lastname

import { Usuario } from "@/types/user"
import { sanitizedBaseUrl } from "./config"
import { uploadImage, getImage } from "@/contexts/SupabaseContext"



// El frontend usa: firstName, lastName
function mapBackendUserToUsuario(data: any): Usuario {
  return {
    id: data.id,
    name: data.name,
    lastname: data.lastname,
    email: data.email,
    password: data.password,
    profilePhoto: data.profilePhoto
  }
}

// User - GET (id)
export async function fetchUser(id: string): Promise<Usuario | null> {
  const response = await fetch(`${sanitizedBaseUrl}/user/${id}`, {
    cache: "no-store",
  })

  if (response.status === 404) {
    return null
  }

  if (!response.ok) {
    throw new Error(`Error al consultar users/${id}: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  return mapBackendUserToUsuario(data)
}

// User - GET (email)
export async function fetchUserByEmail(email: string): Promise<Usuario | null> {
  const response = await fetch(`${sanitizedBaseUrl}/user/email/${email}`, {
    cache: "no-store",
  })

  if (response.status === 404) {
    return null
  }

  if (!response.ok) {
    throw new Error(`Error al consultar users?email=${email}: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  return mapBackendUserToUsuario(data)
}

// PUT - update user
export async function updateUser(payload: Partial<Usuario>): Promise<Usuario> {
  var id = payload.id
  if (!id) {
    throw new Error("El id del usuario es requerido para actualizar")
  }
  const response = await fetch(`${sanitizedBaseUrl}/user/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const fallback = await response.text()
    throw new Error(`No se pudo actualizar el usuario: ${response.status} ${response.statusText}. ${fallback}`)
  }
  
  const data = await response.json()
  return mapBackendUserToUsuario(data)
}

// POST - create user
// El backend espera: name, lastname, email, password
export async function createUser(payload: { name: string; lastname: string; email: string; password: string }): Promise<Usuario> {
  const response = await fetch(`${sanitizedBaseUrl}/user`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })
  
  if (!response.ok) {
    const fallback = await response.text()
    throw new Error(`No se pudo crear el usuario: ${response.status} ${response.statusText}. ${fallback}`)
  }
  
  const data = await response.json()
  return mapBackendUserToUsuario(data)
}



// User - POST (upload profile photo) - Using Supabase
export async function uploadProfilePhoto(userId: string, file: File): Promise<string> {
  // Genera una ruta única para el archivo en el bucket
  const fileExtension = file.name.split('.').pop() || 'jpg'
  const path = `profile-photos/${userId}.${Date.now()}.${fileExtension}`

  // Sube la imagen al bucket
  const uploadedPath = await uploadImage(path, file)
  
  if (!uploadedPath) {
    console.error("Error al subir la foto de perfil", uploadedPath)
    throw new Error("Error al subir la foto de perfil")
  }

  // Obtiene la URL pública del archivo subido
  const { publicUrl } = getImage(uploadedPath)
    ? { publicUrl: getImage(uploadedPath) }
    : { publicUrl: null }

  if (!publicUrl) {
    throw new Error("No se pudo obtener la URL pública de la imagen")
  }

  // Devuelve la URL lista para guardar en la base de datos
  return publicUrl
}
